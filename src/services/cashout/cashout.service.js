// Initializes the `cashout` service on path `/cashout`
const { Cashout } = require('./cashout.class')
const hooks = require('./cashout.hooks')
const multer = require('multer')
const express = require('@feathersjs/express')
module.exports = function (app) {
  const upload = multer()

  // Middleware parsing JSON dan urlencoded harus dipasang di app utama
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/cashout', upload.none(),new Cashout(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('cashout')

  service.hooks(hooks)
}
