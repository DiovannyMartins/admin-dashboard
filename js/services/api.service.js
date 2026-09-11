/**
 * ApiService — serviço de API do front com fallback offline (issues #7/#8).
 *
 * Tenta a API local (`http://localhost:3001/api`) via `fetch` e, se offline
 * (caso do GitHub Pages, só estático — ADR-0002), opera sobre o seed local
 * rico de `fallback-seed.js` + `localStorage`, preservando a mesma interface.
 *
 * Formatos (iguais ao contrato REST do back-end):
 * - Usuário: { id, nome, email, status, plano, created_at }
 * - listUsers -> { data, meta: { total, page, per_page, total_pages } }
 * - Stats: { usuarios_totais, projetos_ativos, vendas_total, receita_total }
 * - Weekly: [{ dia, vendas, meta }] (Seg–Sex)
 * - Notificação: { id, titulo, mensagem, lida, created_at }
 */

import { StorageService } from './storage.service.js';
import {
  FALLBACK_USERS,
  FALLBACK_NOTIFICATIONS,
  FALLBACK_SALES_BY_DAY,
  FALLBACK_GOALS_BY_DAY,
  FALLBACK_ACTIVE_PROJECTS,
} from './fallback-seed.js';

export const API_BASE_URL = 'http://localhost:3001/api';
const REQUEST_TIMEOUT_MS = 2500;
const SORTS_VALIDOS = ['nome', 'status', 'plano', 'created_at', 'id'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ApiError extends Error {
  constructor(message, { code = 'INTERNAL_ERROR', status = 500, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /** Erro de rede/offline (sem resposta HTTP): cai para o seed local. */
  static offline() {
    const err = new ApiError('API indisponível (modo offline)', { code: 'OFFLINE', status: 0 });
    err.offline = true;
    return err;
  }
}

function sameId(a, b) {
  return String(a) === String(b);
}

export class ApiService {
  constructor({ baseUrl = API_BASE_URL, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
    this.baseUrl = (typeof window !== 'undefined' && window.__DASHBOARD_API_BASE) || baseUrl;
    this.timeoutMs = timeoutMs;
    this.online = false;
    this._users = null;
    this._notifications = null;
  }

  /** Sonda a API; define o modo online/offline inicial. */
  async init() {
    try {
      await this._request('/health', { allowOffline: false });
      this.online = true;
    } catch (err) {
      if (err?.offline) this.online = false;
      else this.online = false;
    }
    return this.online;
  }

  get isOnline() {
    return this.online;
  }

  // ---- HTTP ----

  async _request(path, { method = 'GET', body, allowOffline = true } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    let res;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: ctrl.signal,
      });
    } catch {
      throw ApiError.offline();
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      let payload = null;
      try { payload = await res.json(); } catch { /* corpo não-JSON */ }
      const code = payload?.error?.code ?? (res.status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
      const message = payload?.error?.message ?? `Erro ${res.status}`;
      throw new ApiError(message, { code, status: res.status, details: payload?.error?.details });
    }
    if (res.status === 204) return null;
    try {
      return await res.json();
    } catch {
      if (!allowOffline) throw ApiError.offline();
      throw new ApiError('Resposta inválida da API', { code: 'INTERNAL_ERROR', status: res.status });
    }
  }

  /** Executa online; em falha de rede, marca offline e roda o fallback local. */
  async _withFallback(fnOnline, fnLocal) {
    try {
      const result = await fnOnline();
      this.online = true;
      return result;
    } catch (err) {
      if (!err?.offline) throw err;
      this.online = false;
      return fnLocal();
    }
  }

  // ---- Usuários ----

  async listUsers({ q = '', status = '', plano = '', sort = 'id', order = 'desc', page = 1, per_page = 5 } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (plano) params.set('plano', plano);
    params.set('sort', sort);
    params.set('order', order);
    params.set('page', String(page));
    params.set('per_page', String(per_page));
    return this._withFallback(
      () => this._request(`/users?${params.toString()}`),
      () => this._listUsersLocal({ q, status, plano, sort, order, page, per_page }),
    );
  }

  async createUser(data) {
    return this._withFallback(
      async () => (await this._request('/users', { method: 'POST', body: data })).data,
      () => this._createUserLocal(data),
    );
  }

  async updateUser(id, data) {
    return this._withFallback(
      async () => (await this._request(`/users/${id}`, { method: 'PUT', body: data })).data,
      () => this._updateUserLocal(id, data),
    );
  }

  async deleteUser(id) {
    return this._withFallback(
      async () => (await this._request(`/users/${id}`, { method: 'DELETE' })).data,
      () => this._deleteUserLocal(id),
    );
  }

  /** Restaura Usuário excluído com o mesmo id (undo de 5s do front). */
  async restoreUser(user) {
    const { id, nome, email, status, plano } = user;
    return this._withFallback(
      async () => (await this._request(`/users/${id}/restore`, { method: 'POST', body: { nome, email, status, plano } })).data,
      () => this._restoreUserLocal(user),
    );
  }

  // ---- Stats + Desempenho Semanal ----

  async getStats() {
    return this._withFallback(
      async () => (await this._request('/stats')).data,
      () => this._statsLocal(),
    );
  }

  async getWeekly() {
    return this._withFallback(
      async () => (await this._request('/performance/weekly')).data,
      () => FALLBACK_SALES_BY_DAY.map((s) => ({
        ...s,
        meta: FALLBACK_GOALS_BY_DAY.find((g) => g.dia === s.dia)?.meta ?? 0,
      })),
    );
  }

  // ---- Notificações ----

  async listNotifications() {
    return this._withFallback(
      () => this._request('/notifications'),
      () => {
        const data = this._loadNotificationsLocal();
        return { data, meta: { nao_lidas: data.filter((n) => !n.lida).length } };
      },
    );
  }

  async markNotificationRead(id, lida = true) {
    return this._withFallback(
      async () => (await this._request(`/notifications/${id}`, { method: 'PATCH', body: { lida } })).data,
      () => {
        const all = this._loadNotificationsLocal();
        const alvo = all.find((n) => sameId(n.id, id));
        if (!alvo) throw new ApiError('Notificação não encontrada', { code: 'NOT_FOUND', status: 404 });
        alvo.lida = lida;
        this._saveNotificationsLocal(all);
        return alvo;
      },
    );
  }

  async clearNotifications() {
    return this._withFallback(
      () => this._request('/notifications', { method: 'DELETE' }),
      () => {
        const removidas = this._loadNotificationsLocal().length;
        this._saveNotificationsLocal([]);
        return { data: { removidas } };
      },
    );
  }

  // ---- Reset demo ----

  async resetDemo() {
    try {
      const result = await this._request('/demo/reset', { method: 'POST' });
      this.online = true;
      return result.data;
    } catch (err) {
      if (!err?.offline) throw err;
      this.online = false;
      this._users = structuredClone(FALLBACK_USERS);
      this._notifications = structuredClone(FALLBACK_NOTIFICATIONS);
      StorageService.set('usuarios', this._users);
      StorageService.set('notifications', this._notifications);
      return { reset: true, offline: true };
    }
  }

  // ---- Armazenamento local (fallback offline) ----

  _loadUsersLocal() {
    if (this._users) return this._users;
    const stored = StorageService.get('usuarios', null);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      this._users = stored.map((u) => ({ ...u, email: u.email || '' }));
    } else {
      this._users = structuredClone(FALLBACK_USERS);
      StorageService.set('usuarios', this._users);
    }
    return this._users;
  }

  _saveUsersLocal(users) {
    this._users = users;
    StorageService.set('usuarios', users);
  }

  _loadNotificationsLocal() {
    if (this._notifications) return this._notifications;
    const stored = StorageService.get('notifications', null);
    if (stored && Array.isArray(stored)) {
      // Migra formato antigo { id, text, read } para { id, titulo, mensagem, lida }
      this._notifications = stored.map((n) => ({
        id: n.id,
        titulo: n.titulo ?? n.text ?? '',
        mensagem: n.mensagem ?? '',
        lida: n.lida ?? n.read ?? false,
        created_at: n.created_at ?? null,
      }));
    } else {
      this._notifications = structuredClone(FALLBACK_NOTIFICATIONS);
      StorageService.set('notifications', this._notifications);
    }
    return this._notifications;
  }

  _saveNotificationsLocal(all) {
    this._notifications = all;
    StorageService.set('notifications', all);
  }

  /** Validação espelhada do back-end para o modo offline. */
  _validateLocal(input, { partial = false } = {}) {
    const errors = [];
    const value = {};
    if (input.nome === undefined && partial) {
      // mantém atual
    } else {
      const nome = typeof input.nome === 'string' ? input.nome.trim() : '';
      if (!nome) errors.push({ field: 'nome', message: 'Nome é obrigatório' });
      else if (nome.length < 2) errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 2 caracteres' });
      else if (nome.length > 100) errors.push({ field: 'nome', message: 'Nome deve ter no máximo 100 caracteres' });
      else value.nome = nome;
    }
    if (input.email === undefined || input.email === null || input.email === '') {
      if (!partial) value.email = '';
    } else if (typeof input.email !== 'string' || !EMAIL_RE.test(input.email.trim())) {
      errors.push({ field: 'email', message: 'Email inválido' });
    } else {
      value.email = input.email.trim();
    }
    if (input.status === undefined) {
      if (!partial) value.status = 'Ativo';
    } else if (!['Ativo', 'Inativo'].includes(input.status)) {
      errors.push({ field: 'status', message: 'Status de Usuário deve ser Ativo ou Inativo' });
    } else {
      value.status = input.status;
    }
    if (input.plano === undefined) {
      if (!partial) value.plano = 'Básico';
    } else if (!['Básico', 'Premium'].includes(input.plano)) {
      errors.push({ field: 'plano', message: 'Plano deve ser Básico ou Premium' });
    } else {
      value.plano = input.plano;
    }
    return { value, errors };
  }

  _assertValidLocal(result) {
    if (result.errors.length > 0) {
      throw new ApiError('Dados de Usuário inválidos', { code: 'VALIDATION_ERROR', status: 400, details: result.errors });
    }
  }

  _emailEmUsoLocal(users, email, excetoId = null) {
    if (!email) return false;
    return users.some((u) => u.email && u.email.toLowerCase() === email.toLowerCase() && !sameId(u.id, excetoId));
  }

  _nextIdLocal(users) {
    const max = users.reduce((m, u) => {
      const n = typeof u.id === 'number' ? u.id : 0;
      return Math.max(m, n);
    }, 0);
    return max + 1;
  }

  _listUsersLocal({ q = '', status = '', plano = '', sort = 'id', order = 'desc', page = 1, per_page = 5 }) {
    let filtered = [...this._loadUsersLocal()];
    const termo = q.trim().toLowerCase();
    if (termo) {
      filtered = filtered.filter((u) =>
        u.nome.toLowerCase().includes(termo) || (u.email && u.email.toLowerCase().includes(termo)),
      );
    }
    if (status) filtered = filtered.filter((u) => u.status === status);
    if (plano) filtered = filtered.filter((u) => u.plano === plano);
    const campo = SORTS_VALIDOS.includes(sort) ? sort : 'id';
    const dir = order === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      if (campo === 'id') return (Number(a.id) - Number(b.id)) * dir;
      return String(a[campo] ?? '').localeCompare(String(b[campo] ?? ''), 'pt-BR', { sensitivity: 'base' }) * dir;
    });
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / per_page));
    const start = (page - 1) * per_page;
    return { data: filtered.slice(start, start + per_page), meta: { total, page, per_page, total_pages: totalPages } };
  }

  _createUserLocal(data) {
    const { value, errors } = this._validateLocal(data);
    this._assertValidLocal({ value, errors });
    const users = this._loadUsersLocal();
    if (this._emailEmUsoLocal(users, value.email)) {
      throw new ApiError('Email já cadastrado', { code: 'VALIDATION_ERROR', status: 400 });
    }
    const user = { id: this._nextIdLocal(users), created_at: new Date().toISOString(), ...value };
    this._saveUsersLocal([user, ...users]);
    return user;
  }

  _updateUserLocal(id, data) {
    const { value, errors } = this._validateLocal(data, { partial: true });
    this._assertValidLocal({ value, errors });
    const users = this._loadUsersLocal();
    const idx = users.findIndex((u) => sameId(u.id, id));
    if (idx === -1) throw new ApiError('Usuário não encontrado', { code: 'NOT_FOUND', status: 404 });
    if (value.email !== undefined && this._emailEmUsoLocal(users, value.email, id)) {
      throw new ApiError('Email já cadastrado', { code: 'VALIDATION_ERROR', status: 400 });
    }
    users[idx] = { ...users[idx], ...value };
    this._saveUsersLocal(users);
    return users[idx];
  }

  _deleteUserLocal(id) {
    const users = this._loadUsersLocal();
    const alvo = users.find((u) => sameId(u.id, id));
    if (!alvo) throw new ApiError('Usuário não encontrado', { code: 'NOT_FOUND', status: 404 });
    this._saveUsersLocal(users.filter((u) => !sameId(u.id, id)));
    return alvo;
  }

  _restoreUserLocal(user) {
    const { value, errors } = this._validateLocal(user);
    this._assertValidLocal({ value, errors });
    const users = this._loadUsersLocal();
    if (users.some((u) => sameId(u.id, user.id))) {
      throw new ApiError('Usuário já existe', { code: 'VALIDATION_ERROR', status: 400 });
    }
    if (this._emailEmUsoLocal(users, value.email)) {
      throw new ApiError('Email já cadastrado', { code: 'VALIDATION_ERROR', status: 400 });
    }
    const restored = { ...value, id: user.id, created_at: new Date().toISOString() };
    this._saveUsersLocal([restored, ...users]);
    return restored;
  }

  _statsLocal() {
    const usuarios = this._loadUsersLocal().length;
    const vendasTotal = FALLBACK_SALES_BY_DAY.reduce((s, d) => s + d.quantidade, 0);
    const receitaTotal = Math.round(FALLBACK_SALES_BY_DAY.reduce((s, d) => s + d.vendas, 0) * 100) / 100;
    return {
      usuarios_totais: usuarios,
      projetos_ativos: FALLBACK_ACTIVE_PROJECTS,
      vendas_total: vendasTotal,
      receita_total: receitaTotal,
    };
  }
}

/** Instância compartilhada usada pelos módulos do painel. */
export const apiService = new ApiService();
