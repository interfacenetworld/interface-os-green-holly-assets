'use strict';
const $ = id => document.getElementById(id);
const BASE = '../public/holly-green/';
const image = $('holly');
const video = $('holly-motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const modes = {
  character: 'Character Form',
  sphere: 'Speaking Light Sphere',
  companion: 'Companion Mode',
  creator: 'Creator Mode',
};
const states = {
  'idle-default': 'Idle',
  'idle-attentive': 'Attentive',
  listening: 'Listening preview',
  speaking: 'Speaking preview',
  summon: 'Summoning',
};
const gifFallback = {
  'idle-default': 'holly-character-hover',
  'sphere-idle': 'holly-sphere-idle',
  'sphere-listening': 'holly-sphere-listening',
  'sphere-speaking': 'holly-sphere-speaking',
};

let cam = null;
let mic = null;
let mode = 'character';
let state = 'idle-default';
let expression = null;
let paused = false;
let playback = 0;
let demoResponse;

function log(message) {
  $('log').textContent += '\n' + message;
  $('log').scrollTop = $('log').scrollHeight;
}

function clipForState() {
  if (state === 'summon') return 'summon';
  if (mode === 'sphere') {
    return state === 'listening' || state === 'speaking' ? 'sphere-' + state : 'sphere-idle';
  }
  return state === 'idle-default' && mode !== 'character' ? mode : state;
}

function showImage(path, backup) {
  image.hidden = false;
  $('fallback').hidden = true;
  image.onerror = () => {
    if (backup) {
      showImage(backup);
    } else {
      image.hidden = true;
      $('fallback').hidden = false;
    }
  };
  image.src = BASE + path;
}

function render() {
  const request = ++playback;
  const clip = clipForState();
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
  image.alt = expression
    ? 'Holly Short Circuit, ' + expression + ' expression'
    : 'Holly Short Circuit in ' + modes[mode].toLowerCase();
  showImage(expression ? 'assets/09_Holly_Character/face-' + expression + '.png' : still,
    expression ? still : backup);

  $('mode-label').textContent = modes[mode];
  $('state').textContent = modes[mode];
  $('expression').textContent = expression ? expression + ' expression preview' : states[state];
  $('motion').disabled = reducedMotion.matches;
  $('motion').textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
  document.querySelectorAll('[data-mode]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  });
  document.querySelectorAll('[data-state]').forEach(button => {
    button.setAttribute('aria-pressed', String(!expression && button.dataset.state === state));
  });

  if (expression || reducedMotion.matches || paused) return;

  video.loop = state !== 'summon';
  video.muted = true;
  video.onplaying = () => {
    if (request !== playback) return;
    video.hidden = false;
    $('fallback').hidden = true;
  };
  if (!video.loop) video.onended = () => {
    if (request === playback) selectState('idle-default');
  };

  const formats = [
    ['webm', 'video/webm; codecs="vp9"'],
    ['mp4', 'video/mp4; codecs="avc1.64001e"'],
  ].filter(([, type]) => video.canPlayType(type));

  function tryFormat(index) {
    if (request !== playback) return;
    if (!formats[index]) {
      if (state === 'summon') selectState('idle-default');
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
        selectState('idle-default');
      }
      // Keep the still visible if the browser blocks autoplay.
    });
  }
  tryFormat(0);
}

function selectState(next) {
  clearTimeout(demoResponse);
  expression = null;
  state = next === 'summon' && (paused || reducedMotion.matches) ? 'idle-default' : next;
  render();
}

document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  selectState('idle-default');
  log('Holly: ' + modes[mode] + ' activated (UI preview).');
}));
document.querySelectorAll('[data-state]').forEach(button => button.addEventListener('click', () => {
  selectState(button.dataset.state);
}));
document.querySelectorAll('[data-face]').forEach(button => button.addEventListener('click', () => {
  clearTimeout(demoResponse);
  expression = button.dataset.face;
  state = 'idle-default';
  render();
}));
$('summon').addEventListener('click', () => {
  mode = 'character';
  selectState('summon');
});
$('motion').addEventListener('click', () => {
  paused = !paused;
  if (paused && state === 'summon') state = 'idle-default';
  render();
});
$('reset').addEventListener('click', () => {
  mode = 'character';
  paused = false;
  selectState('idle-default');
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches && state === 'summon') state = 'idle-default';
  render();
});

$('chat').addEventListener('submit', event => {
  event.preventDefault();
  const value = $('message').value.trim();
  if (!value) return;
  log('You: ' + value);
  log('Holly (demo): Message received. This preview uses a scripted response.');
  $('message').value = '';
  selectState('speaking');
  demoResponse = setTimeout(() => selectState('idle-default'), 3200);
});
render();

function update(){const c=!!cam?.getVideoTracks().some(t=>t.readyState==='live');const m=!!mic?.getAudioTracks().some(t=>t.readyState==='live');$('camera').textContent=c?'Stop camera':'Start camera';$('mic').textContent=m?'Stop microphone':'Start microphone';$('preview').hidden=!c;$('media-status').textContent='Camera '+(c?'active':'off')+' · Microphone '+(m?'active':'off')}
async function camera(){if(cam){cam.getTracks().forEach(t=>t.stop());cam=null;$('preview').srcObject=null;update();return}try{if(!navigator.mediaDevices?.getUserMedia)throw Error('HTTPS or localhost required');cam=await navigator.mediaDevices.getUserMedia({video:true,audio:false});$('preview').srcObject=cam;cam.getTracks().forEach(t=>t.onended=()=>{cam=null;update()});update()}catch(e){$('media-status').textContent='Camera: '+e.message}}
async function microphone(){if(mic){mic.getTracks().forEach(t=>t.stop());mic=null;update();return}try{if(!navigator.mediaDevices?.getUserMedia)throw Error('HTTPS or localhost required');mic=await navigator.mediaDevices.getUserMedia({audio:true,video:false});mic.getTracks().forEach(t=>t.onended=()=>{mic=null;update()});update()}catch(e){$('media-status').textContent='Microphone: '+e.message}}
function stop(){if(cam){cam.getTracks().forEach(t=>t.stop());cam=null}if(mic){mic.getTracks().forEach(t=>t.stop());mic=null}$('preview').srcObject=null;update()}
$('camera').addEventListener('click',camera);$('mic').addEventListener('click',microphone);$('stop').addEventListener('click',stop);window.addEventListener('pagehide',stop);update();