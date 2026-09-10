/**
 * errors — convenção de erros JSON consistente da API.
 *
 * Envelope: { error: { code, message, details? } }
 * Códigos: NOT_FOUND, VALIDATION_ERROR, INTERNAL_ERROR
 * (VALIDATION_ERROR será usado pelos tickets de Usuários/Notificações.)
 */

export function createError(status, code, message, details) {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  if (details !== undefined) err.details = details;
  return err;
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Rota ${req.method} ${req.originalUrl ?? req.path} não encontrada`,
    },
  });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';
  const message = status === 500 ? 'Erro interno do servidor' : (err.message || 'Erro inesperado');
  const payload = { error: { code, message } };
  if (err.details !== undefined) payload.error.details = err.details;
  res.status(status).json(payload);
}
