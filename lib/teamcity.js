const main = {
  'setCreditials': setCreditials,
  'setBuildStatus': setBuildStatus,
  'getBuildArtifact': getBuildArtifact,
  'setBuildName': setBuildName,
  'init': init
};

/**
 * Реквизиты доступа
 * @typedef {Object} Creditials
 * @property {String} login - логин
 * @property {String} pasword - пароль
 * @property {String} host - url сервера teamcity
 */

/**
 * @type {Creditials}
 */
let creditials = {
  login: '',
  password: '',
  host: ''
};

module.exports = main;

/**
 * Инициализация
 * @param {Creditials} сreditials - реквизиты доступа
 * @param {String} [mode] - решим работы
 */
function init (сreditials, mode) {
  setCreditials(creditials);

}

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
 */
function setBuildName () {

};