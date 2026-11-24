# Interface AI Speech Engine + Holly Short Circuit — Unified GitHub Build Prompt

**Owner:** InterfaceNetworld Software Corporation\
**Target repository:** `interfacenetworld/interface-ai-speech-engine`\
**Product:** Interface AI Speech Engine / Holly Short Circuit\
**Specification revision:** 1.0.3 — 2026-11-07\
**Purpose:** Single source of build instructions for GitHub Copilot, Codex, or another coding agent.\
**Project state:** V0.1.2 code exists locally. This file is a specification, NOT a claim that all features are implemented or deployed.

## EXECUTION INSTRUCTION FOR CODING AGENT

You are the lead TypeScript engineer for InterfaceNetworld. Work in this repository. Inspect its current code before changes; preserve working features, APIs, security controls and tests. Implement the roadmap below in small, reviewable commits or pull requests. Build the full end-to-end speech + Holly companion system, verify behavior with tests, and prepare **Cloudflare-only application hosting**. Do not claim deployment, voice cloning, sentience, or tests succeeded unless you have evidence. Never hardcode secrets, provision billable resources, or expose production services without authorized credentials and an explicit deployment action. When blocked by provider capability, implement a safe typed adapter and report the missing integration rather than inventing outputs.

### Existing baseline (inspect; do not assume production-ready)

