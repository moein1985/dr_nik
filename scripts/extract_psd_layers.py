"""
Extract all visible image layers from the clinic PSD file.
Outputs named PNG files to docs/Website Clinic3-3/extracted/
"""
import os
import sys
# Force UTF-8 output to avoid Persian character encode errors in Windows console
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)
from pathlib import Path
from psd_tools import PSDImage
from psd_tools.constants import Tag

PSD_PATH = Path(__file__).parent.parent / "docs" / "Website Clinic3-3" / "Website Clinic3-3.psd"
OUT_DIR  = PSD_PATH.parent / "extracted"
OUT_DIR.mkdir(exist_ok=True)

print(f"Opening {PSD_PATH} ({PSD_PATH.stat().st_size // 1024 // 1024} MB)...")
psd = PSDImage.open(PSD_PATH)
print(f"Canvas: {psd.width} x {psd.height} px, {len(list(psd))} top-level layers")

def sanitize(name: str) -> str:
    return "".join(c if c.isalnum() or c in "-_ " else "_" for c in name).strip().replace(" ", "_")[:60]

def export_layers(layers, depth=0, idx_prefix=""):
    for i, layer in enumerate(layers):
        idx = f"{idx_prefix}{i:02d}"
        kind = layer.kind
        name = sanitize(layer.name) or f"layer_{idx}"
        print("  " * depth + f"[{idx}] {kind} '{layer.name}' visible={layer.visible} size={layer.width}x{layer.height}")

        # Recurse into groups and artboards (always, even if not visible, to discover assets)
        if kind in ("group", "artboard"):
            export_layers(layer, depth + 1, idx_prefix=f"{idx}_")
            continue

        # Export pixel / smartobject / type layers that have size
        if kind in ("pixel", "smartobject", "type") and layer.width > 10 and layer.height > 10:
            try:
                img = layer.composite()
                if img is None:
                    img = layer.topil()
                if img:
                    fname = OUT_DIR / f"{idx}_{name}.png"
                    img.save(fname)
                    print("  " * depth + f"  -> saved {fname.name} ({img.width}x{img.height})")
            except Exception as e:
                print("  " * depth + f"  !! error: {e}")

export_layers(psd)

# Also save a full composite of the whole document
print("\nSaving full composite...")
composite = psd.composite()
if composite:
    composite.save(OUT_DIR / "_FULL_COMPOSITE.png")
    print(f"Full composite saved ({composite.width}x{composite.height})")

print(f"\nDone. Files in: {OUT_DIR}")
