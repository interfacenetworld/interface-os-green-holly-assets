# 05 — Codex To-Do Until Active

## P0 Audit
- locate Holly avatar repository and frontend entry point
- inventory GLB/GLTF assets, morph targets, bones, animation clips
- inventory existing voice/AI code and tests

## P1 State machine
- implement canonical states and deterministic transitions
- add unit tests

## P2 Voice input
- permission UI
- push-to-talk
- optional VAD
- STT adapter
- transcript UI

## P3 AI response
- common conversation endpoint for voice/text
- streaming response support
- expression/gesture metadata

## P4 Voice output
- TTS adapter
- audio playback controller
- cancellation/barge-in
- captions

## P5 Lip sync
- viseme timeline
- morph-target mapping
- smoothing
- fallback alignment

## P6 Body/face animation
- blink/gaze
- breathing
- head motion
- bounded gesture clips
- animation blending

## P7 Persistence
- Holly remains present across pages
- conversation state survives navigation
- minimize to orb and restore

## P8 Integrations
- FIND search/research
- Interface Chromium page-aware browsing
- Interface Core authorization
- Night Cloud model/storage adapters

## P9 Hardening
- privacy controls
- observability
- accessibility
- performance/load tests
- security review

## P10 Staging and production gate
Do not mark active until CI passes, real STT/AI/TTS are connected, lip sync is visually verified, interruption works, mobile performance is acceptable, security/privacy review passes, monitoring exists, and rollback is verified.
