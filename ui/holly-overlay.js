import { HollyController } from './holly-controller.js';
import { mountHollyPlayer } from './holly-player.js';
import { HollyMicrophone } from './holly-microphone.js';

export const MODES = {
  character: 'Character Form',
  sphere: 'Speaking Light Sphere',
  companion: 'Companion Mode',
  creator: 'Creator Mode',
};
const STATE_LABELS = {
  'idle-default': 'Idle',
  'idle-attentive': 'Attentive',
  listening: 'Listening preview',
  speaking: 'Speaking preview',
  summon: 'Summoning',
};
const MIC_LABELS = {
  off: 'Microphone off',
  requesting: 'Waiting for microphone permission',
  recording: 'Recording microphone',
  denied: 'Microphone access denied',
  unavailable: 'Microphone recording requires a supported browser and HTTPS or localhost',
  error: 'Microphone recording failed',
};
const STORAGE_KEY = 'interface-os:holly-preferences';

function readPreferences() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

export function mountHollyOverlay(host, { assetBase } = {}) {
  const controller = new HollyController(readPreferences());
  const microphone = new HollyMicrophone(controller);
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const overlay = document.createElement('aside');
  overlay.className = 'holly-overlay';
  overlay.setAttribute('aria-label', 'Holly Short Circuit');
  overlay.innerHTML = `
    <div class="holly-overlay-panel">
      <div class="holly-visual">
        <img alt="Holly Short Circuit">
        <video muted playsinline preload="none" aria-hidden="true" hidden></video>
        <div class="fallback" role="img" aria-label="Holly glowing light" hidden></div>
      </div>
      <div class="holly-overlay-content">
        <strong data-holly-mode></strong>
        <span data-holly-state role="status"></span>
        <span data-holly-mic-status role="status"></span>
        <div class="controls">
          <button type="button" data-holly-action="summon">Summon</button>
          <button type="button" data-holly-action="mic">Record microphone</button>
          <button type="button" data-holly-action="motion">Pause motion</button>
        </div>
      </div>
    </div>`;
  host.append(overlay);

  const player = mountHollyPlayer(overlay.querySelector('.holly-visual'), controller, { assetBase });
  const get = selector => overlay.querySelector(selector);
  const action = name => get('[data-holly-action="' + name + '"]');
  function update() {
    const { mode, state, paused, speaking, recording } = controller.snapshot;
    const reduced = player.reducedMotion.matches;
    const modeLabel = get('[data-holly-mode]');
    const stateLabel = get('[data-holly-state]');
    const micLabel = get('[data-holly-mic-status]');
    modeLabel.textContent = MODES[mode];
    const label = speaking ? 'Playing speech audio' : recording ? 'Listening' : STATE_LABELS[state];
    if (stateLabel.textContent !== label) stateLabel.textContent = label;
    if (micLabel.textContent !== MIC_LABELS[microphone.status]) micLabel.textContent = MIC_LABELS[microphone.status];
    micLabel.dataset.recording = String(recording);
    action('mic').textContent = recording ? 'Stop recording'
      : microphone.status === 'requesting' ? 'Cancel microphone request' : 'Record microphone';
    action('motion').disabled = reduced;
    action('motion').textContent = reduced ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  }

  let savedPreferences;
  controller.addEventListener('change', () => {
    const { mode, paused } = controller.snapshot;
    const nextPreferences = JSON.stringify({ mode, paused });
    if (nextPreferences !== savedPreferences) {
      savedPreferences = nextPreferences;
      try { localStorage.setItem(STORAGE_KEY, nextPreferences); }
      catch { /* The overlay also works with storage disabled. */ }
    }
    update();
  }, options);
  microphone.addEventListener('change', update, options);
  player.reducedMotion.addEventListener('change', update, options);
  action('summon').addEventListener('click', () => controller.summon(), options);
  action('motion').addEventListener('click', () => controller.setPaused(!controller.snapshot.paused), options);
  action('mic').addEventListener('click', () => {
    if (microphone.status === 'recording' || microphone.status === 'requesting') microphone.stop();
    else microphone.start();
  }, options);
  const stopOnExit = () => microphone.stop({ discard: true });
  window.addEventListener('pagehide', stopOnExit, options);
  update();

  return {
    controller, microphone, player, element: overlay,
    destroy() {
      listeners.abort();
      stopOnExit();
      player.destroy();
      controller.disconnectSpeech();
      overlay.remove();
    },
  };
}
