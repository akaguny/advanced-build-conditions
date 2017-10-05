const path = require('path'),
      basePackagePath = path.resolve(__dirname, '..'),
      fixturePath = path.resolve(basePackagePath, 'spec', 'fixtures'),
      mapStatusFixtures = {
        success: 'equal',
        failed: 'newErrorsAndFiles'
      },
      helpers = require('./helpers');

let testCreditials = {
  login: 'teamcity',
  pass: 'password',
  host: 'http://localhost:8080',
  buildTypeId: 'testBuildTypeId',
  buildId: '19994'
};

describe('smoke тест: выставление статуса сборки', () => {
  let buildFailedConditions;

  beforeEach(() => {
    buildFailedConditions = require(`${path.resolve(basePackagePath, 'index.js')}`);
  });

  it('прошла', () => {
    let expectedStatus = 'success',
        fixture = mapStatusFixtures[expectedStatus];

    buildFailedConditions(helpers.prepareConfig(fixture, fixturePath, testCreditials)).then((result) => {
      expect(result.success).toEqual(true);
    });
  });

  it('провалилась', () => {
    let expectedStatus = 'failed',
        fixture = mapStatusFixtures[expectedStatus];
    buildFailedConditions(helpers.prepareConfig(fixture, fixturePath, testCreditials)).then((result) => {
      expect(result.success).toEqual(false);
    });
  });
});
