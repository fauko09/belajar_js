// Initializes the `account-bank` service on path `/account-bank`
const { AccountBank } = require('./account-bank.class');
const createModel = require('../../models/account-bank.model');
const hooks = require('./account-bank.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/account-bank', new AccountBank(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('account-bank');

  service.hooks(hooks);
};