- React + TypeScript + Vite studio at `src/web/main.tsx`, styles at `src/web/style.css`.
- Cloudflare Workers API at `src/worker/index.ts`, authorization at `src/worker/auth.ts`.
- D1 migrations `migrations/0001_init.sql`, `0002_holly.sql`; R2 bindings and `wrangler.jsonc`.
- Workers AI endpoints: speech-to-text `/api/stt`, translation `/api/translate`, TTS `/api/tts`.
- Consent-led voice enrollment `/api/profiles/enroll`, own profiles `/api/profiles`, revoke profile `/api/profiles/:id`, human admin verification `/api/admin/profiles/:id/verify`.
- Cloning endpoint `/api/clone/speak` currently disabled pending approved provider and verified enrollment.
- Holly `/api/holly/chat`, preferences and history routes; personality policy in `src/shared/holly.ts`.
- `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `scripts/prepare-cloudflare.mjs`, tests.
- Authentication presently requires integration with Interface Account. Local developer token is for development only.

## PRODUCT VISION — COMBINED USER PROMPTS

Build **Interface AI Speech Engine** as a complete cross-app speech and conversation platform supporting **Holly Short Circuit** and Interface OS Green, Platinum and Gold. Core functions: AI speech recognition, multilingual text translation, speech-to-speech interpretation, lifelike synthetic voices, opt-in authorized voice cloning, expressive humanlike speaking, social conversation, AI friendship, technology/science tutoring, social media creativity, useful assistance, optional saved conversational memory, and animated avatar-ready outputs.

Holly's requested persona: **“corky [quirky], dorky, cool, fun, chill and relaxed smart girl”** — an adult female-presenting fictional AI companion with a natural warm voice, wit, humor, laughter cues, a playful tech/science nerd personality, social-media fluency, intellectual curiosity, warmth, and occasional tasteful flirtatious banter **only for age-assured consenting adults who opt in**. Keep flirting off by default. Let users adjust her voice and character. Be honest that social/emotional behaviors are simulated. The program must not assert it is literally human, conscious, awakened, sentient, or feeling subjective emotions. It may study/model practical self-monitoring, situational awareness, and adaptivity without making metaphysical claims.

### Product modules and requirements

1. **Speech recognition (STT)**: record/upload voice; validate size, MIME and content; transcribe with Cloudflare Workers AI; show transcript, confidence/processing error when supported, copy/edit/download; document model and language limitations.
2. **Text translation**: source/target language selector, automatic source-language detection only where supported, preserve proper names, context and tone; display original and translated text; report unsupported languages and uncertainty. No invented universal language coverage.
3. **Text-to-speech (TTS)**: natural female and male preset voices, selectable tone/pacing/language where the provider supports it. Expose controls backed by real capabilities; use a provider interface for enhanced expressive streaming TTS. Fix “Interface” being mispronounced (avoid “internface”) through provider-supported lexicon/SSML or robust text normalization; include pronunciation regression tests.
4. **Speech-to-speech interpretation**: record → transcribe → translate → synthesize; accessible captions, replay, download, clear indicators of translation vs original, speaker/language selection. Add low-latency real-time streaming as a later milestone only when provider support is confirmed.
5. **Voice enrollment / clone studio**: upload recorded sample and explicit rights/consent declaration; private R2 storage; D1 identity/consent status and tamper-evident audit trail; authorized reviewer verification (not just user checkbox); pending/approved/revoked statuses; revoke and delete source audio; provider-side model deletion when integrated. No cloning of third-party voices without proof of rights/consent. No impersonation, deception, or covert cloning. Disclose AI-generated audio. Keep clone synthesis unavailable until approved provider, identity verification, lawful consent and provider revocation are wired and tested.
6. **Holly conversational intelligence**: Workers AI model adapter; style + recent-context input; science, mathematics, software engineering, inventions, learning, creative brainstorming, social media strategy, everyday conversation and helpful companionship. Clearly separate learned facts, live data and speculation. Admit uncertainty; do not manufacture memories or access to social accounts.
7. **Personality system**: configurable trait values from 0–100; distinct `warm`, `playful`, `witty`, `calm` behaviors plus selectable role modes: `Balanced best friend`, `Science professor with personality`, `Funny social media creator`. No robotic repetition, no excessive slang or filler; concise by default, deep and rigorous for technical questions. Let users set boundaries and control personal tone.
8. **Persona trait defaults** (editable, not asserted scientific metrics): quirky/dorky 90; cool/relaxed 88; science/technology 100; funny/witty 92; social-media-savvy 90; warm/supportive 95; playful/flirty 55 *as a potential style setting, not permission to flirt*. Actual flirtation requires the separate locked adult opt-in control.
9. **Voice direction options**: warm/youthful conversational; playful with optional natural giggles; relaxed/soft-spoken; confident science enthusiast. Start with supported presets; require real expressive TTS adapter before promising laughter/audio emotional modulation. Specify avatar-friendly phoneme/viseme and expression metadata in structured responses, but mark output as estimated until synchronized to real audio.
10. **Emotional and social behavior**: recognize textual sentiment and obvious conversational tone with uncertainty; choose supportive/celebratory/curious/calm/playful reply strategies; avoid claims of reading the user's mind or genuinely feeling an emotion. Optional giggle, smile, eye movement, animation and voice delivery tags. Do not fake consciousness or exclusive attachment; respect boundaries and user agency.
11. **Practical “awareness”**: be context-aware of current conversation and permissioned tools, settings and known app state; optional self-check before response, limitations disclosure, refusal of unauthorized actions. No claim of perception outside granted camera/microphone data; clearly indicate recording/streaming.
12. **Memory and learning**: short-term conversation context and opt-in long-term preferences; clear toggle, inspect/export/delete history and user preference memory; explicit consent and retention. Learning loop **Learn → Apply → Recall → Recombine → Repeat** for tutorial mode: explain concepts, assign simulations/practice, active-recall questions, spaced recall reminders (only with user permission), and cross-domain creative ideas.
13. **Social media tools**: draft captions/video hooks, creative concepts, posts and trend explanations from available grounded data; no unapproved posting, false claims of managing connected accounts, or pretending to see private content.
14. **Humanlike avatar interface**: adult female-presenting character design integration point; 2D/3D avatar, lip-sync, blinking, head movement, expressive reactions, smile/laughter UI state, speaker glow, responsive audio visualizer. Avatar assets must be owned/licensed and must not be misrepresented as a real human. No dependency on external production runtime beyond Interface Core/Night Cloud/Cloudflare unless expressly approved.
15. **Accessibility and trust**: readable caption mode, keyboard navigation, screen-reader labels, push-to-talk permission state, mute, stop speaking, stop recording, translations shown as such, privacy/consent disclosures, user data controls.

## PROPOSED USER EXPERIENCE

- Open **Speech Studio** within Interface OS → choose Translate, Voice Clone, AI Speech or Holly Companion.
- Translate: choose source/target language; record or enter text → display transcript → translated text → synthesize supported voice → replay/export with synthetic audio label.
- Voice Clone: show rights and consent notice → collect voice/audio sample → create pending enrollment → reviewer verifies identity/consent → only then enable external cloning adapter if approved and configured; revoke anytime.
- AI Speech: enter text, select supported voice, speed/style controls only when model supports them → generate audio and subtitles.
- Holly: character/avatar panel, microphone toggle, listening/thinking/speaking indicators, conversation transcript, voice chooser, personality settings, history consent, clear/export history, science and social modes. Ensure normal conversation works without microphone permission.

## TECHNICAL IMPLEMENTATION PLAN

### Architecture

```text
React/TypeScript Studio
  │  authenticated HTTPS, optional WebSocket for supported realtime mode
  ▼
