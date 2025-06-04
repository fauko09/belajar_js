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

// async function checkBallanceIRIS(context) {
  
// }

async function payoutsMidtrans(context, dataBody) {
  const username = context.app.get('midtrans_dis')
  const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = `https://app.midtrans.com/api/v1/payouts`
  console.log('url validasi bank', url)
  console.log('basic auth', basicAuth)

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(dataBody),
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: 'application/json'
    }
  })
  const data = await response.json()
  console.log('create payouts ', data)

  return data
}
const createCashOut = () => {
  return async (context) => {
    const { app } = context
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    const balanceModel = app.get('sequelizeClient').models.balance
    const balance = await balanceModel.findOne({ where: { uid: getUid } })
    const bankUser = await app.get('sequelizeClient').models.account_bank.findOne({ where: { uid: getUid } })
    const user = await app.get('sequelizeClient').models.users.findOne({ where: { uid: getUid } })
    if (balance.saldo < context.data.saldo) {
      throw new Error('Saldo tidak cukup')
    } else {
      await balanceModel.update({ saldo: balance.saldo - context.data.saldo }, { where: { uid: getUid } })
      const sisa = await balanceModel.findOne({ where: { uid: getUid } })
      const now = new Date();

      data =  {
        beneficiary_name: user.nama,
        beneficiary_account: bankUser.account,
        beneficiary_bank: bankUser.nama_bank,
        beneficiary_email: user.email,
        amount: context.data.saldo,
        notes: `Payout ${now}`
      }
      await payoutsMidtrans(context, data)
      context.result = {
        status: 200,
        message: 'success',
        user : user.nama,
        bank: bankUser.nama_bank,
        account: bankUser.account,
        payouts: context.data.saldo,
        ballance: sisa.saldo,
      }
      return context
    }
  }
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    // get: [],
    create: [createCashOut()],
    // update: [],
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
