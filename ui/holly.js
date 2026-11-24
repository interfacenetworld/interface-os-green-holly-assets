import { MODES, mountHollyOverlay } from './holly-overlay.js';

const $ = id => document.getElementById(id);
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

function updateRoute() {
  const library = location.hash === '#library';
  $('conversation').hidden = library;
  $('library').hidden = !library;
  $('conversation-link').setAttribute('aria-current', library ? 'false' : 'page');
  $('library-link').setAttribute('aria-current', library ? 'page' : 'false');
  controller.setAttentive(!library && document.activeElement === $('message'));
}
window.addEventListener('hashchange', updateRoute);
updateRoute();
$('message').addEventListener('focus', () => controller.setAttentive(true));
$('message').addEventListener('blur', () => controller.setAttentive(false));

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
  log('Holly (demo): Message received. This preview uses a scripted response.');
  $('message').value = '';
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
