# Admin Dashboard

Dashboard administrativo para gerenciamento de usuarios, estatisticas e notificacoes, construido inteiramente com HTML, CSS e JavaScript vanilla.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Destaques

- **100% vanilla** -- zero dependencias, zero build step, zero bundler
- **Mobile first** -- layout responsivo com breakpoints para tablet e desktop
- **Acessivel** -- WCAG 2.1 AA, focus trap, ARIA roles/states, navegacao por teclado
- **SEO-ready** -- meta tags semanticas, favicon SVG inline, lang attribute
- **Dark/Light mode** -- alternancia com persistencia em `localStorage` e deteccao de preferencia do sistema

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

Este e um projeto de estudo focado em praticar arquitetura frontend sem frameworks. As decisoes tecnicas principais:

- **Arquitetura CSS em camadas** para organizar estilos por especificidade: `base` > `layout` > `components` > `pages` > `responsive` > `themes` > `utils`
- **ES Modules nativos** (`type="module"`) para separacao de responsabilidades sem bundler
- **EventBus (pub/sub)** para comunicacao entre modulos sem acoplamento direto
- **CSS Variables** para design tokens, facilitando a troca de temas e manutencao da paleta
- **Debounce de 250ms** na busca para evitar re-renders excessivos
- **Focus trap** em modais seguindo a tecnica de redirecionamento de Tab/Shift+Tab
- **`prefers-reduced-motion`** respeitado em todas as animacoes CSS

---

## Funcionalidades

### Interface e UX
- Design responsivo (desktop, tablet, mobile)
- Dark/Light mode com persistencia via `localStorage`
- Animacoes suaves com `prefers-reduced-motion`
- Grafico de barras animado com CSS transitions

### Gerenciamento de Usuarios
- CRUD completo (criar, visualizar, editar, excluir)
- Busca em tempo real com debounce de 250ms
- Filtros por status (Ativo/Inativo) e plano (Basico/Premium)
- Ordenacao por colunas (nome, status, plano -- asc/desc)
- Paginacao inteligente com 5 itens por pagina e elipses
- Export CSV com BOM UTF-8
- Undo em exclusoes com toast (5 segundos)
- Validacao de formulario com feedback visual em tempo real

### Notificacoes e Perfil
- Dropdown de notificacoes com marcar como lida e limpar todas
- Badge de notificacoes nao lidas em tempo real (`aria-live="polite"`)
- Menu de perfil com dropdown

### Acessibilidade
- Skip link para navegacao por teclado
- Focus trap em modais (Tab/Shift+Tab)
- ARIA labels em todos os elementos interativos
- ARIA roles: `dialog`, `menu`, `status`
- ARIA states: `aria-expanded`, `aria-current`, `aria-live`
- Navegacao completa por teclado (Tab, Escape, Enter)
- Contraste AA em todos os textos

### Atalhos de Teclado

| Atalho | Acao |
|--------|------|
| `Ctrl + K` | Focar campo de busca |
| `Ctrl + N` | Abrir modal de novo usuario |
| `Ctrl + E` | Exportar tabela para CSV |
| `Ctrl + T` | Alternar tema escuro/claro |
| `Escape` | Fechar modal ou dropdown |

---

## Como rodar

O projeto usa ES Modules (`type="module"`), entao precisa de um servidor HTTP. Zero dependencias para instalar.

### 1. Clone o repositorio
```bash
git clone https://github.com/DiovannyMartins/admin-dashboard.git
```

### 2. Entre na pasta do projeto
```bash
cd admin-dashboard
```

### 3. Inicie um servidor local

**Opcao A: VS Code + Live Server** (recomendado)
- Clique com botao direito no `index.html` > "Open with Live Server"

**Opcao B: Python**
```bash
python -m http.server 8000
```
Acesse: http://localhost:8000

**Opcao C: Node.js**
```bash
npx serve
```
Acesse: http://localhost:3000

