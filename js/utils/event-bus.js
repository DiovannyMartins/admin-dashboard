/**
 * EventBus - Sistema de comunicação pub/sub (publish/subscribe)
 * Permite que módulos se comuniquem sem acoplamento direto
 * 
 * Exemplo de uso:
 * eventBus.on('user:created', (data) => console.log(data));
 * eventBus.emit('user:created', { name: 'João' });
 */
class EventBus {
  constructor() {
    // Armazena listeners por evento: { 'user:created': [fn1, fn2] }
    this.listeners = {};
  }

  /**
   * Registra listener para um evento
   * @param {string} event - Nome do evento (ex: 'user:created')
   * @param {Function} callback - Função a executar quando evento disparar
   * @returns {Function} - Função para remover listener (unsubscribe)
   */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    // Retorna função para facilitar unsubscribe
    return () => this.off(event, callback);
  }

  /**
   * Remove listener de um evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função a remover
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Dispara evento, executando todos os listeners registrados
   * @param {string} event - Nome do evento
   * @param {any} data - Dados a passar para os listeners
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

// Instância singleton (compartilhada em toda a aplicação)
export const eventBus = new EventBus();
