/**
 * Dropdown - Componente de menu suspenso
 * Gerencia abertura/fechamento com clique e teclado
 */

export class Dropdown {
  constructor(triggerEl, dropdownEl) {
    this.trigger = triggerEl;
    this.dropdown = dropdownEl;
    this.isOpen = false;

    this._onClickOutside = (e) => {
      if (this.isOpen && !this.dropdown.contains(e.target)) {
        this.close();
      }
    };

    this._onEscape = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.trigger.focus();
      }
    };

    // Toggle ao clicar no trigger
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Previne fechamento ao clicar dentro do dropdown
    this.dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * Alterna estado do dropdown
   */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  /**
   * Abre o dropdown
   */
  open() {
    this.isOpen = true;
    this.dropdown.classList.add('active');
    this.trigger.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', this._onClickOutside);
    document.addEventListener('keydown', this._onEscape);
  }

  /**
   * Fecha o dropdown
   */
  close() {
    this.isOpen = false;
    this.dropdown.classList.remove('active');
    this.trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this._onClickOutside);
    document.removeEventListener('keydown', this._onEscape);
  }
}
