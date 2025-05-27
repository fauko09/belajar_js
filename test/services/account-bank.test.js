const app = require('../../src/app');

describe('\'account-bank\' service', () => {
  it('registered the service', () => {
    const service = app.service('account-bank');
    expect(service).toBeTruthy();
  });
});
