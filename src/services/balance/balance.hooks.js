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
  const now = new Date()
  const milliseconds = `${now.getMilliseconds()}`.padStart(3, '0')
  let newSaldo
  try {
    if (context.params.query.operator == '-') {
      newSaldo = parseInt(saldo.saldo) - parseInt(data.saldo)
      await createHistory(app, {
        uid: getUid,
        his_id: 'withdraw' + getUid + milliseconds,
        total: -parseInt(data.saldo),
        tipe: 'debit'
      })
    } else if (context.params.query.status === 'settlement') {
      newSaldo = parseInt(saldo.saldo) + parseInt(data.saldo)
      await updateHistory(app, {
        total: parseInt(data.saldo),
        status: 'kredit'
      })
    }
    await balanceModel.update({ saldo: newSaldo }, { where: { uid: getUid } })
  } catch (error) {
    console.log('error update saldo', error)
  }

  context.result = {
    status: 200,
    message: 'success',
    saldo: newSaldo
  }
  return context
}

async function createHistory(app, body) {
  const historyModel = app.get('sequelizeClient').models.hisTransaksi
  await historyModel.create({body})
}
async function updateHistory(app, body) {
  const historyModel = app.get('sequelizeClient').models.hisTransaksi
  await historyModel.update(body, { where: { total: null, status: null } })
}

async function getStatusTopUp(context) {
  const username = context.app.get('midtrans_key')
  console.log('param get status topup', context.id)
  const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = `https://api.midtrans.com/v2/${context.id}/status`
  console.log('url get status topup', url)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Basic ${basicAuth}` // *** PERBAIKAN UTAMA DI SINI ***
    }
  }

  resB = await fetch(url, options)
    .then(async (res) => {
      dataRes = await res.json()
      console.log('data get status topup', dataRes)
      if (dataRes.transaction_status != 'expired') {
        await updateHistory(app, {
          total: dataRes.gross_amount,
          status: dataRes.transaction_status
        })
      }
      context.result = {
        status: 200,
        message: 'success',
        data: dataRes
      }
    })
    .then((json) => console.log(json))
    .catch((err) => console.error(err))
  return context
}

async function topUpBallance(context) {
  const username = context.app.get('midtrans_key')
  const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = 'https://api.midtrans.com/v2/charge'
  const getUid = getUidFromToken(context.params.authentication.accessToken)
  if (getUid == null) {
    throw new Error('Invalid or revoked token')
  }
  const { data } = context

  const now = new Date()
  const milliseconds = `${now.getMilliseconds()}`.padStart(3, '0')
  console.log('saldo ', data.saldo)

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Basic ${basicAuth}`
    },
    body: JSON.stringify({
      payment_type: 'qris',
      transaction_details: { order_id: 'order-' + getUid + milliseconds, gross_amount: data.saldo },
      qris: { acquirer: 'gopay' }
    })
  }

  await fetch(url, options)
    .then(async (res) => {
      const dataRes = await res.json()
      await createHistory(context.app, {
        uid: getUid,
        his_id: dataRes.order_id
      })
      context.result = {
        status_code: dataRes.status_code,
        status_message: dataRes.status_message,
        order_id: dataRes.order_id,
        transaction_id: dataRes.transaction_id,
        transaction_time: dataRes.transaction_time,
        transaction_status: dataRes.transaction_status,
        qris: dataRes.qr_string,
        expired: dataRes.expiry_time
      }
    })
    .then((json) => console.log(json))
    .catch((err) => console.error('erorr qris', err))

  return context
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [getBalanceByID()],
    get: [getStatusTopUp],
    create: [topUpBallance],
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
