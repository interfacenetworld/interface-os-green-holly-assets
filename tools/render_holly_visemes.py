"""Make aligned mouth sprites from the V1 neutral frame with Pillow and SciPy."""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

motion = Path(__file__).resolve().parents[1] / "public/holly-green/motion"
output = motion / "visemes"
output.mkdir(exist_ok=True)
pixels = np.asarray(Image.open(motion / "idle-default.png").convert("RGB"))
y, x = np.indices(pixels.shape[:2], dtype=np.float32)
dx = x - 211
dy = y - 69.5 - dx * 0.25
mask = np.clip(1 - ((dx / 12) ** 2 + (dy / 8) ** 2), 0, 1)
alpha = np.uint8(np.minimum(1, mask * 3) * 255)

for shape, width, height in [
    ("closed", 1.03, 0.42), ("open", 0.94, 1.75), ("wide", 1.36, 0.96), ("round", 0.68, 1.46),
]:
    sx = x + dx * (1 / width - 1) * mask
    sy = y + dy * (1 / height - 1) * mask
    warped = [map_coordinates(pixels[:, :, channel], (sy, sx), order=1) for channel in range(3)]
    Image.fromarray(np.stack([*warped, alpha], axis=-1)).save(output / f"{shape}.png", optimize=True)
