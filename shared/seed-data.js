/**
 * seed-data — dados de demonstração em fonte única.
 *
 * - `backend/src/seed.js` insere estas linhas no SQLite (ids autoincrement).
 * - `js/services/fallback-seed.js` deriva daqui os agregados offline
 *   (ids sequenciais, vendas por dia, metas), para o GitHub Pages nunca
 *   quebrar sem servidor (ADR-0002).
 *
 * Uma mudança no demo edita SÓ este arquivo.
 */

export const SEED_USERS = [
  { nome: 'João Silva', email: 'joao@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Maria Souza', email: 'maria@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { nome: 'Pedro Alves', email: 'pedro@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Ana Dias', email: 'ana@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Carlos Mendes', email: 'carlos.mendes@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Fernanda Lima', email: 'fernanda.lima@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Rafael Costa', email: 'rafael.costa@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { nome: 'Juliana Rocha', email: 'juliana.rocha@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Marcos Vinicius', email: 'marcos.v@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Patricia Gomes', email: 'patricia.gomes@exemplo.com', status: 'Inativo', plano: 'Premium' },
  { nome: 'Lucas Ferreira', email: 'lucas.ferreira@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Beatriz Santos', email: 'beatriz.santos@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Thiago Oliveira', email: 'thiago.o@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { nome: 'Camila Ribeiro', email: 'camila.r@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Diego Martins', email: 'diego.martins@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Larissa Almeida', email: 'larissa.a@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Bruno Carvalho', email: 'bruno.c@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { nome: 'Aline Barbosa', email: 'aline.b@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Gustavo Henrique', email: 'gustavo.h@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Renata Cardoso', email: 'renata.c@exemplo.com', status: 'Inativo', plano: 'Premium' },
  { nome: 'Felipe Nogueira', email: 'felipe.n@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Daniela Teixeira', email: 'daniela.t@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Rodrigo Pinto', email: 'rodrigo.p@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { nome: 'Sabrina Correia', email: 'sabrina.c@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'Eduardo Freitas', email: 'eduardo.f@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { nome: 'Vanessa Moreira', email: 'vanessa.m@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { nome: 'André Luiz', email: 'andre.luiz@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { nome: 'Priscila Nunes', email: 'priscila.n@exemplo.com', status: 'Ativo', plano: 'Premium' },
];

export const SEED_PROJECTS = [
  { nome: 'Site institucional', status: 'ativo' },
  { nome: 'App mobile v2', status: 'ativo' },
  { nome: 'Integração pagamentos', status: 'ativo' },
  { nome: 'Dashboard analytics', status: 'ativo' },
  { nome: 'Migração de banco', status: 'ativo' },
  { nome: 'Landing page campanha', status: 'ativo' },
  { nome: 'API pública', status: 'ativo' },
  { nome: 'Design system', status: 'ativo' },
  { nome: 'Blog corporativo', status: 'concluído' },
  { nome: 'Onboarding novo', status: 'concluído' },
  { nome: 'Relatórios PDF', status: 'concluído' },
  { nome: 'Protótipo MVP', status: 'concluído' },
];

export const SEED_SALES = [
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Seg' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Seg' },
  { descricao: 'Upgrade de plano', valor: 200.0, dia: 'Seg' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Seg' },
  { descricao: 'Consultoria', valor: 1200.0, dia: 'Seg' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Ter' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Ter' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Ter' },
  { descricao: 'Treinamento', valor: 800.0, dia: 'Ter' },
  { descricao: 'Suporte anual', valor: 950.0, dia: 'Ter' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Ter' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Qua' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Qua' },
  { descricao: 'Upgrade de plano', valor: 200.0, dia: 'Qua' },
  { descricao: 'Consultoria', valor: 1200.0, dia: 'Qua' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Qua' },
  { descricao: 'Treinamento', valor: 800.0, dia: 'Qua' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Qui' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Qui' },
  { descricao: 'Suporte anual', valor: 950.0, dia: 'Qui' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Qui' },
  { descricao: 'Consultoria', valor: 1200.0, dia: 'Qui' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Sex' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Sex' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Sex' },
  { descricao: 'Upgrade de plano', valor: 200.0, dia: 'Sex' },
  { descricao: 'Treinamento', valor: 800.0, dia: 'Sex' },
  { descricao: 'Consultoria', valor: 1200.0, dia: 'Sex' },
  { descricao: 'Suporte anual', valor: 950.0, dia: 'Sex' },
  { descricao: 'Assinatura Premium', valor: 499.9, dia: 'Sex' },
  { descricao: 'Assinatura Básica', valor: 149.9, dia: 'Sex' },
  { descricao: 'Upgrade de plano', valor: 200.0, dia: 'Sex' },
];

export const SEED_NOTIFICATIONS = [
  { titulo: 'Novo usuário cadastrado', mensagem: 'João Silva criou uma conta Premium.', lida: false },
  { titulo: 'Meta semanal atualizada', mensagem: 'A meta de sexta-feira foi revisada.', lida: false },
  { titulo: 'Venda aprovada', mensagem: 'Assinatura Premium de R$ 499,90 confirmada.', lida: false },
  { titulo: 'Projeto concluído', mensagem: 'Blog corporativo foi marcado como concluído.', lida: false },
  { titulo: 'Backup diário', mensagem: 'Backup do banco SQLite concluído com sucesso.', lida: true },
  { titulo: 'Plano expirando', mensagem: '3 Usuários do plano Básico vencem nesta semana.', lida: true },
  { titulo: 'Bem-vindo ao painel', mensagem: 'Explore Usuários, Stats e Desempenho Semanal.', lida: true },
];

export const SEED_GOALS = [
  { dia: 'Seg', meta: 3000 },
  { dia: 'Ter', meta: 3500 },
  { dia: 'Qua', meta: 4000 },
  { dia: 'Qui', meta: 3500 },
  { dia: 'Sex', meta: 5000 },
];
