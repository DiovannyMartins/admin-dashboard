import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: GET /api/health — a API sobe localmente e informa que o banco está de pé.
describe('GET /api/health', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-health-${Date.now()}.db`);
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

  it('responde 200 com status ok e banco acessível', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /application\/json/);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.db, 'up');
  });

  it('expõe contagens do seed rico para verificação via HTTP', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const body = await res.json();
    assert.ok(body.seed, 'esperava objeto seed no health check');
    assert.ok(body.seed.usuarios >= 20, `esperava dezenas de Usuários, veio ${body.seed.usuarios}`);
    assert.ok(body.seed.projetos >= 8, `esperava projetos, veio ${body.seed.projetos}`);
    assert.ok(body.seed.vendas >= 20, `esperava vendas, veio ${body.seed.vendas}`);
    assert.ok(body.seed.notificacoes >= 5, `esperava Notificações, veio ${body.seed.notificacoes}`);
  });

  it('libera CORS para o front vanilla', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.headers.get('access-control-allow-origin'), '*');
  });
});
