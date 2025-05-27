// Initializes the `users` service on path `/users`
const { Users } = require('./users.class');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
const express = require('@feathersjs/express');
const feathers = require('@feathersjs/feathers');
const multer = require('multer');

module.exports = function (app) {
  const upload = multer();

  // Middleware parsing JSON dan urlencoded harus dipasang di app utama
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Pasang multer middleware pada route /users untuk parsing form-data tanpa file
  app.use('/users', upload.none(), new Users({
    Model: createModel(app),
    paginate: app.get('paginate')
  }, app));

  // Ambil service users untuk mendaftarkan hooks
  const service = app.service('users');
  service.hooks(hooks);
};
