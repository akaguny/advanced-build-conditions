const sh = require('shelljs'),
      path = require('path'),
      fs = require('fs-extra'),
      basePackagePath = path.resolve(__dirname, '..'),
      fixturePath = path.resolve(basePackagePath, 'spec', 'fixtures'),
      resultFixturePath = path.resolve(fixturePath, 'result'),
      readJSON = fs.readJSONSync,
      mapStatusFixtures = {
        success: 'onesLessErrorInExistErrorFile',
        failed: 'newErrorsAndFiles'
      };

let prepareInput,
    identInputForTest,
    prepareConfig,
    clearInputForTest,
    runAppFromConsole,
    testMasterBuildName = '1.12.0/develop',
    testBuildStatus = 'Failed',
    testBuildFailedReason = 'New ESlint errors',
    testBuildProblem = 'It`s real big problem',
    testUsername = 'teamcity',
    testPassword = 'password',
    testHost = 'http://localhost:8080',
    testProjectId = 'testProjectId',
    testBuildName = 'pull-requests/2741',
    testBuildId = 19994;
/**
 * Идентификация входных данных
 * на основе кейса определяет имена json файлов с тестовыми данными
 * @param {string} testCase - кейс использования:
 * (equal|oneMoreError|oneMoreNewError|empty)
 * @typedef {Object} testDataJSONNames имена обозначающие JSON с тестовыми
 * данными
 * @property {String} masterInputName - мастер ветку
 * @property {String} currentInputName - текущую ветку
 * @return {testDataJSONNames}
 */
identInputForTest = (testCase) => {
  let current,
      master,
      error = 'error',
      tempMaster;

  console.log(testCase);

  switch (testCase) {
    case 'equal':
      master = error;
      current = error;
      break;
    case 'newErrorsAndFiles':
      master = error;
      current = testCase;
      break;
    case 'onesLessErrorFile':
      tempMaster = identInputForTest('newErrorsAndFiles').masterJSON.replace('.json', '.json');
      master = path.basename(tempMaster, path.extname(tempMaster));
      current = error;
      break;
    case 'oneMoreErrorInExistErrorFile':
      master = error;
      current = testCase;
      break;
    case 'onesLessErrorInExistErrorFile':
      tempMaster = identInputForTest('oneMoreErrorInExistErrorFile').masterJSON.replace('.json', '');
      master = path.basename(tempMaster, path.extname(tempMaster));
      current = error;
      break;
    case 'empty':
      master = testCase;
      current = testCase;
      break;
    default:
      break;
  }

  return {
    masterJSON: path.resolve(fixturePath, `${master}.json`),
    currentJson: path.resolve(fixturePath, `${current}.json`)
  };
};

/**
 * Подготовка конфигурации для работы
 * @param {String} forResult - failed | success
 * @typedef {Object} Config
 * @property {Object} teamcity
 * @property {Object} eslint
 * @return {Config}
 */
prepareConfig = (forResult) => {
  let config = {eslint: {}, teamcity: {}};

  config.eslint = identInputForTest(forResult);
  config.teamcity = {
    login: testUsername,
    pass: testPassword,
    host: testHost,
    projectId: testProjectId,
    buildId: testBuildId
  };

  return config;
};

describe('smoke тест: выставление статуса сборки', () => {
  let buildFailedConditions,
      stdout;
  beforeEach(() => {
    stdout = '';

    process.stdout.write = (function (write) {
      return function (string, encoding, fileDescriptor) {
        stdout += `${string}\n`;
        write.apply(process.stdout, arguments);
      };
    })(process.stdout.write);
  });

  beforeEach(() => {
    buildFailedConditions = require(`${path.resolve(basePackagePath, 'index.js')}`);
  });

  it('прошла', () => {
    let expectedStatus = 'success',
        fixture = mapStatusFixtures[expectedStatus];
    buildFailedConditions(prepareConfig(fixture)).then((result) => {
      expect(result.success).toEqual(true);
      expect(stdout).not.toContain(`##teamcity[buildProblem description='`);
    });
  });

  it('провалилась', () => {
    let expectedStatus = 'failed',
        fixture = mapStatusFixtures[expectedStatus];
    buildFailedConditions(prepareConfig(fixture)).then((result) => {
      expect(result.success).toEqual(false);
      expect(stdout).toContain(`#teamcity[buildProblem description='${testBuildFailedReason}' identity='${testBuildFailedReason}']`);
    });
  });
});
