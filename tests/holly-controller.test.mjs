import assert from 'node:assert/strict';
import test from 'node:test';
import { HollyController, normalizeVisemes, visemeAt } from '../ui/holly-controller.js';

class Audio extends EventTarget {
  currentTime = 0;
  paused = true;
  ended = false;
  seeking = false;
  readyState = 4;
}

test('application activity has priority and restores underlying attentive state', () => {
  const holly = new HollyController();
  assert.equal(holly.snapshot.state, 'idle-default');
  holly.setAttentive(true);
  assert.equal(holly.snapshot.state, 'idle-attentive');
  holly.summon();
  assert.equal(holly.snapshot.state, 'summon');
  holly.setRecording(true);
  assert.equal(holly.snapshot.state, 'listening');
  const audio = new Audio();
  holly.connectSpeech(audio);
  audio.dispatchEvent(new Event('playing'));
  assert.equal(holly.snapshot.state, 'speaking');
  assert.equal(holly.snapshot.hasVisemes, false);
  audio.dispatchEvent(new Event('waiting'));
  assert.equal(holly.snapshot.state, 'listening');
  holly.setRecording(false);
  assert.equal(holly.snapshot.state, 'idle-attentive');
});

test('mode, summon completion and pause have consistent transitions', () => {
  const holly = new HollyController({ mode: 'companion', paused: true });
  holly.setMode('unknown');
  assert.equal(holly.snapshot.mode, 'companion');
  holly.summon();
  assert.equal(holly.snapshot.state, 'idle-default');
  assert.equal(holly.snapshot.mode, 'character');
  holly.setPaused(false);
  holly.summon();
  assert.equal(holly.snapshot.state, 'summon');
  holly.finishSummon();
  assert.equal(holly.snapshot.state, 'idle-default');
});

test('visemes validate, sort and resolve at exact media timestamps', () => {
  const cues = normalizeVisemes([
    { timeMs: 620, shape: 'open' }, { timeMs: 120, shape: 'closed' },
    { timeMs: -1, shape: 'open' }, null, { timeMs: 550, shape: 'unsupported' },
  ]);
  assert.equal(cues.length, 2);
  assert.equal(visemeAt(cues, 0.119), 'rest');
  assert.equal(visemeAt(cues, 0.120), 'closed');
  assert.equal(visemeAt(cues, 0.620), 'open');
});

test('speech uses the audio clock and detaches stale media events', () => {
  const holly = new HollyController();
  const first = new Audio();
  const second = new Audio();
  const stale = holly.connectSpeech(first);
  holly.connectSpeech(second, [{ timeMs: 500, shape: 'round' }]);
  stale();
  first.dispatchEvent(new Event('playing'));
  assert.equal(holly.snapshot.state, 'idle-default');
  second.dispatchEvent(new Event('playing'));
  second.currentTime = 0.7;
  assert.equal(holly.mouthShape(), 'round');
  second.seeking = true;
  assert.equal(holly.mouthShape(), 'rest');
  second.dispatchEvent(new Event('ended'));
  assert.equal(holly.snapshot.state, 'idle-default');
});
