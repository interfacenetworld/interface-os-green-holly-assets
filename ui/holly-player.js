import { MOUTH_SHAPES } from './holly-controller.js';

const gifFallback = {
  'idle-default': 'holly-character-hover',
  'sphere-idle': 'holly-sphere-idle',
  'sphere-listening': 'holly-sphere-listening',
  'sphere-speaking': 'holly-sphere-speaking',
};

export function clipForState(state, mode) {
  if (state === 'summon') return 'summon';
  if (mode === 'sphere') {
    return state === 'listening' || state === 'speaking' ? 'sphere-' + state : 'sphere-idle';
  }
  return state === 'idle-default' && mode !== 'character' ? mode : state;
}

export function mountHollyPlayer(visual, controller, { assetBase } = {}) {
  const BASE = new URL(assetBase ?? '../public/holly-green/', import.meta.url).href;
  const image = visual.querySelector('img');
  const video = visual.querySelector('video');
  const fallback = visual.querySelector('[role="img"]');
  const mouth = document.createElement('img');
  mouth.className = 'holly-mouth';
  mouth.alt = '';
  mouth.hidden = true;
  mouth.onerror = () => { mouth.hidden = true; };
  visual.append(mouth);
  const mouthAssets = Object.fromEntries(MOUTH_SHAPES.filter(shape => shape !== 'rest').map(shape => {
    const sprite = new Image();
    sprite.src = BASE + 'motion/visemes/' + shape + '.png';
    return [shape, sprite];
  }));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let expression = null;
  let playback = 0;
  let frame;

  function showImage(path, backup) {
    image.hidden = false;
    fallback.hidden = true;
    image.onerror = () => {
      if (backup) {
        showImage(backup);
      } else {
        image.hidden = true;
        fallback.hidden = false;
      }
    };
    image.src = BASE + path;
  }

  function render() {
    const { state, mode, paused, hasVisemes } = controller.snapshot;
    const request = ++playback;
    const clip = clipForState(state, mode);
    cancelAnimationFrame(frame);
    mouth.hidden = true;
    delete visual.dataset.viseme;
    if (state === 'summon' && reducedMotion.matches) {
      controller.finishSummon();
      return;
    }
    const poster = clip === 'summon' ? 'idle-default' : clip;
    const still = 'motion/' + poster + '.png';
    const backup = clip.startsWith('sphere-')
      ? 'assets/12_Speaking_Light/holly-sphere-idle-still.png'
      : 'assets/09_Holly_Character/holly-full-body-main.png';

    video.onplaying = video.onended = video.onerror = null;
    video.pause();
    video.hidden = true;
    video.removeAttribute('src');
    video.load();
    const synchronized = hasVisemes && mode !== 'sphere' && !paused && !reducedMotion.matches;
    image.alt = expression ? 'Holly, ' + expression + ' expression' : 'Holly Short Circuit';
    showImage(expression ? 'assets/09_Holly_Character/face-' + expression + '.png'
      : synchronized ? 'motion/idle-default.png' : still, expression ? still : backup);

    if (expression || reducedMotion.matches || paused) return;

    if (synchronized) {
      let previous;
      function tick() {
        const next = controller.mouthShape();
        if (next !== previous) {
          previous = next;
          mouth.hidden = next === 'rest';
          if (!mouth.hidden) mouth.src = mouthAssets[next].src;
          visual.dataset.viseme = next;
        }
        frame = requestAnimationFrame(tick);
      }
      tick();
      return;
    }
    video.loop = state !== 'summon';
    video.muted = true;
    video.onplaying = () => {
      if (request !== playback) return;
      video.hidden = false;
      fallback.hidden = true;
    };
    if (!video.loop) video.onended = () => {
      if (request === playback) controller.finishSummon();
    };

    const formats = [
      ['webm', 'video/webm; codecs="vp9"'],
      ['mp4', 'video/mp4; codecs="avc1.64001e"'],
    ].filter(([, type]) => video.canPlayType(type));

    function tryFormat(index) {
      if (request !== playback) return;
      if (!formats[index]) {
        if (state === 'summon') controller.finishSummon();
        if (gifFallback[clip]) showImage('assets/11_Animations_GIF/' + gifFallback[clip] + '.gif', still);
        return;
      }
      let failed = false;
      function nextFormat() {
        if (failed || request !== playback) return;
        failed = true;
        video.hidden = true;
        tryFormat(index + 1);
      }
      video.onerror = nextFormat;
      video.src = BASE + 'motion/' + clip + '.' + formats[index][0];
      video.play().catch(error => {
        if (request !== playback || failed) return;
        if (error.name === 'NotSupportedError') {
          nextFormat();
        } else if (error.name === 'NotAllowedError' && state === 'summon') {
          controller.finishSummon();
        }
        // Keep the still visible if the browser blocks autoplay.
      });
    }
    tryFormat(0);
  }

  let previous;
  function update() {
    const { state, mode, paused, hasVisemes } = controller.snapshot;
    const key = JSON.stringify([state, mode, paused, hasVisemes]);
    if (key === previous) return;
    previous = key;
    expression = null;
    render();
  }
  controller.addEventListener('change', update, options);
  reducedMotion.addEventListener('change', render, options);
  update();

  return {
    reducedMotion,
    setExpression(next) {
      if (expression === next) return;
      expression = next;
      render();
    },
    destroy() {
      listeners.abort();
      playback++;
      cancelAnimationFrame(frame);
      video.onplaying = video.onended = video.onerror = null;
      video.pause();
      video.removeAttribute('src');
      video.load();
      image.onerror = null;
      mouth.remove();
    },
  };
}
