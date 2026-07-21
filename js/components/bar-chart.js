/**
 * BarChart - Componente de gráfico de barras animado
 * Renderiza gráfico de barras com animação de entrada
 * 
 * Exemplo de uso:
 * const chart = new BarChart(container, {
 *   legendLabels: ['Vendas', 'Metas'],
 *   barClasses: ['bar-green', 'bar-blue']
 * });
 * chart.render([
 *   { dia: 'Seg', vendas: 40, metas: 60 },
 *   { dia: 'Ter', vendas: 65, metas: 35 }
 * ]);
 */
import { createElement, sanitize } from '../utils/dom.js';

export class BarChart {
  /**
   * @param {Element} container - Elemento onde renderizar o gráfico
   * @param {Object} options - Opções de configuração
   * @param {string[]} options.legendLabels - Labels da legenda (padrão: ['Vendas', 'Metas'])
   * @param {string[]} options.barClasses - Classes CSS das barras (padrão: ['bar-green', 'bar-blue'])
   */
  constructor(container, options = {}) {
    this.container = container;
    this.legendLabels = options.legendLabels || ['Vendas', 'Metas'];
    this.barClasses = options.barClasses || ['bar-green', 'bar-blue'];
  }

  /**
   * Renderiza o gráfico com os dados fornecidos
   * @param {Object[]} data - Array de objetos com { dia, valor1, valor2, ... }
   */
  render(data) {
    this.container.innerHTML = '';

    // Cria legenda
    const legend = createElement('div', { className: 'chart-legend' });
    this.legendLabels.forEach((label, i) => {
      const item = createElement('div', { className: 'chart-legend-item' }, [
        createElement('span', { className: `chart-legend-color ${this.barClasses[i]}` }),
        createElement('span', {}, [label])
      ]);
      legend.appendChild(item);
    });
    this.container.appendChild(legend);

    // Cria área do gráfico
    const chartArea = createElement('div', { className: 'chart-area' });

    // Renderiza cada grupo de barras (um por dia/período)
    data.forEach((item, idx) => {
      const group = createElement('div', { className: 'bar-group' });
      const wrapper = createElement('div', { className: 'bars-wrapper' });

      // Pega apenas valores numéricos do objeto (ex: vendas: 40, metas: 60)
      const values = Object.values(item).filter(v => typeof v === 'number');
      values.forEach((val, i) => {
        const bar = createElement('div', { className: `bar ${this.barClasses[i]}` });
        // Começa com altura 0 para animar
        bar.style.height = '0%';
        wrapper.appendChild(bar);
        // Anima com delay escalonado (cada grupo aparece após o anterior)
        requestAnimationFrame(() => {
          setTimeout(() => {
            bar.style.height = `${val}%`;
          }, idx * 80); // 80ms de delay entre grupos
        });
      });

      // Label do grupo (dia da semana, mês, etc.)
      const label = createElement('span', { className: 'label' }, [item.dia || item.label || '']);
      group.appendChild(wrapper);
      group.appendChild(label);
      chartArea.appendChild(group);
    });

    this.container.appendChild(chartArea);
  }
}
