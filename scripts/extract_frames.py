"""
Turn a hero clip into a scroll-scrubbed frame sequence.

    pip install opencv-python
    python scripts/extract_frames.py hero-src/clip-1.mp4 --name seq1
    python scripts/extract_frames.py hero-src/clip-2.mp4 --name seq2 --frames 150

Writes public/hero/<name>/0001.webp … and manifest.json.
"""
import argparse, json, os, shutil
import cv2

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("--name", default="seq1")
ap.add_argument("--frames", type=int, default=0, help="0 = keep every frame")
ap.add_argument("--width", type=int, default=1920)
ap.add_argument("--quality", type=int, default=80)
ap.add_argument("--crop-bottom", type=float, default=0.0, help="fraction of height to cut from the bottom")
a = ap.parse_args()

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "hero", a.name)
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out)

cap = cv2.VideoCapture(a.video)
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)
if not frames:
    raise SystemExit("could not read any frame")

n = len(frames) if a.frames <= 0 else min(a.frames, len(frames))
picks = [round(i * (len(frames) - 1) / (n - 1)) for i in range(n)]
h, w = frames[0].shape[:2]
cut = round(h * (1 - a.crop_bottom))
scale = a.width / w
size = (round(w * scale), round(cut * scale))
for k, idx in enumerate(picks, 1):
    f = cv2.resize(frames[idx][:cut], size, interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(out, f"{k:04d}.webp"), f, [cv2.IMWRITE_WEBP_QUALITY, a.quality])

json.dump(
    {"count": n, "width": size[0], "height": size[1], "ext": "webp"},
    open(os.path.join(out, "manifest.json"), "w"),
)
print(f"{n} frames of {size[0]}x{size[1]} from {len(frames)} source frames -> {os.path.normpath(out)}")
