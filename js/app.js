import { $ } from './utils/dom.js';
import { Sidebar } from './modules/sidebar.js';
import { UserTable } from './modules/user-table.js';
import { Notifications } from './modules/notifications.js';
import { Dashboard } from './modules/dashboard.js';
import { BarChart } from './components/bar-chart.js';

class App {
  constructor() {
    this.sidebar = new Sidebar();
    this.dashboard = new Dashboard();
    this.userTable = new UserTable();
    this.notifications = new Notifications();
    this._initChart();
  }

  _initChart() {
    const chartData = [
      { dia: 'Seg', vendas: 40, metas: 60 },
      { dia: 'Ter', vendas: 65, metas: 35 },
      { dia: 'Qua', vendas: 70, metas: 80 },
      { dia: 'Qui', vendas: 45, metas: 50 },
      { dia: 'Sex', vendas: 85, metas: 90 },
    ];

    const chart = new BarChart($('#grafico'), {
      legendLabels: ['Vendas', 'Metas'],
      barClasses: ['bar-green', 'bar-blue']
    });
    chart.render(chartData);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
