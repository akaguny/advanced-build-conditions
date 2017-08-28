const xml2js = require('xml2js').parseString,
      fetch = require('node-fetch'),
      base64Encode = require('base64url'),
      eslintTeamcityReporter = require('eslint-teamcity'),
      main = {},
      /**
 * Реквизиты доступа
 * @typedef {Object} Creditials
 * @property {String} login - логин
 * @property {String} pasword - пароль
 * @property {String} [projectId] - id для поиска сборки
 * @property {String} [host] - url сервера teamcity
 */

      /**
 * @type {Creditials}
 */
      creditials = {
        login: '',
        password: '',
        host: ''
      };

module.exports = main;

let buildId = '';

main.setBuildStatus = setBuildStatus;
main.setBuildProblem = setBuildProblem;
main.getBuildArtifact = getBuildArtifact;
main.prepareEslintReportForTeamcity = prepareEslintReportForTeamcity;
main.init = init;

/**
 * Инициализация
 * @param {Creditials} _сreditials - реквизиты доступа
 * @param {String} buildName - имя(Id) конфигурации
 * @param {String} [masterBranchName=master] - имя master ветки
 * @param {String} [mode] - решим работы
 * @return {Promise} - статус инициализации
 */
function init (_сreditials, masterBranchName, mode) {
  let pending = [];
  setCreditials(_сreditials);
  pending.push(setLatestSuccessfullBuildId(masterBranchName || 'master'));

  return Promise.all(pending);
};

/**
 * Установка реквизитов доступа
 * @param {Creditials} _сreditials - реквизиты доступа
 */
function setCreditials (_creditials) {
  creditials.host = _creditials.host;
  creditials.login = _creditials.login;
  creditials.password = _creditials.password;
  creditials.projectId = _creditials.projectId;
};

/**
 * Установка статуса сборки
 * @param {String} status - статус сборки
 * @param {String} [reason] - причина
 */
function setBuildStatus (status, reason) {
  console.log(`##teamcity[buildStatus status='${status}' text='${reason}']`);
};

/**
 * Получение артефакта сборки
 */
function getBuildArtifact () {
  const options = { method: 'GET',
    url: `${creditials.host}/repository/download/${creditials.projectId}/${buildId}:id/reports.zip%21/eslint.json`,
    headers:
            { 'cache-control': 'no-cache',
              // TODO: вынести реквизиты в base64 в переменную на этапе init
              'Authorization': 'Basic ' + base64Encode(`${creditials.login}:${creditials.password}`)
            }
  };

  console.log('\n\noptions.url', options.url, '\n\n');
  return fetch(options.url, options).then(function (response) {
    return response.text();
  });
};

/**
 * Установка номера последней удачной сборки
 * @param {String} masterBranchName - имя master ветки
 */
function setLatestSuccessfullBuildId (masterBranchName) {
  return getBuildIdByBuildName(masterBranchName).then((_buildId) => {
    buildId = _buildId;
  });
};

/**
 * Id сборки по имени конфигурации и мастер ветке
 * @param {String} masterBranchName - имя master ветки
 * @return {Promise.<String>} - id последней удачной сборки по заданным
 * параметрам
 */
function getBuildIdByBuildName (masterBranchName) {
  const options = { method: 'GET',
    url: `${creditials.host}/httpAuth/app/rest/builds?locator=buildType:${creditials.projectId},branch:name:${masterBranchName},count:1,status:SUCCESS,state:finished`,
    headers:
        { 'cache-control': 'no-cache',
          'Authorization': 'Basic ' + base64Encode(`${creditials.login}:${creditials.password}`)
        }
  };

  console.log('\n\noptions.url', options.url, '\n\n');
  return fetch(options.url, options).then(function (response) {
    return response.text().then(result => {
      let buildId;
      xml2js(result, function (err, parsed) {
        if (err) {
          console.log('\n\nError, when send request', '\n\n');
          throw new Error(err);
        }

        buildId = parsed.builds.build[0].$.id;
      });

      return buildId;
    });
  }).catch(function (err) {
    throw new Error(err);
  });
};

/**
 * представление результатов проверки eslint в виде teamcity test
 * https://confluence.jetbrains.com/display/TCD10/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-ReportingTests
 * @param {Object} eslintJsonReport - данные JSON объекта
 */
function prepareEslintReportForTeamcity (eslintJsonReport) {
  console.log(eslintTeamcityReporter(eslintJsonReport));
}

/**
 * Установка проблем сборки
 * @param {String} problemDescription - текстовое описание проблемы
 * @param {String} problemTypeId - идентификатор проблемы
 */
function setBuildProblem (problemDescription, problemTypeId) {
  console.log(`##teamcity[buildProblem description='${problemDescription}' identity='${problemTypeId ? problemTypeId : ''}']`);
}