**Opcao D: PowerShell (Windows)**
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
│   │   │   └── variables.css        # Design tokens (cores, espacamentos, tipografia)
│   │   ├── components/
│   │   │   ├── buttons.css          # Primary, secondary, action variants
│   │   │   ├── cards.css            # Stat cards com icones coloridos
│   │   │   ├── chart.css            # Grafico de barras com CSS transitions
│   │   │   ├── extras.css           # Utilitarios e estilos auxiliares
│   │   │   ├── modal.css            # Backdrop blur, scale animation
│   │   │   ├── notifications.css    # Dropdown com badge de contagem
│   │   │   ├── pagination.css       # Botoes com estado ativo/disabled
│   │   │   ├── table.css            # Tabela com hover, badges, ordenacao
│   │   │   └── toast.css            # Slide-in notifications com auto-dismiss
│   │   ├── layout/
│   │   │   ├── grid.css             # CSS Grid principal (sidebar + content)
│   │   │   ├── sidebar.css          # Menu lateral com overlay mobile
│   │   │   └── topbar.css           # Header com busca, notificacoes, perfil
│   │   ├── pages/
│   │   │   └── dashboard.css        # Estilos especificos da pagina dashboard
│   │   ├── responsive/
│   │   │   ├── mobile.css           # Breakpoint < 768px
│   │   │   └── tablet.css           # Breakpoint 768px - 1024px
│   │   ├── themes/
│   │   │   └── dark.css             # Overrides para tema escuro
│   │   └── utils/
│   │       └── skip-link.css        # Skip link acessivel
│   └── style.css                    # Ponto de entrada (importa todos os modulos)
├── js/
│   ├── components/
│   │   ├── bar-chart.js             # Grafico de barras animado
│   │   ├── dropdown.js              # Dropdown generico com keyboard support
│   │   ├── modal.js                 # Focus trap, WAI-ARIA, animacao
│   │   ├── pagination.js            # Paginacao com elipses e ARIA
│   │   └── toast.js                 # Notificacoes temporarias (4 variantes)
│   ├── modules/
│   │   ├── dashboard.js             # Inicializacao do dashboard
│   │   ├── keyboard.js              # Sistema de atalhos globais
│   │   ├── notifications.js         # Gerenciamento de notificacoes
│   │   ├── profile.js               # Menu dropdown de perfil
│   │   ├── sidebar.js               # Toggle sidebar mobile/desktop
│   │   ├── theme.js                 # Gerenciamento de temas
│   │   └── user-table.js            # CRUD, busca, filtros, paginacao, export
│   ├── services/
│   │   └── storage.service.js       # Abstracao para localStorage
│   ├── utils/
│   │   ├── dom.js                   # Helpers de manipulacao DOM
│   │   ├── event-bus.js             # Pub/sub para comunicacao entre modulos
│   │   └── icons.js                 # Biblioteca de 20+ icones SVG
│   └── app.js                       # Ponto de entrada (inicializa todos os modulos)
├── build-css.js                     # Script Node para concatenar CSS
├── build-css.ps1                    # Script PowerShell para concatenar CSS
├── index.html                       # Pagina principal
└── README.md
```

---

## O que aprendi

- **Arquitetura CSS escalavel** com ITCSS -- separar estilos por camada de especificidade facilita manutencao em projetos grandes
- **JavaScript modular sem bundler** -- ES Modules nativos funcionam bem quando a estrutura e bem planejada
- **Comunicacao desacoplada** -- EventBus (pub/sub) evita dependencias circulares entre modulos
- **Acessibilidade na pratica** -- focus trap, ARIA live regions, skip links e navegacao por teclado sao essenciais, nao opcionais
- **Design tokens** -- CSS Variables centralizam a paleta e espacamentos, facilitando a troca de temas
- **Performance percebida** -- debounce na busca e CSS transitions criam sensacao de fluidez sem custo de JavaScript pesado
- **Mobile first** -- comecar pelo mobile obriga a priorizar conteudo e resulta em layout mais limpo no desktop tambem

---

## Testes

Este projeto nao possui suite de testes automatizados. A validacao e feita manualmente:

- **Funcional**: CRUD completo de usuarios, filtros, paginacao, export CSV, undo
- **Acessibilidade**: Navegacao completa por teclado (Tab, Shift+Tab, Escape, Enter), validacao com screen reader (NVDA/VoiceOver), contraste verificado com WebAIM Contrast Checker
- **Responsivo**: Testado em Chrome DevTools (320px, 768px, 1024px, 1440px) e dispositivos reais
- **Temas**: Alternancia dark/light com persistencia apos reload, deteccao de preferencia do sistema via `prefers-color-scheme`
- **Performance**: Lighthouse score > 90 em Performance, Accessibility, Best Practices

---

## Roadmap

- [ ] Migrar dados para backend real (API REST ou Firebase)
- [ ] Adicionar testes unitarios com Jest ou Vitest
- [ ] Implementar E2E tests com Playwright
- [ ] Adicionar animacoes de entrada com View Transitions API
- [ ] Suporte a PWA (Service Worker, manifest.json)
- [ ] Internacionalizacao (i18n) com suporte a ingles/portugues
- [ ] Graficos mais complexos com Chart.js ou D3.js
- [ ] Sistema de autenticacao (login, registro, recuperacao de senha)

---

## Autor

- **GitHub:** [@DiovannyMartins](https://github.com/DiovannyMartins)
- **LinkedIn:** [Diovanny Martins](https://linkedin.com/in/diovanny-martins)
- **E-mail:** diovannydev@gmail.com

---

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  <p><strong>Admin Dashboard</strong></p>
  <p>2026 Diovanny.dev</p>
</div>
