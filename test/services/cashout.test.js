const app = require('../../src/app');

describe('\'cashout\' service', () => {
  it('registered the service', () => {
    const service = app.service('cashout');
    expect(service).toBeTruthy();
  });
});
