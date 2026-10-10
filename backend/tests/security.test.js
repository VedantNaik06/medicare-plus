import './setup.js';
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

const { default: app } = await import('../src/app.js');
const { requireAuth, COOKIE_NAME } = await import('../src/middleware/auth.js');

let server;
let base;
before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());

const H = { 'X-Requested-With': 'medicare-web', 'Content-Type': 'application/json' };

test('every private route returns 401 without a login cookie', async () => {
  const paths = ['/auth/me', '/users/me', '/medicines', '/doses', '/doses/history', '/appointments', '/records', '/tests', '/tests/names', '/dashboard'];
  for (const p of paths) {
    const res = await fetch(base + p, { headers: H });
    assert.equal(res.status, 401, `${p} should be protected`);
  }
  const post = await fetch(base + '/reminders/claim', { method: 'POST', headers: H });
  assert.equal(post.status, 401);
});

test('a forged or tampered token is rejected', async () => {
  const forged = jwt.sign({ sub: '64b7f0f0f0f0f0f0f0f0f0f0' }, 'some-other-secret-that-is-wrong-xx');
  const res = await fetch(base + '/medicines', { headers: { ...H, Cookie: `${COOKIE_NAME}=${forged}` } });
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error.code, 'SESSION_EXPIRED');
});

test('state-changing requests without the custom header are blocked (CSRF defence)', async () => {
  const res = await fetch(base + '/auth/logout', { method: 'POST' });
  assert.equal(res.status, 403);
});

test('requireAuth passes an error to next() when there is no cookie', async () => {
  const err = await new Promise((resolve) => requireAuth({ cookies: {} }, {}, resolve));
  assert.equal(err.status, 401);
  assert.equal(err.code, 'AUTH_REQUIRED');
});

test('invalid login input is rejected before touching the database', async () => {
  const res = await fetch(base + '/auth/login', { method: 'POST', headers: H, body: JSON.stringify({ email: 'bad' }) });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('unknown routes return a JSON 404', async () => {
  const res = await fetch(base + '/nothing-here', { headers: H });
  assert.equal(res.status, 404);
});
