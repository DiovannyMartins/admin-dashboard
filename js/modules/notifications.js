/**
 * Notifications - Sistema de notificações
 * Gerencia lista de notificações com marcar como lida e limpar todas
 */

import { $, createElement } from '../utils/dom.js';
import { Dropdown } from '../components/dropdown.js';
import { Icon } from '../utils/icons.js';

const DEFAULT_NOTIFICATIONS = [
  { id: 1, text: 'Novo usuário cadastrado: Ana Dias', read: false },
  { id: 2, text: 'Meta de vendas de Quarta atingida!', read: false },
  { id: 3, text: 'Servidor com uso de disco em 80%', read: false },
];

export class Notifications {
  constructor() {
    this.trigger = $('#btnNotificacao');
    this.dropdownEl = $('#notificationDropdown');
    this.badge = $('#badgeNotificacao');
    this.listEl = $('#listaNotificacoes');
    this.notifications = [...DEFAULT_NOTIFICATIONS];

    this.dropdown = new Dropdown(this.trigger, this.dropdownEl);
    this._renderIcons();
    this._render();
  }

  /**
   * Renderiza ícones nos botões
   * @private
   */
  _renderIcons() {
    // Ícone do sino
    const bellSpan = this.trigger.querySelector('[data-icon="bell"]');
    if (bellSpan) {
      const svg = Icon.element('bell', { width: 22, height: 22 });
      bellSpan.replaceWith(svg);
    }
  }

  /**
   * Renderiza lista de notificações
   * @private
   */
  _render() {
    this.listEl.innerHTML = '';

    const unread = this.notifications.filter(n => !n.read);
    this.badge.textContent = unread.length;
    this.badge.style.display = unread.length > 0 ? 'flex' : 'none';

    if (this.notifications.length === 0) {
      this.listEl.appendChild(
        createElement('div', { className: 'notification-item notification-empty' }, ['Nenhuma notificação.'])
      );
      return;
    }

    this.notifications.forEach(n => {
      const item = createElement('div', {
        className: `notification-item ${n.read ? 'read' : 'unread'}`,
        dataset: { id: String(n.id) }
      });

      const text = createElement('span', { className: 'notification-text' }, [n.text]);
      item.appendChild(text);

      if (!n.read) {
        const markBtn = createElement('button', {
          className: 'notification-mark-read',
          'aria-label': 'Marcar como lida',
          title: 'Marcar como lida',
          onClick: () => this._markAsRead(n.id)
        });
        markBtn.appendChild(Icon.check({ width: 14, height: 14 }));
        item.appendChild(markBtn);
      }

      this.listEl.appendChild(item);
    });

    const footer = createElement('div', { className: 'notification-footer' });
    const clearBtn = createElement('button', {
      className: 'notification-clear-all',
      onClick: () => this._clearAll()
    }, ['Limpar todas']);
    footer.appendChild(clearBtn);
    this.listEl.appendChild(footer);
  }

  /**
   * Marca notificação como lida
   * @private
   */
  _markAsRead(id) {
    const n = this.notifications.find(n => n.id === id);
    if (n) n.read = true;
    this._render();
  }

  /**
   * Limpa todas as notificações
   * @private
   */
  _clearAll() {
    this.notifications = [];
    this._render();
  }
}
