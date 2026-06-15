from pathlib import Path
import shutil
import math

import numpy as np
import rawpy
from PIL import Image, ImageDraw, ImageFilter
from pillow_heif import register_heif_opener

register_heif_opener()

ROOT = Path("C:/Users/Moein/Documents/Codes/dr_nik_clinic")
SRC = Path("D:/final")
OUT = ROOT / "public/clinic"

MAX_DIM = 1600
QUALITY = 82


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def resize_if_needed(img: Image.Image) -> Image.Image:
    width, height = img.size
    if max(width, height) <= MAX_DIM:
        return img.convert("RGB")
    ratio = MAX_DIM / max(width, height)
    new_size = (max(1, math.floor(width * ratio)), max(1, math.floor(height * ratio)))
    return img.resize(new_size, Image.Resampling.LANCZOS).convert("RGB")


def open_image(path: Path) -> Image.Image:
    suffix = path.suffix.lower()
    if suffix == ".nef":
        with rawpy.imread(str(path)) as raw:
            rgb = raw.postprocess(
                output_bps=8,
                no_auto_bright=True,
                use_camera_wb=True,
                output_color=rawpy.ColorSpace.sRGB,
            )
        return Image.fromarray(rgb).convert("RGB")
    return Image.open(path).convert("RGB")


def save_webp(src: Path, dest: Path, quality: int = QUALITY) -> None:
    ensure_dir(dest.parent)
    img = open_image(src)
    img = resize_if_needed(img)
    img.save(dest, format="WEBP", quality=quality, optimize=True)


def copy_category(src: Path, dest: Path) -> None:
    ensure_dir(dest.parent)
    shutil.copy2(src, dest)


def make_placeholder(dest: Path, text: str = "Placeholder") -> None:
    ensure_dir(dest.parent)
    img = Image.new("RGB", (1200, 900), (20, 31, 52))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 1200, 900), fill=(18, 28, 41))
    for y in range(0, 900, 40):
        draw.line((0, y, 1200, y), fill=(38, 57, 78), width=2)
    draw.rounded_rectangle((160, 180, 1040, 720), radius=60, fill=(13, 19, 31), outline=(97, 179, 191), width=6)
    draw.text((600, 360), text, fill=(233, 245, 250), font=None, anchor="mm")
    img = img.filter(ImageFilter.GaussianBlur(radius=0.4))
    img.save(dest, format="WEBP", quality=80, optimize=True)


# Phase 2 category assets
copy_category(SRC / "gallery/Clinic environment.jpg", OUT / "gallery/categories/clinic-environment.jpg")
copy_category(SRC / "gallery/after.jpg", OUT / "gallery/categories/before-after.jpg")
copy_category(SRC / "gallery/Equipment.png", OUT / "gallery/categories/equipment.png")
copy_category(SRC / "gallery/team.png", OUT / "gallery/categories/team.png")

# Phase 3 gallery detail assets
equipment_dir = OUT / "gallery/equipment"
team_dir = OUT / "gallery/team"
environment_dir = OUT / "gallery/environment"

equipment_source_files = [
    "1.JPG",
    "2.JPG",
    "3.JPG",
    "4.JPG",
    "6.JPG",
    "7.JPG",
    "8.JPG",
    "9.JPG",
    "10.JPG",
    "11.JPG",
    "12.JPG",
    "13.jpg",
    "14.jpg",
]

for idx, filename in enumerate(equipment_source_files, start=1):
    src = SRC / "gallery/folder one/تجهیزات" / filename
    save_webp(src, equipment_dir / f"equipment-{idx:02d}.webp")

save_webp(SRC / "gallery/folder one/تیم درمان/15.jpg", team_dir / "team-01.webp")

env_files = sorted((SRC / "gallery/folder one/محیط کلینیک").glob("*.*"))
for idx, src in enumerate(env_files, start=1):
    save_webp(src, environment_dir / f"environment-{idx:02d}.webp")

# Phase 4 home assets
save_webp(SRC / "a/102.png", OUT / "home/final-cta/final-cta-102.webp")
save_webp(SRC / "c/132.jpg", OUT / "home/results/results-132.webp")
for name in range(133, 139):
    src = next((SRC / "d").glob(f"{name}.*"))
    save_webp(src, OUT / "home/doctor" / f"doctor-{name}.webp")

# Instagram assets
for name in range(117, 122):
    src = next((SRC / "b").glob(f"{name}.*"))
    save_webp(src, OUT / "home/instagram/event" / f"event-{name}.webp")
make_placeholder(OUT / "home/instagram/event/event-placeholder-221.webp", "221 Placeholder")
make_placeholder(OUT / "home/instagram/team/team-placeholder.webp", "Team Placeholder")

client_early_sources = {
    14: SRC / "gallery/folder one/تجهیزات/14.jpg",
    15: SRC / "gallery/folder one/تیم درمان/15.jpg",
    16: SRC / "gallery/folder one/محیط کلینیک/16.jpg",
    17: SRC / "gallery/folder one/محیط کلینیک/17.jpg",
    18: SRC / "gallery/folder one/محیط کلینیک/18.jpg",
    19: SRC / "gallery/folder one/محیط کلینیک/19.jpg",
}
for name, src in client_early_sources.items():
    save_webp(src, OUT / "home/instagram/clients" / f"clients-{name}.webp")
for name in range(110, 117):
    src = next((SRC / "b").glob(f"{name}.jpg"), None) or next((SRC / "b").glob(f"{name}.JPG"), None)
    if src is not None:
        save_webp(src, OUT / "home/instagram/clients" / f"clients-{name}.webp")

for name in range(123, 132):
    src = next((SRC / "b").glob(f"{name}.jpg"), None) or next((SRC / "b").glob(f"{name}.JPG"), None) or next((SRC / "b").glob(f"{name}.jpeg"), None)
    if src is not None:
        save_webp(src, OUT / "home/instagram/amwc" / f"amwc-{name}.webp")

print("Prepared assets under", OUT)
