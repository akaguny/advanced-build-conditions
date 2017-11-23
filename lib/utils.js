const path = require('path'),
      agentPathMatcher = {teamcity: /.*teamcity-agent\/work\/[0-9a-z]+\//};
let utils = {};

utils.mergePathsFromAnyEnv = mergePathFromAnotherEnv;
utils.isVerboseMode = isVerboseMode;

/**
 * Удалить специфичный для окружения путь
 * @param {String} path - путь
 * @param {RegExp|String} patternForEnv - шаблон в виде RegExp характеризующий часть пути окружения или сосбственно часть пути
 * @return {String} путь без специфичной составляющей
 */
function deleteSpecificPathForEnviroment (path, patternForEnv) {
  let resultPath = '',
      matchedStr = '';
  matchedStr = patternForEnv instanceof RegExp ? patternForEnv.exec(path)[0] : patternForEnv;
  resultPath = path.slice(path.indexOf(matchedStr) + matchedStr.length);

  return resultPath;
}

/**
 * Совместить путь из другого окружения и текущего
 * FIXME: расчитывается на то, что скрипты запускаются из корня проекта
 * @param {String} currentBasePath - текущий путь запуска скрипта
 * @param {String} pathFromAnotherEnv - путь сформированный в другом окружении
 * @param {String} env - окружение
 * @param {RegExp} [customEnvPathMatcher] - заданный матчер постоянной составляющей пути окружения
 * @return {String} результирующий путь
 */
function mergePathFromAnotherEnv (currentBasePath, pathFromAnotherEnv, env, customEnvPathMatcher) {
  if (typeof agentPathMatcher[env] === 'undefined' && typeof customEnvPathMatcher === 'undefined') {
    throw new Error(`Параметр env ${env ? env + ' не поддерживается' : 'не задан'}`);
  }
  return path.join(currentBasePath, deleteSpecificPathForEnviroment(pathFromAnotherEnv, customEnvPathMatcher || agentPathMatcher[env]));
}

/**
 * Режим расширенного логирования
 * @returns {boolean} режим расширенного логирования включен
 */
function isVerboseMode (){
  return process.argv.indexOf('--verbose') !== -1
}

module.exports = utils;
