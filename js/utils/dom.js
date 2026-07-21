/**
 * Utilitários DOM e helpers gerais
 * Fornece funções reutilizáveis para manipulação do DOM, sanitização, debounce, etc.
 */

/**
 * Atalho para querySelector
 * @param {string} selector - Seletor CSS
 * @param {Element} context - Elemento pai (padrão: document)
 * @returns {Element|null}
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Atalho para querySelectorAll (retorna array)
 * @param {string} selector - Seletor CSS
 * @param {Element} context - Elemento pai (padrão: document)
 * @returns {Element[]}
 */
export function $$(selector, context = document) {
  return [...context.querySelectorAll(selector)];
}

/**
 * Cria elemento DOM de forma declarativa
 * @param {string} tag - Tag HTML (div, button, span, etc.)
 * @param {Object} attrs - Atributos (className, dataset, onClick, html, etc.)
 * @param {Array} children - Filhos (strings ou elementos)
 * @returns {Element}
 * 
 * Exemplo:
 * createElement('button', { className: 'btn', onClick: () => alert('oi') }, ['Clique'])
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      // Converte onClick -> click, onMouseover -> mouseover, etc.
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'html') el.innerHTML = value;
    else el.setAttribute(key, value);
  }
  children.forEach(child => {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  });
  return el;
}

/**
 * Sanitiza string para prevenir XSS
 * Converte caracteres especiais em entidades HTML
 * @param {string} str - String a ser sanitizada
 * @returns {string} - String segura para usar em innerHTML
 */
export function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str; // Define como texto puro
  return div.innerHTML; // Retorna com entidades HTML escapadas
}

/**
 * Debounce: executa função apenas após período de inatividade
 * Útil para eventos de input/scroll que disparam muitas vezes
 * @param {Function} fn - Função a executar
 * @param {number} delay - Delay em ms (padrão: 300)
 * @returns {Function} - Função debounced
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Gera ID único baseado em timestamp + random
 * @returns {string} - ID único (ex: "lq2x9k3m4n5o6p")
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Formata número como moeda BRL
 * @param {number} value - Valor a formatar
 * @returns {string} - Ex: "R$ 1.234,56"
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/**
 * Formata número com separadores de milhar (pt-BR)
 * @param {number} value - Valor a formatar
 * @returns {string} - Ex: "1.234"
 */
export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value);
}
