const path = require('path'),
      teamcityAgentPathMatcher = /.*teamcity-agent\/work\/[0-9a-z]+\//;
let utils = {};

utils.mergePathsFromAnyEnv = mergePathFromAnotherEnv;

/**
 * Удалить специфичный для окружения путь
 * @param {String} path - путь
 * @param {String} env - окружение
 * @return {String} путь без специфичной составляющей
 */
function deleteSpecificPathForEnviroment (path, env) {
  let resultPath = '',
      matchedStr = '';
  switch (env) {
    case 'teamcity':
      matchedStr = teamcityAgentPathMatcher.exec(path)[0];
      resultPath = path.slice(path.indexOf(matchedStr) + matchedStr.length);
      break;
  }

  return resultPath;
}

/**
 * Совместить путь из другого окружения и текущего
 * FIXME: расчитывается на то, что скрипты запускаются из корня проекта
 * @param {String} currentExecutePath - текущий путь запуска скрипта
 * @param {String} pathFromAnotherEnv - путь сформированный в другом окружении
 */
function mergePathFromAnotherEnv (currentPath, pathFromAnotherEnv) {
  console.log('deleted', deleteSpecificPathForEnviroment(pathFromAnotherEnv, 'teamcity'));
  return path.resolve(currentPath, deleteSpecificPathForEnviroment(pathFromAnotherEnv, 'teamcity'));
}

module.exports = utils;
