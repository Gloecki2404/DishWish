"""HTTP views: image upload and image delivery."""

from __future__ import annotations

import re
from pathlib import Path

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import BUNDLE_NAME, MAX_UPLOAD_BYTES, STATIC_URL
from .db import DbError
from .images import SIZES, image_path
from .store import Actor, NotReady, get_store

_IMAGE_ID = re.compile(r"^[0-9a-f]{32}$")
_CACHE = "public, max-age=31536000, immutable"


class ImageUploadView(HomeAssistantView):
    """POST /api/dishwish/images - multipart field `file`."""

    url = "/api/dishwish/images"
    name = "api:dishwish:images:upload"
    requires_auth = True

    async def post(self, request: web.Request) -> web.Response:
        """Accept an image and register it as unassigned."""
        hass: HomeAssistant = request.app["hass"]
        user = request["hass_user"]
        reader = await request.multipart()
        field = await reader.next()
        if field is None or getattr(field, "name", None) != "file":
            return self.json_message("Missing field 'file'", 400, "invalid_format")

        data = bytearray()
        while chunk := await field.read_chunk(64 * 1024):
            data.extend(chunk)
            if len(data) > MAX_UPLOAD_BYTES:
                return self.json_message("Image too large", 413, "too_large")
        try:
            result = await get_store(hass).async_add_upload(
                Actor(user.id, user.is_admin), bytes(data)
            )
        except DbError as err:
            status = {"too_large": 413, "not_ready": 503}.get(err.code, 400)
            return self.json_message("Image rejected", status, err.code)
        return self.json(result, status_code=201)


class ImageView(HomeAssistantView):
    """GET /api/dishwish/images/{image_id}/{size} - unauthenticated, unguessable id."""

    url = "/api/dishwish/images/{image_id}/{size}"
    name = "api:dishwish:images:get"
    requires_auth = False

    async def get(self, request: web.Request, image_id: str, size: str) -> web.StreamResponse:
        """Serve one image file."""
        if not _IMAGE_ID.match(image_id) or size not in SIZES:
            raise web.HTTPNotFound
        hass: HomeAssistant = request.app["hass"]
        try:
            images_dir = get_store(hass).images_dir
        except NotReady as err:
            raise web.HTTPServiceUnavailable from err
        path = image_path(images_dir, image_id, size)
        if not await hass.async_add_executor_job(path.is_file):
            raise web.HTTPNotFound
        return web.FileResponse(path, headers={"Cache-Control": _CACHE})


class BundleView(HomeAssistantView):
    """The card bundle. The versioned URL (`?v=<version>-<mtime>`, changes with every update)
    is cached for good; a bare URL revalidates, so an update is never shadowed by a stale copy."""

    url = f"{STATIC_URL}/{BUNDLE_NAME}"
    name = "dishwish:bundle"
    requires_auth = False

    def __init__(self, path: Path) -> None:
        self._path = path

    async def get(self, request: web.Request) -> web.StreamResponse:
        """Serve the bundle."""
        cache = _CACHE if "v" in request.query else "no-cache"
        return web.FileResponse(self._path, headers={"Cache-Control": cache})
