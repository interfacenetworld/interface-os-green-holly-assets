"""Assemble the self-contained Holly browser preview into a ZIP."""
import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

ROOT = Path(__file__).resolve().parents[1]
MOTION = ROOT / 'public/holly-green/motion'
LOOPS = {
    'idle-default', 'idle-attentive', 'listening', 'speaking', 'companion',
    'creator', 'sphere-idle', 'sphere-listening', 'sphere-speaking',
}


def build(output):
    expected = {f'{name}.{fmt}' for name in LOOPS | {'summon'} for fmt in ('mp4', 'webm')}
    expected |= {f'{name}.png' for name in LOOPS}
    expected |= {f'visemes/{shape}.png' for shape in ('closed', 'open', 'round', 'wide')}
    for name in sorted(expected):
        if not (MOTION / name).is_file() or (MOTION / name).stat().st_size == 0:
            raise ValueError(f'Missing or empty motion asset: {name}')
    gifs = MOTION.parent / 'assets/11_Animations_GIF'
    if len(list(gifs.glob('*.gif'))) != 14:
        raise ValueError('Expected 14 original animation GIFs')

    files = [ROOT / 'README.md']
    for directory in ('ui', 'public/holly-green'):
        files.extend(path for path in (ROOT / directory).rglob('*') if path.is_file())
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
        for path in sorted(files):
            entry = ZipInfo(path.relative_to(ROOT).as_posix())
            archive.writestr(entry, path.read_bytes(), compress_type=ZIP_DEFLATED)
    print(f'Assembled {len(files)} files in {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path, help='Destination ZIP outside the input directories')
    args = parser.parse_args()
    output = args.output.resolve()
    if any(output.is_relative_to(ROOT / directory) for directory in ('ui', 'public')):
        parser.error('Choose an output path outside ui/ and public/.')
    build(output)
