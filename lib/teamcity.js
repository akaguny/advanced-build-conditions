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
        username: '',
        password: '',
        host: ''
      };

module.exports = main;

let buildId = '';

main.setBuildStatus = setBuildStatus;
main.setBuildProblem = setBuildProblem;
main.reportStatus = reportStatus;
main.setBuildName = setBuildName;
main.getBuildArtifact = getBuildArtifact;
main.prepareEslintReportForTeamcity = prepareEslintReportForTeamcity;
main.init = init;

/**
 * Инициализация
 * @param {Creditials} _creditials - реквизиты доступа
 * @param {String} buildName - имя(Id) конфигурации
 * @param {String} [masterBranchName=master] - имя master ветки
 * @param {String} [mode] - решим работы
 * @return {Promise} - статус инициализации
 */
function init (_creditials, masterBranchName, mode) {
  let pending = [];
  setCreditials(_creditials);
  pending.push(setLatestSuccessfullBuildId(encodeURIComponent(masterBranchName) || 'master'));

  return Promise.all(pending);
};

/**
 * Установка реквизитов доступа
 * @param {Creditials} _сreditials - реквизиты доступа
 */
function setCreditials (_creditials) {
  ['host', 'username', 'password', 'projectId'].forEach(item => {
    if (_creditials[item]) {
      creditials[item] = _creditials[item];
    } else {
      throw new Error(`No much argument ${item} from creditials`);
    }
  });
};

/**
 * Выставление статуса
 * @param {String} currentMode - текущий режим
 * @param {Boolean} isSuccess - флаг статуса
 * @param {String} [reason=''] - причина
 */
function reportStatus (currentMode, isSuccess, reason) {
  let _reason;

  switch (currentMode) {
    case 'teamcity':
      if (!isSuccess) {
        setBuildProblem(reason, reason);
      }
      break;
    default:
      _reason = reason ? `=== Reason: ${reason}` : '';
      console.log(`\n\n=== Build ${isSuccess}\n${_reason}`);
  }
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
    // TODO: настраиваемый путь до нужного артефакта, сейчас зашито: reports.zip%21/eslint.json
    url: `${creditials.host}/repository/download/${creditials.projectId}/${buildId}:id/reports.zip%21/eslint.json`,
    headers:
            { 'cache-control': 'no-cache',
              // TODO: вынести реквизиты в base64 в переменную на этапе init
              'Authorization': 'Basic ' + base64Encode(`${creditials.username}:${creditials.password}`)
            }
  };

  console.log('\n\noptions.url', options.url, '\n\n');
  return fetch(options.url, options).then(function (response) {
    return response.text();
  }).catch((e) => {
    throw new Error(e);
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
          'Authorization': 'Basic ' + base64Encode(`${creditials.username}:${creditials.password}`)
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
        } else if (!parsed.builds.build) {
          throw new Error(`No much any successfull build for buildType:${creditials.projectId} and branch:${masterBranchName}`);
        } else {
          buildId = parsed.builds.build[0].$.id;
        }
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
  console.log(`##teamcity[buildProblem description='${problemDescription}' identity='${problemTypeId || ''}']`);
}

/**
 * Установка имени сборки
 * @param {String} buildName - имя сборки
 */
function setBuildName (buildName) {
  console.log(`##teamcity[buildNumber '${buildName}']`);
}
