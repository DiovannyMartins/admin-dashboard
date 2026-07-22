/**
 * ThemeManager - Gerenciador de temas (dark/light)
 * Persiste preferência do usuário em localStorage
 * 
 * Uso:
 * import { ThemeManager } from './modules/theme.js';
 * const theme = new ThemeManager();
 * theme.toggle(); // Alterna entre dark/light
 */

import { $ } from '../utils/dom.js';
import { Icon } from '../utils/icons.js';

export class ThemeManager {
  constructor() {
    this.theme = this._getStoredTheme() || this._getSystemTheme();
    this._applyTheme();
    this._createToggleButton();
  }

  /**
   * Retorna tema armazenado ou null
   * @private
   */
  _getStoredTheme() {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  }

  /**
   * Detecta tema do sistema operacional
   * @private
   */
  _getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  /**
   * Aplica tema ao documento
   * @private
   */
  _applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this._updateToggleButton();
  }

  /**
   * Alterna entre temas
   */
  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this._applyTheme();
    this._storeTheme();
  }

  /**
   * Define tema específico
   * @param {string} theme - 'dark' ou 'light'
   */
  set(theme) {
    if (theme !== 'dark' && theme !== 'light') return;
    this.theme = theme;
    this._applyTheme();
    this._storeTheme();
  }

  /**
   * Retorna tema atual
   * @returns {string} - 'dark' ou 'light'
   */
  get() {
    return this.theme;
  }

  /**
   * Salva preferência em localStorage
   * @private
   */
  _storeTheme() {
    try {
      localStorage.setItem('theme', this.theme);
    } catch {
      // Silencioso - modo privado pode falhar
    }
  }

  /**
   * Cria/atualiza botão de toggle no topbar
   * @private
   */
  _createToggleButton() {
    const btn = $('#btnThemeToggle');
    if (!btn) return;

    btn.addEventListener('click', () => this.toggle());
    this._toggleBtn = btn;
    this._updateToggleButton();
  }

  /**
   * Atualiza ícone do botão de toggle
   * Recria o SVG completamente ao invés de buscar [data-icon]
   * @private
   */
  _updateToggleButton() {
    if (!this._toggleBtn) return;
    const iconName = this.theme === 'dark' ? 'sun' : 'moon';
    
    // Remove SVG existente se houver
    const existingSvg = this._toggleBtn.querySelector('svg');
    if (existingSvg) existingSvg.remove();
    
    // Cria novo SVG
    const svg = Icon.element(iconName, { width: 20, height: 20 });
    this._toggleBtn.appendChild(svg);
  }
}
