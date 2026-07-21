/**
 * KeyboardShortcuts - Gerenciador de atalhos de teclado
 * Permite navegação e ações via teclado
 * 
 * Atalhos implementados:
 * - Ctrl/Cmd + K: Focar busca
 * - Ctrl/Cmd + N: Novo usuário
 * - Ctrl/Cmd + E: Exportar CSV
 * - Ctrl/Cmd + T: Alternar tema
 * - Escape: Fechar modal/dropdown
 */

import { $ } from '../utils/dom.js';

export class KeyboardShortcuts {
  constructor(options = {}) {
    this.onSearch = options.onSearch || (() => {});
    this.onNewUser = options.onNewUser || (() => {});
    this.onExport = options.onExport || (() => {});
    this.onThemeToggle = options.onThemeToggle || (() => {});
    
    this._bindShortcuts();
  }

  /**
   * Registra atalhos de teclado globais
   * @private
   */
  _bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignora se está em input/select/textarea (exceto Escape)
      const isInput = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName);
      
      if (e.key === 'Escape') {
        // Escape sempre funciona
        return;
      }
      
      if (isInput) return;

      const isCmd = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + K: Buscar
      if (isCmd && e.key === 'k') {
        e.preventDefault();
        this.onSearch();
      }

      // Ctrl/Cmd + N: Novo usuário
      if (isCmd && e.key === 'n') {
        e.preventDefault();
        this.onNewUser();
      }

      // Ctrl/Cmd + E: Exportar CSV
      if (isCmd && e.key === 'e') {
        e.preventDefault();
        this.onExport();
      }

      // Ctrl/Cmd + T: Alternar tema
      if (isCmd && e.key === 't') {
        e.preventDefault();
        this.onThemeToggle();
      }
    });
  }
}
