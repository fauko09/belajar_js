// Initializes the `refresh-token` service on path `/refresh-token`
const { RefreshToken } = require('./refresh-token.class');
const createModel = require('../../models/refresh-token.model');
const hooks = require('./refresh-token.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/refresh-token', new RefreshToken(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('refresh-token');

  service.hooks(hooks);
};
