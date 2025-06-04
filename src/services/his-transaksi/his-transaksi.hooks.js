const { authenticate } = require('@feathersjs/authentication').hooks
const jwt = require('jsonwebtoken')

function getUidFromToken(token) {
  try {
    const decoded = jwt.verify(token, 'jE+z2uQ6zFAhiQVNQqqHr27eZrM=')
    return decoded.sub || decoded.id
  } catch (error) {
    console.error('Token tidak valid atau expired:', error)
    return null
  }
}

const getAllTransaksi = () => {
  return async (context) => {
    const { app } = context
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    const his = app.get('sequelizeClient').models.his_transaksi
    let history
    switch (context.params.query.status) {
      case 'debit':
        history = await his.findOne({ where: { uid: getUid, status: 'debit' } })

        break
      case 'kredit':
        history = await his.findOne({ where: { uid: getUid, status: 'kredit' } })
        break
      case 'all':
        history = await his.findAll({ where: { uid: getUid } })
        break
      default:
        break
    }

    context.result = {
      status: 200,
      message: 'success',
      data: {
        his_id: history.his_id,
        uid: history.uid,
        saldo: history.saldo,
        type: history.tipe,
        status: history.status,
        created_at: history.created_at
      }
    }
    return context
  }
}



module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [getAllTransaksi()],
    // get: [],
    // create: [],
    // update: []
    // patch: [],
    // remove: []
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
