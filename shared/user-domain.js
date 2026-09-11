/**
 * user-domain — vocabulário e validação de Usuário em fonte única.
 *
 * Importado pelos dois lados (back-end Node e front vanilla via fetch):
 * - `backend/src/validate.js` delega para cá (email ausente vira null no banco)
 * - `js/services/api.service.js` delega para cá (email ausente vira '' no front,
 *   ver `toUserJson`: o front representa ausência como string vazia)
 *
 * Regras (spec #1):
 * - nome obrigatório, 2–100 caracteres (após trim)
 * - email opcional; ausente/vazio/null; se informado, formato válido
 * - Status de Usuário restrito a Ativo/Inativo (default Ativo)
 * - Plano restrito a Básico/Premium (default Básico)
 */

export const STATUS_VALIDOS = ['Ativo', 'Inativo'];
export const PLANOS_VALIDOS = ['Básico', 'Premium'];
export const USER_SORTS_VALIDOS = ['nome', 'status', 'plano', 'created_at', 'id'];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUserInput(input = {}, { partial = false, emptyEmail = null } = {}) {
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

  // email (opcional; ausência vira `emptyEmail`, inclusive '' em update parcial)
  if (input.email === undefined || input.email === null || input.email === '') {
    if (!partial) value.email = emptyEmail;
    else if (input.email === '') value.email = emptyEmail;
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
