PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS voice_profiles (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, display_name TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('pending','verified','revoked')) DEFAULT 'pending',
 consent_version TEXT NOT NULL, consent_statement TEXT NOT NULL,
 consent_recorded_at TEXT NOT NULL, consent_audio_key TEXT NOT NULL,
 verification_note TEXT, reviewed_at TEXT, reviewed_by TEXT,
 created_at TEXT NOT NULL, revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_voice_owner ON voice_profiles(owner_id, created_at);
CREATE TABLE IF NOT EXISTS audio_records (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, kind TEXT NOT NULL,
 object_key TEXT NOT NULL UNIQUE, content_type TEXT NOT NULL,
 bytes INTEGER NOT NULL, created_at TEXT NOT NULL, expires_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_audio_owner ON audio_records(owner_id, created_at);
CREATE TABLE IF NOT EXISTS audit_events (
 id TEXT PRIMARY KEY, actor TEXT NOT NULL, event TEXT NOT NULL,
 subject_id TEXT, created_at TEXT NOT NULL, metadata TEXT
);
