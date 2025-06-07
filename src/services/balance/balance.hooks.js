const { authenticate } = require('@feathersjs/authentication').hooks
const jwt = require('jsonwebtoken')
const balanceModel = require('../../models/balance.model')
const sendMail = require('../sendmail')

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
    data: {
      uid: balance.uid,
      saldo: balance.saldo,
    }
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
  const sequelize = app.get('sequelizeClient');
  if (!sequelize || !sequelize.models.his_transaksi) {
    throw new Error('Model hisTransaksi tidak ditemukan');
  }

  const historyModel = sequelize.models.his_transaksi;
  await historyModel.create(body); // HANYA body, bukan {body}
}
async function updateHistory(app, body, uid) {
  const sequelize = app.get('sequelizeClient');
  if (!sequelize || !sequelize.models.his_transaksi) {
    throw new Error('Model hisTransaksi tidak ditemukan');
  }
  const historyModel = sequelize.models.his_transaksi;
  await historyModel.update(body, { where: { uid: uid, status: null } });
}

function formatIDR(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

async function getStatusTopUp(context) {
  const username = context.app.get('midtrans_key')
  console.log('param get status topup', context.id)
  const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = `https://api.midtrans.com/v2/${context.id}/status`
  console.log('url get status topup', url)
  const getUid = getUidFromToken(context.params.authentication.accessToken)
  if (getUid == null) {
    throw new Error('Invalid or revoked token')
  }
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
      const sequelize = context.app.get('sequelizeClient');
      if (!sequelize || !sequelize.models.balance) {
        throw new Error('Model ballance tidak ditemukan');
      }

      const balanceModel = sequelize.models.balance;
      try {
        const saldo = await balanceModel.findOne({ where: { uid: getUid } })
        const newSaldo = parseInt(saldo.saldo) + parseInt(dataRes.gross_amount)
        const user = await context.app.get('sequelizeClient').models.users.findOne({ where: { uid: getUid } })
        console.log('new saldo', dataRes.transaction_status == 'settlement' && parseInt(saldo.saldo) < newSaldo);
        switch (dataRes.transaction_status) {
          case 'settlement':
            console.log('new saldo', newSaldo);
            const transaksi = await context.app.get('sequelizeClient').models.his_transaksi.findOne({
              where: {
                his_id: dataRes.order_id,
                status: 'settlement'
              }
            });

            if (transaksi) {
              console.log("Transaksi sudah pernah diproses, skip top up");
              return context.result = {
                status: 200,
                message: 'done top up',
              }
            } else{
              await sendMail({
                to: user.email,
                subject: 'Topup berhasil',
                text: 'Topup berhasil',
                html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Top Up Berhasil</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f8f9;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }

    .card {
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .card h1 {
      color: #2e7d32;
      margin-bottom: 20px;
    }

    .card p {
      font-size: 18px;
      margin: 8px 0;
    }

    .amount {
      font-weight: bold;
      color: #0277bd;
    }

    .balance {
      font-weight: bold;
      color: #388e3c;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Top Up Berhasil 🎉</h1>
    <p>Terima kasih telah melakukan top up.</p>
    <p>Top Up Berhasil, Saldo anda telah bertambah.</p>
    <p>Jumlah Top Up: <span class="amount">${formatIDR(dataRes.gross_amount)}</span></p>
    <p>Saldo Terakhir: <span class="balance">${formatIDR(newSaldo)}</span></p>
  </div>
</body>
</html>
`
              })
              await balanceModel.update({ saldo: newSaldo }, { where: { uid: getUid } })
              await updateHistory(context.app, {
                total: dataRes.gross_amount,
                status: dataRes.transaction_status
              }, getUid)
            }

            break;
          case 'expired':
            await updateHistory(context.app, {
              total: dataRes.gross_amount,
              status: dataRes.transaction_status,
            }, getUid)
            break;
          default:
            break;
        }

      } catch (error) {
        console.log('error get status topup', error);
        throw new Error("error get status topup");
      }
      updatesaldo = await balanceModel.findOne({ where: { uid: getUid } })
      context.result = {
        status: 200,
        message: 'success',
        data: {
          saldo: updatesaldo.saldo,
          order_id: dataRes.order_id,
          transaction_id: dataRes.transaction_id,
          transaction_status: dataRes.transaction_status,
          gross_amount: dataRes.gross_amount,
          status_message: dataRes.status_message,
          payment_type: dataRes.payment_type,
        }
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
        his_id: dataRes.order_id,
        total: data.saldo,
        tipe: 'kredit'
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
    // update: [upadeteBalance()]
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
