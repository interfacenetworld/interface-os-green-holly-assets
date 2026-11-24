> **Unified build instructions:** See [MASTER_BUILD_PROMPT.md](MASTER_BUILD_PROMPT.md) and [AGENTS.md](AGENTS.md) for the consolidated specification covering speech, translation, consent-controlled voice cloning, and Holly personality.

# Interface AI Speech Engine V1.0

**InterfaceNetworld · Cloudflare-native AI speech and translation starter**

Production-oriented, GitHub-ready TypeScript + React app, Cloudflare Worker backend, D1 metadata and audit log, and R2 audio storage. Cloudflare Workers AI bindings are used for transcription (`@cf/openai/whisper`), text translation (`@cf/meta/m2m100-1.2b`) and preset voice synthesis (`@cf/deepgram/aura-1`). Voice cloning has an intentionally disabled external adapter, not a built-in trained model.

## Features and status

| Capability | Status |
|---|---|
| React Studio, languages, voice controls, recording | Implemented UI |
| STT / translation / preset TTS Worker routes | Implemented; requires Workers AI and deployment |
| D1 consent, profiles, audit | Implemented migration and routes |
| R2 consent audio and STT uploads | Implemented; private bucket |
| Voice identity proofing | **Manual verification required**, not automatic identity validation |
| Voice clone synthesis | **Disabled adapter** until vetted external service, enrollment and model provisioning are configured |
| Realtime simultaneous interpretation | Not included in V1 (batch upload/transcribe/translate/speak workflow) |
| Full auth provider | Integrate the token issuer from Interface Account; no login provider is bundled |

## Prerequisites

