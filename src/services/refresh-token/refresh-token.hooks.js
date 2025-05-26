const { authenticate } = require('@feathersjs/authentication').hooks
const jwt = require('jsonwebtoken')

const refresh = () => {
  return async (context) => {
        const { app, result } = context
        const authHeader = context.params.authentication && context.params.authentication.accessToken

        // Verifikasi token refresh (gunakan secret berbeda)
        const refreshModel = app.get('sequelizeClient').models.refresh_token
        const tokenRecord = await refreshModel.findOne({
          where: { token: authHeader }
        })
        console.log('header refresh token : ',authHeader)
        const userModel = app.get('sequelizeClient').models.users
        const user = await userModel.findOne({
          where: {
            uid: tokenRecord.uid
          }
        })
        console.log('user', user.nama)

        if (!tokenRecord) {
          throw new Error('Invalid or revoked token')
        }

        const now = new Date(Date.now())
        const expiredDate = new Date(tokenRecord.expired)
        console.log('token expired', now, expiredDate)
        console.log(
          'cek date = ',
          new Date(Date.now() + 30 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
        )
        console.log(
          'validasi date',
          now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }) >
            expiredDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
        )

        if (
          now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }) >
          expiredDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
        ) {
          const date = new Date(Date.now() + 30 * 1000)
          const dateRefresh = new Date(Date.now() + 60 * 1000)
          const authService = app.service('authentication')
          const jwtPayload = { sub: user.uid }
         
          const refreshToken = await authService.createAccessToken(jwtPayload, {
            expiresIn: '60s'
          })

          const newToken = await authService.createAccessToken(jwtPayload, {
            expiresIn: '30s'
          })

          console.log("new token " , newToken);
          console.log("new refresh token " , refreshToken);
          
          console.log("matching token " , newToken == refreshToken);

          const result = await tokenRecord.update({
            token: newToken,
            refresh: refreshToken,
            expired: dateRefresh
          })

          console.log(result);
          

          context.result;
          return context;

          console.log(result)
          
          context.result = {
            user_id: user.uid,
            nama: user.nama,
            email: user.email,
            token: newToken,
            refresh_token: refreshToken,
            expired: date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
          }
        } else {
          throw new Error('Token Not Expired')
        }

      }
}


module.exports = {
  before: {
    all: [],
    find: [
    ],
    get: [
      refresh()
    ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
