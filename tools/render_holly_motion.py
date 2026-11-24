"""Render Holly's 2D motion from the original full-body artwork (Pillow, NumPy,
SciPy, FFmpeg). Run from any directory with the split asset kit imported.
"""
from contextlib import ExitStack
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

ROOT = Path(__file__).resolve().parents[1] / "public/holly-green"
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "motion"
SIZE = (400, 540)
FPS = 24
BACKGROUND = (4, 17, 13)
PROFILES = {
    # Float in pixels, breath displacement, head bias, head travel, mouth motion.
    "idle-default": (4, 1.8, 0, 1.2, 0),
    "idle-attentive": (3, 1.6, 1.5, 1.2, 0),
    "listening": (2.5, 1.4, -1.7, 1.7, 0),
    "speaking": (3, 1.8, 0, 1.8, 1.6),
    "companion": (5, 2.1, -0.6, 1.4, 0),
    "creator": (3.5, 1.5, 0.7, 1.6, 0),
    "summon": (4, 1.8, 0, 1.2, 0),
}


def encode(name, frames):
    source = [
        "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
        "-s", f"{SIZE[0]}x{SIZE[1]}", "-r", str(FPS), "-i", "-", "-an",
    ]
    formats = {
        "webm": ["-c:v", "libvpx-vp9", "-crf", "30", "-b:v", "0", "-deadline", "good", "-cpu-used", "4"],
        "mp4": ["-c:v", "libx264", "-crf", "21", "-movflags", "+faststart"],
    }
    with ExitStack() as stack:
        encoders = [
            stack.enter_context(subprocess.Popen(
                source + options + ["-threads", "2", "-pix_fmt", "yuv420p", str(OUTPUT / f"{name}.{ext}")],
                stdin=subprocess.PIPE,
            ))
            for ext, options in formats.items()
        ]
        for frame in frames:
            pixels = frame.tobytes()
            for encoder in encoders:
                encoder.stdin.write(pixels)
        for encoder in encoders:
            encoder.stdin.close()
        for encoder in encoders:
            if encoder.wait():
                raise RuntimeError(f"Could not encode {name}")


def render():
    OUTPUT.mkdir(exist_ok=True)
    # Crop the title and retain the entire figure, including feet and platform.
    artwork = np.asarray(Image.open(ASSETS / "09_Holly_Character/holly-full-body-main.png")
                         .convert("RGB").crop((0, 0, 315, 807)))
    y, x = np.indices(artwork.shape[:2], dtype=np.float32)

    def area(cx, cy, width, height):
        return np.exp(-0.5 * (((x - cx) / width) ** 2 + ((y - cy) / height) ** 2))

    chest = area(171, 173, 55, 64)
    head = area(151, 55, 54, 38)
    hair = area(102, 116, 20, 37)
    suit = area(157, 326, 59, 110)
    mouth = area(176, 78, 7, 5)
    blink = np.zeros_like(y)
    for cx, cy, slope, width in [(158, 43, 0.27, 9), (185, 50, 0.09, 5.5)]:
        eye_y = cy + (x - cx) * slope
        distance = y - eye_y
        # Bring upper-lid pixels down and lift lower-lid pixels into a thin crease.
        lid = 2.3 - 6.0 * np.tanh((distance - 1.6) / 0.9)
        blink += lid * np.exp(-0.5 * (((x - cx) / width) ** 2 + (distance / 5.0) ** 2))
    edge = np.minimum.reduce([x, x.max() - x, y, y.max() - y])
    alpha = Image.fromarray(np.uint8(255 * np.clip(edge / 7, 0, 1))).resize((194, 496))

    def frame(profile, seconds, entrance=1):
        floating, breathing, bias, turning, talking = profile
        phase = seconds * np.pi / 4
        breath = np.sin(2 * phase)
        sway = np.sin(phase - 0.6)
        turn = bias + turning * np.sin(phase)
        eyelid = sum(np.exp(-((seconds - center) / 0.071) ** 2) for center in (2.2, 6.85))
        phoneme = np.sin(20 * phase) * (0.5 + 0.5 * np.sin(3 * phase))
        sample_x = x - head * turn - (x - 165) * 0.012 * breath * chest - sway * (2 * hair + 1.4 * suit)
        sample_y = y + breathing * breath * chest - head * 0.8 * np.sin(phase) - blink * eyelid
        sample_y += talking * phoneme * mouth * np.tanh((y - 75) / 3)
        pixels = np.stack([
            map_coordinates(artwork[:, :, channel], (sample_y, sample_x), order=1, mode="nearest")
            for channel in range(3)
        ], axis=-1)
        image = Image.fromarray(pixels).resize((194, 496), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", SIZE, BACKGROUND)
        offset = floating * np.sin(phase) + (1 - entrance) * 16
        canvas.paste(image, (103, 22 + round(offset)), alpha)
        return canvas if entrance == 1 else Image.blend(Image.new("RGB", SIZE, BACKGROUND), canvas, entrance)

    for name, profile in PROFILES.items():
        print(f"Rendering {name}", flush=True)
        if name == "summon":
            def summon_frames():
                for i in range(36):
                    progress = min(i / 30, 1)
                    yield frame(profile, 0, progress * progress * (3 - 2 * progress))
            encode(name, summon_frames())
        else:
            frame(profile, 0).save(OUTPUT / f"{name}.png", optimize=True)
            encode(name, (frame(profile, i / FPS) for i in range(8 * FPS)))

    for state in ("idle", "listening", "speaking"):
        gif = Image.open(ASSETS / f"11_Animations_GIF/holly-sphere-{state}.gif")
        frames = []
        elapsed = 0
        for index in range(gif.n_frames):
            gif.seek(index)
            image = gif.convert("RGB").resize(SIZE, Image.Resampling.LANCZOS)
            next_time = elapsed + gif.info["duration"] * FPS / 1000
            frames.extend([image] * (round(next_time) - round(elapsed)))
            elapsed = next_time
        frames[0].save(OUTPUT / f"sphere-{state}.png", optimize=True)
        encode(f"sphere-{state}", frames)


if __name__ == "__main__":
    render()
