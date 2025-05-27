const app = require('../../src/app');

describe('\'refresh-tok\' service', () => {
  it('registered the service', () => {
    const service = app.service('refresh-tok');
    expect(service).toBeTruthy();
  });
});
