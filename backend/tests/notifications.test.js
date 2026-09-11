import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: coleção de Notificações persistente (issue #6).
// Listar com lida/não-lida, marcar como lida por id, limpar todas, badge consistente.
describe('Notificações API', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-notif-${Date.now()}.db`);
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

  it('lista Notificações do seed com estado lida/não-lida e contagem', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 5);
    assert.ok(typeof body.meta.nao_lidas === 'number');
    const naoLidas = body.data.filter((n) => !n.lida).length;
    assert.equal(body.meta.nao_lidas, naoLidas);
    for (const n of body.data) {
      assert.ok(n.id, 'esperava id');
      assert.ok(typeof n.titulo === 'string' && n.titulo.length > 0);
      assert.equal(typeof n.lida, 'boolean');
    }
  });

  it('marca Notificação como lida por id (badge cai)', async () => {
    const lista = await (await fetch(`${baseUrl}/api/notifications`)).json();
    const alvo = lista.data.find((n) => !n.lida);
    assert.ok(alvo, 'seed precisa de ao menos uma não-lida');
    const antes = lista.meta.nao_lidas;

    const res = await fetch(`${baseUrl}/api/notifications/${alvo.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lida: true }),
    });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).data.lida, true);

    const depois = await (await fetch(`${baseUrl}/api/notifications`)).json();
    assert.equal(depois.meta.nao_lidas, antes - 1);
  });

  it('marcar id inexistente retorna 404 com envelope', async () => {
    const res = await fetch(`${baseUrl}/api/notifications/999999`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lida: true }),
    });
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error.code, 'NOT_FOUND');
  });

  it('limpa todas as Notificações (lista zera, badge zera)', async () => {
    const res = await fetch(`${baseUrl}/api/notifications`, { method: 'DELETE' });
    assert.equal(res.status, 200);
    const lista = await (await fetch(`${baseUrl}/api/notifications`)).json();
    assert.deepEqual(lista.data, []);
    assert.equal(lista.meta.nao_lidas, 0);
  });
});
