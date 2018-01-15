const path = require('path'),
      basePackagePath = path.resolve(__dirname, '..'),
      fixturePath = path.resolve(basePackagePath, 'spec', 'fixtures'),
      mapStatusFixtures = {
        success: 'equal',
        failed: 'newErrorsAndFiles'
      },
      helpers = require('./helpers');

describe('smoke тест: выставление статуса сборки', () => {
  let buildFailedConditions;

  beforeEach(() => {
    buildFailedConditions = require(`${path.resolve(basePackagePath, 'index.js')}`);
  });

  describe('прошла', () => {
    it('нет нарушений', () => {
      let expectedStatus = 'success',
          fixture = mapStatusFixtures[expectedStatus];

      buildFailedConditions(helpers.prepareConfig(fixture, fixturePath, testCreditials)).then((result) => {
        expect(result.success).toEqual(true);
        expect(result.violationsCount).toEqual({
          error: 0,
          warning: 0
        });
      });
    });

    it('есть нарушения только типа warning', () => {
      buildFailedConditions(helpers.prepareConfig('onlyWarnings', fixturePath, testCreditials)).then((result) => {
        expect(result.violationsCount).toEqual({
          error: 0,
          warning: 5
        });
      });
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
