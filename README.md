#  Admin Dashboard

Dashboard administrativo moderno desenvolvido com **HTML5**, **CSS3** e **JavaScript** para gerenciamento de usuários, estatísticas e notificações.

🔗 **Acesse:** [diovannymartins.github.io/admin-dashboard](https://diovannymartins.github.io/admin-dashboard/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-2088FF?style=for-the-badge&logo=github-pages&logoColor=white)

---

## 📸 Preview

<div align="center">
  <img src="https://github.com/user-attachments/assets/12995740-aa1b-47dd-a5fe-32ea71856f92" alt="Preview do Admin Dashboard" width="800">
</div>

---

## ✨ Funcionalidades

### 🎨 Interface & UX
- **Design responsivo** — adaptável a desktop, tablet e mobile
- **Dark/Light mode** — alternância de tema com persistência via `localStorage`
- **Animações suaves** — transições CSS com `prefers-reduced-motion` respeitado
- **Gráfico de barras animado** — desempenho semanal com CSS transitions

###  Gerenciamento de Usuários
- **CRUD completo** — criar, visualizar, editar e excluir usuários
- **Busca em tempo real** — com debounce de 250ms para performance
- **Filtros avançados** — por status (Ativo/Inativo) e plano (Básico/Premium)
- **Ordenação por colunas** — nome, status e plano (asc/desc)
- **Paginação inteligente** — 5 itens por página com elipses
- **Export CSV** — download com BOM UTF-8
- **Undo em exclusões** — toast com botão "Desfazer" (5 segundos)
- **Validação de formulário** — feedback visual em tempo real

### 🔔 Notificações & Perfil
- **Dropdown de notificações** — marcar como lida e limpar todas
- **Badge de notificações** — contador de não lidas em tempo real
- **Menu de perfil** — dropdown com opções do usuário

### ♿ Acessibilidade
- **Skip link** — para navegação por teclado
- **Focus trap** — em modais (Tab/Shift+Tab)
- **ARIA labels** — em todos os elementos interativos
- **ARIA roles** — `dialog`, `menu`, `status`
- **ARIA states** — `aria-expanded`, `aria-current`, `aria-live`
- **Navegação por teclado** — Tab, Escape, Enter
- **prefers-reduced-motion** — respeita preferência do usuário
- **Contraste AA** — em todos os textos

### ⌨️ Atalhos de Teclado
| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Focar campo de busca |
| `Ctrl + N` | Abrir modal de novo usuário |
| `Ctrl + E` | Exportar tabela para CSV |
| `Ctrl + T` | Alternar tema escuro/claro |
| `Escape` | Fechar modal ou dropdown |

---

## ️ Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura semântica e acessível com ARIA |
| **CSS3** | Variáveis CSS, Grid, Flexbox, Media Queries, animações |
| **JavaScript ES6+** | Módulos (import/export), Classes, Arrow Functions |
| **SVG Inline** | 20+ ícones escaláveis e customizáveis |
| **Git/GitHub** | Versionamento e deploy via GitHub Pages |

---

##  Estrutura do Projeto

```
admin-dashboard/
├── css/
│   ├── base/              # Reset, variáveis e acessibilidade
│   ├── components/        # Estilos de cada componente (buttons, cards, modal, etc.)
│   ├── layout/            # Grid, sidebar e topbar
│   ├── pages/             # Estilos específicos da página dashboard
│   ├── responsive/        # Media queries (tablet e mobile)
│   ├── themes/            # Tema claro (light mode)
│   ├── utils/             # Utilitários (skip-link)
│   └── style.css          # Ponto de entrada (importa todos os módulos)
├── js/
│   ├── components/        # Componentes UI (Modal, Toast, Dropdown, Pagination, Chart)
│   ├── modules/           # Módulos de funcionalidade (Sidebar, UserTable, Notifications, etc.)
│   ├── services/          # Serviços (StorageService)
│   ├── utils/             # Utilitários (DOM, EventBus, Icons)
│   └── app.js             # Ponto de entrada (inicializa todos os módulos)
├── index.html             # Página principal
└── README.md              # Documentação do projeto
```

---

##  Como Usar

### 1. Clone o repositório
```bash
git clone https://github.com/DiovannyMartins/admin-dashboard.git
```

### 2. Entre na pasta do projeto
```bash
cd admin-dashboard
```

### 3. Abra com um servidor local

> **Nota:** O projeto usa ES Modules (`type="module"`), então precisa de um servidor HTTP.

**Opção A: VS Code + Live Server** (recomendado)
- Clique com botão direito no `index.html` → "Open with Live Server"

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

##  Design System

### Paleta de Cores

| Cor | Dark Mode | Light Mode | Uso |
|-----|-----------|------------|-----|
| **Primária** | `#818cf8` | `#6366f1` | Botões, links, destaques |
| **Sucesso** | `#34d399` | `#10b981` | Status ativo, tendências positivas |
| **Perigo** | `#f87171` | `#ef4444` | Exclusão, tendências negativas |
| **Aviso** | `#fbbf24` | `#f59e0b` | Alertas, status pendente |
| **Info** | `#22d3ee` | `#06b6d4` | Informações, badges informativos |
| **Background** | `#0f172a` | `#ffffff` | Fundo principal |
| **Surface** | `#1e293b` | `#f8fafc` | Cards, modais |

### Tipografia
- **Fonte:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI"
- **Hierarquia:** 12px (labels) → 14px (corpo) → 18px (títulos) → 26px (valores)

### Espaçamento & Efeitos
- **Border Radius:** 8px (sm) · 12px (md) · 16px (lg) · 9999px (full/pill)
- **Sombras:** 5 níveis de elevação (sm → xl)
- **Transições:** 150ms (fast) · 200ms (default) · 300ms (slow)

---

##  Componentes

### JavaScript
| Componente | Descrição |
|------------|-----------|
| **Modal** | Focus trap, WAI-ARIA, animação suave, fecha com Escape |
| **Toast** | Notificações temporárias com 4 variantes (success, error, warning, info) |
| **Dropdown** | Menu suspenso genérico com keyboard support |
| **Pagination** | Paginação inteligente com elipses e ARIA |
| **BarChart** | Gráfico de barras animado com CSS transitions |
| **Icon** | Biblioteca de 20+ ícones SVG reutilizáveis |
| **ThemeManager** | Gerenciador de temas com persistência |
| **KeyboardShortcuts** | Sistema de atalhos de teclado globais |
| **UserProfile** | Menu dropdown de perfil do usuário |

### CSS
| Componente | Descrição |
|------------|-----------|
| **Buttons** | 3 variantes: primary, secondary, action |
| **Cards** | Stat cards com ícones coloridos e hover |
| **Table** | Tabela com hover, badges, ordenação visual |
| **Modal** | Backdrop blur, scale animation, focus trap |
| **Notifications** | Dropdown com marcar como lida e limpar todas |
| **Toast** | Slide-in notifications com auto-dismiss |
| **Pagination** | Botões com estado ativo e disabled |

---

## 📚 Aprendizados

Este projeto foi desenvolvido para praticar e demonstrar:

- **Arquitetura CSS modular** com padrão ITCSS (Inverted Triangle CSS)
- **JavaScript modular** com ES6+ (import/export, classes, arrow functions)
- **Sistema de design** com variáveis CSS e design tokens
- **Acessibilidade web** seguindo WCAG 2.1 nível AA
- **Padrões WAI-ARIA** para screen readers e navegação por teclado
- **Gerenciamento de estado** com localStorage e EventBus (pub/sub)
- **Componentes reutilizáveis** com responsabilidades bem definidas
- **Performance** com SVG inline, debounce e lazy rendering
- **Tema escuro/claro** com persistência e detecção de preferência do sistema

---

## 🔗 Projetos Relacionados

- [**Frontend Portfolio**](https://diovannymartins.github.io/frontend-portfolio/) — Portfólio pessoal com projetos e habilidades
- [**Business Dashboard**](https://diovannymartins.github.io/business-dashboard/) — Dashboard corporativo com painel administrativo
- [**SaaS Landing Page**](https://diovannymartins.github.io/saas-landing-page/) — Landing page profissional para plataforma SaaS
- [**Modern E-commerce**](https://diovannymartins.github.io/modern-ecommerce/) — Página inicial de loja virtual

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contato

- **GitHub:** [@DiovannyMartins](https://github.com/DiovannyMartins)
- **LinkedIn:** [Diovanny Martins](https://linkedin.com/in/diovanny-martins)
- **Instagram:** [@diovanny_067](https://www.instagram.com/diovanny_067/)
- **E-mail:** diovannydev@gmail.com

---

<div align="center">
  <p>Feito com ❤️ por <strong>Diovanny Martins</strong></p>
  <p>© 2026 Diovanny.dev - Todos os direitos reservados</p>
</div>
