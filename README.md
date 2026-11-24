# Interface OS Green — Holly Short Circuit Asset Library

**Version:** 1.0 · **Project:** InterfaceNetworld · **Intended consumer:** Interface Core

This private repository is for the original `Interface_OS_Green_Holly_Short_Circuit_Separate_Assets_v1.0` artwork package.

## Source archive inventory

- 445 entries, approximately 35.3 MB uncompressed
- 307 PNG files, 120 editable SVG files, 14 motion-preview GIFs
- 1 preview HTML, 1 gallery stylesheet, 1 source README and 1 JSON manifest
- The original archive includes reference boards, independent icon/vector artwork, widgets, navigation, speaking-light components and character-mode design references.

**Import status:** The original assets are available in the workspace under
`public/holly-green/assets/`. The nine split archives preserve that directory
structure. For the older single-archive layout, see `tools/import_asset_kit.py`.

The source package contains **concept/design assets only**. It does not include functional 3D rigging, FaceKey biometric identity processing, camera/mic permissions, speech synthesis, or a Holly AI backend.

## Integration plan

1. Import the entire original package and verify the manifest and preview references.
2. Reference the assets from Interface Core's static assets pipeline after reviewing icon licenses and file sizes.
3. Wire Holly UI controls to authenticated Interface services separately.
4. Test desktop/mobile layouts and accessibility.
5. Keep production deployment independent of this asset import.

No live Interface Core or Cloudflare deployment is triggered by initializing this repository.

## Character UI implemented

The repository now includes a browser-ready interface under `ui/index.html`, with `ui/holly.css` and `ui/holly.js` for character modes, speaking-light visual selection, expression controls, local message demonstration, and opt-in camera/microphone start/stop controls. **AI inference, speech recognition, biometric FaceKey validation, and backend plugins are not connected.**

## Holly idle animation

Open [the local preview](ui/index.html) or serve the repository root with
`python -m http.server 8000` and visit `/ui/`. For a static integration, keep
`ui/` and `public/holly-green/` in the same relative layout or update the image URL
in HTML and the `BASE` path in JavaScript to match your static asset mount.

| State | Playback |
| --- | --- |
| Default idle | Eight-second full-body loop with breathing, two blinks, small head shifts, floating, and localized hair and suit sway |
| Attentive | Eight-second loop with a slightly shifted head pose and quieter float |
| Listening | Eight-second loop with a subtle head angle and less body movement |
| Speaking | Eight-second loop with small procedural mouth motion |
| Summon | 1.5-second entrance that returns to full-body idle |
| Companion and Creator | Full-body idle loops with their own motion amplitudes |
| Speaking Light | Original sphere idle, listening, and speaking previews converted to video |

The ten clips in `public/holly-green/motion/` have silent VP9 WebM and H.264 MP4
versions. The player tries WebM and then MP4 where supported and shows a PNG while
loading. The original GIFs remain in `assets/11_Animations_GIF/` under the same
public folder. The character default and sphere states can use those GIFs if
video formats fail. Other states fall back to a still, and a browser autoplay
block leaves the still visible. Pausing or enabling
`prefers-reduced-motion: reduce` unloads video and uses a static image. A summon
requested in either case immediately selects default idle.

- **HTML** uses `#holly` for the poster and fallback image, `#holly-motion` for
  muted inline video, and `data-state` and `data-mode` for preview controls.
- **CSS** gives the media a shared responsive aspect ratio, keeps the full figure
  in view, and preserves the single-column mobile layout.
- **JavaScript** maps mode and state to a clip in `clipForState()`.
  `selectState()` handles state changes and `render()` owns playback and the
  fallback chain. A future conversation adapter can call `selectState()` when
  actual listening or audio output starts and ends. The supplied buttons and
  scripted chat are local animation demos. Speaking motion has no audio sync.

The nine split ZIPs were verified against the split manifest and imported under
`public/holly-green/assets/` with all 445 original assets. The character motion
was synthesized from the supplied full-body PNG. To regenerate it, run
`python tools/render_holly_motion.py` with Pillow, NumPy, SciPy, and FFmpeg with
libx264 and libvpx enabled. The package includes design references, flattened
artwork, and GIF previews. Editable animation timelines, a character rig,
separated hair and costume artwork, and facial blendshapes or audio-aligned
visemes were absent. Those would support authored motion and synchronized
speech in a future production pass.
