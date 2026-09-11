/**
 * validate — validação de Usuário no back-end.
 *
 * Delega para `shared/user-domain.js` (fonte única, espelhada no front para o
 * modo offline). Reexporta os símbolos para os importadores existentes.
 * Email ausente vira null no banco (`toUserJson` expõe '' ao front).
 */

import {
  STATUS_VALIDOS,
  PLANOS_VALIDOS,
  EMAIL_RE,
  validateUserInput as sharedValidate,
} from '../../shared/user-domain.js';

export { STATUS_VALIDOS, PLANOS_VALIDOS, EMAIL_RE };

export function validateUserInput(input = {}, { partial = false } = {}) {
  return sharedValidate(input, { partial, emptyEmail: null });
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
