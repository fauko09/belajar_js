// Initializes the `account-bank` service on path `/account-bank`
const { AccountBank } = require('./account-bank.class')
const createModel = require('../../models/account-bank.model')
const hooks = require('./account-bank.hooks')
const multer = require('multer')
const express = require('@feathersjs/express');


module.exports = function (app) {
  const upload = multer()

  // Middleware parsing JSON dan urlencoded harus dipasang di app utama
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/account-bank', upload.none(), new AccountBank(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('account-bank')

  service.hooks(hooks)
}
