/**
 * Segredo JWT: obrigatório em produção; em teste usa valor fixo; em dev avisa se faltar.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'test') {
    return 'test-jwt-secret-do-not-use-in-production';
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET deve estar definido no ambiente em produção.');
  }
  console.warn(
    '[auth] JWT_SECRET não definido; usando fallback apenas para desenvolvimento. Defina JWT_SECRET no .env'
  );
  return 'dev-only-jwt-secret-change-me';
}

module.exports = { getJwtSecret };
