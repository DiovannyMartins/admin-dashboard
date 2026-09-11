/**
 * Notifications - Sistema de notificações via ApiService (issue #8)
 * Lista, marca como lida e limpa todas; online via API, offline via seed local.
 */

import { $, createElement } from '../utils/dom.js';
import { apiService } from '../services/api.service.js';
import { Dropdown } from '../components/dropdown.js';
import { Icon } from '../utils/icons.js';

export class Notifications {
  constructor() {
    this.trigger = $('#btnNotificacao');
    this.dropdownEl = $('#notificationDropdown');
    this.badge = $('#badgeNotificacao');
    this.listEl = $('#listaNotificacoes');
    this.notifications = [];

    this.dropdown = new Dropdown(this.trigger, this.dropdownEl);
    this._renderIcons();
    this.ready = this._load();
  }

  /**
   * Carrega Notificações da API (ou seed local offline)
   * @private
   */
  async _load() {
    try {
      const { data } = await apiService.listNotifications();
      this.notifications = data;
    } catch {
      this.notifications = [];
    }
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
   * Texto exibido de uma Notificação (título + mensagem)
   * @private
   */
  _textOf(n) {
    if (n.titulo && n.mensagem) return `${n.titulo} — ${n.mensagem}`;
    return n.titulo ?? n.text ?? '';
  }

  /**
   * Renderiza lista de notificações
   * @private
   */
  _render() {
    this.listEl.innerHTML = '';

    const unread = this.notifications.filter(n => !(n.lida ?? n.read));
    this.badge.textContent = unread.length;
    this.badge.style.display = unread.length > 0 ? 'flex' : 'none';

    if (this.notifications.length === 0) {
      this.listEl.appendChild(
        createElement('div', { className: 'notification-item notification-empty' }, ['Nenhuma notificação.'])
      );
      return;
    }

    this.notifications.forEach(n => {
      const read = n.lida ?? n.read ?? false;
      const item = createElement('div', {
        className: `notification-item ${read ? 'read' : 'unread'}`,
        dataset: { id: String(n.id) }
      });

      const text = createElement('span', { className: 'notification-text' }, [this._textOf(n)]);
      item.appendChild(text);

      if (!read) {
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
  async _markAsRead(id) {
    try {
      const updated = await apiService.markNotificationRead(id, true);
      const local = this.notifications.find(n => String(n.id) === String(id));
      if (local) {
        local.lida = updated.lida ?? true;
        local.read = local.lida;
      }
    } catch {
      const local = this.notifications.find(n => String(n.id) === String(id));
      if (local) {
        local.lida = true;
        local.read = true;
      }
    }
    this._render();
  }

  /**
   * Limpa todas as notificações
   * @private
   */
  async _clearAll() {
    try {
      await apiService.clearNotifications();
    } catch {
      // Offline total: limpa só a exibição
    }
    this.notifications = [];
    this._render();
  }
}
