# Admin Dashboard

Dashboard administrativo para gerenciamento de usuários, estatísticas e notificações, construído inteiramente com HTML, CSS e JavaScript vanilla.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Destaques

- **100% vanilla** -- zero dependências, zero build step, zero bundler
- **Mobile first** -- layout responsivo com breakpoints para tablet e desktop
- **Acessível** -- WCAG 2.1 AA, focus trap, ARIA roles/states, navegação por teclado
- **SEO-ready** -- meta tags semânticas, favicon SVG inline, lang attribute
- **Dark/Light mode** -- alternância com persistência em `localStorage` e detecção de preferência do sistema

---

## Demo

[![Preview do Admin Dashboard](https://github.com/user-attachments/assets/12995740-aa1b-47dd-a5fe-32ea71856f92)](https://diovannymartins.github.io/admin-dashboard/)

**[Acesse a demo ao vivo](https://diovannymartins.github.io/admin-dashboard/)**

---

## Tecnologias

| Tecnologia | Utilização |
|------------|------------|
| **HTML5** | Estrutura semântica |
| **CSS3** | Layout, temas e responsividade |
| **JavaScript** | Lógica, CRUD e interação |
| **SVG** | Ícones escaláveis |
| **GitHub Pages** | Deploy |

---

## Sobre o projeto

Este é um projeto de estudo focado em praticar arquitetura frontend sem frameworks. As decisões técnicas principais:

- **Arquitetura CSS em camadas** para organizar estilos por especificidade: `base` > `layout` > `components` > `pages` > `responsive` > `themes` > `utils`
- **ES Modules nativos** (`type="module"`) para separação de responsabilidades sem bundler
- **EventBus (pub/sub)** para comunicação entre módulos sem acoplamento direto
- **CSS Variables** para design tokens, facilitando a troca de temas e manutenção da paleta
- **Debounce de 250ms** na busca para evitar re-renders excessivos
- **Focus trap** em modais seguindo a técnica de redirecionamento de Tab/Shift+Tab
- **`prefers-reduced-motion`** respeitado em todas as animações CSS

---

## Funcionalidades

### Interface e UX
- Design responsivo (desktop, tablet, mobile)
- Dark/Light mode com persistência via `localStorage`
- Animações suaves com `prefers-reduced-motion`
- Gráfico de barras animado com CSS transitions

### Gerenciamento de Usuários
- CRUD completo (criar, visualizar, editar, excluir)
- Busca em tempo real com debounce de 250ms
- Filtros por status (Ativo/Inativo) e plano (Básico/Premium)
- Ordenação por colunas (nome, status, plano -- asc/desc)
- Paginação inteligente com 5 itens por página e elipses
- Export CSV com BOM UTF-8
- Undo em exclusões com toast (5 segundos)
- Validação de formulário com feedback visual em tempo real

### Notificações e Perfil
- Dropdown de notificações com marcar como lida e limpar todas
- Badge de notificações não lidas em tempo real (`aria-live="polite"`)
- Menu de perfil com dropdown

### Acessibilidade
- Skip link para navegação por teclado
- Focus trap em modais (Tab/Shift+Tab)
- ARIA labels em todos os elementos interativos
- ARIA roles: `dialog`, `menu`, `status`
- ARIA states: `aria-expanded`, `aria-current`, `aria-live`
- Navegação completa por teclado (Tab, Escape, Enter)
- Contraste AA em todos os textos

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Focar campo de busca |
| `Ctrl + N` | Abrir modal de novo usuário |
| `Ctrl + E` | Exportar tabela para CSV |
| `Ctrl + T` | Alternar tema escuro/claro |
| `Escape` | Fechar modal ou dropdown |

---

## Como rodar

O projeto usa ES Modules (`type="module"`), então precisa de um servidor HTTP. Zero dependências para instalar.

### 1. Clone o repositório
```bash
git clone https://github.com/DiovannyMartins/admin-dashboard.git
```

### 2. Entre na pasta do projeto
```bash
cd admin-dashboard
```

### 3. Inicie um servidor local

**Opção A: VS Code + Live Server** (recomendado)
- Clique com botão direito no `index.html` > "Open with Live Server"

**Opção B: Python**
```bash
python -m http.server 8000
```
Acesse: http://localhost:8000

**Opção C: Node.js**
```bash
npx serve
```
Acesse: http://localhost:3000

**Opção D: PowerShell (Windows)**
```powershell
./build-css.ps1
```

---

## Estrutura de pastas

```
admin-dashboard/
├── css/
│   ├── modules/
│   │   ├── base/
│   │   │   ├── accessibility.css    # sr-only, skip-link, focus-visible
│   │   │   ├── reset.css            # Box-sizing, margin/padding reset
│   │   │   └── variables.css        # Design tokens (cores, espaçamentos, tipografia)
│   │   ├── components/
│   │   │   ├── buttons.css          # Primary, secondary, action variants
│   │   │   ├── cards.css            # Stat cards com ícones coloridos
│   │   │   ├── chart.css            # Gráfico de barras com CSS transitions
│   │   │   ├── extras.css           # Utilitários e estilos auxiliares
│   │   │   ├── modal.css            # Backdrop blur, scale animation
│   │   │   ├── notifications.css    # Dropdown com badge de contagem
│   │   │   ├── pagination.css       # Botões com estado ativo/disabled
│   │   │   ├── table.css            # Tabela com hover, badges, ordenação
│   │   │   └── toast.css            # Slide-in notifications com auto-dismiss
│   │   ├── layout/
│   │   │   ├── grid.css             # CSS Grid principal (sidebar + content)
│   │   │   ├── sidebar.css          # Menu lateral com overlay mobile
│   │   │   └── topbar.css           # Header com busca, notificações, perfil
│   │   ├── pages/
│   │   │   └── dashboard.css        # Estilos específicos da página dashboard
│   │   ├── responsive/
│   │   │   ├── mobile.css           # Breakpoint < 768px
│   │   │   └── tablet.css           # Breakpoint 768px - 1024px
│   │   ├── themes/
│   │   │   └── dark.css             # Overrides para tema escuro
│   │   └── utils/
│   │       └── skip-link.css        # Skip link acessível
│   └── style.css                    # Ponto de entrada (importa todos os módulos)
├── js/
│   ├── components/
│   │   ├── bar-chart.js             # Gráfico de barras animado
│   │   ├── dropdown.js              # Dropdown genérico com keyboard support
│   │   ├── modal.js                 # Focus trap, WAI-ARIA, animação
│   │   ├── pagination.js            # Paginação com elipses e ARIA
│   │   └── toast.js                 # Notificações temporárias (4 variantes)
│   ├── modules/
│   │   ├── dashboard.js             # Inicialização do dashboard
│   │   ├── keyboard.js              # Sistema de atalhos globais
│   │   ├── notifications.js         # Gerenciamento de notificações
│   │   ├── profile.js               # Menu dropdown de perfil
│   │   ├── sidebar.js               # Toggle sidebar mobile/desktop
│   │   ├── theme.js                 # Gerenciamento de temas
│   │   └── user-table.js            # CRUD, busca, filtros, paginação, export
│   ├── services/
│   │   └── storage.service.js       # Abstração para localStorage
│   ├── utils/
│   │   ├── dom.js                   # Helpers de manipulação DOM
│   │   ├── event-bus.js             # Pub/sub para comunicação entre módulos
│   │   └── icons.js                 # Biblioteca de 20+ ícones SVG
│   └── app.js                       # Ponto de entrada (inicializa todos os módulos)
├── build-css.js                     # Script Node para concatenar CSS
├── build-css.ps1                    # Script PowerShell para concatenar CSS
├── index.html                       # Página principal
└── README.md
```

---

## O que aprendi

- **Arquitetura CSS escalável** com ITCSS -- separar estilos por camada de especificidade facilita manutenção em projetos grandes
- **JavaScript modular sem bundler** -- ES Modules nativos funcionam bem quando a estrutura é bem planejada
- **Comunicação desacoplada** -- EventBus (pub/sub) evita dependências circulares entre módulos
- **Acessibilidade na prática** -- focus trap, ARIA live regions, skip links e navegação por teclado são essenciais, não opcionais
- **Design tokens** -- CSS Variables centralizam a paleta e espaçamentos, facilitando a troca de temas
- **Performance percebida** -- debounce na busca e CSS transitions criam sensação de fluidez sem custo de JavaScript pesado
- **Mobile first** -- começar pelo mobile obriga a priorizar conteúdo e resulta em layout mais limpo no desktop também

---

## Testes

Este projeto não possui suite de testes automatizados. A validação é feita manualmente:

- **Funcional**: CRUD completo de usuários, filtros, paginação, export CSV, undo
- **Acessibilidade**: Navegação completa por teclado (Tab, Shift+Tab, Escape, Enter), validação com screen reader (NVDA/VoiceOver), contraste verificado com WebAIM Contrast Checker
- **Responsivo**: Testado em Chrome DevTools (320px, 768px, 1024px, 1440px) e dispositivos reais
- **Temas**: Alternância dark/light com persistência após reload, detecção de preferência do sistema via `prefers-color-scheme`
- **Performance**: Lighthouse score > 90 em Performance, Accessibility, Best Practices

---

## Roadmap

- [ ] Migrar dados para backend real (API REST ou Firebase)
- [ ] Adicionar testes unitários com Jest ou Vitest
- [ ] Implementar E2E tests com Playwright
- [ ] Adicionar animações de entrada com View Transitions API
- [ ] Suporte a PWA (Service Worker, manifest.json)
- [ ] Internacionalização (i18n) com suporte a inglês/português
- [ ] Gráficos mais complexos com Chart.js ou D3.js
- [ ] Sistema de autenticação (login, registro, recuperação de senha)

---

## Autor

- **GitHub:** [@DiovannyMartins](https://github.com/DiovannyMartins)
- **LinkedIn:** [Diovanny Martins](https://linkedin.com/in/diovanny-martins)
- **E-mail:** diovannydev@gmail.com

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  <p><strong>Admin Dashboard</strong></p>
  <p>2026 Diovanny.dev</p>
</div>
