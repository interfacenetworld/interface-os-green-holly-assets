const MODES = ['character', 'sphere', 'companion', 'creator'];
export const MOUTH_SHAPES = ['rest', 'closed', 'open', 'wide', 'round'];

export function normalizeVisemes(cues = []) {
  if (!Array.isArray(cues)) return [];
  return cues.filter(cue => cue && Number.isFinite(cue.timeMs) && cue.timeMs >= 0 &&
    MOUTH_SHAPES.includes(cue.shape))
    .map(({ timeMs, shape }) => ({ timeMs, shape }))
    .sort((a, b) => a.timeMs - b.timeMs);
}

export function visemeAt(cues, seconds) {
  const milliseconds = seconds * 1000;
  let start = 0;
  let end = cues.length;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    if (cues[middle].timeMs <= milliseconds) start = middle + 1;
    else end = middle;
  }
  return cues[start - 1]?.shape ?? 'rest';
}

export class HollyController extends EventTarget {
  #mode = 'character';
  #paused = false;
  #attentive = false;
  #recording = false;
  #summoning = false;
  #speaking = false;
  #preview = null;
  #cues = [];
  #disconnectSpeech = null;

  constructor({ mode, paused } = {}) {
    super();
    if (MODES.includes(mode)) this.#mode = mode;
    this.#paused = paused === true;
  }

  get snapshot() {
    const state = this.#speaking ? 'speaking'
      : this.#recording ? 'listening'
      : this.#summoning ? 'summon'
      : this.#preview ?? (this.#attentive ? 'idle-attentive' : 'idle-default');
    return { state, mode: this.#mode, paused: this.#paused, recording: this.#recording,
      speaking: this.#speaking, hasVisemes: this.#speaking && this.#cues.length > 0 };
  }

  #change() {
    this.dispatchEvent(new Event('change'));
  }

  setMode(mode) {
    if (!MODES.includes(mode)) return;
    this.#mode = mode;
    this.#summoning = false;
    this.#preview = null;
    this.#change();
  }

  setPaused(paused) {
    this.#paused = paused === true;
    if (this.#paused) this.#summoning = false;
    this.#change();
  }

  setAttentive(attentive) {
    this.#attentive = attentive;
    this.#preview = null;
    this.#change();
  }

  setRecording(recording) {
    this.#recording = recording;
    if (recording) this.#summoning = false;
    this.#preview = null;
    this.#change();
  }

  summon() {
    this.#mode = 'character';
    this.#preview = null;
    this.#summoning = !this.#paused && !this.#recording && !this.#speaking;
    this.#change();
  }

  finishSummon() {
    if (!this.#summoning) return;
    this.#summoning = false;
    this.#change();
  }

  preview(state) {
    if (['idle-default', 'idle-attentive', 'listening', 'speaking'].includes(state)) {
      this.#preview = state;
      this.#summoning = false;
      this.#change();
    }
  }

  connectSpeech(audio, cues = []) {
    this.#disconnectSpeech?.();
    this.audio = audio;
    this.#cues = normalizeVisemes(cues);
    const events = new AbortController();
    const listen = (type, handle) => audio.addEventListener(type, handle, { signal: events.signal });
    const speaking = active => {
      if (active) {
        this.#preview = null;
        this.#summoning = false;
      }
      this.#speaking = active;
      this.#change();
    };
    listen('playing', () => speaking(true));
    for (const event of ['pause', 'ended', 'error', 'emptied', 'loadstart', 'waiting']) {
      listen(event, () => speaking(false));
    }

    const disconnect = () => {
      if (this.#disconnectSpeech !== disconnect) return;
      events.abort();
      this.#disconnectSpeech = null;
      this.audio = null;
      this.#cues = [];
      speaking(false);
    };
    this.#disconnectSpeech = disconnect;
    speaking(!audio.paused && !audio.ended && audio.readyState >= 3);
    return disconnect;
  }

  disconnectSpeech() {
    this.#disconnectSpeech?.();
  }

  mouthShape() {
    return this.#speaking && !this.audio.seeking ? visemeAt(this.#cues, this.audio.currentTime) : 'rest';
  }
}
