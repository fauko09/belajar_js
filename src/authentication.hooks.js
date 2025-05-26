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
          // const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          const date =  new Date(Date.now() + 30 * 1000)
          const authService = app.service('authentication')
          const jwtPayload = { sub: result.user.uid }
          const refreshToken = await authService.createAccessToken(jwtPayload, {
            expiresIn: '60s'
          })
          console.log('result token', refreshToken)

          console.log('result user', result.user)
          const refreshTokenModel = app.get('sequelizeClient').models.refresh_token
          const userModel = app.get('sequelizeClient').models.users
          // Cari refresh token yang sudah ada untuk uid user ini
          const existingToken = await refreshTokenModel.findOne({
            where: { uid: result.user.uid }
          })

          const user = await userModel.findOne({
            where: {
              uid: result.user.uid
            }
          })

          // Jika tidak ada token sama sekali, atau token yang ada berbeda dengan accessToken baru
          if (!existingToken || existingToken.token !== refreshToken) {
            // Buat refresh token baru (random string atau UUID)
            if (existingToken) {
              // Update token dan refresh_token pada record yang sudah ada
              await existingToken.update({
                token: result.accessToken,
                refresh: refreshToken,
                expired: date
              })
            } else {
              // Buat record baru jika belum ada
              await refreshTokenModel.create({
                uid: result.user.uid,
                token: result.accessToken,
                refresh: refreshToken,
                expired: date
              })
            }
            context.result = {
              user_id: result.user.uid,
              nama: user.nama,
              email: result.user.email,
              token: result.accessToken,
              refresh_token: refreshToken,
              expired: date // jika ada
            }
            // Tambahkan refresh token ke response agar client bisa menerima dan menyimpannya
          } else {
            context.result = {
              user_id: result.user.uid,
              nama: user.nama,
              email: result.user.email,
              token: result.accessToken,
              refresh_token: refreshToken,
              expired: date // jika ada
            }
            // Jika token sama, gunakan refresh_token yang sudah ada
            result.refreshToken = existingToken.refresh_token
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
