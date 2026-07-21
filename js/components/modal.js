/**
 * Modal - Componente de modal acessível com focus trap
 * Implementa padrões WAI-ARIA para acessibilidade:
 * - Focus trap (Tab/Shift+Tab ficam dentro do modal)
 * - Fecha com Escape
 * - Retorna foco para elemento que abriu ao fechar
 * - aria-modal="true" para screen readers
 */
import { $, $$ } from '../utils/dom.js';

// Seletor para elementos focáveis dentro do modal
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class Modal {
  /**
   * @param {Element} overlayEl - Elemento do overlay (fundo escuro)
   * @param {Element} modalEl - Elemento do modal (conteúdo)
   */
  constructor(overlayEl, modalEl) {
    this.overlay = overlayEl;
    this.modal = modalEl;
    this.isOpen = false;
    this._triggerEl = null; // Elemento que abriu o modal (para retornar foco)
    this._onKeyDown = this._handleKeyDown.bind(this);

    // Botão de fechar (deve ter data-modal-close)
    this.closeBtn = $('[data-modal-close]', this.modal);
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    // Fecha ao clicar no overlay
    this.overlay.addEventListener('click', () => this.close());
  }

  /**
   * Abre o modal
   * @param {Element} triggerEl - Elemento que disparou a abertura (opcional)
   */
  open(triggerEl = null) {
    // Salva elemento atual para retornar foco ao fechar
    this._triggerEl = triggerEl || document.activeElement;
    this.isOpen = true;
    this.overlay.classList.add('active');
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-modal', 'true');
    // Adiciona listener para Escape e Tab
    document.addEventListener('keydown', this._onKeyDown);
    // Move foco para primeiro elemento focável
    requestAnimationFrame(() => this._trapFocus());
  }

  /**
   * Fecha o modal e retorna foco para elemento que abriu
   */
  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    this.modal.classList.remove('active');
    this.modal.removeAttribute('aria-modal');
    document.removeEventListener('keydown', this._onKeyDown);
    // Retorna foco para elemento que abriu o modal
    if (this._triggerEl) {
      this._triggerEl.focus();
      this._triggerEl = null;
    }
  }

  /**
   * Handler de teclas (Escape fecha, Tab faz focus trap)
   * @private
   */
  _handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      this._trapFocus(e);
    }
  }

  /**
   * Focus trap: mantém navegação Tab dentro do modal
   * @private
   * @param {KeyboardEvent|null} e - Evento Tab (null para foco inicial)
   */
  _trapFocus(e = null) {
    // Pega apenas elementos visíveis (offsetParent !== null)
    const focusable = $$(FOCUSABLE, this.modal).filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Foco inicial: move para primeiro elemento
    if (!e) {
      first.focus();
      return;
    }

    // Shift+Tab no primeiro elemento -> vai para o último
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } 
    // Tab no último elemento -> vai para o primeiro
    else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
