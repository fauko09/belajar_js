const { authenticate } = require('@feathersjs/authentication').hooks
const { default: axios } = require('axios')
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


async function payoutsMidtrans(context, dataBody) {
  const username = context.app.get('midtrans_dis_pay')
  // const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = `https://app.midtrans.com/iris/api/v1/payouts`
  console.log("body ", JSON.parse(JSON.stringify(dataBody)));

  try {
    const response = await axios.post(url, JSON.parse(JSON.stringify({ payouts: [dataBody] })), {
      headers: {
        Accept: 'application/json',
        setContentType: 'application/json',
        Authorization: ''
      },
      auth: {
        username: username,
        password: ''
      },
    })
    console.log('create payouts ', response.data)
    data = response.data.payouts[0]
    console.log("data", data);

    return data
  } catch (error) {
    console.log(
      "error witdrawal", error
    );
    throw new Error("error witdrawal");
  }
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
    const checkHis = await app.get('sequelizeClient').models.his_transaksi.findOne({ where: { uid: getUid, status: "queued" } })
    if (balance.saldo < context.data.saldo) {
      throw new Error('Saldo tidak cukup')
    } else {
      data = {
        beneficiary_name: user.nama,
        beneficiary_account: bankUser.account,
        beneficiary_bank: bankUser.nama_bank,
        beneficiary_email: user.email,
        amount: context.data.saldo,
        notes: `payouts withdrawal`
      }
      const minesBallance = (parseInt(context.data.saldo) + 2500) + (2500 * 0.11)
      console.log("minesBallance", minesBallance);
      if (checkHis != null) {
        context.result = {
          status: 200,
          message: 'anda sudah melakukan penarikan sebelumnya tunggu penarikan selesai',
        }
        return context
      }

      const payoustMid = await payoutsMidtrans(context, data)

      await createHistory(app, { total: context.data.saldo, status: `${payoustMid.status}`, tipe: "debit", uid: getUid, his_id: payoustMid.reference_no })
      await balanceModel.update({ saldo: balance.saldo - minesBallance }, { where: { uid: getUid } })
      const sisa = await balanceModel.findOne({ where: { uid: getUid } })
      const now = new Date();
      context.result = {
        status: 200,
        message: 'success',
        user: user.nama,
        bank: bankUser.nama_bank,
        account: bankUser.account,
        payouts: "-" + context.data.saldo,
        no: payoustMid.reference_no,
        ballance: sisa.saldo,
      }
      return context
    }
  }
}

const getDetailPay = () => {
  return async (context) => {
    const { app } = context
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    try {
      const respon = await axios.get(`https://app.midtrans.com/iris/api/v1/payouts/${context.id}`, {
        headers: {
          Accept: 'application/json',
          setContentType: 'application/json',
          Authorization: ''
        },
        auth: {
          username: app.get('midtrans_dis_pay'),
          password: ''
        },
      })
      console.log("detail payouts", respon.data);
      const isHistory = await app.get('sequelizeClient').models.his_transaksi.findOne({ where: { uid: getUid, his_id: respon.data.reference_no } })
      if (respon.data.status === "failed" && isHistory.status !== "failed") {
        const history = await app.get('sequelizeClient').models.his_transaksi.findOne({ where: { uid: getUid, his_id: respon.data.reference_no } })
        history.update({ status: "failed" })
        const ballanceRefund = await app.get('sequelizeClient').models.balance.findOne({ where: { uid: getUid } })
        await app.get('sequelizeClient').models.balance.update({ saldo: parseInt(ballanceRefund.saldo) + parseInt(respon.data.amount) }, { where: { uid: getUid } })
      } else if (respon.data.status === "completed" && isHistory.status !== "completed") {
        const history = await app.get('sequelizeClient').models.his_transaksi.findOne({ where: { uid: getUid, his_id: respon.data.reference_no } })
        history.update({ status: "completed" })
      }
      context.result = {
        status: 200,
        message: 'success',
        amount: respon.data.amount,
        beneficiary_name: respon.data.beneficiary_name,
        beneficiary_account: respon.data.beneficiary_account,
        beneficiary_bank: respon.data.beneficiary_bank,
        beneficiary_email: respon.data.beneficiary_email,
        notes: respon.data.notes,
        reference_no: respon.data.reference_no,
        status: respon.data.status,
        created_at: respon.data.created_at,
        updated_at: respon.data.updated_at
      }
      return context
    } catch (error) {
      console.log("detail payouts error", error);

      throw new Error("detail payouts error");
    }

  }
}

module.exports = {
  before: {
    all: [authenticate('jwt')],
    // find: [getDetailPay()],
    get: [getDetailPay()],
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
