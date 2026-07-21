import { createElement, sanitize } from '../utils/dom.js';

export class Pagination {
  constructor(container, options = {}) {
    this.container = container;
    this.currentPage = 1;
    this.perPage = options.perPage || 5;
    this.totalItems = 0;
    this.onChange = options.onChange || (() => {});
    this.render();
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.totalItems / this.perPage));
  }

  update(totalItems) {
    this.totalItems = totalItems;
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.render();
  }

  getSlice() {
    const start = (this.currentPage - 1) * this.perPage;
    return { start, end: start + this.perPage };
  }

  render() {
    this.container.innerHTML = '';
    if (this.totalPages <= 1) return;

    const nav = createElement('nav', { className: 'pagination', 'aria-label': 'Paginação' });

    const prevBtn = createElement('button', {
      className: `pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}`,
      'aria-label': 'Página anterior',
      disabled: this.currentPage === 1 ? 'true' : undefined,
      onClick: () => this.goTo(this.currentPage - 1)
    }, ['‹']);
    nav.appendChild(prevBtn);

    const pages = this._getPageNumbers();
    pages.forEach(p => {
      if (p === '...') {
        nav.appendChild(createElement('span', { className: 'pagination-ellipsis' }, ['…']));
      } else {
        const btn = createElement('button', {
          className: `pagination-btn ${p === this.currentPage ? 'active' : ''}`,
          'aria-label': `Página ${p}`,
          'aria-current': p === this.currentPage ? 'page' : undefined,
          onClick: () => this.goTo(p)
        }, [String(p)]);
        nav.appendChild(btn);
      }
    });

    const nextBtn = createElement('button', {
      className: `pagination-btn ${this.currentPage === this.totalPages ? 'disabled' : ''}`,
      'aria-label': 'Página seguinte',
      disabled: this.currentPage === this.totalPages ? 'true' : undefined,
      onClick: () => this.goTo(this.currentPage + 1)
    }, ['›']);
    nav.appendChild(nextBtn);

    this.container.appendChild(nav);
  }

  goTo(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.render();
    this.onChange(this.currentPage);
  }

  _getPageNumbers() {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 3) return [1, 2, 3, 4, '...', total];
    if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }
}
