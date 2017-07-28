const request = require('request-promise-native'),
      xml2js = require('xml-js').xml2js,
      main = {};
module.exports = main;
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
let creditials = {
      login: '',
      password: '',
      host: ''
    },
    buildId = '';

main.setBuildStatus = setBuildStatus;
main.getBuildArtifact = getBuildArtifact;
main.init = init;

/**
 * Инициализация
 * @param {Creditials} сreditials - реквизиты доступа
 * @param {String} buildName - имя(Id) конфигурации
 * @param {String} [masterBranchName=master] - имя master ветки
 * @param {String} [mode] - решим работы
 */
function init (сreditials, buildName, masterBranchName, mode) {
  setCreditials(creditials);
  setBuildId(buildName, masterBranchName || 'master');
};

/**
 * Установка реквизитов доступа
 * @param {Object}
 */
function setCreditials () {

};

/**
 * Установка статуса сборки
 */
function setBuildStatus () {

};

/**
 * Получение артефакта сборки
 */
function getBuildArtifact () {

};

/**
 * Установка номера сборки
 * @param {String} buildName - имя бранча
 * @param {String} masterBranchName - имя master ветки
 */
function setBuildId (buildName, masterBranchName) {
  buildId = getBuildIdByBuildName(buildName, masterBranchName);
};

/**
 * Id сборки по имени конфигурации и мастер ветке
 * @param {String} buildName - имя сборки
 * @param {String} masterBranchName - имя master ветки
 * @return {Promise.<String>} - id последней удачной сборки по заданным
 * параметрам
 */
function getBuildIdByBuildName (buildName, masterBranchName) {
  const options = { method: 'GET',
    url: `https://${creditials.host}/httpAuth/app/rest/builds/`,
    qs: { locator: `buildType:***REMOVED***,branch:name:${masterBranchName},count:1,status:SUCCESS,state:finished` },
    headers:
        { 'cache-control': 'no-cache'
        },
    auth: {
      user: creditials.login,
      password: creditials.pasword
    }
  };

  request(options)
    .then(function (result) {
      return xml2js(result, {compact: true}).builds.build._attributes.id;
    });
};