const users = require('./users/users.service.js');
const refreshToken = require('./refresh-token/refresh-token.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(refreshToken);
};
