const { authenticate } = require('@feathersjs/authentication').hooks
const jwt = require('jsonwebtoken')
const { where } = require('sequelize')

function getUidFromToken(token) {
  try {
    const decoded = jwt.verify(token, 'jE+z2uQ6zFAhiQVNQqqHr27eZrM=')
    return decoded.sub || decoded.id
  } catch (error) {
    console.error('Token tidak valid atau expired:', error)
    return null
  }
}

getBalanceByID = () => async (context) => {
  const { app } = context
  const getUid = getUidFromToken(context.params.authentication.accessToken)
  if (getUid == null) {
    throw new Error('Invalid or revoked token')
  }
  const balanceModel = app.get('sequelizeClient').models.balance
  const balance = await balanceModel.findOne({ where: { uid: getUid } })
  context.result = {
    status: 200,
    message: 'success',
    data: balance
  }
  return context
}

const upadeteBalance = () => async (context) => {
  const { data } = context
  const { app } = context
  const getUid = getUidFromToken(context.params.authentication.accessToken)
  if (getUid == null) {
    throw new Error('Invalid or revoked token')
  }
  const balanceModel = app.get('sequelizeClient').models.balance
  const saldo = await balanceModel.findOne({ where: { uid: getUid } })
  let newSaldo
  if (context.params.query.operator == '-') {
    newSaldo = saldo.saldo - parseInt(data.saldo) // pastikan tipe number
  } else {
    newSaldo = saldo.saldo + parseInt(data.saldo) // pastikan tipe number
  }

  await balanceModel.update({ saldo: newSaldo }, { where: { uid: getUid } })

  context.result = {
    status: 200,
    message: 'success',
    data: { saldo: newSaldo }
  }
  return context
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [getBalanceByID()],
    // get: [],
    // create: [],
    update: [upadeteBalance()]
    // patch: [upadeteBalance()]
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
