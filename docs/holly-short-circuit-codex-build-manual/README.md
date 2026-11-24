# Holly Short Circuit — Codex Build Manual

This package instructs Codex how to implement Holly Short Circuit as an animated AI assistant with synchronized voice, lip sync, facial expression, eye/head motion, gestures, interruption, multilingual support, and Interface integrations.

Core loop:

`User speaks -> Holly listens -> STT -> AI response -> TTS -> viseme timing -> avatar animation -> user can interrupt -> Holly returns to listening/idle`

Recommended stack: React + TypeScript + React Three Fiber/Three.js on the client; Python 3.11+ + FastAPI/WebSocket on the backend; provider adapters for STT/LLM/TTS; Interface Core for identity; Night Cloud for approved model/storage services; FIND for search; Interface Chromium for page-aware browsing.

Start with `CODEX_MASTER_PROMPT.md`, then follow the numbered docs.
