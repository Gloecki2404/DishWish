"""HTTP views: image upload and image delivery."""

from __future__ import annotations

import re

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import MAX_UPLOAD_BYTES
from .db import DbError
from .images import SIZES, image_path
from .store import Actor, get_store

_IMAGE_ID = re.compile(r"^[0-9a-f]{32}$")
_CACHE = "public, max-age=31536000, immutable"


class ImageUploadView(HomeAssistantView):
    """POST /api/essensplan/images - multipart field `file`."""

    url = "/api/essensplan/images"
    name = "api:essensplan:images:upload"
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
            status = 413 if err.code == "too_large" else 400
            return self.json_message("Image rejected", status, err.code)
        return self.json(result, status_code=201)


class ImageView(HomeAssistantView):
    """GET /api/essensplan/images/{image_id}/{size} - unauthenticated, unguessable id."""

    url = "/api/essensplan/images/{image_id}/{size}"
    name = "api:essensplan:images:get"
    requires_auth = False

    async def get(self, request: web.Request, image_id: str, size: str) -> web.StreamResponse:
        """Serve one image file."""
        if not _IMAGE_ID.match(image_id) or size not in SIZES:
            raise web.HTTPNotFound
        hass: HomeAssistant = request.app["hass"]
        path = image_path(get_store(hass).images_dir, image_id, size)
        if not await hass.async_add_executor_job(path.is_file):
            raise web.HTTPNotFound
        return web.FileResponse(path, headers={"Cache-Control": _CACHE})
