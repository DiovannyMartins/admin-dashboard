/**
 * UserProfile - Menu de perfil do usuário
 * Dropdown com opções do usuário logado
 */

import { $ } from '../utils/dom.js';
import { Dropdown } from '../components/dropdown.js';
import { Icon } from '../utils/icons.js';
import { createElement } from '../utils/dom.js';

export class UserProfile {
  constructor() {
    this.avatar = $('.user-avatar');
    if (!this.avatar) return;

    this._createDropdown();
    this._bindEvents();
  }

  /**
   * Cria dropdown de perfil
   * @private
   */
  _createDropdown() {
    this.dropdownEl = createElement('div', {
      className: 'profile-dropdown',
      role: 'menu',
      'aria-label': 'Menu do perfil'
    });

    this.dropdownEl.innerHTML = `
      <div class="profile-dropdown-header">
        <div class="profile-avatar-large">DY</div>
        <div class="profile-info">
          <div class="profile-name">Diovanny Martins</div>
          <div class="profile-email">diovanny@exemplo.com</div>
        </div>
      </div>
      <div class="profile-dropdown-menu">
        <button class="profile-menu-item" data-action="profile">
          <span data-icon="user" data-size="16"></span>
          Meu Perfil
        </button>
        <button class="profile-menu-item" data-action="settings">
          <span data-icon="settings" data-size="16"></span>
          Configurações
        </button>
        <div class="profile-divider"></div>
        <button class="profile-menu-item profile-menu-logout" data-action="logout">
          Sair
        </button>
      </div>
    `;

    document.body.appendChild(this.dropdownEl);
    this.dropdown = new Dropdown(this.avatar, this.dropdownEl);

    // Renderiza ícones
    this.dropdownEl.querySelectorAll('[data-icon]').forEach(el => {
      const svg = Icon.element(el.dataset.icon, { width: parseInt(el.dataset.size) || 16, height: parseInt(el.dataset.size) || 16 });
      el.replaceWith(svg);
    });

    // Bind actions
    this.dropdownEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => this._handleAction(btn.dataset.action));
    });
  }

  /**
   * Bind de eventos do avatar
   * @private
   */
  _bindEvents() {
    this.avatar.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.dropdown.toggle();
      }
    });
  }

  /**
   * Handler de ações do menu
   * @private
   */
  _handleAction(action) {
    this.dropdown.close();
    
    switch (action) {
      case 'profile':
        alert('Funcionalidade de perfil em desenvolvimento');
        break;
      case 'settings':
        alert('Funcionalidade de configurações em desenvolvimento');
        break;
      case 'logout':
        if (confirm('Deseja realmente sair?')) {
          alert('Logout realizado');
        }
        break;
    }
  }
}
