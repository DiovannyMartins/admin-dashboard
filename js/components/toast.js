/**
 * Toast - Sistema de notificações temporárias
 * Cria toasts animados que aparecem no canto superior direito
 * 
 * Exemplo de uso:
 * showToast('Usuário criado com sucesso!', 'success');
 * showToast('Erro ao salvar', 'error');
 * showToast('Campo obrigatório', 'warning');
 */
import { createElement } from '../utils/dom.js';

let toastContainer = null;

/**
 * Cria/retorna container dos toasts (singleton)
 * @private
 */
function getContainer() {
  if (!toastContainer) {
    toastContainer = createElement('div', {
      className: 'toast-container',
      'aria-live': 'polite', // Screen readers anunciam mudanças
      'aria-atomic': 'true'
    });
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Exibe notificação toast
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info' (padrão: 'success')
 * @param {number} duration - Duração em ms (padrão: 3000)
 */
export function showToast(message, type = 'success', duration = 3000) {
  const container = getContainer();

  // Ícones para cada tipo de toast
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  // Cria estrutura do toast
  const toast = createElement('div', {
    className: `toast toast-${type}`,
    role: 'status' // Screen readers anunciam como status
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

  // Anima entrada (adiciona classe após render)
  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  // Remove automaticamente após duração
  const timer = setTimeout(() => dismiss(toast), duration);

  /**
   * Remove toast com animação de saída
   * @param {Element} el - Elemento do toast
   */
  function dismiss(el) {
    clearTimeout(timer);
    el.classList.remove('toast-visible');
    // Remove do DOM após transição
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }
}
