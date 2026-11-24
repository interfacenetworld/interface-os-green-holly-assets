import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = fileURLToPath(new URL('..', import.meta.url));
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webm': 'video/webm', '.mp4': 'video/mp4', '.png': 'image/png', '.gif': 'image/gif',
};

let server;
let browser;
let origin;
before(async () => {
  server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const file = resolve(root, '.' + pathname);
      assert(file.startsWith(root.endsWith(sep) ? root : root + sep));
      const { size } = await stat(file);
      const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range ?? '');
      const start = match ? Number(match[1]) : 0;
      const end = match?.[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
      response.setHeader('Content-Type', types[extname(file)]);
      response.setHeader('Content-Length', end - start + 1);
      response.setHeader('Accept-Ranges', 'bytes');
      if (match) response.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${size}` });
      createReadStream(file, { start, end }).pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--use-fake-device-for-media-stream'],
  });
});
after(async () => {
  await browser?.close();
  server?.close();
});

const video = '.holly-visual video';
const state = '[data-holly-state]';
const microphone = '[data-holly-action="mic"]';
const motion = '[data-holly-action="motion"]';

async function playing(page, name, extension = 'webm') {
  await page.waitForFunction(({ video, suffix }) => {
    const media = document.querySelector(video);
    return !media.hidden && !media.paused && media.currentSrc.endsWith(suffix) && media.currentTime > 0;
  }, { video, suffix: '/' + name + '.' + extension });
}

for (const mobile of [false, true]) {
  test(`${mobile ? 'mobile' : 'desktop'} overlay persists across routes and honors motion settings`, async () => {
    const page = await browser.newPage({
      isMobile: mobile, hasTouch: mobile,
      viewport: mobile ? { width: 390, height: 844 } : { width: 1200, height: 900 },
    });
    try {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin + '/ui/index.html');
      await playing(page, 'idle-default');
      const original = await page.locator('.holly-overlay').elementHandle();
      await page.locator('#message').focus();
      await playing(page, 'idle-attentive');
      await page.click('#library-link');
      await page.click('[data-mode="companion"]');
      await playing(page, 'companion');
      await page.click('#conversation-link');
      assert(await original.evaluate(node => node === document.querySelector('.holly-overlay')));
      await page.click('[data-holly-action="summon"]');
      await playing(page, 'summon');
      await playing(page, 'idle-default');
      await page.locator(video).evaluate(media => { media.currentTime = 7.85; });
      await page.waitForFunction(selector => {
        const media = document.querySelector(selector);
        return !media.seeking && media.currentTime < 1 && !media.paused;
      }, video);
      await page.click(motion);
      assert(await page.locator(video).evaluate(media => media.hidden && !media.hasAttribute('src')));
      await page.reload();
      await page.waitForFunction(selector => document.querySelector(selector)?.textContent === 'Resume motion', motion);
      await page.click(motion);
      await playing(page, 'idle-default');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForFunction(selector => document.querySelector(selector)?.disabled, motion);
      assert(await page.locator(video).evaluate(media => media.hidden && !media.hasAttribute('src')));
      await page.click('[data-holly-action="summon"]');
      assert.equal(await page.locator(state).textContent(), 'Idle');
      assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth));
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  });
}

test('recording follows real MediaRecorder events, and denial has an explicit status', async () => {
  const context = await browser.newContext({ permissions: ['microphone'] });
  try {
    const page = await context.newPage();
    await page.goto(origin + '/ui/index.html');
    await page.evaluate(async () => {
      const { holly } = await import('/ui/holly.js');
      holly.microphone.addEventListener('recording', event => {
        document.body.dataset.recordedSize = event.detail.size;
      });
    });
    await page.click(microphone);
    await playing(page, 'listening');
    assert.equal(await page.locator('[data-recording="true"]').textContent(), 'Recording microphone');
    await page.click('#library-link');
    assert.equal(await page.locator(state).textContent(), 'Listening');
    await page.click(microphone);
    await page.waitForFunction(() => Number(document.body.dataset.recordedSize) > 0);
    await playing(page, 'idle-default');
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
    });
    await page.click(microphone);
    await page.getByText('Microphone access denied').waitFor();
    assert.equal(await page.locator(state).textContent(), 'Idle');
  } finally {
    await context.close();
  }
});

test('WebM then MP4 then GIF fallback, with a still for reduced motion', async () => {
  const page = await browser.newPage();
  try {
    await page.route('**/*.webm', route => route.abort());
    await page.goto(origin + '/ui/index.html');
    await playing(page, 'idle-default', 'mp4');
    await page.route('**/*.mp4', route => route.abort());
    await page.click(motion);
    await page.click(motion);
    await page.waitForFunction(() => document.querySelector('.holly-visual img').src.endsWith('holly-character-hover.gif'));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('.holly-visual img').src.endsWith('idle-default.png'));
  } finally {
    await page.close();
  }
});

test('timestamped sprite follows browser audio across seek, pause and completion', async () => {
  const page = await browser.newPage();
  try {
    await page.goto(origin + '/ui/index.html');
    await page.evaluate(async () => {
      const { holly } = await import('/ui/holly.js');
      // A generated PCM tone exercises an actual media clock without a speech provider.
      const samples = 32000;
      const bytes = new Uint8Array(44 + samples * 2);
      const header = new DataView(bytes.buffer);
      for (const [offset, label] of [[0, 'RIFF'], [8, 'WAVEfmt '], [36, 'data']]) {
        bytes.set(new TextEncoder().encode(label), offset);
      }
      header.setUint32(4, bytes.length - 8, true);
      header.setUint32(16, 16, true);
      header.setUint16(20, 1, true);
      header.setUint16(22, 1, true);
      header.setUint32(24, 8000, true);
      header.setUint32(28, 16000, true);
      header.setUint16(32, 2, true);
      header.setUint16(34, 16, true);
      header.setUint32(40, samples * 2, true);
      for (let i = 0; i < samples; i++) header.setInt16(44 + 2 * i, 800 * Math.sin(i * 0.15), true);
      const audio = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
      audio.id = 'fixture-audio';
      audio.controls = true;
      document.body.prepend(audio);
      holly.controller.connectSpeech(audio, [
        { timeMs: 0, shape: 'closed' }, { timeMs: 1000, shape: 'wide' },
        { timeMs: 2000, shape: 'round' }, { timeMs: 3000, shape: 'rest' },
      ]);
      const launch = document.createElement('button');
      launch.textContent = 'Play fixture';
      launch.onclick = () => audio.play();
      document.body.prepend(launch);
    });
    await page.getByRole('button', { name: 'Play fixture' }).click();
    const visual = page.locator('.holly-visual');
    await page.waitForFunction(() => document.querySelector('.holly-visual').dataset.viseme === 'closed');
    const audio = page.locator('#fixture-audio');
    await audio.evaluate(media => { media.currentTime = 2.1; });
    await page.waitForFunction(() => document.querySelector('.holly-visual').dataset.viseme === 'round');
    assert(await audio.evaluate(media => media.currentTime >= 2 && media.currentTime < 3));
    await page.locator('.holly-mouth').evaluate(image => image.decode());
    await page.click(motion);
    assert.equal(await visual.getAttribute('data-viseme'), null);
    assert.equal(await audio.evaluate(media => media.paused), false);
    await page.click(motion);
    await audio.evaluate(media => media.pause());
    await playing(page, 'idle-default');
    assert.equal(await visual.getAttribute('data-viseme'), null);
    await audio.evaluate(media => { media.currentTime = 3.75; });
    await page.getByRole('button', { name: 'Play fixture' }).click();
    await page.getByText('Playing speech audio', { exact: true }).waitFor();
    await playing(page, 'idle-default');
    assert(await audio.evaluate(media => media.ended));
  } finally {
    await page.close();
  }
});
