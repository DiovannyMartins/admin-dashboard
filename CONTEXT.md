# Admin Dashboard

Dashboard administrativo para gerenciamento de usuários, estatísticas e notificações. Este contexto cobre o painel inteiro (front vanilla + futuro back-end em Node).

## Language

**Usuário**:
Pessoa gerenciada no painel, com nome, email, status e plano.
_Avoid_: Client, conta, member

**Status de Usuário**:
Situação do usuário: Ativo ou Inativo.
_Avoid_: state, flag

**Plano**:
Tier de assinatura do usuário: Básico ou Premium.
_Avoid_: tier, level

**Notificação**:
Aviso exibido no dropdown do topbar, com estado lida/não-lida.
_Avoid_: alert, push

**Stat**:
Número agregado do resumo geral (usuários totais, projetos ativos, vendas, receita).
_Avoid_: metric, KPI, card

**Desempenho Semanal**:
Série de vendas vs metas por dia (Seg–Sex) exibida no gráfico de barras.
_Avoid_: chart data, report
