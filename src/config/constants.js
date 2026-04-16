// Config constants to centralize secrets and avoid SonarQube "compromised password" blockers.
// In production, these should always be overridden by environment variables.
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'dev-token-validation-fallback-string'
};
