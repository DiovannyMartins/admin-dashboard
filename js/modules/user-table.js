/**
 * UserTable - Gerenciamento completo de usuários via ApiService
 * Busca, filtros, ordenação e paginação no servidor (ou seed local offline),
 * com CRUD, export CSV e undo de exclusão (5 segundos).
 */

import { $, $$, createElement, sanitize, debounce } from '../utils/dom.js';
import { eventBus } from '../utils/event-bus.js';
import { apiService } from '../services/api.service.js';
import { Modal } from '../components/modal.js';
import { Pagination } from '../components/pagination.js';
import { showToast } from '../components/toast.js';
import { Icon } from '../utils/icons.js';

export class UserTable {
  constructor() {
    this.tbody = $('#tabelaUsuarios');
    this.searchInput = $('#inputBuscaUsuario');
    this.btnAdd = $('#btnAdicionarUsuario');
    this.paginationContainer = $('#paginationContainer');
    this.exportBtn = $('#btnExportarCsv');
    this.filterStatus = $('#filterStatus');
    this.filterPlano = $('#filterPlano');
    this.btnClearFilters = $('#btnClearFilters');

    this.sortState = { field: 'id', direction: 'desc' };
    this.currentSearch = '';
    this.currentStatusFilter = '';
    this.currentPlanoFilter = '';
    this.pageUsers = [];
    this.lastDeletedUser = null;
    this.undoTimeout = null;
    this._fetchSeq = 0;

    this.modal = new Modal($('#modalOverlay'), $('#modalUsuario'));
    this.form = $('#formUsuario');
    this.modalTitle = $('#modalTitulo');
    this.modalNome = $('#modalNome');
    this.modalEmail = $('#modalEmail');
    this.modalStatus = $('#modalStatus');
    this.modalPlano = $('#modalPlano');
    this.btnSave = $('#btnSalvarModal');
    this.errorNome = $('#errorNome');
    this.errorEmail = $('#errorEmail');
    this.editingId = null;

    this.pagination = new Pagination(this.paginationContainer, {
      perPage: 5,
      onChange: () => this._fetchAndRender(),
    });

    this._bindEvents();
    this._setupUndoToast();
    this.ready = this._fetchAndRender();
  }

  /**
   * Registra todos os event listeners
   * @private
   */
  _bindEvents() {
    // Busca com debounce
    this.searchInput.addEventListener('input', debounce(() => {
      this.currentSearch = this.searchInput.value.trim();
      this.pagination.currentPage = 1;
      this._fetchAndRender();
    }, 250));

    // Filtros
    this.filterStatus.addEventListener('change', () => {
      this.currentStatusFilter = this.filterStatus.value;
      this.pagination.currentPage = 1;
      this._fetchAndRender();
    });

    this.filterPlano.addEventListener('change', () => {
      this.currentPlanoFilter = this.filterPlano.value;
      this.pagination.currentPage = 1;
      this._fetchAndRender();
    });

    // Limpar filtros
    if (this.btnClearFilters) {
      this.btnClearFilters.addEventListener('click', () => this._clearFilters());
    }

    // Botão adicionar
    this.btnAdd.addEventListener('click', () => this._openModalForCreate());

    // Submit do formulário
    this.form.addEventListener('submit', (e) => this._handleSubmit(e));

    // Ordenação
    $$('.data-table th[data-campo]').forEach(th => {
      th.addEventListener('click', () => this._handleSort(th.dataset.campo));
    });

    // Export CSV
    this.exportBtn.addEventListener('click', () => this._exportCsv());

    // Validação em tempo real
    this.modalNome.addEventListener('input', () => this._validateNome());
    if (this.modalEmail) {
      this.modalEmail.addEventListener('input', () => this._validateEmail());
    }
  }