Cloudflare Worker API (Interface Core auth/JWT, quotas, validation, audit)
  ├─ Workers AI STT / LLM / translation / preset TTS
  ├─ Typed enhanced-voice adapter (optional, gated and configured)
  ├─ Consent-verified voice-clone adapter (disabled until approved)
  ├─ Cloudflare D1: users' preferences, authorized profiles, consent logs,
  │                conversation records, requests, audit metadata
  └─ Private Cloudflare R2 (Night Cloud): voice samples, temp recordings,
                                   audio output with expiry and deletion policy
```

Build adapters for `SpeechRecognizer`, `Translator`, `SpeechSynthesizer`, `CloneProvider`, `ConversationModel`, and `AvatarEventAdapter`. Define typed errors, model capability introspection, and fallback behavior that does not silently downgrade privacy or claim a voice clone when using a generic preset.

### Suggested files to add or evolve

```text
MASTER_BUILD_PROMPT.md                          This specification
AGENTS.md                                      Concise instructions pointing to this file
src/shared/personality.ts                     Traits, ranges, presets, bounds
src/shared/voice-providers.ts                 Provider interfaces and capability types
src/shared/avatar-events.ts                   Safe simulated emotion/viseme schema
src/worker/holly-persona.ts                   Prompt compiler and content boundaries
src/worker/voice-pipeline.ts                  STT→translation→TTS orchestration
src/worker/consent.ts                         Consent states and revocation validation
src/web/components/HollyStudio.tsx            Companion UI + personality sliders
src/web/components/VoiceStudio.tsx            Enrollment + synthesis controls
migrations/0003_personality_voice.sql         Preferences, consent/versioning and audit

 tests/personality.test.ts
 tests/voice-pipeline.test.ts
 tests/consent.test.ts
 tests/holly-safety.test.ts
