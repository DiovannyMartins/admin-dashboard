/**
 * Dashboard — Stats calculados a partir de dados reais (issue #8).
 *
 * Carrega da API (`GET /api/stats`) com fallback offline para o seed local.
 * O fallback estático abaixo só aparece se até o seed local falhar.
 */
import { $, $$, formatCurrency, formatNumber } from '../utils/dom.js';
import { eventBus } from '../utils/event-bus.js';
import { apiService } from '../services/api.service.js';
const STATS_FALLBACK = [
  { id: 'totalUsers', label: 'Usuários Totais', value: 1245, format: 'number' },
  { id: 'activeProjects', label: 'Projetos Ativos', value: 85, format: 'number' },
  { id: 'monthSales', label: 'Vendas do Mês', value: 15400, format: 'currency' },
  { id: 'monthlyRevenue', label: 'Receita Mensal', value: 12800, format: 'currency' },
];

export class Dashboard {
  constructor() {
    this.cards = $$('.stat-card');
    this.ready = this._load();
    // Stats derivam dos dados: recarrega quando Usuários mudam
    eventBus.on('users:changed', () => this._load());
  }

  async _load() {
    let stats;
    try {
      stats = await apiService.getStats();
    } catch {
      stats = null;
    }
    this._render(stats);
  }

  _render(stats) {
    const data = stats
      ? [
          { value: stats.usuarios_totais, format: 'number' },
          { value: stats.projetos_ativos, format: 'number' },
          { value: stats.vendas_total, format: 'number' },
          { value: stats.receita_total, format: 'currency' },
        ]
      : STATS_FALLBACK;

    // Terceiro Stat passa a exibir total de vendas (contagem real da API)
    const labels = stats
      ? ['Usuários Totais', 'Projetos Ativos', 'Vendas (total)', 'Receita Mensal']
      : null;

    this.cards.forEach((card, i) => {
      const item = data[i];
      if (!item) return;

      const valueEl = $('.stat-value', card);
      if (valueEl) {
        valueEl.textContent = item.format === 'currency'
          ? formatCurrency(item.value)
          : formatNumber(item.value);
      }
      if (labels) {
        const labelEl = $('h3', card);
        if (labelEl) labelEl.textContent = labels[i];
      }
    });
  }
}
