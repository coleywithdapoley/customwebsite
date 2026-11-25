#!/usr/bin/env python3
"""Cut garment photos to transparent WebP with rembg's default u2net model.

u2net is Apache-2.0. This script does not use BRIA RMBG.
Run from the repo root:

    .venv/bin/python scripts/cutouts.py
"""

import io
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "images" / "products"
OUT = ROOT / "public" / "images" / "cutouts"

# Tight fabric closeups. A cutout here eats the cloth instead of the backdrop.
SKIP = {
    "colorblock-chest-patch.jpg",
    "colorblock-waist-patch.jpg",
    "colorblock-zipper.jpg",
    "fleece-sky-mark.jpg",
}


def trim_and_pad(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    box = image.getbbox()
    if box:
        image = image.crop(box)
    width, height = image.size
    pad = max(8, int(max(width, height) * 0.03))
    canvas = Image.new("RGBA", (width + pad * 2, height + pad * 2), (0, 0, 0, 0))
    canvas.paste(image, (pad, pad), image)
    return canvas


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    session = new_session("u2net")
    sources = [
        path
        for path in sorted(SRC.iterdir())
        if path.suffix.lower() in {".jpg", ".jpeg", ".png"} and path.name not in SKIP
    ]
    for source in sources:
        cut = remove(source.read_bytes(), session=session)
        image = trim_and_pad(Image.open(io.BytesIO(cut)))
        dest = OUT / f"{source.stem}.webp"
        image.save(dest, "WEBP", quality=86, method=6)
        print(f"{dest.name} {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
