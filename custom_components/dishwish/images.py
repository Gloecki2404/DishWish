"""Image validation, processing and file handling (blocking; run in an executor)."""

from __future__ import annotations

import os
import time
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from .const import (
    FULL_MAX_SIDE,
    FULL_QUALITY,
    MAX_UPLOAD_BYTES,
    THUMB_QUALITY,
    THUMB_SIZE,
)
from .db import DbError

MAX_PIXELS = 60_000_000
SIZES = ("thumb", "full")


class ImageError(DbError):
    """Image could not be accepted; code is a WebSocket/HTTP error code."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


def _to_rgb(img: Image.Image) -> Image.Image:
    if img.mode in ("RGBA", "LA", "PA") or "transparency" in img.info:
        rgba = img.convert("RGBA")
        background = Image.new("RGB", rgba.size, (255, 255, 255))
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return img.convert("RGB")


def _jpeg(img: Image.Image, quality: int) -> bytes:
    out = BytesIO()
    img.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    return out.getvalue()


def process_image(data: bytes) -> tuple[bytes, bytes]:
    """Validate and convert to (full, thumb) JPEG bytes without EXIF metadata."""
    if len(data) > MAX_UPLOAD_BYTES:
        raise ImageError("too_large")
    try:
        Image.open(BytesIO(data)).verify()
        img = Image.open(BytesIO(data))
        if img.width * img.height > MAX_PIXELS:
            raise ImageError("too_large")
        img.load()
    except ImageError:
        raise
    except UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError:
        raise ImageError("unsupported_image") from None

    img = _to_rgb(ImageOps.exif_transpose(img))
    full = img.copy()
    full.thumbnail((FULL_MAX_SIDE, FULL_MAX_SIDE), Image.Resampling.LANCZOS)
    thumb = ImageOps.fit(img, THUMB_SIZE, Image.Resampling.LANCZOS, centering=(0.5, 0.5))
    return _jpeg(full, FULL_QUALITY), _jpeg(thumb, THUMB_QUALITY)


def image_path(images_dir: Path, image_id: str, size: str) -> Path:
    """File path of one image size."""
    return images_dir / f"{image_id}_{size}.jpg"


def _write_atomic(path: Path, data: bytes) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_bytes(data)
    os.replace(tmp, path)


def save_image(images_dir: Path, image_id: str, data: bytes) -> None:
    """Process an upload and write both sizes atomically."""
    full, thumb = process_image(data)
    images_dir.mkdir(parents=True, exist_ok=True)
    _write_atomic(image_path(images_dir, image_id, "full"), full)
    _write_atomic(image_path(images_dir, image_id, "thumb"), thumb)


def delete_files(images_dir: Path, image_ids: list[str] | set[str]) -> None:
    """Remove the files of the given images (missing files are fine)."""
    for image_id in image_ids:
        for size in SIZES:
            image_path(images_dir, image_id, size).unlink(missing_ok=True)


def delete_orphan_files(images_dir: Path, known_ids: set[str], min_age_h: int) -> int:
    """Delete image/tmp files without DB row that are older than min_age_h. Returns count."""
    if not images_dir.is_dir():
        return 0
    cutoff = time.time() - min_age_h * 3600
    removed = 0
    for path in images_dir.iterdir():
        if path.stem.split("_", 1)[0] in known_ids:
            continue
        try:
            if path.stat().st_mtime < cutoff:
                path.unlink()
                removed += 1
        except OSError:
            continue
    return removed