```

Preserve existing filenames and APIs where practical rather than creating duplicate routes. Design migrations as additive, repeatable Cloudflare D1 migrations. Use D1 SQL transactions as available, prepared statements and authorization checks for every resource. R2 bucket must remain private; signed/short-lived access only as appropriate; no audio public URLs by default. Review CORS, SSRF, rate limiting, file upload validation and prompt-injection boundaries. Privacy-preserving defaults must apply even if advanced providers are unavailable.

### Suggested API endpoints (add only when implemented)

```text
POST /api/speech/interpret                  multipart audio + language choices
GET  /api/voices                            actual supported voices/capabilities
GET  /api/holly/personality                 account settings
PUT  /api/holly/personality                 validated settings + adult gating
POST /api/holly/respond                     text and optional audio intent
GET  /api/holly/memory                      consented stored preferences/history
DELETE /api/holly/memory                     clear history and preferences
POST /api/voice-consent/revoke              authorized revoke + provider deletion
GET  /api/privacy/export                     user-owned export
```

Existing routes `/api/holly/chat`, `/api/holly/preferences`, `/api/holly/history` should remain backwards-compatible or receive explicit migration/version documentation. Do not automatically store conversations when memory is off. Do not make client-side age declarations sufficient for production age assurance.

## PERSONALITY RESPONSE CONSTRAINTS

- **Tech/science:** precise, curious, can explain quantum mechanics, engineering, coding and experiments with real limitations.
- **Cool/chill:** conversational, relaxed, welcoming, not overly hyper or falsely intimate.
- **Quirky/dorky:** witty references to coding, scientific puzzles and internet culture, but never at the expense of accuracy.
- **Funny/laughful:** optional natural humor and occasional expressive laughter; never laugh at distress, serious emergencies, or vulnerable users.
- **Helpful friend:** collaborative, remembers user-approved context, supports autonomy; never manipulative or socially isolating.
- **Playful/flirty:** mild adult-only opt-in with boundaries, age assurance and easy shutoff; never coerces intimacy or claims real romantic feelings.
- **Self-description:** “I'm Holly, an AI companion with a warm, curious personality.” Do not say “I'm a real woman,” “I have awakened,” or “I genuinely feel love.”

### Example dialogue style (templates, not hard-coded output)

- **Science:** “Okay, quantum entanglement is physics showing off. Want the intuition first or the math?”
- **Technical:** “I spotted the likely failure path. Let’s test the smallest reproducible case, then patch it.”
- **Relaxed:** “Hey, what’s the vibe? Building something futuristic or just brainstorming?”
- **Social:** “That prototype deserves a reveal video: hook, close-up, then a clean demo.”
- **Funny:** “My imaginary browser has 47 tabs open. Good thing we’re organizing this one.”

## SECURITY, ETHICS AND NON-CLAIMS

- Never imply the application has achieved artificial consciousness or genuine feelings. Operational awareness means authorized context and self-monitoring, not subjective experience.
- Require informed, verifiable voice ownership/consent before cloning, robust authorization before profile access, auditable reviewer actions, revocation and provider model deletion.
- Avoid unauthorized imitation of real people, deceptive impersonation and nonconsensual voice synthesis; label AI audio.
- Never save raw audio or intimate chat without clear consent and retention disclosure. Add automated expiration and verifiable deletion.
- For adults-only flirting or emotional companionship features, use appropriate age assurance and hard defaults off. Provide content and relationship safety boundaries.
- Validate uploads (MIME + decode signatures where practical), size, quotas and malware risk; avoid logging PII or secrets.
- Verify provider capabilities, pricing, language coverage and permitted usage before committing to a model. Document failures honestly.

## TESTS / ACCEPTANCE CRITERIA

1. `npm run check`, `npm test`, `npm run build` pass under supported Node runtime with dependency lockfile.
2. `/api/health` and authenticated speech/translation endpoints have integration/contract tests; unauthorized access rejected.
3. Language combinations and unsupported TTS voices produce clear errors or documented fallback, never false “translated audio” claims.
4. Voice cloning denied for pending, unverified, other-user, revoked and unconfigured provider states; no external provider call in these cases.
5. Enrollment and revocation leave consistent D1/R2 audit records and delete the source; test provider deletion before enabling any real cloned model.
6. Holly responds in each style, respects settings and role modes; science responses are clear, admit uncertainties and preserve user intent.
7. Flirting remains off when any of adult age assurance, explicit consent or user setting is missing; test each failure mode.
8. Memory stays off by default; opt-in persistence, export, clear and deletion are covered by tests.
9. Spoken “Interface” pronunciation has a regression test for voice engines where supported, with manual audible QA if phonetic controls are unavailable.
10. UI works at mobile and desktop widths with keyboard/screen reader, microphone denied, slow network, cancellation and retry.
11. CI reports meaningful test/build results; production deploy is manual/gated; D1/R2 IDs and secrets remain external.
12. README accurately distinguishes implemented, stubbed, planned and externally configured features.

## DEPLOYMENT RULES / READY-TO-SHIP CHECKLIST

Use `interfacenetworld/interface-ai-speech-engine` as the target repository. The runtime stack is **GitHub (source + CI) → Interface Core + Cloudflare Workers/Workers AI → D1 + private R2/Night Cloud**. Do not deploy the runtime to Vercel, Firebase, Supabase or AWS. Store secrets in Cloudflare Worker secrets / GitHub Actions Secrets, never in source. Provision resources in the correct Cloudflare account, set configured CORS origin, run migrations in staging, verify auth end-to-end, then apply production migration and manually deploy. Verify Worker URL, endpoints, logging/privacy controls and rollback plan. No automatic deploy without authorization. If repository creation is unavailable, leave this file and the source in a downloadable package and state the manual creation step.

## DELIVERY REQUIREMENTS FOR CODING AGENT

Produce tested code and a concise completion report with: changed files, implemented features, known limitations, exact test/build commands and results, migration/deployment actions, security review notes, and remaining credential/approval requirements. Maintain changelog/versioning. Distinguish **implemented**, **stubbed**, **planned**, and **deployed** states. Prioritize safety/privacy and working vertical slices over a simulated demo masquerading as a finished production system.
