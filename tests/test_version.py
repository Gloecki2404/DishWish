"""The version must be identical everywhere (see dev/bump_version.py)."""

from __future__ import annotations

import json
import re
from pathlib import Path

from custom_components.dishwish.const import VERSION

ROOT = Path(__file__).resolve().parent.parent


def test_versions_are_in_sync():
    manifest = json.loads((ROOT / "custom_components/dishwish/manifest.json").read_text("utf-8"))
    package = json.loads((ROOT / "frontend/package.json").read_text("utf-8"))
    lock = json.loads((ROOT / "frontend/package-lock.json").read_text("utf-8"))
    assert re.fullmatch(r"\d+\.\d+\.\d+", VERSION)
    assert manifest["version"] == VERSION
    assert package["version"] == VERSION
    assert lock["version"] == VERSION and lock["packages"][""]["version"] == VERSION


def test_changelog_has_an_entry_for_the_version():
    changelog = (ROOT / "CHANGELOG.md").read_text("utf-8")
    assert f"## [{VERSION}]" in changelog
