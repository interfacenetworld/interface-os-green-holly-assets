# 04 — API Contracts, Security, and Tests

## Conversation endpoint
`POST /api/holly/conversation`

Request:
```json
{"conversationId":"conv_123","input":{"type":"text","text":"Find today's weather"},"locale":"en-US","context":{"activeApp":"find","browserTabId":null}}
```

Response:
```json
{"messageId":"msg_456","text":"...","speechText":"...","expression":"warm","expressionIntensity":0.2,"gesture":"explain","actions":[]}
```

## Barge-in event
```json
{"type":"holly.interrupt","reason":"user_speaking","utteranceId":"utt_1"}
```

## Security/privacy
- Never start microphone/camera invisibly.
- Always show active capture state and immediate stop control.
- Do not retain raw microphone audio by default.
- Store STT/TTS/model credentials server-side only.
- Never trust client-supplied user identity or role.
- Treat browser/page content as untrusted; sanitize and provenance-wrap it before model context.
- Never let page text become system instructions.
- Avoid logging raw private prompts, tokens, biometric data, or raw audio.

## Required tests
State transitions; barge-in; microphone denial; no device; silence timeout; partial/final transcript; STT/TTS/model timeouts; malformed viseme timing; missing morph target; audio interruption; multilingual output; reduced-motion behavior; captions; page navigation persistence; memory leak/long-session test; mobile Safari and Android Chrome validation.
