/**
 * fallback-seed — seed local rico para o modo offline (GitHub Pages).
 *
 * Espelha `backend/src/seed.js`: mesmos Usuários, Notificações, vendas e
 * metas, para o demo nunca quebrar sem servidor. Usado pelo ApiService
 * quando o `fetch` na API local falha.
 */

export const FALLBACK_USERS = [
  { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 2, nome: 'Maria Souza', email: 'maria@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: 3, nome: 'Pedro Alves', email: 'pedro@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 4, nome: 'Ana Dias', email: 'ana@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 5, nome: 'Carlos Mendes', email: 'carlos.mendes@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 6, nome: 'Fernanda Lima', email: 'fernanda.lima@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 7, nome: 'Rafael Costa', email: 'rafael.costa@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: 8, nome: 'Juliana Rocha', email: 'juliana.rocha@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 9, nome: 'Marcos Vinicius', email: 'marcos.v@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 10, nome: 'Patricia Gomes', email: 'patricia.gomes@exemplo.com', status: 'Inativo', plano: 'Premium' },
  { id: 11, nome: 'Lucas Ferreira', email: 'lucas.ferreira@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 12, nome: 'Beatriz Santos', email: 'beatriz.santos@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 13, nome: 'Thiago Oliveira', email: 'thiago.o@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: 14, nome: 'Camila Ribeiro', email: 'camila.r@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 15, nome: 'Diego Martins', email: 'diego.martins@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 16, nome: 'Larissa Almeida', email: 'larissa.a@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 17, nome: 'Bruno Carvalho', email: 'bruno.c@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: 18, nome: 'Aline Barbosa', email: 'aline.b@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 19, nome: 'Gustavo Henrique', email: 'gustavo.h@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 20, nome: 'Renata Cardoso', email: 'renata.c@exemplo.com', status: 'Inativo', plano: 'Premium' },
  { id: 21, nome: 'Felipe Nogueira', email: 'felipe.n@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 22, nome: 'Daniela Teixeira', email: 'daniela.t@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 23, nome: 'Rodrigo Pinto', email: 'rodrigo.p@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: 24, nome: 'Sabrina Correia', email: 'sabrina.c@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 25, nome: 'Eduardo Freitas', email: 'eduardo.f@exemplo.com', status: 'Ativo', plano: 'Básico' },
  { id: 26, nome: 'Vanessa Moreira', email: 'vanessa.m@exemplo.com', status: 'Ativo', plano: 'Premium' },
  { id: 27, nome: 'André Luiz', email: 'andre.luiz@exemplo.com', status: 'Inativo', plano: 'Básico' },
  { id: 28, nome: 'Priscila Nunes', email: 'priscila.n@exemplo.com', status: 'Ativo', plano: 'Premium' },
];

export const FALLBACK_NOTIFICATIONS = [
  { id: 7, titulo: 'Bem-vindo ao painel', mensagem: 'Explore Usuários, Stats e Desempenho Semanal.', lida: true },
  { id: 6, titulo: 'Plano expirando', mensagem: '3 Usuários do plano Básico vencem nesta semana.', lida: true },
  { id: 5, titulo: 'Backup diário', mensagem: 'Backup do banco SQLite concluído com sucesso.', lida: true },
  { id: 4, titulo: 'Projeto concluído', mensagem: 'Blog corporativo foi marcado como concluído.', lida: false },
  { id: 3, titulo: 'Venda aprovada', mensagem: 'Assinatura Premium de R$ 499,90 confirmada.', lida: false },
  { id: 2, titulo: 'Meta semanal atualizada', mensagem: 'A meta de sexta-feira foi revisada.', lida: false },
  { id: 1, titulo: 'Novo usuário cadastrado', mensagem: 'João Silva criou um Usuário Premium.', lida: false },
];

/** Vendas agregadas por dia (somatório do seed do back-end). */
export const FALLBACK_SALES_BY_DAY = [
  { dia: 'Seg', vendas: 2549.7, quantidade: 5 },
  { dia: 'Ter', vendas: 3049.6, quantidade: 6 },
  { dia: 'Qua', vendas: 3349.7, quantidade: 6 },
  { dia: 'Qui', vendas: 2949.7, quantidade: 5 },
  { dia: 'Sex', vendas: 5149.5, quantidade: 11 },
];

export const FALLBACK_GOALS_BY_DAY = [
  { dia: 'Seg', meta: 3000 },
  { dia: 'Ter', meta: 3500 },
  { dia: 'Qua', meta: 4000 },
  { dia: 'Qui', meta: 3500 },
  { dia: 'Sex', meta: 5000 },
];

/** Projetos do seed (só contagem de ativos importa para os Stats offline). */
export const FALLBACK_ACTIVE_PROJECTS = 8;
