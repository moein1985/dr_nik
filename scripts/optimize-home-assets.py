from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path("public/home")
OUT = ROOT / "optimized"
OUT.mkdir(exist_ok=True)

TARGETS = {
    "doctor-photo.jpeg": 1200,
    "trust-banner.png": 1200,
    "instagram-1.jpg": 900,
    "instagram-2.jpg": 900,
    "instagram-3.jpg": 900,
    "instagram-4.jpg": 900,
    "gallery-1.png": 1400,
    "gallery-2.png": 1400,
    "gallery-3.png": 1400,
    "gallery-4.png": 1400,
    "gallery-5.png": 1400,
    "gallery-dental-1.png": 900,
    "hero-main.png": 1200,
    "hero-bg.png": 1400,
}

for src in sorted(ROOT.glob("*")):
    if src.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
        continue

    if src.name.startswith("hero-bg.orig"):
        continue

    max_dim = TARGETS.get(src.name, 1600)

    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode in ("RGBA", "LA", "P"):
            rgb = im.convert("RGBA")
        else:
            rgb = im.convert("RGB")

        width, height = rgb.size
        if max(width, height) > max_dim:
            scale = max_dim / max(width, height)
            rgb = rgb.resize((max(1, int(width * scale)), max(1, int(height * scale))), Image.Resampling.LANCZOS)

        quality = 72 if src.name.startswith("instagram-") or src.name.startswith("doctor-photo") else 75
        output = OUT / f"{src.stem}.webp"
        rgb.save(output, format="WEBP", quality=quality, optimize=True)
        print(f"{src.name} -> {output.name} ({output.stat().st_size} bytes, {rgb.size[0]}x{rgb.size[1]})")
