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
import { BarChart } from "./components/bar-chart.js";
import { Icon } from "./utils/icons.js";

class App {
  constructor() {
    // Inicializa módulos principais
    this.theme = new ThemeManager();
    this.sidebar = new Sidebar();
    this.dashboard = new Dashboard();
    this.userTable = new UserTable();
    this.notifications = new Notifications();

    // Inicializa gráfico
    this._initChart();

    // Inicializa atalhos de teclado
    this._initKeyboardShortcuts();

    // Adiciona skip link dinamicamente
    this._addSkipLink();
  }

  /**
   * Inicializa gráfico de barras
   * @private
   */
  _initChart() {
    const chartData = [
      { dia: "Seg", vendas: 40, metas: 60 },
      { dia: "Ter", vendas: 65, metas: 35 },
      { dia: "Qua", vendas: 70, metas: 80 },
      { dia: "Qui", vendas: 45, metas: 50 },
      { dia: "Sex", vendas: 85, metas: 90 },
    ];

    const chart = new BarChart($("#grafico"), {
      legendLabels: ["Vendas", "Metas"],
      barClasses: ["bar-green", "bar-blue"],
    });
    chart.render(chartData);
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

  /**
   * Adiciona skip link para acessibilidade
   * @private
   */
  _addSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Pular para conteúdo principal";
    document.body.insertBefore(skipLink, document.body.firstChild);
  }
}

// Inicializa aplicação quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
