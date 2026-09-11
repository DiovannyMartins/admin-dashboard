import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ApiService } from './api.service.js';

// Seam: ApiService public interface com fallback offline (issue #7).
// Observa comportamento via retornos públicos; `fetch` é fronteira de
// sistema (mock permitido); nunca toca em métodos privados `_*Local`.
function installOffline() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); },
  };
  globalThis.fetch = async () => { throw new Error('offline'); };
  return store;
}

let savedFetch;
let savedStorage;

beforeEach(() => {
  savedFetch = globalThis.fetch;
  savedStorage = globalThis.localStorage;
});

afterEach(() => {
  globalThis.fetch = savedFetch;
  if (savedStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = savedStorage;
});

describe('ApiService fallback offline (issue #7)', () => {
  it('opera via seed local sem quebrar quando a API está offline', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    const { data, meta } = await api.listUsers({ page: 1, per_page: 5 });
    assert.equal(data.length, 5);
    assert.equal(meta.total, 28);
    assert.equal(meta.total_pages, 6);
    // Sort default id desc: primeiro da página é o maior id do seed.
    assert.equal(data[0].nome, 'Priscila Nunes');
    assert.equal(api.isOnline, false);
  });

  it('preserva busca, filtros, ordenação e paginação no modo offline', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    const busca = await api.listUsers({ q: 'joao', per_page: 10 });
    assert.equal(busca.meta.total, 1);
    assert.equal(busca.data[0].nome, 'João Silva');

    const filtro = await api.listUsers({ status: 'Inativo', plano: 'Básico', per_page: 100 });
    assert.ok(filtro.meta.total > 0);
    for (const u of filtro.data) {
      assert.equal(u.status, 'Inativo');
      assert.equal(u.plano, 'Básico');
    }

    const ordenado = await api.listUsers({ sort: 'nome', order: 'asc', per_page: 100 });
    const nomes = ordenado.data.map((u) => u.nome);
    const esperado = [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
    assert.deepEqual(nomes, esperado);

    const pagina2 = await api.listUsers({ page: 2, per_page: 5 });
    assert.equal(pagina2.data.length, 5);
    assert.notDeepEqual(pagina2.data[0], (await api.listUsers({ page: 1, per_page: 5 })).data[0]);
  });

  it('mantém CRUD + restore com o mesmo id no modo offline (undo de 5s)', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    const criado = await api.createUser({ nome: 'Offline Novo', email: 'offline.novo@exemplo.com', status: 'Ativo', plano: 'Básico' });
    assert.equal(criado.id, 29);

    const editado = await api.updateUser(criado.id, { nome: 'Offline Editado' });
    assert.equal(editado.nome, 'Offline Editado');

    const excluido = await api.deleteUser(criado.id);
    assert.equal(excluido.id, criado.id);
    const aposExcluir = await api.listUsers({ q: 'offline.novo', per_page: 10 });
    assert.equal(aposExcluir.meta.total, 0);

    const restaurado = await api.restoreUser(excluido);
    assert.equal(restaurado.id, criado.id);
    const aposRestaurar = await api.listUsers({ q: 'offline.novo', per_page: 10 });
    assert.equal(aposRestaurar.meta.total, 1);
  });

  it('espelha a validação do back no modo offline (400 VALIDATION_ERROR)', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    await assert.rejects(() => api.createUser({ nome: 'A' }), (err) => err.code === 'VALIDATION_ERROR' && err.status === 400);
    await assert.rejects(() => api.createUser({ nome: 'Nome Ok', email: 'nao-e-email' }), (err) => err.code === 'VALIDATION_ERROR');
    await assert.rejects(() => api.createUser({ nome: 'Nome Ok', status: 'Ativado' }), (err) => err.code === 'VALIDATION_ERROR');
  });

  it('opera online via API quando o fetch responde', async () => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    };
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: 1, nome: 'Da API' }], meta: { total: 1, page: 1, per_page: 5, total_pages: 1 } }),
    });

    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });
    const { data, meta } = await api.listUsers();
    assert.equal(data[0].nome, 'Da API');
    assert.equal(meta.total, 1);
    assert.equal(api.isOnline, true);
  });

  it('expõe Stats, Desempenho Semanal e Notificações no modo offline', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    const stats = await api.getStats();
    assert.equal(stats.usuarios_totais, 28);
    assert.equal(stats.projetos_ativos, 8);
    assert.equal(stats.vendas_total, 32); // 5+6+6+5+10 vendas do seed (igual ao banco online)
    assert.ok(stats.receita_total > 17000);

    const weekly = await api.getWeekly();
    assert.deepEqual(weekly.map((d) => d.dia), ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);
    assert.equal(weekly[0].meta, 3000);

    const { data, meta } = await api.listNotifications();
    assert.equal(data.length, 7);
    assert.equal(meta.nao_lidas, 4);

    const marcada = await api.markNotificationRead(1, true);
    assert.equal(marcada.lida, true);
    const depois = await api.listNotifications();
    assert.equal(depois.meta.nao_lidas, 3);

    await api.clearNotifications();
    assert.equal((await api.listNotifications()).data.length, 0);

    const reset = await api.resetDemo();
    assert.equal(reset.offline, true);
    assert.equal((await api.listUsers({ per_page: 100 })).meta.total, 28);
  });

  it('não ressuscita o seed quando a tabela é esvaziada offline', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    const todos = await api.listUsers({ per_page: 100 });
    assert.equal(todos.meta.total, 28);
    for (const u of todos.data) await api.deleteUser(u.id);
    assert.equal((await api.listUsers({ per_page: 100 })).meta.total, 0);

    // Nova instância com o mesmo localStorage: vazio intencional persiste.
    const api2 = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });
    assert.equal((await api2.listUsers({ per_page: 100 })).meta.total, 0);
  });

  it('limpa o email com string vazia no update parcial offline (espelha o back)', async () => {
    installOffline();
    const api = new ApiService({ baseUrl: 'http://127.0.0.1:9/api' });

    const criado = await api.createUser({ nome: 'Email Limpo', email: 'limpar@exemplo.com' });
    const limpo = await api.updateUser(criado.id, { email: '' });
    assert.equal(limpo.email, '');
  });
});
