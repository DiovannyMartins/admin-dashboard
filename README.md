# Admin Dashboard

Dashboard administrativo moderno com tema escuro, desenvolvido com HTML5, CSS3 modular e JavaScript ES6+ com arquitetura profissional.

## 🚀 Tecnologias

- **HTML5** - Semântica e acessibilidade (ARIA)
- **CSS3** - Variáveis CSS, Grid, Flexbox, Media Queries
- **JavaScript ES6+** - Módulos, Classes, Arrow Functions
- **SVG Inline** - Ícones escaláveis e customizáveis

## 📱 Funcionalidades

### Interface
- ✅ Tema escuro/claro com toggle (persiste preferência)
- ✅ Design responsivo (desktop, tablet, mobile)
- ✅ Sidebar com menu mobile (drawer)
- ✅ Cards de estatísticas com ícones coloridos
- ✅ Gráfico de barras animado
- ✅ Tabela de dados com hover

### Gerenciamento de Usuários
- ✅ CRUD completo (Criar, Ler, Atualizar, Deletar)
- ✅ Busca com debounce (250ms)
- ✅ Filtros avançados (Status, Plano)
- ✅ Ordenação por colunas (Nome, Status, Plano)
- ✅ Paginação inteligente (5 itens por página)
- ✅ Export CSV com BOM UTF-8
- ✅ Undo em exclusões (5 segundos)
- ✅ Validação de formulário em tempo real

### Acessibilidade
- ✅ Skip link para navegação
- ✅ Focus trap em modais
- ✅ ARIA labels e roles
- ✅ Navegação por teclado (Tab, Escape)
- ✅ prefers-reduced-motion respeitado
- ✅ Contraste AA em todos os textos

### Atalhos de Teclado
- `Ctrl/Cmd + K` - Focar busca
- `Ctrl/Cmd + N` - Novo usuário
- `Ctrl/Cmd + E` - Exportar CSV
- `Ctrl/Cmd + T` - Alternar tema
- `Escape` - Fechar modal/dropdown

## 🏗️ Arquitetura

```
07/
├── index.html              # Entry point HTML
├── README.md               # Documentação
├── css/                    # Estilos modulares (ITCSS)
│   ├── style.css          # Importa todos os módulos
│   ├── base/              # Variáveis, reset, acessibilidade
│   ├── components/        # Componentes reutilizáveis
│   ├── layout/            # Estrutura principal
│   ├── pages/             # Estilos específicos
│   ├── responsive/        # Media queries
│   ├── themes/            # Temas (dark/light)
│   └── utils/             # Utilitários
└── js/                    # JavaScript modular
    ├── app.js            # Entry point
    ├── components/        # Componentes UI (Modal, Toast, etc.)
    ├── modules/           # Módulos de funcionalidade
    ├── services/          # Serviços (Storage)
    └── utils/             # Utilitários (DOM, Icons, EventBus)
```

## 🎨 Design System

### Cores
- **Primária:** Índigo (#818cf8 dark / #6366f1 light)
- **Sucesso:** Verde (#34d399 dark / #10b981 light)
- **Perigo:** Vermelho (#f87171 dark / #ef4444 light)
- **Aviso:** Âmbar (#fbbf24 dark / #f59e0b light)
- **Info:** Ciano (#22d3ee dark / #06b6d4 light)

### Tipografia
- **Fonte:** Inter, -apple-system, BlinkMacSystemFont, "Segoe UI"
- **Tamanhos:** 12px (labels), 14px (corpo), 18px (títulos), 26px (valores)

### Espaçamento
- **Radius:** 8px (sm), 12px (md), 16px (lg), 9999px (full)
- **Sombras:** 5 níveis (sm, md, lg, xl)

##  Componentes

### JavaScript
- **Modal** - Focus trap, WAI-ARIA, animações
- **Toast** - Notificações temporárias
- **Dropdown** - Menu suspenso com keyboard support
- **Pagination** - Paginação inteligente com elipses
- **BarChart** - Gráfico animado com CSS transitions
- **Icon** - Sistema de ícones SVG reutilizável
- **ThemeManager** - Gerenciador de temas
- **KeyboardShortcuts** - Atalhos de teclado

### CSS
- **Buttons** - 3 variantes (primary, secondary, action)
- **Cards** - Stat cards com hover e ícones
- **Table** - Tabela com hover, badges, ordenação
- **Modal** - Backdrop blur, animação suave
- **Notifications** - Dropdown com marcar como lida
- **Toast** - Sistema de notificações
- **Pagination** - Design moderno

## 🔧 Instalação

```bash
# Clone o repositório
git clone <url>

# Abra em um servidor local
# Opção 1: VS Code Live Server
# Opção 2: Python
python -m http.server 8000

# Opção 3: Node.js
npx serve
```

##  Deploy

https://diovannymartins.github.io/admin-dashboard/

## 📚 Aprendizados

- Arquitetura CSS modular (ITCSS)
- JavaScript modular com ES6+
- Sistema de design com variáveis CSS
- Acessibilidade web (WCAG 2.1)
- Padrões WAI-ARIA
- Gerenciamento de estado com localStorage
- Componentes reutilizáveis
- Atalhos de teclado
- Tema escuro/claro com persistência

## ‍💻 Autor

Diovanny Martins

## 📄 Licença

MIT
