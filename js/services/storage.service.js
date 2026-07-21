export const StorageService = {
  get(key, fallback = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      console.warn(`StorageService: erro ao ler "${key}"`);
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      console.warn(`StorageService: erro ao salvar "${key}"`);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`StorageService: erro ao remover "${key}"`);
    }
  }
};
