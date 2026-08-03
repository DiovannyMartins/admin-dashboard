import { $, $$, formatCurrency, formatNumber } from '../utils/dom.js';

const STATS_DATA = [
  { id: 'totalUsers', label: 'Usuários Totais', value: 1245, format: 'number' },
  { id: 'activeProjects', label: 'Projetos Ativos', value: 85, format: 'number' },
  { id: 'monthSales', label: 'Vendas do Mês', value: 15400, format: 'currency' },
  { id: 'monthlyRevenue', label: 'Receita Mensal', value: 12800, format: 'currency' },
];

export class Dashboard {
  constructor() {
    this.cards = $$('.stat-card');
    this._render();
  }

  _render() {
    this.cards.forEach((card, i) => {
      const data = STATS_DATA[i];
      if (!data) return;

      const valueEl = $('.stat-value', card);
      if (valueEl) {
        valueEl.textContent = data.format === 'currency'
          ? formatCurrency(data.value)
          : formatNumber(data.value);
      }
    });
  }
}
