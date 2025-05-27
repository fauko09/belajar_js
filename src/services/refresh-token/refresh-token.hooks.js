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
    if (!tokenRecord) {
      throw new Error('Invalid or revoked token') 
    }
    const userModel = app.get('sequelizeClient').models.users
    const user = await userModel.findOne({
      where: {
        uid: tokenRecord.uid
      }
    })

    if (!tokenRecord) {
      throw new Error('Invalid or revoked token')
    }

    const now = new Date(Date.now())
    const expiredDate = new Date(tokenRecord.expired)
    // console.log('token expired', now, expiredDate)
    // console.log(
    //   'cek date = ',
    //   new Date(Date.now() + 30 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    // )
    // console.log(
    //   'validasi date',
    //   now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }) >
    //     expiredDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    // )

    if (
      now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }) >
      expiredDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
    ) {
      const date = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)	
      const authService = app.service('authentication')
      const jwtPayload = { sub: user.uid }
      const newToken = await authService.createAccessToken(jwtPayload, {
        expiresIn: '1d'
      })

      console.log('new token vvvvvv ', newToken)
      console.log('new refresh token aaaaaa', refreshToken)

      // console.log("matching token " , newToken == refreshToken);

      await refreshModel.update(
        {
          token: newToken,
          expired: date
        },
        {
          where: {
            uid: user.uid
          }
        }
      )

      context.result = {
        user_id: user.uid,
        nama: user.nama,
        email: user.email,
        token: newToken,
        expired: date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
      }
      return context
    } else {
      throw new Error('Token Not Expired')
    }
  }
}

module.exports = {
  before: {
    all: [],
    find: [refresh()],
    get: [],
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
