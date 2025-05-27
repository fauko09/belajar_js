const { authenticate } = require('@feathersjs/authentication').hooks

const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks

const editUser = () => {
  return async (context) => {
    const { app, result } = context
    const authHeader = context.params.authentication && context.params.authentication.accessToken
    const tokenRecord = await app.get('sequelizeClient').models.refresh_token.findOne({
      where: { token: authHeader }
    })

    const userModel = app.get('sequelizeClient').models.users
    const user = await userModel.findOne({
      where: {
        uid: tokenRecord.uid
      }
    })
    console.log('user ', user)
    console.log('user edit ', context.data)
    if (!user) {
      throw new Error('Invalid or revoked token')
    }
    user.update({
      nama: context.data.nama.trim(),
      email: context.data.email,
      password: context.data.password
    })
    context.result = {
      status: 200,
      message: 'success',
      data: {
        user_id: user.uid,
        nama: user.nama,
        email: user.email
      }
    }
    return context
  }
}

const deleteUser = () => {
  return async (context) => {
    const { app, result } = context
    const authHeader = context.params.authentication && context.params.authentication.accessToken
    const tokenRecord = await app.get('sequelizeClient').models.refresh_token.findOne({
      where: { token: authHeader }
    })
    const userModel = app.get('sequelizeClient').models.users
    const user = await userModel.findOne({
      where: {
        uid: tokenRecord.uid
      }
    })
    user.destroy()
    context.result = {
      status: 200,
      message: 'success delete user'
    }
    return context
  }
}

const createUser = () => {
  return async (context) => {
    const userModel = app.get('sequelizeClient').models.users
    const user = await userModel;
    user.create({
      email: context.data.email,
      password: context.data.password,
      nama: context.data.nama.totrim()
    })
    context.result = {
      status: 200,
      message: 'success create user',
      data: {
        user_id: user.uid,
        nama: user.nama,
        email: user.email,
        password: user.password
      }
    }
    return context
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [authenticate('jwt')],
    create: [hashPassword('password')],
    update: [hashPassword('password'), authenticate('jwt'), editUser()],
    patch: [hashPassword('password'), authenticate('jwt'), editUser()],
    remove: [authenticate('jwt'), deleteUser()]
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password')
    ],
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
