import { readFileSync, writeFileSync } from 'node:fs';

// Creates a deployable Wrangler configuration without editing the source template.
// This script never reads or writes API tokens or JWT signing secrets.
const id = process.env.CLOUDFLARE_D1_DATABASE_ID || '';
const origin = process.env.SPEECH_ALLOWED_ORIGIN || '';
const bucket = process.env.SPEECH_R2_BUCKET || 'interface-speech-audio';
const validId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!validId.test(id)) throw new Error('CLOUDFLARE_D1_DATABASE_ID must be a D1 UUID');
if (!/^https:\/\/[\w.-]+(?::\d+)?$/.test(origin)) throw new Error('SPEECH_ALLOWED_ORIGIN must be an HTTPS origin without a trailing slash or path');
if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) throw new Error('Invalid R2 bucket name');
const cfg = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
cfg.d1_databases[0].database_id = id;
cfg.r2_buckets[0].bucket_name = bucket;
cfg.vars.ALLOWED_ORIGIN = origin;
writeFileSync(new URL('../wrangler.deploy.json', import.meta.url), JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
console.log('Created wrangler.deploy.json with D1, R2, and CORS settings (no secrets).');
