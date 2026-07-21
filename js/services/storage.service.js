/**
 * StorageService - Wrapper seguro para localStorage
 * Trata erros (modo privado, quota cheia) e faz parse/stringify automaticamente
 * 
 * Exemplo de uso:
 * StorageService.set('usuarios', [{ nome: 'João' }]);
 * const usuarios = StorageService.get('usuarios', []);
 */
export const StorageService = {
  /**
   * Recupera valor do localStorage
   * @param {string} key - Chave de armazenamento
   * @param {any} fallback - Valor padrão se não existir ou erro (padrão: null)
   * @returns {any} - Valor parseado ou fallback
   */
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      // Pode falhar em modo privado ou com dados corrompidos
      console.warn(`StorageService: erro ao ler "${key}"`);
      return fallback;
    }
  },

  /**
   * Salva valor no localStorage
   * @param {string} key - Chave de armazenamento
   * @param {any} value - Valor a salvar (será convertido para JSON)
   * @returns {boolean} - true se salvou com sucesso, false se erro
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      // Pode falhar se quota estiver cheia ou em modo privado
      console.warn(`StorageService: erro ao salvar "${key}"`);
      return false;
    }
  },

  /**
   * Remove item do localStorage
   * @param {string} key - Chave a remover
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`StorageService: erro ao remover "${key}"`);
    }
  }
};
