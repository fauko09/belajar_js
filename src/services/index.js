const users = require('./users/users.service.js');
const refreshToken = require('./refresh-token/refresh-token.service.js');
const logout = require('./logout/logout.service.js');
const accountBank = require('./account-bank/account-bank.service.js');
const balance = require('./balance/balance.service.js');
const cashout = require('./cashout/cashout.service.js');
const hisTransaksi = require('./his-transaksi/his-transaksi.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(refreshToken);
  app.configure(logout);
  app.configure(accountBank);
  app.configure(balance);
  app.configure(cashout);
  app.configure(hisTransaksi);
};
