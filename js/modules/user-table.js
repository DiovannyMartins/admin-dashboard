/**
 * UserTable - Gerenciamento completo de usuários
 * CRUD com busca, filtros, ordenação, paginação e export CSV
 */

import { $, $$, createElement, sanitize, debounce, generateId } from '../utils/dom.js';
import { eventBus } from '../utils/event-bus.js';
import { StorageService } from '../services/storage.service.js';
import { Modal } from '../components/modal.js';
import { Pagination } from '../components/pagination.js';
import { showToast } from '../components/toast.js';
import { Icon } from '../utils/icons.js';

const DEFAULT_USERS = [
  { id: generateId(), nome: 'João Silva', email: 'joao@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: generateId(), nome: 'Maria Souza', email: 'maria@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: generateId(), nome: 'Pedro Alves', email: 'pedro@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: generateId(), nome: 'Ana Dias', email: 'ana@exemplo.com', status: 'Ativo', plano: 'Premium' },
];

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

    // Migra dados antigos (sem campo email)
    const stored = StorageService.get('usuarios', null);
    if (stored && stored.length > 0) {
      this.users = stored.map(u => ({
        ...u,
        email: u.email || ''
      }));
    } else {
      this.users = DEFAULT_USERS;
    }
    
    this.filteredUsers = [...this.users];
    this.sortState = { field: null, direction: 'asc' };
    this.currentSearch = '';
    this.currentStatusFilter = '';
    this.currentPlanoFilter = '';
    this.lastDeletedUser = null;
    this.undoTimeout = null;

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
      onChange: () => this._render()
    });

    this._bindEvents();
    this._applyFilters();
    this._setupUndoToast();
  }

  /**
   * Registra todos os event listeners
   * @private
   */
  _bindEvents() {
    // Busca com debounce
    this.searchInput.addEventListener('input', debounce(() => {
      this.currentSearch = this.searchInput.value.trim().toLowerCase();
      this._applyFilters();
    }, 250));

    // Filtros
    this.filterStatus.addEventListener('change', () => {
      this.currentStatusFilter = this.filterStatus.value;
      this._applyFilters();
    });

    this.filterPlano.addEventListener('change', () => {
      this.currentPlanoFilter = this.filterPlano.value;
      this._applyFilters();
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
   * Aplica todos os filtros (busca, status, plano)
   * @private
   */
  _applyFilters() {
    let filtered = [...this.users];

    // Filtro de busca
    if (this.currentSearch) {
      filtered = filtered.filter(u =>
        u.nome.toLowerCase().includes(this.currentSearch) ||
        (u.email && u.email.toLowerCase().includes(this.currentSearch))
      );
    }

    // Filtro de status
    if (this.currentStatusFilter) {
      filtered = filtered.filter(u => u.status === this.currentStatusFilter);
    }

    // Filtro de plano
    if (this.currentPlanoFilter) {
      filtered = filtered.filter(u => u.plano === this.currentPlanoFilter);
    }

    // Aplica ordenação se existir
    if (this.sortState.field) {
      this._applySort(filtered);
    }

    this.filteredUsers = filtered;
    this.pagination.update(this.filteredUsers.length);
    this._render();
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
    
    this._applyFilters();
    showToast('Filtros limpos', 'info');
  }

  /**
   * Ordena array de usuários
   * @private
   */
  _applySort(array = this.filteredUsers) {
    const { field, direction } = this.sortState;
    if (!field) return;
    
    array.sort((a, b) => {
      const result = a[field].localeCompare(b[field], 'pt-BR', { sensitivity: 'base' });
      return direction === 'asc' ? result : -result;
    });
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
    
    this._applySort();
    this._updateSortIcons();
    this._render();
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
   * Renderiza a tabela com dados filtrados e paginados
   * @private
   */
  _render() {
    this.tbody.innerHTML = '';
    const { start, end } = this.pagination.getSlice();
    const page = this.filteredUsers.slice(start, end);

    if (page.length === 0) {
      const tr = createElement('tr');
      const td = createElement('td', { colspan: '4', className: 'table-empty' }, ['Nenhum usuário encontrado.']);
      tr.appendChild(td);
      this.tbody.appendChild(tr);
      return;
    }

    page.forEach(user => {
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
   * Handler de submit do formulário
   * @private
   */
  _handleSubmit(e) {
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

    if (this.editingId) {
      const idx = this.users.findIndex(u => u.id === this.editingId);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...data };
        showToast('Usuário atualizado com sucesso!', 'success');
      }
    } else {
      this.users.unshift({ id: generateId(), ...data });
      showToast('Usuário criado com sucesso!', 'success');
    }

    this._persist();
    this._applyFilters();
    this.modal.close();
  }

  /**
   * Exclui usuário com opção de undo
   * @private
   */
  _deleteUser(user) {
    // Salva usuário para possível undo
    this.lastDeletedUser = { ...user, index: this.users.findIndex(u => u.id === user.id) };
    
    // Remove usuário
    this.users = this.users.filter(u => u.id !== user.id);
    this._persist();
    this._applyFilters();

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
  _undoDelete() {
    if (!this.lastDeletedUser) return;

    const { index, ...user } = this.lastDeletedUser;
    this.users.splice(index, 0, user);
    this._persist();
    this._applyFilters();
    this.lastDeletedUser = null;
    
    showToast('Usuário restaurado', 'success');
  }

  /**
   * Persiste dados em localStorage
   * @private
   */
  _persist() {
    StorageService.set('usuarios', this.users);
    eventBus.emit('users:changed', this.users);
  }

  /**
   * Exporta usuários para CSV
   * @private
   */
  _exportCsv() {
    if (this.users.length === 0) {
      showToast('Nenhum usuário para exportar.', 'warning');
      return;
    }
    
    const header = 'Nome,Email,Status,Plano';
    const rows = this.users.map(u =>
      `"${u.nome.replace(/"/g, '""')}","${u.email || ''}","${u.status}","${u.plano}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = createElement('a', { href: url, download: 'usuarios.csv' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exportado com sucesso!', 'success');
  }
}
