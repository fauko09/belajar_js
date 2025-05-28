const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication')
const { LocalStrategy } = require('@feathersjs/authentication-local')
const { expressOauth } = require('@feathersjs/authentication-oauth')

const authenticationHooks = require('./authentication.hooks') // pastikan path benar
const { NotAuthenticated } = require('@feathersjs/errors')
const { Email } = require('read-excel-file')

module.exports = (app) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new customJWT())
  // authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('/authentication', authentication)
  app.configure(expressOauth())

  // Pasang hooks
  app.service('authentication').hooks(authenticationHooks)
}

class customJWT extends JWTStrategy {
  async authenticate(auth, params) {
    const payload = await super.authenticate(auth, params)
    const refreshModel = this.app.get('sequelizeClient').models.refresh_token
    const tokenRecord = await refreshModel.findOne({
      where: { token: payload.accessToken }
    })
    
    if (tokenRecord === null) {
      
      throw new NotAuthenticated('Token not found') // <-- penting: throw error
    } else {
      const now = new Date(Date.now())
      const expiredDate = new Date(tokenRecord.expired)
      if (
        now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }) >
        expiredDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
      ) {
        throw new NotAuthenticated('Token is expired') // <-- penting: throw error
      } else {
        return payload
      }
    }
  }
}
// module.exports = { customJWT }

// class CustomJWTStrategy extends JWTStrategy {
//   async authenticate(authentication, params) {
//     // Panggil metode JWTStrategy bawaan untuk mendapatkan hasil awal
//     const payload = await super.authenticate(authentication, params);

//     // pengecualian untuk admin
//     if (payload?.user?.role_id === "admin") {
//       return payload;
//     }

//     const sequelize = this.app.get("sequelizeClient");
//     const { user_session, users } = sequelize.models;

//     const userSession = await user_session.findOne({
//       where: { user_id: payload?.user?.id },
//     });

//     // Mengecek apakah sesi sudah ada dan valid
//     if (!userSession || new Date(userSession?.session_expired) < new Date()) {
//       throw new errors.NotAuthenticated("Sesi Anda telah berakhir.");
//     }

//     // Mengecek device yg tersimpan di user_session dalam token dengan di payload
//     const decodedToken = jwt.decode(userSession?.session_token);

//     if (decodedToken?.device !== payload?.authentication?.payload?.device_id) {
//       throw new errors.Forbidden(
//         "Akun Anda telah digunakan di perangkat lain. Sesi ini berakhir."
//       );
//     }

//     // Mengecek apakah password lebih dari 3 bulan
//     const user = await users.findOne({
//       attributes: ["password_changed_at", "created_at"],
//       where: { id: payload?.user?.id },
//     });

//     const monthsAgo = new Date();
//     monthsAgo.setMonth(monthsAgo.getMonth() - 3);

//     if (new Date(user?.password_changed_at || user?.created_at) < monthsAgo) {
//       throw new errors.NotAuthenticated(
//         "Password telah kedaluwarsa. Silahkan ganti password."
//       );
//     }

//     return payload;
//   }
// }
