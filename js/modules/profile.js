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

    const header = createElement('div', { className: 'profile-dropdown-header' });
    header.appendChild(createElement('div', { className: 'profile-avatar-large' }, ['DY']));
    const info = createElement('div', { className: 'profile-info' });
    info.appendChild(createElement('div', { className: 'profile-name' }, ['Diovanny Martins']));
    info.appendChild(createElement('div', { className: 'profile-email' }, ['diovanny@exemplo.com']));
    header.appendChild(info);
    this.dropdownEl.appendChild(header);

    const menu = createElement('div', { className: 'profile-dropdown-menu' });

    const btnProfile = createElement('button', { className: 'profile-menu-item', 'data-action': 'profile' });
    const iconProfile = createElement('span', { 'data-icon': 'user', 'data-size': '16' });
    btnProfile.appendChild(iconProfile);
    btnProfile.appendChild(document.createTextNode('Meu Perfil'));
    menu.appendChild(btnProfile);

    const btnSettings = createElement('button', { className: 'profile-menu-item', 'data-action': 'settings' });
    const iconSettings = createElement('span', { 'data-icon': 'settings', 'data-size': '16' });
    btnSettings.appendChild(iconSettings);
    btnSettings.appendChild(document.createTextNode('Configurações'));
    menu.appendChild(btnSettings);

    menu.appendChild(createElement('div', { className: 'profile-divider' }));

    const btnLogout = createElement('button', { className: 'profile-menu-item profile-menu-logout', 'data-action': 'logout' }, ['Sair']);
    menu.appendChild(btnLogout);

    this.dropdownEl.appendChild(menu);

    document.body.appendChild(this.dropdownEl);
    this.dropdown = new Dropdown(this.avatar, this.dropdownEl);

    // Renderiza ícones recriando SVGs
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
