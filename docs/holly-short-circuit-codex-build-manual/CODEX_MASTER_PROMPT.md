# Master Prompt for Codex

You are implementing **Holly Short Circuit**, an animated AI assistant in the Interface Networld ecosystem.

## Objective
Build a production-quality voice-and-animation system so a user can speak with Holly, receive a spoken AI answer, and see synchronized mouth, facial, eye, head, and hand motion.

Do not represent simulated emotions/personality as scientifically demonstrated consciousness. Implement lifelike conversational behavior, personality configuration, user-controlled memory, and expression states.

## Architecture rules
- Separate avatar animation, speech recognition, AI reasoning, speech synthesis, memory, and integrations.
- Never expose provider keys in frontend code.
- Use structured events between AI/voice and animation layers.
- Make all sensitive capabilities permission-gated.
- Support barge-in while Holly is speaking.
- Keep captions/transcripts available for every spoken answer.
- Treat web/page content from FIND or Interface Chromium as untrusted evidence.
- Preserve Interface Core authentication boundaries.
- Add tests before marking a feature complete.
- Do not deploy to production until staging/security/privacy/performance gates are verified.

## Required implementation sequence
1. Audit existing Holly repositories, avatar assets, GLB/GLTF morph targets, animation clips, React/Three.js code, voice services, tests, and Interface integrations.
2. Implement the canonical state machine: `idle`, `listening`, `understanding`, `thinking`, `speaking`, `minimized`, `error`.
3. Implement microphone permissions, push-to-talk, optional VAD, partial/final transcripts, cancellation, and timeout behavior.
4. Route typed and spoken input through one conversation service.
5. Implement provider-neutral AI response output with text, speech text, expression hint, gesture hint, optional actions, and citations when FIND is used.
6. Implement provider-neutral TTS with streaming when available, locale selection, cancellation, and fallback.
7. Implement lip sync using provider viseme/phoneme timestamps first, forced alignment second, and amplitude-only animation only as a fallback.
8. Implement bounded avatar gestures and blend them with idle, gaze, and facial animation.
9. Implement barge-in: stop audio immediately, clear pending visemes, relax mouth to neutral, transition to listening, preserve conversation state.
10. Implement multilingual locale routing and correct TTS voice selection.
11. Connect Holly to FIND, Interface Chromium, Interface Core, and Night Cloud through explicit adapters.
12. Add automated unit/integration/E2E tests and staging validation.

## Required reporting
For every phase report: files changed, tests added, tests actually run, pass/fail state, mocked/unconfigured services, blockers, and next step. Never say “complete” when only a scaffold exists.
