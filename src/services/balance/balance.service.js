// Initializes the `balance` service on path `/balance`
const { Balance } = require('./balance.class');
const createModel = require('../../models/balance.model');
const hooks = require('./balance.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/balance', new Balance(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('balance');

  service.hooks(hooks);
};
