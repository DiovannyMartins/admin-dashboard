import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: reset demo restaura o seed rico (issue #8).
describe('POST /api/demo/reset', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-demo-${Date.now()}.db`);
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

  it('bagunça e restaura o seed rico', async () => {
    await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Bagunça Demo', email: `bagunca-${Date.now()}@exemplo.com` }),
    });
    await fetch(`${baseUrl}/api/notifications`, { method: 'DELETE' });
    const baguncado = await (await fetch(`${baseUrl}/api/health`)).json();
    assert.equal(baguncado.seed.notificacoes, 0);

    const res = await fetch(`${baseUrl}/api/demo/reset`, { method: 'POST' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.reset, true);
    assert.ok(body.data.seed.usuarios >= 20);
    assert.ok(body.data.seed.notificacoes >= 5);

    const health = await (await fetch(`${baseUrl}/api/health`)).json();
    assert.deepEqual(health.seed, body.data.seed);
  });
});