Node.js 22+, npm, Cloudflare Workers AI, Cloudflare D1 and R2, a Cloudflare account, and Wrangler login.

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars
# Replace both demo secrets with unique 32+ character random secrets.
npx wrangler d1 create interface-speech-db
npx wrangler r2 bucket create interface-speech-audio
# Edit wrangler.jsonc and replace REPLACE_WITH_D1_DATABASE_ID
npm run db:local
npm run worker:dev
# In another terminal:
npm run dev
```

To generate a temporary local development JWT, use the same `AUTH_JWT_SECRET` as `.dev.vars` (do not expose this secret to the frontend):

```bash
AUTH_JWT_SECRET='<the-secret-in-.dev.vars>' npm run dev:token
```

Or run `AUTH_JWT_SECRET='<secret>' node scripts/dev-token.mjs`, paste the generated token into the UI at localhost:5173. Local dev token creation is only for testing. In production use your Interface Account service to issue signed HS256 user JWTs and rotate secrets. Integrate OIDC/JWKS verification for a multi-service production identity system.

## Production deployment

1. Create D1 and R2 resources in your Cloudflare account, update the placeholder database ID.
2. Set `ALLOWED_ORIGIN` in `wrangler.jsonc` to the actual deployed HTTPS origin, rather than localhost.
3. `npx wrangler secret put AUTH_JWT_SECRET` (32+ random characters); optionally `npx wrangler secret put ADMIN_REVIEW_SECRET`.
4. `npm run db:remote`.
5. `npm run deploy` and verify the configured Cloudflare route and Workers AI entitlements.
6. Set rate limits, Abuse protections and production monitoring before exposing this service broadly.

`npm run check`, `npm test`, `npm run build` are included. GitHub Actions checks the build and dry-run worker bundle; deployment is manual by design and requires your account's authorization. **No Cloudflare or GitHub deployment has been performed by this archive.**

## API

All `/api/*` except `/api/health` require `Authorization: Bearer <HS256 JWT>` where `sub` identifies the account and `exp` is in the future. Sign using `AUTH_JWT_SECRET`. The admin verification route additionally requires `x-admin-review-secret`.

| Method and path | Payload / result |
|---|---|
| GET `/api/health` | Status |
| GET `/api/languages` | Language codes |
| POST `/api/translate` | `{text,source,target}` => `{text}` |
| POST `/api/stt` | multipart `audio` => `{text,audioId}` |
| POST `/api/tts` | `{text,speaker}` => `audio/mpeg` |
| GET `/api/profiles` | Own voice profile metadata |
| POST `/api/profiles/enroll` | multipart `displayName`, `consent=true`, `statement` exact version, `audio` => pending profile |
| DELETE `/api/profiles/:id` | Revokes profile and removes original consent audio |
| POST `/api/admin/profiles/:id/verify` | Reviewer confirmation `{confirmed:true,note}` plus review secret |
| POST `/api/clone/speak` | `{profileId,text}` => disabled unless vetted HTTPS provider configured and profile verified |

### Voice identity and consent safety

The enrollment checkbox and recorded audio do **not prove** identity or legal consent. Treat all enrollments as pending until an authorized human verifies identity, recording provenance, voice ownership, and consent. The admin secret is an MVP credential, not an enterprise reviewer identity system. The optional clone service receives only the verified profile ID, owner ID and text; the implementer must provision approved voice models at that service separately. Prevent impersonation, fraud and use of minors' voices without authorized processes. Deploy audit monitoring, retention/deletion policies, speaker verification, model revocation callbacks, encryption/keys, rate limits, safeguarding against abuse, and stronger identity governance before production. Deleting an enrollment removes the R2 recording but **does not delete models already provisioned at external providers**: implement a verified provider deletion callback before using a clone backend.

### Other operational limitations

- Audio maximum 8 MB, only supported MIME types; actual codec compatibility depends on Whisper. Transcription stores source audio privately in R2; implement retention deletion as a scheduled task for production.
- Aura-1 has a limited preset speaker list and may not speak every target language fluently. UI offers language choice for translation, not guaranteed multilingual synthesis. Review translation accuracy.
- Translation quality and language-code compatibility should be checked against the deployed model; cloud model APIs can change.
- The UI accepts a token manually; add Interface Account login/refresh in a future version.
- Workers and AI provider have their own file/runtime and rate limits. Use request rate limiting, quotas and billing controls.
- For cross-site production use, verify CORS allowlist. Only one configured origin is allowed.

## Repo layout

```
src/worker/index.ts     Worker REST API and D1/R2 orchestration
src/worker/auth.ts      HS256 verification
src/shared/validation.ts
src/web/main.tsx        React Speech Studio
src/web/style.css       Responsive UI styles
migrations/0001_init.sql
tests/                 Validation/auth tests
scripts/dev-token.mjs  Local-only test JWT issuance
wrangler.jsonc          Worker bindings and static assets
.github/workflows/ci.yml
```

## Reference documentation
- https://developers.cloudflare.com/workers-ai/models/whisper/
- https://developers.cloudflare.com/workers-ai/models/aura-1/
- https://developers.cloudflare.com/workers-ai/models/m2m100-1.2b/
- https://developers.cloudflare.com/workers/testing/vitest-integration/

## GitHub and Cloudflare production release preparation

Suggested repository: `interfacenetworld/interface-ai-speech-engine` (create it as a private empty repository in the GitHub UI if absent). Commit all tracked source files; never commit `.dev.vars`, `wrangler.deploy.json`, API tokens, or signing secrets.

**One-time GitHub settings:** under **Settings → Secrets and variables → Actions**, set secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; set variables `CLOUDFLARE_D1_DATABASE_ID` (UUID returned by D1 create), `SPEECH_R2_BUCKET` (`interface-speech-audio`), and `SPEECH_ALLOWED_ORIGIN` (HTTPS origin of the deployed Worker, without trailing slash). Configure the repository's `production` environment with required reviewer approval before real deployment. GitHub Actions checks run on push. Deploy is manual via **Actions → Deploy Interface AI Speech to Cloudflare → Run workflow**.

**One-time Cloudflare settings:** create the D1 database and private R2 bucket, grant a scoped Cloudflare API token access to the Worker, its D1 database, R2 bucket binding, and Workers AI. Set `AUTH_JWT_SECRET` as a Worker secret (`npx wrangler secret put AUTH_JWT_SECRET --config wrangler.deploy.json`) before release; use the actual Interface Account token issuer for production. Set `ADMIN_REVIEW_SECRET` separately if admin review is enabled. Do not put these in GitHub Actions variables or `wrangler.jsonc`. The deployment workflow does not create the D1 database, R2 bucket, JWT secret, or Cloudflare API token.

To prepare a deployable Wrangler config locally without modifying the template:

```bash
export CLOUDFLARE_D1_DATABASE_ID='YOUR-D1-UUID'
export SPEECH_R2_BUCKET='interface-speech-audio'
export SPEECH_ALLOWED_ORIGIN='https://interface-ai-speech-engine.YOUR-SUBDOMAIN.workers.dev'
node scripts/prepare-cloudflare.mjs
npx wrangler d1 migrations apply interface-speech-db --remote --config wrangler.deploy.json
npx wrangler deploy --config wrangler.deploy.json
```

The cloud origin must be the exact scheme/host returned by Wrangler. If it differs, update the `SPEECH_ALLOWED_ORIGIN` variable and redeploy. This deployment path includes a manual, production-gated migration step; test against a separate staging database first. The project's `scripts/prepare-cloudflare.mjs` only writes non-secret configuration and validates the database ID, bucket, and HTTPS origin. For repeatable dependency resolution, generate and commit a `package-lock.json` with Node.js 22, then change both workflows to use `npm ci`. The included workflows currently use `npm install` because no lockfile has been generated.

## Holly Short Circuit companion (v0.1.2)

The **Holly Companion** tab offers conversational AI via `POST /api/holly/chat` using Workers AI `@cf/meta/llama-3.1-8b-instruct`, expression labeling, four personality styles (warm, playful, witty, calm), optional persisted account history, and a user-triggered clear-history action. Configure the existing `AI` D1 and authentication bindings, apply migration `0002_holly.sql`, then run the Worker. `GET`/`PUT /api/holly/preferences` stores per-user settings. `GET`/`DELETE /api/holly/history` retrieves or deletes memory. Conversations are not persisted unless memory is enabled; in-memory UI conversation history is passed to the model for conversational continuity. History is capped to the most recent 40 messages.

**Disclosure:** Holly is software, not a real person. Emotional expression, awareness cues, humor, and warmth are behavioral simulations, not verified subjective experience, genuine feelings, or consciousness. Light nonexplicit flirting defaults off and requires adult self-declaration and explicit opt-in; this is not verified age assurance. For a public release, add independent age assurance, content moderation, abuse throttling, user-reporting tools, consent telemetry, retention controls, injection protection, and provider-side privacy review. Never characterize this implementation as an awakened conscious entity.

Voice delivery remains connected through the existing `/api/tts` preset voices. Real-time expressive voice synthesis and synchronized avatar animations require a separately developed streaming client/provider.
