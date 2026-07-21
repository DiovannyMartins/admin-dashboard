import { $, $$, createElement, sanitize, debounce, generateId } from '../utils/dom.js';
import { eventBus } from '../utils/event-bus.js';
import { StorageService } from '../services/storage.service.js';
import { Modal } from '../components/modal.js';
import { Pagination } from '../components/pagination.js';
import { showToast } from '../components/toast.js';

const DEFAULT_USERS = [
  { id: generateId(), nome: 'João Silva', status: 'Ativo', plano: 'Premium' },
  { id: generateId(), nome: 'Maria Souza', status: 'Inativo', plano: 'Básico' },
  { id: generateId(), nome: 'Pedro Alves', status: 'Ativo', plano: 'Básico' },
  { id: generateId(), nome: 'Ana Dias', status: 'Ativo', plano: 'Premium' },
];

export class UserTable {
  constructor() {
    this.tbody = $('#tabelaUsuarios');
    this.searchInput = $('#inputBuscaUsuario');
    this.btnAdd = $('#btnAdicionarUsuario');
    this.paginationContainer = $('#paginationContainer');
    this.exportBtn = $('#btnExportarCsv');

    this.users = StorageService.get('usuarios', null) || DEFAULT_USERS;
    this.filteredUsers = [...this.users];
    this.sortState = { field: null, direction: 'asc' };
    this.currentSearch = '';

    this.modal = new Modal($('#modalOverlay'), $('#modalUsuario'));
    this.form = $('#formUsuario');
    this.modalTitle = $('#modalTitulo');
    this.modalNome = $('#modalNome');
    this.modalStatus = $('#modalStatus');
    this.modalPlano = $('#modalPlano');
    this.btnSave = $('#btnSalvarModal');
    this.editingId = null;

    this.pagination = new Pagination(this.paginationContainer, {
      perPage: 5,
      onChange: () => this._render()
    });

    this._bindEvents();
    this._applyFilter();
  }

  _bindEvents() {
    this.searchInput.addEventListener('input', debounce(() => {
      this.currentSearch = this.searchInput.value.trim().toLowerCase();
      this._applyFilter();
    }, 250));

    this.btnAdd.addEventListener('click', () => this._openModalForCreate());

    this.form.addEventListener('submit', (e) => this._handleSubmit(e));

    $$('.data-table th[data-campo]').forEach(th => {
      th.addEventListener('click', () => this._handleSort(th.dataset.campo));
    });

    this.exportBtn.addEventListener('click', () => this._exportCsv());
  }

  _applyFilter() {
    if (!this.currentSearch) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(u =>
        u.nome.toLowerCase().includes(this.currentSearch)
      );
    }
    if (this.sortState.field) this._applySort();
    this.pagination.update(this.filteredUsers.length);
    this._render();
  }

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

  _applySort() {
    const { field, direction } = this.sortState;
    if (!field) return;
    this.filteredUsers.sort((a, b) => {
      const result = a[field].localeCompare(b[field], 'pt-BR', { sensitivity: 'base' });
      return direction === 'asc' ? result : -result;
    });
  }

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
    tdActions.appendChild(this._createActionBtn('visualizar', 'Visualizar', 'img/visualizar.png', () => this._openModalForView(user)));
    tdActions.appendChild(this._createActionBtn('editar', 'Editar', 'img/editar.png', () => this._openModalForEdit(user)));
    tdActions.appendChild(this._createActionBtn('excluir', 'Excluir', 'img/lixeira-de-reciclagem.png', () => this._deleteUser(user)));

    tr.appendChild(tdName);
    tr.appendChild(tdStatus);
    tr.appendChild(tdPlan);
    tr.appendChild(tdActions);
    return tr;
  }

  _createActionBtn(type, label, iconSrc, onClick) {
    const btn = createElement('button', {
      className: `btn-action btn-${type}`,
      'aria-label': label,
      title: label,
      onClick
    });
    const img = createElement('img', { src: iconSrc, alt: '', 'aria-hidden': 'true', loading: 'lazy' });
    btn.appendChild(img);
    return btn;
  }

  _openModalForView(user) {
    this.modalTitle.textContent = 'Visualizar Usuário';
    this.modalNome.value = user.nome;
    this.modalStatus.value = user.status;
    this.modalPlano.value = user.plano;
    this._setFormDisabled(true);
    this.btnSave.style.display = 'none';
    this.modal.open();
  }

  _openModalForEdit(user) {
    this.modalTitle.textContent = 'Editar Usuário';
    this.modalNome.value = user.nome;
    this.modalStatus.value = user.status;
    this.modalPlano.value = user.plano;
    this._setFormDisabled(false);
    this.btnSave.style.display = '';
    this.editingId = user.id;
    this.modal.open();
  }

  _openModalForCreate() {
    this.modalTitle.textContent = 'Novo Usuário';
    this.form.reset();
    this._setFormDisabled(false);
    this.btnSave.style.display = '';
    this.editingId = null;
    this.modal.open();
  }

  _setFormDisabled(disabled) {
    this.modalNome.disabled = disabled;
    this.modalStatus.disabled = disabled;
    this.modalPlano.disabled = disabled;
  }

  _handleSubmit(e) {
    e.preventDefault();
    const nome = this.modalNome.value.trim();
    if (!nome) {
      showToast('O nome não pode estar vazio.', 'warning');
      return;
    }

    const data = { nome, status: this.modalStatus.value, plano: this.modalPlano.value };

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
    this._applyFilter();
    this.modal.close();
  }

  _deleteUser(user) {
    if (!confirm(`Remover o usuário "${user.nome}"?`)) return;
    this.users = this.users.filter(u => u.id !== user.id);
    this._persist();
    this._applyFilter();
    showToast('Usuário removido.', 'info');
  }

  _persist() {
    StorageService.set('usuarios', this.users);
    eventBus.emit('users:changed', this.users);
  }

  _exportCsv() {
    if (this.users.length === 0) {
      showToast('Nenhum usuário para exportar.', 'warning');
      return;
    }
    const header = 'Nome,Status,Plano';
    const rows = this.users.map(u =>
      `"${u.nome.replace(/"/g, '""')}","${u.status}","${u.plano}"`
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
