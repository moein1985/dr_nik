"""
Crop individual photo assets from the PSD full composite
and save them to public/home/ for use in the website.
Coordinates are from PSD layer bbox analysis.
"""
from pathlib import Path
from PIL import Image

COMPOSITE = Path(__file__).parent.parent / "docs" / "Website Clinic3-3" / "extracted" / "_FULL_COMPOSITE.png"
OUT = Path(__file__).parent.parent / "public" / "home"
OUT.mkdir(parents=True, exist_ok=True)

img = Image.open(COMPOSITE)
W, H = img.width, img.height
print(f"Composite: {W} x {H}")

def crop(x1, y1, x2, y2, name, padding=4):
    """Crop region from composite with optional padding, clamped to bounds."""
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(W, x2 + padding)
    y2 = min(H, y2 + padding)
    region = img.crop((x1, y1, x2, y2))
    out_path = OUT / name
    region.save(out_path)
    print(f"  Saved {name} ({region.width}x{region.height})")

# ─── Logo ─────────────────────────────────────────────────────────────────────
crop(770, 57, 985, 107, "logo.png", padding=0)

# ─── Hero background (building photo) ─────────────────────────────────────────
# Layer 9 in تاپ منو group, spans top area
crop(0, 0, 1027, 420, "hero-bg.png", padding=0)

# ─── Dental before/after gallery (group: اسلایدر, y≈779-1179) ─────────────────
# Rectangle 2 (leftmost large photo - likely BEFORE teeth)
crop(590, 779, 918, 1179, "gallery-dental-1.png")
# Rectangle 2 (left small photo)
crop(52, 828, 270, 1096, "gallery-dental-2.png")
# Rectangle 2 (center photo)
crop(237, 841, 463, 1094, "gallery-dental-3.png")
# Layer 15 (right photo)
crop(467, 869, 642, 1088, "gallery-dental-4.png")

# ─── Instagram photos (group: اینستا و گالریش, y≈1156-1507) ────────────────────
crop(138, 1169, 318, 1488, "insta-1.png")
crop(329, 1181, 506, 1496, "insta-2.png")
crop(519, 1184, 693, 1493, "insta-3.png")
crop(698, 1156, 881, 1482, "insta-4.png")

# ─── Facial/skin before-after gallery (group: قبل و بعد برای پوست) ─────────────
# Layer 16 (leftmost)
crop(55,  1459, 462, 1866, "gallery-skin-1.png")
# Layer 19 (second from left)
crop(276, 1482, 658, 1864, "gallery-skin-2.png")
# Layer 18 (center)
crop(243, 1443, 654, 1854, "gallery-skin-3.png")
# Layer 17 (right)
crop(649, 1476, 1064, 1891, "gallery-skin-4.png")
# Layer 20 (large rightmost)
crop(632, 1386, 1074, 1938, "gallery-skin-5.png")

# ─── Doctor profile photo (group: درباره دکتر مریم و دکترشیما) ──────────────────
crop(54, 1819, 371, 2382, "hero-preview.png")

# ─── Trust section background strip ───────────────────────────────────────────
crop(0, 1250, 1027, 1520, "trust-section.png", padding=0)

print(f"\nAll assets saved to: {OUT}")
print(f"Files: {len(list(OUT.glob('*.png')))} PNG files")
