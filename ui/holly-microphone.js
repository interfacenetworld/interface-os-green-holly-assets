// Capture begins only through start(), and stays local until an app handles a recording event.
export class HollyMicrophone extends EventTarget {
  #generation = 0;
  #discardedThrough = 0;
  #stream;
  #recorder;
  #timer;

  constructor(controller) {
    super();
    this.controller = controller;
    this.status = 'off';
  }

  #setStatus(status) {
    if (this.status === status) return;
    this.status = status;
    this.controller.setRecording(status === 'recording');
    this.dispatchEvent(new Event('change'));
  }

  async start() {
    if (this.status === 'requesting' || this.status === 'recording') return;
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {
      this.#setStatus('unavailable');
      return;
    }
    const generation = ++this.#generation;
    this.#setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== this.#generation) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      this.#stream = stream;
      const recorder = new MediaRecorder(stream);
      this.#recorder = recorder;
      const chunks = [];
      recorder.addEventListener('dataavailable', event => {
        if (event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener('stop', () => {
        if (generation <= this.#discardedThrough || !chunks.length) return;
        this.dispatchEvent(new CustomEvent('recording', {
          detail: new Blob(chunks, { type: recorder.mimeType }),
        }));
      }, { once: true });
      recorder.addEventListener('error', () => {
        if (generation !== this.#generation) return;
        this.stop({ discard: true });
        this.#setStatus('error');
      });
      stream.getAudioTracks().forEach(track => track.addEventListener('ended', () => {
        if (this.#stream === stream) this.stop();
      }, { once: true }));
      recorder.start();
      this.#timer = setTimeout(() => this.stop(), 60_000);
      this.#setStatus('recording');
    } catch (error) {
      if (generation !== this.#generation) return;
      this.stop({ discard: true });
      this.#setStatus(error.name === 'NotAllowedError' || error.name === 'SecurityError'
        ? 'denied' : 'error');
    }
  }

  stop({ discard = false } = {}) {
    if (discard) this.#discardedThrough = this.#generation;
    if (discard || this.status === 'requesting') this.#generation++;
    clearTimeout(this.#timer);
    if (this.#recorder?.state === 'recording' || this.#recorder?.state === 'paused') this.#recorder.stop();
    this.#stream?.getTracks().forEach(track => track.stop());
    this.#recorder = this.#stream = null;
    this.#setStatus('off');
  }
}
