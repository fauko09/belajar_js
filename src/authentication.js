const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication')
const { LocalStrategy } = require('@feathersjs/authentication-local')
const { expressOauth } = require('@feathersjs/authentication-oauth')

const authenticationHooks = require('./authentication.hooks') // pastikan path benar

module.exports = (app) => {
  const authentication = new AuthenticationService(app)

  // authentication.register('jwt', new customJWT())
  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('/authentication', authentication)
  app.configure(expressOauth())

  // Pasang hooks
  app.service('authentication').hooks(authenticationHooks)
}

class customJWT extends JWTStrategy {

   async getEntityQuery(params) {
    console.log('UHUY');
    
    return {
      active: true
    }
  }

  async authenticate(auth, params) {
    console.log('tez');
    
    const refreshTokenModel = app.get('sequelizeClient').models.refresh_token
    const tokenRecord = await refreshTokenModel.findOne({
      where: { token: payload.accessToken }
    })
    console.log('payload token', payload)
    console.log('tokenRecord', tokenRecord)

    if (!tokenRecord) {
      throw new Forbidden('Invalid or revoked token')
    }

    if (tokenRecord.expired) {
      const now = new Date().now
      const expiredDate = new Date(tokenRecord.expired)

      console.log('token expired', now, expiredDate)
      if (now > expiredDate) {
        console.log('token expired')
        throw new Forbidden('Token has expired')
      }
    }

    return payload
  }
}
