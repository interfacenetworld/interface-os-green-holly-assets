# 01 — Architecture

## System

```text
User
  | voice / text
  v
Holly UI + Avatar
  v
Conversation Controller
  +--> STT Adapter
  +--> Interface Core session
  +--> authorized memory
  +--> FIND context
  +--> Interface Chromium page context
  v
AI Conversation Service
  | text + speechText + expression + gesture + actions
  v
TTS Adapter
  | audio + viseme/phoneme timing
  v
Holly Animation Controller
  +--> lips/jaw
  +--> eyes/blinks/gaze
  +--> head
  +--> hands/body
```

## Frontend modules
- `HollyAvatar`
- `HollyStateMachine`
- `HollyVoiceController`
- `LipSyncController`
- `GestureController`
- `AudioPlaybackController`
- `CaptionPanel`
- `PermissionUI`

## Backend modules
- `conversation_service`
- `stt_adapter`
- `tts_adapter`
- `memory_adapter`
- `find_adapter`
- `chromium_adapter`
- `interface_auth_adapter`

## Event-driven contract
The avatar must animate from events rather than knowing which TTS or model provider generated the answer.

Example:
```json
{
  "type":"holly.speech.ready",
  "utteranceId":"utt_123",
  "audioUrl":"/api/holly/audio/utt_123",
  "durationMs":2310,
  "visemes":[{"timeMs":0,"id":"sil"},{"timeMs":120,"id":"AA"}]
}
```
