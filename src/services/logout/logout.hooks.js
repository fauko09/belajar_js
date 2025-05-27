
const logoutJwt = () => {
  return async (context) => {
    const authHeader = context.params.authentication && context.params.authentication.accessToken
    console.log('token logout', authHeader)
    const refreshModel = context.app.get('sequelizeClient').models.refresh_token
    const tokenRecord = await refreshModel.findOne({
      where: { token: authHeader }
    })
    if (!tokenRecord) {
      throw new Error('Invalid or revoked token')
    }
    tokenRecord.destroy();
    // context.app.get('authentication').logout(authHeader)
    return context
  }
}


module.exports = {
  before: {
    all: [],
    find: [logoutJwt()],
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
