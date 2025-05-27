const app = require('../../src/app');

describe('\'balance\' service', () => {
  it('registered the service', () => {
    const service = app.service('balance');
    expect(service).toBeTruthy();
  });
});
