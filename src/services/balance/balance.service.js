// Initializes the `balance` service on path `/balance`
const { Balance } = require('./balance.class')
const createModel = require('../../models/balance.model')
const hooks = require('./balance.hooks')
const multer = require('multer')
const express = require('@feathersjs/express')

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
  app.use('/balance',upload.none() ,new Balance(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('balance')

  service.hooks(hooks)
}
