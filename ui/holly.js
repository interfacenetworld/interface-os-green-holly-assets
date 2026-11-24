import { mountFind, parseFindCommand } from './find.js';
import { MODES, mountHollyOverlay } from './holly-overlay.js';
import { demoLines, hollyProfile } from './holly-profile.js';

const $ = id => document.getElementById(id);
$('character-name').textContent = hollyProfile.character;
$('log').textContent = 'Holly (demo): ' + demoLines.greeting;
export const holly = mountHollyOverlay($('holly-shell'));
const { controller, microphone, player } = holly;

function log(message) {
  $('log').textContent += '\n' + message;
  $('log').scrollTop = $('log').scrollHeight;
}

function updateControls() {
  const { mode, state, recording, speaking } = controller.snapshot;
  $('state').textContent = MODES[mode];
  for (const button of document.querySelectorAll('[data-mode]')) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
  }
  for (const button of document.querySelectorAll('[data-state]')) {
    button.setAttribute('aria-pressed', String(!recording && !speaking && button.dataset.state === state));
  }
  for (const button of document.querySelectorAll('[data-face]')) button.disabled = recording || speaking;
}
controller.addEventListener('change', updateControls);
updateControls();

const runSearch = mountFind({
  form: $('find-form'), input: $('find-query'), results: $('find-results'),
  status: $('find-status'), web: $('find-web'),
  onSearch(query, matches) {
    $('find-guide').textContent = matches.length
      ? 'Holly: Start with ' + matches[0].title + '.'
      : 'Holly: I couldn’t find a local match for “' + query + '”.';
  },
});

function updateRoute() {
  const hash = location.hash.slice(1);
  const route = ['library', 'find'].includes(hash) ? hash : 'conversation';
  for (const page of ['conversation', 'library', 'find']) {
    $(page).hidden = page !== route;
    $(page + '-link').setAttribute('aria-current', page === route ? 'page' : 'false');
  }
  controller.setAttentive(document.activeElement === $(route === 'find' ? 'find-query' : 'message') &&
    route !== 'library');
}
window.addEventListener('hashchange', updateRoute);
const linkedQuery = new URLSearchParams(location.search).get('q');
if (linkedQuery && !location.hash) {
  history.replaceState(null, '', '#find');
  runSearch(linkedQuery);
}
updateRoute();
for (const id of ['message', 'find-query']) {
  $(id).addEventListener('focus', () => controller.setAttentive(true));
  $(id).addEventListener('blur', () => controller.setAttentive(false));
}

for (const button of document.querySelectorAll('[data-mode]')) {
  button.addEventListener('click', () => {
    controller.setMode(button.dataset.mode);
    player.setExpression(null);
  });
}
for (const button of document.querySelectorAll('[data-state]')) {
  button.addEventListener('click', () => {
    controller.preview(button.dataset.state);
    player.setExpression(null);
  });
}
for (const button of document.querySelectorAll('[data-face]')) {
  button.addEventListener('click', () => player.setExpression(button.dataset.face));
}
$('reset').addEventListener('click', () => {
  controller.setMode('character');
  controller.setPaused(false);
  player.setExpression(null);
});

$('chat').addEventListener('submit', event => {
  event.preventDefault();
  const value = $('message').value.trim();
  if (!value) return;
  log('You: ' + value);
  $('message').value = '';
  const query = parseFindCommand(value);
  if (query) {
    log('Holly: I’ll open Find for that.');
    location.hash = 'find';
    updateRoute();
    runSearch(query);
    $('find-query').focus();
  } else {
    log('Holly (demo): ' + demoLines.reply);
  }
});
microphone.addEventListener('recording', () => log('Microphone recording finished locally.'));

let cameraStream;
let cameraRequest = 0;
let cameraPending = false;
function cameraStatus(status) {
  $('camera-status').textContent = status;
  $('camera').textContent = cameraStream ? 'Stop camera' : cameraPending ? 'Cancel camera request' : 'Start camera';
  $('preview').hidden = !cameraStream;
  $('preview').srcObject = cameraStream ?? null;
}
function stopCamera(status = 'Camera off') {
  cameraRequest++;
  cameraPending = false;
  cameraStream?.getTracks().forEach(track => track.stop());
  cameraStream = null;
  cameraStatus(status);
}
$('camera').addEventListener('click', async () => {
  if (cameraStream || cameraPending) {
    stopCamera();
    return;
  }
  const request = ++cameraRequest;
  cameraPending = true;
  cameraStatus('Waiting for camera permission');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    if (request !== cameraRequest) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    cameraPending = false;
    cameraStream = stream;
    stream.getTracks().forEach(track => track.addEventListener('ended', () => {
      if (cameraStream === stream) stopCamera();
    }, { once: true }));
    cameraStatus('Camera active');
  } catch {
    if (request === cameraRequest) stopCamera('Camera access unavailable');
  }
});
$('stop').addEventListener('click', () => {
  stopCamera();
  microphone.stop();
});
window.addEventListener('pagehide', () => stopCamera());
