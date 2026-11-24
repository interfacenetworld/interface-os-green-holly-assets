# 02 — Voice and Lip Sync

## Input pipeline
`idle -> microphone permission -> listening -> transcript -> understanding -> AI request`

Typed input must use the same conversation endpoint as voice input.

## STT adapter
```python
class SpeechToTextAdapter:
    async def transcribe(self, audio: bytes, locale: str) -> str:
        ...
```

For streaming STT, emit `partial` and `final` transcript events.

## TTS adapter
```python
class TextToSpeechAdapter:
    async def synthesize(self, text: str, locale: str, voice_id: str | None = None):
        ...
```

Return audio plus duration and viseme/phoneme timing when available.

## Lip-sync priority
1. TTS-provided viseme timestamps.
2. Phoneme timestamps mapped to visemes.
3. Forced alignment against generated audio.
4. Audio-amplitude mouth-open approximation only as fallback.

Example mapping:
- `sil -> mouthClose`
- `AA -> jawOpen`
- `E -> jawOpen + mouthSmile`
- `O -> mouthFunnel`
- `U -> mouthPucker`
- `M/B/P -> mouthClose`

Use interpolation; never snap morph weights. On interruption, stop audio, clear future visemes, and blend mouth to neutral in roughly 100–200 ms.

## Voice target
Natural, warm, conversational, technologically confident, expressive but not exaggerated. Keep the voice profile configurable so the system is not locked to one vendor.
