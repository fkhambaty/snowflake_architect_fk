"""Crop circular DP-ready headshots from docs/assets/cast-sheet.jpg."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "assets" / "cast-sheet.jpg"
OUT = ROOT / "docs" / "assets" / "cast"
NAMES = ["elena", "marcus", "alex", "jordan", "sam", "nora", "dev"]


def main() -> None:
    im = Image.open(SRC).convert("RGB")
    W, H = im.size
    OUT.mkdir(parents=True, exist_ok=True)

    # Sheet layout (1280x720): gold title ~y0-110, portraits ~y120-520, labels ~y540+
    pad_x = 28
    usable = W - 2 * pad_x
    col_w = usable / 7
    # Square head-and-shoulders for circular DP (skip title text)
    face_top = 178
    size = 205

    for i, name in enumerate(NAMES):
        cx = pad_x + col_w * (i + 0.5)
        left = int(round(cx - size / 2))
        top = face_top
        right = left + size
        bot = top + size
        left = max(0, min(left, W - size))
        top = max(0, min(top, H - size))
        right = left + size
        bot = top + size
        crop = im.crop((left, top, right, bot)).resize((256, 256), Image.Resampling.LANCZOS)
        path = OUT / f"{name}.jpg"
        crop.save(path, quality=92, optimize=True)
        print(f"{name}: ({left},{top})-({right},{bot}) -> {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
