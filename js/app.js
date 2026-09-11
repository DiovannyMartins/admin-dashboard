/**
 * App - Entry Point da Aplicação
 * Inicializa todos os módulos e componentes do dashboard
 */

import { $ } from "./utils/dom.js";
import { Sidebar } from "./modules/sidebar.js";
import { UserTable } from "./modules/user-table.js";
import { Notifications } from "./modules/notifications.js";
import { Dashboard } from "./modules/dashboard.js";
import { ThemeManager } from "./modules/theme.js";
import { KeyboardShortcuts } from "./modules/keyboard.js";
import { UserProfile } from "./modules/profile.js";
import { BarChart } from "./components/bar-chart.js";
import { showToast } from "./components/toast.js";
import { Icon } from "./utils/icons.js";
import { apiService } from "./services/api.service.js";

/** Dados estáticos do gráfico (fallback se API e seed local falharem). */
const CHART_FALLBACK = [
  { dia: "Seg", vendas: 40, metas: 60 },
  { dia: "Ter", vendas: 65, metas: 35 },
  { dia: "Qua", vendas: 70, metas: 80 },
  { dia: "Qui", vendas: 45, metas: 50 },
  { dia: "Sex", vendas: 85, metas: 90 },
];

class App {
  constructor() {
    // Sonda a API em paralelo (define modo online/offline do ApiService)
    apiService.init();

    // Inicializa módulos principais
    this.theme = new ThemeManager();
    this.sidebar = new Sidebar();
    this.dashboard = new Dashboard();
    this.userTable = new UserTable();
    this.notifications = new Notifications();
    this.profile = new UserProfile();

    // Renderiza ícones globais do HTML (stat-cards, search, botões, etc.)
    // Cada módulo já renderiza seus próprios ícones internamente
    Icon.renderAll();

    // Inicializa gráfico (Desempenho Semanal via API com fallback)
    this._initChart();

    // Botão de reset demo (portfólio)
    this._initResetDemo();

    // Inicializa atalhos de teclado
    this._initKeyboardShortcuts();
  }

  /**
   * Inicializa gráfico de barras (vendas vs metas Seg–Sex, normalizado em %)
   * @private
   */
  async _initChart() {
    let chartData = CHART_FALLBACK;
    try {
      const weekly = await apiService.getWeekly();
      if (Array.isArray(weekly) && weekly.length > 0) {
        const max = Math.max(1, ...weekly.flatMap((d) => [d.vendas, d.meta]));
        chartData = weekly.map((d) => ({
          dia: d.dia,
          vendas: Math.round((d.vendas / max) * 100),
          metas: Math.round((d.meta / max) * 100),
        }));
      }
    } catch {
      // Mantém fallback estático
    }

    const chart = new BarChart($("#grafico"), {
      legendLabels: ["Vendas", "Metas"],
      barClasses: ["bar-green", "bar-blue"],
    });
    chart.render(chartData);
  }

  /**
   * Botão "Reset demo": restaura o seed rico (API ou seed local offline)
   * @private
   */
  _initResetDemo() {
    const btn = $("#btnResetDemo");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      try {
        await apiService.resetDemo();
        showToast("Demo restaurado com o seed original!", "success");
        window.location.reload();
      } catch (err) {
        showToast(err?.message ?? "Erro ao restaurar demo", "error");
      }
    });
  }

  /**
   * Inicializa atalhos de teclado
   * @private
   */
  _initKeyboardShortcuts() {
    this.keyboard = new KeyboardShortcuts({
      onSearch: () => {
        const searchInput = $("#inputBuscaUsuario");
        if (searchInput) searchInput.focus();
      },
      onNewUser: () => {
        const btn = $("#btnAdicionarUsuario");
        if (btn) btn.click();
      },
      onExport: () => {
        const btn = $("#btnExportarCsv");
        if (btn) btn.click();
      },
      onThemeToggle: () => {
        this.theme.toggle();
      },
    });
  }
}

// Inicializa aplicação quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
