"""Image processing tests."""

from __future__ import annotations

import os
import time
from io import BytesIO

import pytest
from PIL import Image

from custom_components.dishwish import images

from .conftest import jpeg_bytes


def _open(data: bytes) -> Image.Image:
    return Image.open(BytesIO(data))


def test_sizes():
    full, thumb = images.process_image(jpeg_bytes((3000, 2000)))
    assert max(_open(full).size) == 1600
    assert _open(thumb).size == (480, 360)
    assert len(thumb) < 60 * 1024


def test_small_image_not_upscaled():
    full, thumb = images.process_image(jpeg_bytes((200, 100)))
    assert _open(full).size == (200, 100)
    assert _open(thumb).size == (480, 360)


def test_exif_rotation_applied_and_exif_removed():
    img = Image.new("RGB", (200, 100), (255, 0, 0))
    exif = Image.Exif()
    exif[0x0112] = 6  # rotate 90 degrees clockwise to display
    exif[0x010F] = "SecretCam"
    out = BytesIO()
    img.save(out, "JPEG", exif=exif.tobytes())
    assert _open(out.getvalue()).getexif().get(0x010F) == "SecretCam"

    full, thumb = images.process_image(out.getvalue())
    result = _open(full)
    assert result.size == (100, 200)
    assert not dict(result.getexif())
    assert not dict(_open(thumb).getexif())
    assert "exif" not in result.info


def test_png_with_alpha_gets_white_background():
    out = BytesIO()
    Image.new("RGBA", (50, 50), (0, 0, 0, 0)).save(out, "PNG")
    full, _ = images.process_image(out.getvalue())
    result = _open(full)
    assert result.mode == "RGB"
    r, g, b = result.getpixel((25, 25))
    assert min(r, g, b) > 240


def test_corrupt_file_rejected():
    with pytest.raises(images.ImageError) as err:
        images.process_image(b"not an image at all")
    assert err.value.code == "unsupported_image"
    truncated = jpeg_bytes((400, 400))[:200]
    with pytest.raises(images.ImageError):
        images.process_image(truncated)


def test_too_large_rejected():
    with pytest.raises(images.ImageError) as err:
        images.process_image(b"0" * (15 * 1024 * 1024 + 1))
    assert err.value.code == "too_large"


def test_save_and_delete_files(tmp_path):
    images.save_image(tmp_path, "a" * 32, jpeg_bytes())
    assert images.image_path(tmp_path, "a" * 32, "thumb").is_file()
    assert images.image_path(tmp_path, "a" * 32, "full").is_file()
    assert not list(tmp_path.glob("*.tmp"))
    images.delete_files(tmp_path, ["a" * 32, "b" * 32])  # missing ones are fine
    assert not list(tmp_path.iterdir())


def test_orphan_cleanup(tmp_path):
    known, old_orphan, young_orphan = "a" * 32, "b" * 32, "c" * 32
    for image_id in (known, old_orphan, young_orphan):
        images.save_image(tmp_path, image_id, jpeg_bytes())
    two_hours_ago = time.time() - 7200
    for image_id in (known, old_orphan):
        for size in images.SIZES:
            path = images.image_path(tmp_path, image_id, size)
            os.utime(path, (two_hours_ago, two_hours_ago))
    removed = images.delete_orphan_files(tmp_path, {known}, 1)
    assert removed == 2
    names = {p.name for p in tmp_path.iterdir()}
    assert names == {
        f"{known}_full.jpg",
        f"{known}_thumb.jpg",
        f"{young_orphan}_full.jpg",
        f"{young_orphan}_thumb.jpg",
    }
