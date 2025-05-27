const { LocalStrategy } = require('@feathersjs/authentication-local')
const bcrypt = require('bcryptjs')

const localStrategy = new LocalStrategy()

async function verifyUserPassword(userModel, inputPassword) {
  // Bandingkan password plain text dengan hash yang tersimpan
  const isMatch = await bcrypt.compare(inputPassword, userModel)
  // Jika tidak error, password cocok
  return isMatch
}
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [], // Jangan pasang validasi token di sini
    update: [],
    patch: [],
    remove: []
  },
  after: {
    create: [
      async (context) => {
        const { app, result } = context

        // Pastikan ada user dan accessToken (JWT)
        if (result && result.accessToken && result.user) {
          const date = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
          //   const date = new Date(Date.now() + 30 * 1000)
          //   const authService = app.service('authentication')
          //   const jwtPayload = { sub: result.user.uid }
          //   const refreshToken = await authService.createAccessToken(jwtPayload, {
          //     expiresIn: '60s'
          //   })

          const userModel = app.get('sequelizeClient').models.users
          const user = await userModel.findOne({
            where: {
              uid: result.user.uid
            }
          })
          if (user == null) {
            context.result = {
              status: 401,
              message: 'User not found'
            }
            return context
          }
          const refreshTokenModel = app.get('sequelizeClient').models.refresh_token
          // Cari refresh token yang sudah ada untuk uid user ini
          const existingToken = await refreshTokenModel.findOne({
            where: { uid: result.user.uid }
          })

          console.log('result.user.password', context.data)
          console.log('userModel.password', user.password)

          const isMatch = await verifyUserPassword(user.password, context.data.password)

          if (isMatch === false) {
            context.result = {
              status: 401,
              message: 'Invalid password'
            }
            return context
          }
          // Jika tidak ada token sama sekali, atau token yang ada berbeda dengan accessToken baru
          if (!existingToken) {
            // Buat refresh token baru (random string atau UUID)

            // Buat record baru jika belum ada
            await refreshTokenModel.create({
              uid: result.user.uid,
              token: result.accessToken,
              expired: date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
            })

            context.result = {
              user_id: result.user.uid,
              nama: user.nama,
              email: result.user.email,
              token: result.accessToken,
              expired: date // jika ada
            }
            // Tambahkan refresh token ke response agar client bisa menerima dan menyimpannya
          } else {
            await existingToken.update({
              token: result.accessToken,
              expired: date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
            })
            context.result = {
              user_id: result.user.uid,
              nama: user.nama,
              email: result.user.email,
              token: result.accessToken,
              expired: date // jika ada
            }
          }
        }
        return context
      }
    ],
    all: [],
    find: [],
    get: [],
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
