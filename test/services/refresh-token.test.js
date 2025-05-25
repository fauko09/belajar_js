const app = require('../../src/app');

describe('\'refresh-token\' service', () => {
  it('registered the service', () => {
    const service = app.service('refresh-token');
    expect(service).toBeTruthy();
  });
});