  /**
   * Configura toast de undo para exclusão
   * @private
   */
  _setupUndoToast() {
    const undoToast = $('#undoToast');
    const btnUndo = $('#btnUndo');

    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        this._undoDelete();
        undoToast.classList.remove('active');
      });
    }
  }

  /**
   * Busca a página atual na API (ou seed local offline) e renderiza
   * @private
   */
  async _fetchAndRender() {
    const seq = ++this._fetchSeq;
    this._renderLoading();
    try {
      const { data, meta } = await apiService.listUsers({
        q: this.currentSearch,
        status: this.currentStatusFilter,
        plano: this.currentPlanoFilter,
        sort: this.sortState.field,
        order: this.sortState.direction,
        page: this.pagination.currentPage,
        per_page: this.pagination.perPage,
      });
      if (seq !== this._fetchSeq) return; // resposta obsoleta: ignora
      this.pageUsers = data;
      this.pagination.update(meta.total);
      // Filtros podem ter esvaziado páginas além do total: refaz na última válida
      if (this.pagination.currentPage > this.pagination.totalPages) {
        this.pagination.currentPage = this.pagination.totalPages;
        return this._fetchAndRender();
      }
      this._render();
    } catch (err) {
      if (seq !== this._fetchSeq) return;
      this.pageUsers = [];
      this._renderError(err?.message ?? 'Erro ao carregar usuários');
    }
  }

  /**
   * Limpa todos os filtros
   * @private
   */
  _clearFilters() {
    this.currentSearch = '';
    this.currentStatusFilter = '';
    this.currentPlanoFilter = '';

    this.searchInput.value = '';
    this.filterStatus.value = '';
    this.filterPlano.value = '';

    this.pagination.currentPage = 1;
    this._fetchAndRender();
    showToast('Filtros limpos', 'info');
  }

  /**
   * Handler de ordenação por coluna
   * @private
   */
  _handleSort(field) {
    if (this.sortState.field === field) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState = { field, direction: 'asc' };
    }

    this._updateSortIcons();
    this.pagination.currentPage = 1;
    this._fetchAndRender();
  }

  /**
   * Atualiza ícones de ordenação nos cabeçalhos
   * @private
   */
  _updateSortIcons() {
    $$('.data-table th[data-campo]').forEach(th => {
      const icon = $('.sort-icon', th);
      if (th.dataset.campo === this.sortState.field) {
        icon.textContent = this.sortState.direction === 'asc' ? '↑' : '↓';
      } else {
        icon.textContent = '';
      }
    });
  }

  /**
   * Renderiza estado de carregamento
   * @private
   */
  _renderLoading() {
    this.tbody.innerHTML = '';
    const tr = createElement('tr');
    const td = createElement('td', { colspan: '4', className: 'table-empty' }, ['Carregando usuários…']);
    tr.appendChild(td);
    this.tbody.appendChild(tr);
  }

  /**
   * Renderiza estado de erro com tentativa novamente
   * @private
   */
  _renderError(message) {
    this.tbody.innerHTML = '';
    const tr = createElement('tr');
    const td = createElement('td', { colspan: '4', className: 'table-empty' }, [message]);
    tr.appendChild(td);
    this.tbody.appendChild(tr);
  }

  /**
   * Renderiza a tabela com a página atual
   * @private
   */
  _render() {
    this.tbody.innerHTML = '';

    if (this.pageUsers.length === 0) {
      const tr = createElement('tr');
      const td = createElement('td', { colspan: '4', className: 'table-empty' }, ['Nenhum usuário encontrado.']);
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }

    this.pageUsers.forEach(user => {
      const tr = this._createRow(user);
      this.tbody.appendChild(tr);
    });
  }

  /**
   * Cria linha da tabela para um usuário
   * @private
   */
  _createRow(user) {
    const statusClass = user.status === 'Ativo' ? 'status-active' : 'status-inactive';
    const planClass = user.plano === 'Premium' ? 'plan-premium' : 'plan-basic';

    const tr = createElement('tr');

    const tdName = createElement('td', {}, [sanitize(user.nome)]);
    const tdStatus = createElement('td');
    tdStatus.appendChild(createElement('span', { className: `badge ${statusClass}` }, [user.status]));
    const tdPlan = createElement('td');
    tdPlan.appendChild(createElement('span', { className: `badge ${planClass}` }, [user.plano]));

    const tdActions = createElement('td', { className: 'td-actions' });
    tdActions.appendChild(this._createActionBtn('visualizar', 'Visualizar', Icon.eye({ width: 18, height: 18 }), () => this._openModalForView(user)));
    tdActions.appendChild(this._createActionBtn('editar', 'Editar', Icon.edit({ width: 18, height: 18 }), () => this._openModalForEdit(user)));
    tdActions.appendChild(this._createActionBtn('excluir', 'Excluir', Icon.trash({ width: 18, height: 18 }), () => this._deleteUser(user)));

    tr.appendChild(tdName);
    tr.appendChild(tdStatus);
    tr.appendChild(tdPlan);
    tr.appendChild(tdActions);
    return tr;
  }

  /**
   * Cria botão de ação com ícone SVG
   * @private
   */
  _createActionBtn(type, label, iconElement, onClick) {
    const btn = createElement('button', {
      className: `btn-action btn-${type}`,
      'aria-label': label,
      title: label,
      onClick
    });
    btn.appendChild(iconElement);
    return btn;
  }

  /**
   * Abre modal para visualização
   * @private
   */
  _openModalForView(user) {
    this.modalTitle.textContent = 'Visualizar Usuário';
    this.modalNome.value = user.nome;
    if (this.modalEmail) this.modalEmail.value = user.email || '';
    this.modalStatus.value = user.status;
    this.modalPlano.value = user.plano;
    this._setFormDisabled(true);
    this.btnSave.style.display = 'none';
    this._clearErrors();
    this.modal.open();
  }

  /**
   * Abre modal para edição
   * @private
   */
  _openModalForEdit(user) {
    this.modalTitle.textContent = 'Editar Usuário';
    this.modalNome.value = user.nome;
    if (this.modalEmail) this.modalEmail.value = user.email || '';
    this.modalStatus.value = user.status;
    this.modalPlano.value = user.plano;
    this._setFormDisabled(false);
    this.btnSave.style.display = '';
    this.editingId = user.id;
    this._clearErrors();
    this.modal.open();
  }

  /**
   * Abre modal para criação
   * @private
   */
  _openModalForCreate() {
    this.modalTitle.textContent = 'Novo Usuário';
    this.form.reset();
    this._setFormDisabled(false);
    this.btnSave.style.display = '';
    this.editingId = null;
    this._clearErrors();
    this.modal.open();
  }

  /**
   * Habilita/desabilita campos do formulário
   * @private
   */
  _setFormDisabled(disabled) {
    this.modalNome.disabled = disabled;
    if (this.modalEmail) this.modalEmail.disabled = disabled;
    this.modalStatus.disabled = disabled;
    this.modalPlano.disabled = disabled;
  }

  /**
   * Valida campo nome
   * @private
   */
  _validateNome() {
    const nome = this.modalNome.value.trim();
    if (!nome) {
      this._showError(this.errorNome, 'Nome é obrigatório');
      return false;
    }
    if (nome.length < 2) {
      this._showError(this.errorNome, 'Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (nome.length > 100) {
      this._showError(this.errorNome, 'Nome deve ter no máximo 100 caracteres');
      return false;
    }
    this._clearError(this.errorNome);
    return true;
  }

  /**
   * Valida campo email
   * @private
   */
  _validateEmail() {
    if (!this.modalEmail) return true;

    const email = this.modalEmail.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this._showError(this.errorEmail, 'Email inválido');
      return false;
    }
    this._clearError(this.errorEmail);
    return true;
  }

  /**
   * Mostra erro em campo
   * @private
   */
  _showError(element, message) {
    if (element) {
      element.textContent = message;
    }
  }

  /**
   * Limpa erro de campo
   * @private
   */
  _clearError(element) {
    if (element) {
      element.textContent = '';
    }
  }

  /**
   * Limpa todos os erros
   * @private
   */
  _clearErrors() {
    this._clearError(this.errorNome);
    this._clearError(this.errorEmail);
  }

  /**
   * Exibe erros de validação vindos da API nos campos do formulário
   * @private
   */
  _showApiErrors(err) {
    const details = Array.isArray(err?.details) ? err.details : [];
    for (const d of details) {
      if (d.field === 'nome') this._showError(this.errorNome, d.message);
      if (d.field === 'email') this._showError(this.errorEmail, d.message);
    }
    if (details.some(d => d.field === 'email' && /uso/i.test(d.message))) {
      showToast('Email já está em uso por outro usuário', 'error');
    } else {
      showToast(err?.message ?? 'Corrija os erros antes de salvar', 'error');
    }
  }

  /**
   * Handler de submit do formulário
   * @private
   */
  async _handleSubmit(e) {
    e.preventDefault();

    // Valida campos
    const isNomeValid = this._validateNome();
    const isEmailValid = this._validateEmail();

    if (!isNomeValid || !isEmailValid) {
      showToast('Corrija os erros antes de salvar', 'error');
      return;
    }

    const nome = this.modalNome.value.trim();
    const email = this.modalEmail ? this.modalEmail.value.trim() : '';
    const data = { nome, email, status: this.modalStatus.value, plano: this.modalPlano.value };

    try {
      if (this.editingId !== null && this.editingId !== undefined) {
        await apiService.updateUser(this.editingId, data);
        showToast('Usuário atualizado com sucesso!', 'success');
      } else {
        await apiService.createUser(data);
        showToast('Usuário criado com sucesso!', 'success');
      }
      this.modal.close();
      eventBus.emit('users:changed');
      await this._fetchAndRender();
    } catch (err) {
      if (err?.code === 'VALIDATION_ERROR') this._showApiErrors(err);
      else showToast(err?.message ?? 'Erro ao salvar usuário', 'error');
    }
  }

  /**
   * Exclui usuário com opção de undo
   * @private
   */
  async _deleteUser(user) {
    let deleted;
    try {
      deleted = await apiService.deleteUser(user.id);
    } catch (err) {
      showToast(err?.message ?? 'Erro ao excluir usuário', 'error');
      return;
    }

    // Guarda payload para possível undo (restauração com o mesmo id)
    this.lastDeletedUser = deleted;
    eventBus.emit('users:changed');
    await this._fetchAndRender();

    // Mostra toast de undo
    const undoToast = $('#undoToast');
    if (undoToast) {
      undoToast.classList.add('active');

      // Auto-remove após 5 segundos
      if (this.undoTimeout) clearTimeout(this.undoTimeout);
      this.undoTimeout = setTimeout(() => {
        undoToast.classList.remove('active');
        this.lastDeletedUser = null;
      }, 5000);
    }

    showToast('Usuário removido', 'info');
  }

  /**
   * Desfaz última exclusão
   * @private
   */
  async _undoDelete() {
    if (!this.lastDeletedUser) return;

    try {
      await apiService.restoreUser(this.lastDeletedUser);
      this.lastDeletedUser = null;
      eventBus.emit('users:changed');
      await this._fetchAndRender();
      showToast('Usuário restaurado', 'success');
    } catch (err) {
      showToast(err?.message ?? 'Erro ao restaurar usuário', 'error');
    }
  }

  /**
   * Exporta usuários filtrados para CSV (todas as páginas)
   * @private
   */
  async _exportCsv() {
    try {
      const perPage = 100;
      const first = await apiService.listUsers({
        q: this.currentSearch,
        status: this.currentStatusFilter,
        plano: this.currentPlanoFilter,
        sort: this.sortState.field,
        order: this.sortState.direction,
        page: 1,
        per_page: perPage,
      });
      let users = [...first.data];
      for (let page = 2; page <= first.meta.total_pages; page++) {
        const next = await apiService.listUsers({
          q: this.currentSearch,
          status: this.currentStatusFilter,
          plano: this.currentPlanoFilter,
          sort: this.sortState.field,
          order: this.sortState.direction,
          page,
          per_page: perPage,
        });
        users = users.concat(next.data);
      }

      if (users.length === 0) {
        showToast('Nenhum usuário para exportar.', 'warning');
        return;
      }

      const header = 'Nome,Email,Status,Plano';
      const rows = users.map(u =>
        `"${u.nome.replace(/"/g, '""')}","${(u.email || '').replace(/"/g, '""')}","${u.status}","${u.plano}"`
      );
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = createElement('a', { href: url, download: 'usuarios.csv' });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('CSV exportado com sucesso!', 'success');
    } catch (err) {
      showToast(err?.message ?? 'Erro ao exportar CSV', 'error');
    }
  }
}
