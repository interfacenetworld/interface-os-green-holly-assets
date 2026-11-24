import assert from 'node:assert/strict';
import test from 'node:test';
import { findResults, parseFindCommand } from '../ui/find.js';

test('Find ranks title matches and recognizes local search concepts', () => {
  assert.equal(findResults('animation')[0].title, 'Animation library');
  assert.equal(findResults('mic')[0].title, 'Holly Short Circuit');
  assert.deepEqual(findResults('! unknownxyz'), []);
});

test('Holly sends explicit search requests to Find', () => {
  assert.equal(parseFindCommand(' Search for avatar '), 'avatar');
  assert.equal(parseFindCommand('find microphone'), 'microphone');
  assert.equal(parseFindCommand('help me'), '');
});
