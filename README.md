# Interface OS Green — Holly Short Circuit Asset Library

**Version:** 1.0 · **Project:** InterfaceNetworld · **Intended consumer:** Interface Core

This private repository is for the original `Interface_OS_Green_Holly_Short_Circuit_Separate_Assets_v1.0` artwork package.

## Source archive inventory

- 445 entries, approximately 35.3 MB uncompressed
- 307 PNG files, 120 editable SVG files, 14 motion-preview GIFs
- 1 preview HTML, 1 gallery stylesheet, 1 source README and 1 JSON manifest
- The original archive includes reference boards, independent icon/vector artwork, widgets, navigation, speaking-light components and character-mode design references.

**Import status:** Repository initialized. **The original 445 asset files are not yet committed.** The GitHub connector cannot directly read or stream the binary images from the uploaded ZIP. Do not mistake this README for a completed upload.

## Import complete package

Use `tools/import_asset_kit.py` locally against the original ZIP to extract and validate it, preserving the directory structure under `assets/`. Then review the changes and commit them through Git. The script never uploads or deploys anything by itself.

```bash
python tools/import_asset_kit.py "/path/to/Interface_OS_Green_Holly_Short_Circuit_Separate_Assets_v1.0.zip"
git status --short
git add assets
git commit -m "assets: import Interface OS Green Holly separate artwork v1.0"
git push origin main
```

The source package contains **concept/design assets only**. It does not include functional 3D rigging, FaceKey biometric identity processing, camera/mic permissions, speech synthesis, or a Holly AI backend.

## Integration plan

1. Import the entire original package and verify the manifest and preview references.
2. Reference the assets from Interface Core's static assets pipeline after reviewing icon licenses and file sizes.
3. Wire Holly UI controls to authenticated Interface services separately.
4. Test desktop/mobile layouts and accessibility.
5. Keep production deployment independent of this asset import.

No live Interface Core or Cloudflare deployment is triggered by initializing this repository.
