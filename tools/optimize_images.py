"""Shrinks big phone photos so the site loads and scrolls smoothly.
Usage:  pip install pillow
        python optimize_images.py  path/to/your/photos
Writes smaller copies (max 1000px, ~150 KB each) into a new folder called "optimized"."""
import sys, os
from PIL import Image, ImageOps
src = sys.argv[1] if len(sys.argv) > 1 else "."
out = os.path.join(src, "optimized"); os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(src)):
    if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        im = ImageOps.exif_transpose(Image.open(os.path.join(src, f))).convert("RGB")
        im.thumbnail((1000, 1000))
        name = os.path.splitext(f)[0] + ".jpg"
        im.save(os.path.join(out, name), quality=78, optimize=True, progressive=True)
        print(name, im.size, os.path.getsize(os.path.join(out, name)) // 1024, "KB")
