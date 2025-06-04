// Initializes the `his-transaksi` service on path `/his-transaksi`
const { HisTransaksi } = require('./his-transaksi.class')
const createModel = require('../../models/his-transaksi.model')
const hooks = require('./his-transaksi.hooks')
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
  app.use('/his-transaksi',upload.none() ,new HisTransaksi(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('his-transaksi')

  service.hooks(hooks)
}
