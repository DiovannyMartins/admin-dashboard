/**
 * validate — validação espelhada front/back de Usuário.
 *
 * Regras (spec #1, issues #3/#7):
 * - nome obrigatório, 2–100 caracteres (após trim)
 * - email opcional; vazio/null ausente; se informado, formato válido
 * - Status de Usuário restrito a Ativo/Inativo (default Ativo)
 * - Plano restrito a Básico/Premium (default Básico)
 */

export const STATUS_VALIDOS = ['Ativo', 'Inativo'];
export const PLANOS_VALIDOS = ['Básico', 'Premium'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserInput(input = {}, { partial = false } = {}) {
  const errors = [];
  const value = {};

  // nome
  if (input.nome === undefined && partial) {
    // ausente em update parcial: mantém atual
  } else {
    const nome = typeof input.nome === 'string' ? input.nome.trim() : '';
    if (!nome) {
      errors.push({ field: 'nome', message: 'Nome é obrigatório' });
    } else if (nome.length < 2) {
      errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 2 caracteres' });
    } else if (nome.length > 100) {
      errors.push({ field: 'nome', message: 'Nome deve ter no máximo 100 caracteres' });
    } else {
      value.nome = nome;
    }
  }

  // email (opcional; '' em update parcial limpa para null)
  if (input.email === undefined || input.email === null || input.email === '') {
    if (!partial) value.email = null;
    else if (input.email === '') value.email = null;
  } else if (typeof input.email !== 'string' || !EMAIL_RE.test(input.email.trim())) {
    errors.push({ field: 'email', message: 'Email inválido' });
  } else {
    value.email = input.email.trim();
  }

  // status
  if (input.status === undefined) {
    if (!partial) value.status = 'Ativo';
  } else if (!STATUS_VALIDOS.includes(input.status)) {
    errors.push({ field: 'status', message: 'Status de Usuário deve ser Ativo ou Inativo' });
  } else {
    value.status = input.status;
  }

  // plano
  if (input.plano === undefined) {
    if (!partial) value.plano = 'Básico';
  } else if (!PLANOS_VALIDOS.includes(input.plano)) {
    errors.push({ field: 'plano', message: 'Plano deve ser Básico ou Premium' });
  } else {
    value.plano = input.plano;
  }

  return { value, errors };
}

export function toUserJson(row) {
  if (!row) return null;
  return {
    id: row.id,
    nome: row.nome,
    email: row.email ?? '',
    status: row.status,
    plano: row.plano,
    created_at: row.created_at,
  };
}
