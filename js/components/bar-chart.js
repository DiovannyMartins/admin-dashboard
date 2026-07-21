import { createElement, sanitize } from '../utils/dom.js';

export class BarChart {
  constructor(container, options = {}) {
    this.container = container;
    this.legendLabels = options.legendLabels || ['Vendas', 'Metas'];
    this.barClasses = options.barClasses || ['bar-green', 'bar-blue'];
  }

  render(data) {
    this.container.innerHTML = '';

    const legend = createElement('div', { className: 'chart-legend' });
    this.legendLabels.forEach((label, i) => {
      const item = createElement('div', { className: 'chart-legend-item' }, [
        createElement('span', { className: `chart-legend-color ${this.barClasses[i]}` }),
        createElement('span', {}, [label])
      ]);
      legend.appendChild(item);
    });
    this.container.appendChild(legend);

    const chartArea = createElement('div', { className: 'chart-area' });

    data.forEach((item, idx) => {
      const group = createElement('div', { className: 'bar-group' });
      const wrapper = createElement('div', { className: 'bars-wrapper' });

      const values = Object.values(item).filter(v => typeof v === 'number');
      values.forEach((val, i) => {
        const bar = createElement('div', { className: `bar ${this.barClasses[i]}` });
        bar.style.height = '0%';
        wrapper.appendChild(bar);
        requestAnimationFrame(() => {
          setTimeout(() => {
            bar.style.height = `${val}%`;
          }, idx * 80);
        });
      });

      const label = createElement('span', { className: 'label' }, [item.dia || item.label || '']);
      group.appendChild(wrapper);
      group.appendChild(label);
      chartArea.appendChild(group);
    });

    this.container.appendChild(chartArea);
  }
}
