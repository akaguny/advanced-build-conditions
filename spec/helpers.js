const path = require('path');
let helpers = {};
/**
 * @typedef {Object} testDataJSONNames имена обозначающие JSON с тестовыми
 * данными
 * @property {String} masterInputName - мастер ветку
 * @property {String} currentInputName - текущую ветку
 */

/**
 * @typedef {object} TestCreditials - тестовые реквизиты
 * @property {String} - login
 * @property {String} - pass
 * @property {String} - host
 * @property {String} - projectId
 * @property {String} - buildId
 */

/**
 * @typedef {Object} TestConfig
 * @property {Object} teamcity
 * @property {Object} eslint
 */

helpers.identInputForTest = identInputForTest;
helpers.prepareConfig = prepareConfig;

/**
 * Идентификация входных данных
 * на основе кейса определяет имена json файлов с тестовыми данными
 * @param {string} testCase - кейс использования:
 * (equal|oneMoreError|oneMoreNewError|empty)
 * @param {String} fixturesPath - путь к фикстурам
 * @param {boolean} notIncludeExtention - не использовать расширение при формировании пути
 * @return {testDataJSONNames}
 */
function identInputForTest (testCase, fixturesPath, notIncludeExtention) {
  let current,
      master,
      error = 'error';

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
      master = identInputForTest('newErrorsAndFiles', fixturesPath, true).masterJSON;
      current = error;
      break;
    case 'oneMoreErrorInExistErrorFile':
      master = error;
      current = testCase;
      break;
    case 'onesLessErrorInExistErrorFile':
      master = identInputForTest('oneMoreErrorInExistErrorFile', fixturesPath, true).masterJSON;
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
    masterJSON: path.resolve(fixturesPath, `${master}${!notIncludeExtention || master.indexOf('.json') !== -1 ? '.json' : ''}`),
    currentJSON: path.resolve(fixturesPath, `${current}${!notIncludeExtention || current.indexOf('.json') !== -1 ? '.json' : ''}`)
  };
};

/**
 * Подготовка конфигурации для работы
 * @param {String} forResult - failed | success
 * @param {TestCreditials} testCreditials - тестовые реквизиты
 * @param {String} fixturesPath - путь к фикстурам
 * @return {TestConfig}
 */
function prepareConfig (forResult, fixturesPath, testCreditials) {
  let config = {eslint: {}, teamcity: {}};

  config.eslint = helpers.identInputForTest(forResult, fixturesPath);
  config.teamcity = {
    login: testCreditials.login,
    pass: testCreditials.pass,
    host: testCreditials.host,
    projectId: testCreditials.projectId,
    buildId: testCreditials.buildId
  };

  return config;
};

module.exports = helpers;
