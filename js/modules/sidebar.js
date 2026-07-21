/**
 * Sidebar - Menu lateral com suporte a mobile
 * Gerencia abertura/fechamento e overlay
 */

import { $, $$ } from '../utils/dom.js';
import { Icon } from '../utils/icons.js';

export class Sidebar {
  constructor() {
    this.toggle = $('#menuToggle');
    this.sidebar = $('.sidebar');
    this.overlay = $('#sidebarOverlay');
    this.links = $$('.sidebar-menu a');
    
    this._init();
    this._renderIcons();
  }

  /**
   * Inicializa event listeners
   * @private
   */
  _init() {
    this.toggle.addEventListener('click', () => this._toggle());
    
    this.links.forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // Fecha ao clicar no overlay
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Fecha com Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sidebar.classList.contains('active')) {
        this.close();
      }
    });
  }

  /**
   * Renderiza ícones nos links do menu
   * @private
   */
  _renderIcons() {
    $$('.sidebar-menu .icon[data-icon]').forEach(el => {
      const iconName = el.dataset.icon;
      el.innerHTML = Icon.get(iconName, { width: 20, height: 20 });
    });

    // Ícone do logo
    const logoIcon = $('.logo-icon[data-icon]');
    if (logoIcon) {
      const size = parseInt(logoIcon.dataset.size) || 28;
      logoIcon.innerHTML = Icon.get(logoIcon.dataset.icon, { width: size, height: size });
    }
  }

  /**
   * Alterna estado da sidebar
   * @private
   */
  _toggle() {
    const isActive = this.sidebar.classList.toggle('active');
    this.toggle.setAttribute('aria-expanded', String(isActive));
    this.toggle.setAttribute('aria-label', isActive ? 'Fechar menu' : 'Abrir menu');
    
    // Mostra/esconde overlay
    if (this.overlay) {
      this.overlay.classList.toggle('active', isActive);
    }
    
    // Previne scroll do body quando sidebar está aberta
    document.body.style.overflow = isActive ? 'hidden' : '';
  }

  /**
   * Fecha a sidebar
   */
  close() {
    this.sidebar.classList.remove('active');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', 'Abrir menu');
    
    if (this.overlay) {
      this.overlay.classList.remove('active');
    }
    
    document.body.style.overflow = '';
  }
}
