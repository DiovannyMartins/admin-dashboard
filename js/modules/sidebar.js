import { $, $$ } from '../utils/dom.js';

export class Sidebar {
  constructor() {
    this.toggle = $('#menuToggle');
    this.sidebar = $('.sidebar');
    this.links = $$('.sidebar-menu a');
    this._init();
  }

  _init() {
    this.toggle.addEventListener('click', () => this._toggle());
    this.links.forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  }

  _toggle() {
    const isActive = this.sidebar.classList.toggle('active');
    this.toggle.setAttribute('aria-expanded', String(isActive));
    this.toggle.setAttribute('aria-label', isActive ? 'Fechar menu' : 'Abrir menu');
  }

  close() {
    this.sidebar.classList.remove('active');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', 'Abrir menu');
  }
}
