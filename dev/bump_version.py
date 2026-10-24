"""Set the project version everywhere: python dev/bump_version.py 0.2.0

Updates manifest.json, const.py (VERSION) and frontend/package.json (+ lock file).
Afterwards: move the [Unreleased] notes in CHANGELOG.md under the new version, rebuild the bundle,
commit and tag `vX.Y.Z`.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")


def _json_version(path: Path, version: str, nested: tuple[str, ...] = ()) -> None:
    text = path.read_text(encoding="utf-8")
    data = json.loads(text)
    data["version"] = version
    for key in nested:
        data["packages"][key]["version"] = version
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    """Apply the version given on the command line."""
    if len(sys.argv) != 2 or not SEMVER.match(sys.argv[1]):
        sys.exit("usage: python dev/bump_version.py MAJOR.MINOR.PATCH")
    version = sys.argv[1]

    manifest = ROOT / "custom_components" / "dishwish" / "manifest.json"
    text = manifest.read_text(encoding="utf-8")
    manifest.write_text(
        re.sub(r'("version":\s*")[^"]+(")', rf"\g<1>{version}\g<2>", text), encoding="utf-8"
    )

    const = ROOT / "custom_components" / "dishwish" / "const.py"
    text = const.read_text(encoding="utf-8")
    const.write_text(
        re.sub(r'(?m)^VERSION = "[^"]+"', f'VERSION = "{version}"', text), encoding="utf-8"
    )

    _json_version(ROOT / "frontend" / "package.json", version)
    lock = ROOT / "frontend" / "package-lock.json"
    if lock.exists():
        _json_version(lock, version, nested=("",))
    print(f"Version set to {version}.")
    print(f"Next: CHANGELOG.md, npm --prefix frontend run build, commit, tag v{version}.")


if __name__ == "__main__":
    main()
