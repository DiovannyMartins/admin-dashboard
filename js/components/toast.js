import { createElement } from '../utils/dom.js';

let toastContainer = null;

function getContainer() {
  if (!toastContainer) {
    toastContainer = createElement('div', {
      className: 'toast-container',
      'aria-live': 'polite',
      'aria-atomic': 'true'
    });
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'success', duration = 3000) {
  const container = getContainer();

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = createElement('div', {
    className: `toast toast-${type}`,
    role: 'status'
  }, [
    createElement('span', { className: 'toast-icon' }, [iconMap[type] || '']),
    createElement('span', { className: 'toast-message' }, [message]),
    createElement('button', {
      className: 'toast-close',
      'aria-label': 'Fechar notificação',
      onClick: () => dismiss(toast)
    }, ['✕'])
  ]);

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  const timer = setTimeout(() => dismiss(toast), duration);

  function dismiss(el) {
    clearTimeout(timer);
    el.classList.remove('toast-visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }
}
