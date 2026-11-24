# Interface OS Green · Holly Short Circuit · Separate Asset Files v1.0

This package separates the **previously generated Interface OS Green / Holly Short Circuit artwork** into many individual usable image files, with additional directly editable SVG vector components and 2D animated GIF motion previews.

## What's inside

- `00_Reference_Boards/` — full original design boards (for comparison/reference)
- `01_Icons_SVG/` — separately editable vector SVG icon artwork
- `01_Icons_PNG_Transparent/` — separate transparent glyphs rendered from SVG
- `01_Icon_Tiles_PNG/` — individual icon tiles cropped from the icon board (black/green background)
- `02_Vectors_SVG/`, `02_Vectors_PNG/` — standalone orbit rings, speaking sphere, holographic cube, light wings, waveform, platform, panel, scan frame
- `03_Components/` — input styles, cards, tabs, search and button examples
- `04_Background_Pages/` — six scene thumbnails plus responsive layout fragments
- `04_Background_Pages_Vector/` — scalable patterned planet horizon / network background assets
- `05_Navigation_Buttons/` — separated navigation strips and independently scalable nav buttons
- `06_Widgets/` — assistant, status, storage, security, profile, media widgets
- `07_Boxes/` — cropped container styles plus editable standalone transparent vector panels
- `08_Slide_Bars/` — extracted slider images plus scalable vector slider graphics
- `09_Holly_Character/` — Holly full-body art, turnarounds, mesh illustrations, facial expressions, suit details
- `10_Holly_Modes/` — individual cards for five modes
- `11_Animation_Keyframes/` — 10 separate conceptual motion-step thumbnails plus transition panels
- `11_Animations_GIF/` — 14 real looped 2D motion previews: 10 speaking-light animations and 4 character composite effects (summon, hover, pulse, sphere-to-character)
- `12_Speaking_Light/` — light sphere states and stills
- `13_Motion_Control_Buttons/` — separate scalable SVG/PNG motion buttons
- `14_Previews/index.html` — offline gallery for browsing everything visually

## Intended application
Use editable SVGs for UI code / Interface Editor, 256-pixel PNG icon exports for raster UI, transparent panel SVGs for glass widgets, and source-design crops for design review. The light-sphere GIFs are prototype visual animation only; for production use the motion-state specification in `manifest.json`.

## Important limitations
- Cropped character image assets include parts of their original concept-board backdrops; they are **not transparent 3D character textures or meshes**.
- Reference-board icons are not automatically traced. The icons in `01_Icons_SVG` are separate clean scalable implementations inspired by the designs; they may differ in detail from the painted reference boards.
- Background-page PNGs are **extracted thumbnails** rather than full-resolution layered backgrounds. For scalable environments, use the vector backgrounds and rebuild or re-render scene art.
- The package does **not** include a rigged 3D model, FBX/GLB blendshapes, live lip-sync, FaceKey identity verification, real voice recognition, or system integrations.
- Character polycounts printed in concept artwork are illustrative labels, not measured 3D geometry.
- Original reference images remain intact. No assets have been pushed to GitHub or deployed.
- No infinity symbol was added to Interface brand artwork.

## Color tokens
- Primary green `#00FF87`
- Dark background `#020D0D`
- Deep green `#0A3D1F`
- Circuit gold `#FFD66B`
- Energy mint `#7CFFCC`

## Asset use
Open `14_Previews/index.html` after extracting the ZIP. Assets are grouped by category and each image has its own filename.
