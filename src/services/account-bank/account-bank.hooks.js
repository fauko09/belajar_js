const { authenticate } = require('@feathersjs/authentication').hooks
const jwt = require('jsonwebtoken')
const axios = require('axios')
const { json } = require('sequelize')

function getUidFromToken(token) {
  try {
    const decoded = jwt.verify(token, 'jE+z2uQ6zFAhiQVNQqqHr27eZrM=')
    return decoded.sub || decoded.id
  } catch (error) {
    console.error('Token tidak valid atau expired:', error)
    return null
  }
}
const createAccountBank = () => {
  return async (context) => {
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    try {

      console.log('context account bank', getUid)
      const accountBankModel = context.app.get('sequelizeClient').models.account_bank
      console.log('data input account bank', context.data)
      const checkAccount = await accountBankModel.findOne({ where: { uid: getUid } }) //tableAccount
      if (checkAccount != null) {
        throw new Error('account bank sudah ada')
      }
      // const isBank = await validasiBank(context.app, context.data.bank, context.data.account)
      // if (isBank == null) {
      //   throw new Error('account bank tidak valid')
      // }

      const user = await context.app.get('sequelizeClient').models.users.findOne({ where: { uid: getUid } })

      dataBody = {
        name: user.nama,
        account: context.data.account,
        bank: context.data.bank,
        alias_name: context.data.account,
        email: user.email
      }

      const regisBanker = await regisBankIRIS(context, dataBody)
      if (regisBankIRIS == "error") {
        throw new Error('account bank tidak valid')
      }
      const accountBank = await accountBankModel.create({
        nama_bank: context.data.bank,
        account: context.data.account,
        uid: getUid
      })
      const balanceModel = context.app.get('sequelizeClient').models.balance
      const balanceChek = await balanceModel.findOne({ where: { uid: getUid } })
      let balance
      if (balanceChek == null) {
        balance = await balanceModel.create({
          saldo: 0.0,
          uid: getUid
        })
      } else {
        balance = await balanceModel.findOne({ where: { uid: getUid } })
      }

      context.result = {
        status: 201,
        message: 'success',
        validasi: false,
        ballance: balance.saldo,
        data: {
          uid: accountBank.uid,
          bank: accountBank.nama_bank,
          account: accountBank.account,
          status_iris: regisBanker.status === "created" ? true : false
        },
      }
      return context
    } catch (error) {
      return {
        status: 400,
        message: error.message
      }
    }
  }
}

async function regisBankIRIS(context, dataBody) {
  const username = context.app.get('midtrans_dis')
  const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = 'https://app.midtrans.com/iris/api/v1/beneficiaries'
  console.log('url validasi bank', url, basicAuth, username)
  console.log("body", JSON.parse(JSON.stringify(dataBody)));
  try {
    const response = await axios.post(url, JSON.parse(JSON.stringify(dataBody)), {
      headers: {
        Accept: 'application/json',
        setContentType: 'application/json',
        Authorization: ''
      },
      auth: {
        username: username,
        password: ''
      },
      params: {
        "": ""
      }
    })
    if (response.status != 201 || response.status != 200) {
      console.log('data regis Iris bank ', response.data)
      return response.data
    } else {
      return "error"
    }
  } catch (error) {
    return "error"
    console.log('eror regis iris', error);

  }
}


async function getBankIRIS(context) {
  const username = context.app.get('midtrans_dis')
  const basicAuth = Buffer.from(`${username}:`).toString('base64')
  const url = 'https://app.midtrans.com/iris//api/v1/beneficiaries'
  const respone = await axios.get(url, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: 'application/json'
    }
  })
  if (respone.status != 201 || respone.status != 200) {
    console.log('data regis Iris bank ', respone.data);
    return respone.data
  } else {
    return "erorr"
  }
}

const editAccountBank = () => {
  return async (context) => {
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    console.log('context account bank', getUid)
    if (context.data.bank == null || context.data.account == null) {
      throw new Error('data tidak boleh kosong')
    }
    const accountBankModel = context.app.get('sequelizeClient').models.account_bank
    const accountBank = await accountBankModel.findOne({ where: { uid: getUid } }) //tableAccount
    const upateaccountBank = await accountBank.update({
      nama_bank: context.data.bank,
      account: context.data.account
    })
    context.result = {
      status: 200,
      message: 'success',
      data: upateaccountBank
    }
    return context
  }
}

const deleteBank = () => {
  return async (context) => {
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    console.log('context account bank', getUid)
    const accountBankModel = context.app.get('sequelizeClient').models.account_bank
    const accountBank = await accountBankModel.findOne({ where: { uid: getUid } }) //tableAccount
    await accountBank.destroy()
    context.result = {
      status: 200,
      message: 'success delete account bank'
    }
    return context
  }
}
const getAccountBankUID = () => {
  return async (context) => {
    console.log('context account bank', context.params.query)
    const getUid = getUidFromToken(context.params.authentication.accessToken)
    if (getUid == null) {
      throw new Error('Invalid or revoked token')
    }
    console.log('context account asdasd', context.params.query)
    await getBankIRIS(context);
    const accountBankModel = context.app.get('sequelizeClient').models.account_bank
    if (context.params.query.by === 'id') {
      delete context.params.query.by
      const accountBank = await accountBankModel.findOne({ where: { uid: getUid } }) //tableAccount
      context.result = {
        status: 200,
        message: 'success',
        data: accountBank
      }
      return context
    } else {
      return context
    }
  }
}


// async function validasiBank(app, bank, account) {
//   const username = app.get('midtrans_dis')
//   const basicAuth = Buffer.from(`${username}:`).toString('base64')
//   const url = `https://app.midtrans.com/iris/api/v1/account_validation?bank=${bank}&account=${account}`
//   console.log("url validasi bank", url);
//   console.log("basic auth", basicAuth);

//   const response = await fetch(url, {
//     method: 'GET',
//     headers: {
//       Authorization: `Basic ${basicAuth}`,
//       Accept: 'application/json'
//     }
//   })
//   const data = await response.json();
//   console.log("data valisasi bank ", data);

//   return data
// }
module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [getAccountBankUID()],
    get: [],
    create: [createAccountBank()],
    // update: [editAccountBank()],
    // patch: [editAccountBank()],
    remove: [deleteBank()]
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
