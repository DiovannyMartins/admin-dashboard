# Admin Dashboard

Dashboard administrativo full-stack para gerenciamento de usuários, estatísticas e notificações: front em HTML, CSS e JavaScript vanilla + API REST em Node + Express + SQLite.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Destaques

- **100% vanilla** -- zero dependências, zero build step, zero bundler
- **Mobile first** -- layout responsivo com breakpoints para tablet e desktop
- **Acessível** -- WCAG 2.1 AA, focus trap, ARIA roles/states, navegação por teclado
- **SEO-ready** -- meta tags semânticas, favicon SVG inline, lang attribute
- **Dark/Light mode** -- alternância com persistência em `localStorage` e detecção de preferência do sistema

---

## Tecnologias

| Tecnologia | Utilização |
|------------|------------|
| **HTML5** | Estrutura semântica |
| **CSS3** | Layout, temas e responsividade |
| **JavaScript** | Lógica, CRUD e interação |
| **SVG** | Ícones escaláveis |
| **Node.js + Express** | API REST (`backend/`, porta 3001) |
| **SQLite** | Persistência local (`better-sqlite3`, sem ORM) |
| **GitHub Pages** | Deploy do demo estático |

---

## Arquitetura

```
Navegador (front vanilla)          Node + Express + SQLite
┌────────────────────────┐        ┌──────────────────────────────┐
│ ApiService (fetch)     │──on──▶ │ /api/users (CRUD + restore)  │
│  + fallback offline    │        │ /api/stats                   │
│  (seed local rico)     │        │ /api/performance/weekly      │
└────────────────────────┘        │ /api/notifications           │
        │ offline                 │ /api/demo/reset              │
        ▼ (GitHub Pages)          └──────────────────────────────┘
  seed local: painel 100%
  funcional sem servidor
```

- O demo no GitHub Pages é só estático: o `ApiService` tenta a API local e, se offline, opera sobre o seed local rico — o painel nunca quebra.
- Localmente, `npm run dev` sobe API + front estático no mesmo processo (http://localhost:3001).
- Sem autenticação nesta versão (ver `docs/adr/0001-node-express-sqlite-rest.md`).
- Vocabulário da API e UI: Usuário, Status de Usuário, Plano, Notificação, Stat, Desempenho Semanal (ver `CONTEXT.md`).

### Contrato REST

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Status da API + contagens do seed |
| `GET` | `/api/users?q=&status=&plano=&sort=&order=&page=&per_page=` | Lista com busca, filtros, ordenação e paginação |
| `POST` | `/api/users` | Cria Usuário (nome 2-100, email válido opcional, Status/Plano) |
| `GET` | `/api/users/:id` | Lê Usuário por id |
| `PUT` | `/api/users/:id` | Atualiza Usuário por id |
| `DELETE` | `/api/users/:id` | Exclui Usuário (undo do front restaura em 5s) |
| `POST` | `/api/users/:id/restore` | Restaura Usuário excluído com o mesmo id |
| `GET` | `/api/stats` | Stats derivados do banco (usuários, projetos ativos, vendas, receita) |
| `GET` | `/api/performance/weekly` | Vendas vs metas Seg–Sex a partir de vendas reais |
| `GET` | `/api/notifications` | Lista Notificações + contagem de não-lidas |
| `PATCH` | `/api/notifications/:id` | Marca Notificação como lida (`{ "lida": true }`) |
| `DELETE` | `/api/notifications` | Limpa todas as Notificações |
| `POST` | `/api/demo/reset` | Restaura o seed rico (botão "Reset demo") |

Respostas de erro seguem o envelope `{ "error": { "code", "message", "details?" } }` com códigos `NOT_FOUND`, `VALIDATION_ERROR` e `INTERNAL_ERROR`.

---

## Sobre o projeto

Este é um projeto de estudo focado em praticar arquitetura frontend sem frameworks. As decisões técnicas principais:

- **Arquitetura CSS em camadas** para organizar estilos por especificidade: `base` > `layout` > `components` > `pages` > `responsive` > `utils`
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

### Full-stack (front + API, recomendado)

Um comando sobe a API em http://localhost:3001 servindo o front junto, com SQLite + seed rico de demonstração.

```bash
git clone https://github.com/DiovannyMartins/admin-dashboard.git
cd admin-dashboard
npm install
npm run dev
```

Acesse: http://localhost:3001 — o painel opera 100% via API (verifique com `GET /api/health`).

```bash
npm test   # suíte de testes HTTP da API (runner nativo do Node)
```

### Só front (estático, sem servidor)

O projeto usa ES Modules (`type="module"`), então precisa de um servidor HTTP. Zero dependências para instalar. Neste modo o painel usa o seed local (mesmo comportamento do GitHub Pages).

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

---

## Estrutura de pastas

```
admin-dashboard/
├── backend/
│   ├── src/
│   │   ├── app.js                   # Fábrica do Express (API + front estático)
│   │   ├── server.js                # Entry point: npm run dev (porta 3001)
│   │   ├── db.js                    # SQLite + schema (Usuários, projetos, vendas, Notificações, metas)
│   │   ├── seed.js                  # Seed rico idempotente de demonstração
│   │   ├── validate.js              # Validação espelhada front/back
│   │   ├── users.routes.js          # CRUD + restore + listagem avançada
│   │   ├── stats.routes.js          # Stats + Desempenho Semanal derivados
│   │   ├── notifications.routes.js  # Notificações persistentes
│   │   ├── demo.routes.js           # Reset demo
│   │   └── errors.js                # Envelope de erros JSON
│   └── tests/                       # Testes HTTP (node --test)
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
│   │   └── utils/
│   │       └── skip-link.css        # Skip link acessível
│   └── style.css                    # CSS consolidado (todos os módulos concatenados)
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
│   │   ├── storage.service.js       # Abstração para localStorage
│   │   ├── api.service.js           # ApiService: fetch na API com fallback offline
│   │   └── fallback-seed.js         # Seed local rico (modo GitHub Pages)
│   ├── utils/
│   │   ├── dom.js                   # Helpers de manipulação DOM
│   │   ├── event-bus.js             # Pub/sub para comunicação entre módulos
│   │   └── icons.js                 # Biblioteca de 20+ ícones SVG
│   └── app.js                       # Ponto de entrada (inicializa todos os módulos)
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
- **Contrato REST como seam** -- testar comportamento via HTTP (status, corpo, persistência) em vez de detalhes internos de SQL
- **Fallback offline** -- tentar a API e cair para seed local mantém o demo estático funcionando sem servidor
- **Validação espelhada** -- mesmas regras nos dois lados (nome 2-100, email, enums) evitam dados inconsistentes

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
