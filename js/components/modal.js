import { $, $$ } from '../utils/dom.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class Modal {
  constructor(overlayEl, modalEl) {
    this.overlay = overlayEl;
    this.modal = modalEl;
    this.isOpen = false;
    this._triggerEl = null;
    this._onKeyDown = this._handleKeyDown.bind(this);

    this.closeBtn = $('[data-modal-close]', this.modal);
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    this.overlay.addEventListener('click', () => this.close());
  }

  open(triggerEl = null) {
    this._triggerEl = triggerEl || document.activeElement;
    this.isOpen = true;
    this.overlay.classList.add('active');
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-modal', 'true');
    document.addEventListener('keydown', this._onKeyDown);
    requestAnimationFrame(() => this._trapFocus());
  }

  close() {
    this.isOpen = false;
    this.overlay.classList.remove('active');
    this.modal.classList.remove('active');
    this.modal.removeAttribute('aria-modal');
    document.removeEventListener('keydown', this._onKeyDown);
    if (this._triggerEl) {
      this._triggerEl.focus();
      this._triggerEl = null;
    }
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      this._trapFocus(e);
    }
  }

  _trapFocus(e = null) {
    const focusable = $$(FOCUSABLE, this.modal).filter(el => el.offsetParent !== null);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!e) {
      first.focus();
      return;
    }

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
