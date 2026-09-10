import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: convenção de erros JSON consistente — qualquer rota desconhecida
// responde no formato { error: { code, message } }, nunca HTML.
describe('convenção de erros JSON', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-errors-${Date.now()}.db`);
    const created = createApp({ dbPath });
    db = created.db;
    await new Promise((resolve) => {
      server = created.app.listen(0, () => resolve());
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(() => resolve()));
    db.close();
    for (const suffix of ['', '-wal', '-shm', '-journal']) {
      try { fs.rmSync(`${dbPath}${suffix}`, { force: true }); } catch { /* ignore */ }
    }
  });

  it('rota inexistente retorna 404 com envelope de erro', async () => {
    const res = await fetch(`${baseUrl}/api/rota-inexistente`);
    assert.equal(res.status, 404);
    assert.match(res.headers.get('content-type') ?? '', /application\/json/);
    const body = await res.json();
    assert.ok(body.error, 'esperava envelope { error }');
    assert.equal(body.error.code, 'NOT_FOUND');
    assert.ok(typeof body.error.message === 'string' && body.error.message.length > 0);
  });

  it('rota fora da API também retorna JSON, nunca HTML', async () => {
    const res = await fetch(`${baseUrl}/pagina-que-nao-existe`);
    assert.equal(res.status, 404);
    const text = await res.text();
    assert.doesNotMatch(text, /<html/i, 'erro não deve vazar HTML');
    const body = JSON.parse(text);
    assert.ok(body.error);
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('arquivos do back-end nunca são expostos como estático', async () => {
    const res = await fetch(`${baseUrl}/backend/src/app.js`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, 'NOT_FOUND');
  });
});
