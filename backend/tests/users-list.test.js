import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: listagem avançada de Usuários via query params (issue #4).
// Busca parcial, filtros combináveis, ordenação e paginação com total.
describe('Listagem avançada de Usuários', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-users-list-${Date.now()}.db`);
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

  async function list(params = '') {
    const res = await fetch(`${baseUrl}/api/users${params}`);
    assert.equal(res.status, 200);
    return res.json();
  }

  it('busca parcial por nome/email (case-insensitive)', async () => {
    const porNome = await list('?q=jo%C3%A3o&per_page=100');
    assert.ok(porNome.meta.total >= 1);
    assert.ok(porNome.data.every((u) => (`${u.nome} ${u.email}`).toLowerCase().includes('joão')));

    const porEmail = await list('?q=maria@exemplo.com&per_page=100');
    assert.ok(porEmail.meta.total >= 1);
    assert.ok(porEmail.data.some((u) => u.email === 'maria@exemplo.com'));

    const maiusculas = await list('?q=JOAO&per_page=100');
    const minusculas = await list('?q=joao&per_page=100');
    assert.deepEqual(
      maiusculas.data.map((u) => u.id).sort(),
      minusculas.data.map((u) => u.id).sort(),
    );
  });

  it('filtros por status e plano combináveis com a busca', async () => {
    const ativos = await list('?status=Ativo&per_page=100');
    assert.ok(ativos.meta.total > 0);
    assert.ok(ativos.data.every((u) => u.status === 'Ativo'));

    const premium = await list('?plano=Premium&per_page=100');
    assert.ok(premium.meta.total > 0);
    assert.ok(premium.data.every((u) => u.plano === 'Premium'));

    const combinados = await list('?status=Ativo&plano=Premium&per_page=100');
    assert.ok(combinados.data.every((u) => u.status === 'Ativo' && u.plano === 'Premium'));

    const comBusca = await list('?q=a&status=Ativo&plano=Premium&per_page=100');
    assert.ok(comBusca.data.every((u) => u.status === 'Ativo' && u.plano === 'Premium'));
    assert.ok(comBusca.meta.total <= combinados.meta.total);
  });

  it('ordenação por nome, status e plano asc/desc', async () => {
    for (const sort of ['nome', 'status', 'plano']) {
      const asc = await list(`?sort=${sort}&order=asc&per_page=100`);
      const desc = await list(`?sort=${sort}&order=desc&per_page=100`);
      const nomesAsc = asc.data.map((u) => u[sort]);
      const nomesDesc = desc.data.map((u) => u[sort]);
      const ordenado = [...nomesAsc].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
      assert.deepEqual(nomesAsc, ordenado, `esperava ${sort} asc ordenado`);
      assert.deepEqual(nomesDesc, [...ordenado].reverse(), `esperava ${sort} desc reverso`);
    }
  });

  it('paginação com page/per_page e total consistente', async () => {
    const p1 = await list('?page=1&per_page=5');
    const p2 = await list('?page=2&per_page=5');
    assert.equal(p1.data.length, 5);
    assert.equal(p1.meta.page, 1);
    assert.equal(p1.meta.per_page, 5);
    assert.ok(p1.meta.total >= 20);
    assert.equal(p1.meta.total_pages, Math.ceil(p1.meta.total / 5));
    assert.equal(p2.meta.page, 2);
    const ids1 = new Set(p1.data.map((u) => u.id));
    assert.ok(p2.data.every((u) => !ids1.has(u.id)), 'páginas não devem repetir registros');

    const tudo = await list(`?per_page=${p1.meta.total}`);
    assert.equal(tudo.data.length, tudo.meta.total);
  });

  it('parâmetros inválidos retornam 400 com envelope', async () => {
    for (const params of ['?status=Bloqueado', '?plano=Gold', '?sort=idade', '?order=sideways', '?page=0', '?per_page=500']) {
      const res = await fetch(`${baseUrl}/api/users${params}`);
      assert.equal(res.status, 400, `esperava 400 para ${params}`);
      assert.equal((await res.json()).error.code, 'VALIDATION_ERROR');
    }
  });
});
