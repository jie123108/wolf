const log4js = require('../util/log4js')
const TokenError = require('../errors/token-error')
const RbacTokenError = require('../errors/rbac-token-error')
const AccessDenyError = require('../errors/access-deny-error')
const ArgsError = require('../errors/args-error')
const BackendError = require('../errors/backend-error')
const Sequelize = require('sequelize');
const json = require('../util/ok-json')

module.exports = function() {
  return function(ctx, next) {
    return next().catch((err) => {
      log4js.error('[error-catch] request [', ctx.method, ctx.url, '] failed! err[[', err, ']]')

      if (err instanceof ArgsError) {
        ctx.status = 400
        ctx.body = json.fail('ERR_ARGS_ERROR', err.message)
      } else if (err instanceof TokenError) {
        ctx.status = 401
        ctx.body = json.fail('ERR_TOKEN_INVALID', err.message)
      } else if (err instanceof RbacTokenError) {
        ctx.status = 302;
        ctx.redirect('/api/v1/rbac/login?error=Login%20Required');
      } else if (err instanceof AccessDenyError) {
        ctx.status = 401
        ctx.body = json.fail('ERR_ACCESS_DENIED', err.message)
      } else if (err instanceof Sequelize.UniqueConstraintError) {
        log4js.error('duplicate data err:', err.errors)
        ctx.status = 400;
        ctx.body = json.fail('ERR_DUPLICATE_KEY_ERROR', err.message)
      } else if ( err instanceof BackendError) {
        ctx.status = 500
        ctx.body = json.fail('ERR_SERVER_ERROR', err.message)
      } else {
        ctx.status = 200
        ctx.body = json.fail('ERR_SERVER_ERROR', err.message)
      }
    })
  }
}