import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: coleção de Usuários persistente via REST (issue #3).
// Criar, ler por id, atualizar, excluir e restaurar (undo de 5s), com validação espelhada.
describe('Usuários CRUD + restore', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-users-${Date.now()}.db`);
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

  it('cria Usuário válido e persiste (201 + corpo)', async () => {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Teste Silva', email: 'teste.silva@exemplo.com', status: 'Ativo', plano: 'Premium' }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.data.id, 'esperava id');
    assert.equal(body.data.nome, 'Teste Silva');
    assert.equal(body.data.email, 'teste.silva@exemplo.com');
    assert.equal(body.data.status, 'Ativo');
    assert.equal(body.data.plano, 'Premium');

    const get = await fetch(`${baseUrl}/api/users/${body.data.id}`);
    assert.equal(get.status, 200);
    const got = await get.json();
    assert.equal(got.data.nome, 'Teste Silva');
  });

  it('lê Usuário por id; id inexistente retorna 404 com envelope', async () => {
    const res = await fetch(`${baseUrl}/api/users/999999`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, 'NOT_FOUND');
  });

  it('atualiza Usuário por id com persistência real', async () => {
    const created = await (await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Editar Eu', email: 'editar@exemplo.com' }),
    })).json();

    const res = await fetch(`${baseUrl}/api/users/${created.data.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Editado Nome', plano: 'Premium' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.nome, 'Editado Nome');
    assert.equal(body.data.plano, 'Premium');
    assert.equal(body.data.email, 'editar@exemplo.com');
  });

  it('exclui e restaura Usuário (undo de 5s do front)', async () => {
    const created = await (await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Undo Teste', email: 'undo@exemplo.com', status: 'Ativo', plano: 'Básico' }),
    })).json();
    const id = created.data.id;

    const del = await fetch(`${baseUrl}/api/users/${id}`, { method: 'DELETE' });
    assert.equal(del.status, 200);
    assert.equal((await fetch(`${baseUrl}/api/users/${id}`)).status, 404);

    const restore = await fetch(`${baseUrl}/api/users/${id}/restore`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Undo Teste', email: 'undo@exemplo.com', status: 'Ativo', plano: 'Básico' }),
    });
    assert.equal(restore.status, 201);
    const restored = await restore.json();
    assert.equal(restored.data.id, id);
    assert.equal((await fetch(`${baseUrl}/api/users/${id}`)).status, 200);
  });

  it('validação: nome curto, email inválido, enums inválidos e email duplicado retornam 400', async () => {
    const cases = [
      { nome: 'A' },
      { nome: '' },
      { nome: 'Ok Nome', email: 'nao-e-email' },
      { nome: 'Ok Nome', status: 'Ativado' },
      { nome: 'Ok Nome', plano: 'Gold' },
    ];
    for (const payload of cases) {
      const res = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res.status, 400, `esperava 400 para ${JSON.stringify(payload)}`);
      const body = await res.json();
      assert.equal(body.error.code, 'VALIDATION_ERROR');
      assert.ok(body.error.message.length > 0);
    }

    const email = `duplicado-${Date.now()}@exemplo.com`;
    const first = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Primeiro Dono', email }),
    });
    assert.equal(first.status, 201);
    const dup = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Segundo Dono', email }),
    });
    assert.equal(dup.status, 400);
    assert.equal((await dup.json()).error.code, 'VALIDATION_ERROR');
  });
});
