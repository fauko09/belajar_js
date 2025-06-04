const app = require('../../src/app');

describe('\'his-transaksi\' service', () => {
  it('registered the service', () => {
    const service = app.service('his-transaksi');
    expect(service).toBeTruthy();
  });
});
