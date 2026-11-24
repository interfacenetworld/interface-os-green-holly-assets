-- Holly companion opt-in preferences and limited contextual memory, isolated per account.
CREATE TABLE IF NOT EXISTS holly_preferences (
 owner_id TEXT PRIMARY KEY, style TEXT NOT NULL DEFAULT 'warm',
 memory_enabled INTEGER NOT NULL DEFAULT 0 CHECK(memory_enabled IN (0,1)),
 flirting_enabled INTEGER NOT NULL DEFAULT 0 CHECK(flirting_enabled IN (0,1)),
 adult_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(adult_confirmed IN (0,1)),
 updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS holly_messages (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('user','assistant')),
 content TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_holly_history ON holly_messages(owner_id,created_at);
