#!/usr/bin/env node

/**
 * run as nodejs module
 * const buildFailedConditions = require('buildFailedConditions');
 * let config = {eslint: {}, teamcity: {}};
 * config.eslint = {
    masterJSON: `/home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/error.json`,
    currentJSON: `/home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/empty.json`
  };
 * config.teamcity = {
    login: testUsername,
    pass: testPassword,
    host: testHost,
    buildTypeId: testBuildTypeId,
    masterBranch: testMasterBranch
  };
 * console.log(buildFailedConditions(config));
 */

/**
 * @typedef {Object} Config
 * @property {TeamcityConfig} teamcity
 * @property {EslintConfig} eslint
 */

/**
 * @typedef {Object} TeamcityConfig
 * @property {String} username - имя пользователя
 * @property {String} password - пароль пользователя
 * @property {String} host - хост, вместе с протоколом и портом
 * @property {String} buildTypeId - id проекта
 * @property {String} buildId - id сборки
 */

/**
 * @typedef {Object} EslintConfig
 * @property {Object} masterJSON - json с мастер ветки
 * @property {Object} currentJSON - текущий json
 * @property {String} resultJSONPath - путь, куда записывать результат
 */
/* eslint-env es6:true */
'use-strict';
const path = require('path'),
      ensureArray = require('ensure-array'),
      procArg = process.argv,
      allowedModes = {
        eslint: 'eslint',
        teamcity: 'teamcity'
      },
      tc = require('./lib/teamcity'),
      utils = require('./lib/utils'),
      clone = require('lodash.clone'),
      errors = require('./lib/errors');

let currentExecutionMode = '';

console.log('require mod');
currentExecutionMode = 'module';
module.exports = main;

/**
 * Главная функция, точка входа
 * @param {config} args
 * @return {Promise}
 */
function main (args) {
  let currentMode = getCurrentMode(args),
      local = isCalledLocal(args);

  console.log('main func args', args);
  return runChecks(currentMode, args, local).then((result) => {
    return result;
  });
};

/**
 * Выполняется ли вызов в режиме локального
 * @param {Array|Сonfig} args
 * @returns {Boolean}
 */
function isCalledLocal (args) {
  return !tc.isTeamcity();
}

/**
 * Определить текущий режим работы
 * @param {Array|Object} - mainArgs массив аргументов коммандной
 * @return {String} - режим
 */
function getCurrentMode (mainArgs) {
  let currentMode;

  for (let mode in allowedModes) {
    if ((currentExecutionMode === 'console' && mainArgs.indexOf(mode) === -1) ||
      (mainArgs.mode && mainArgs.mode.indexOf(mode) === -1)) {
      // TODO: вынести сообщения об ошибках в хелпер
      throw new Error(`Поддерживаемый режим работы не передан
       ${Object.keys(allowedModes)}`);
    } else {
      currentMode = mode;
      break;
    }
  };

  return currentMode;
};

/**
 * @typedef {Promise} ChecksResult
 * @property {String} mode - режим проверки/средство
 * @property {String} success - флаг успешности проверки
 * @property {String} description - описание ошибки
 * @property {Object} eslintErrors -
 * @property {ViolationsCount} violationsCount - нарушения eslint
 */

/**
 * @typedef {Object}
 * @property {Number} error - режим проверки/средство
 * @property {Number} warning - флаг успешности проверки
 */

/**
 * Запустить проверки
 * @param {String} mode - режим
 * @param {Aray} mainArgs - аргументы
 * @param {boolean} isLocal - локальный ли запуск
 * @return {ChecksResult} - обещание окончания проверки
 */
function runChecks (mode, mainArgs, isLocal) {
  console.log('runChecks func args', arguments);
  const eslintModule = require(path.resolve(__dirname, 'lib/eslint'));
  let checkCompletePromise = {};
  switch (mode) {
    case allowedModes.eslint:
      checkCompletePromise = prepareInput(mode, mainArgs, isLocal).then((preparedInput) => {
        return eslintModule.main.apply(null, preparedInput);
      }).then((mergeResult) => {
        const newViolations = ensureArray(mergeResult),
              howMuchKindOfErrors = eslintModule.countHowMuchKindOfErrors(newViolations),
              isSuccess = howMuchKindOfErrors.error === 0;
        return {
          mode: allowedModes,
          success: isSuccess,
          description: isSuccess ? '' : `New ESlint violations Errors:${howMuchKindOfErrors.error} Warnings:${howMuchKindOfErrors.warning}`,
          violationsCount: howMuchKindOfErrors,
          newViolations: newViolations
        };
      })
        .catch((e) => {
          throw new Error(e);
        });
  }

  return checkCompletePromise;
}

/**
 * Подготовить входные данные для режима
 * @param {String} mode - режим
 * @param {Array} mainArgs - аргументы
 * @param {boolean} isLocal - локальный ли запуск
 * @return {Promise} подготовленные входные данные
 */
function prepareInput (mode, mainArgs, isLocal) {
  let currentJSON,
      masterJSON,
      resultJSONPath,
      masterPath,
      input,
      teamcityConfig;

  switch (mode) {
    case allowedModes.eslint:
      currentJSON = Promise.resolve(mainArgs.eslint.currentJSON).then((currentObject) => {
        return currentObject.map((item) => {
          if (isLocal) {
            item.filePath = item.filePath.replace(/\\/g, '/');
          }
          return item;
        });
      });
      masterPath = mainArgs.eslint.masterPath;
      teamcityConfig = prepareInput(allowedModes.teamcity, mainArgs);
      masterJSON = tc.init(teamcityConfig, teamcityConfig.masterBranch).then(() => {
        return tc.getBuildArtifact().then((artifact) => {
          return JSON.parse(artifact).map((item) => {
            // FIXME: захардкожен teamcity, можно выявлять на основе наличия или отсутствия конфига
            item.filePath = utils.mergePathsFromAnyEnv(masterPath, item.filePath, allowedModes.teamcity);
            if (isLocal) {
              item.filePath = item.filePath.replace(/\\/g, '/');
            }
            return item;
          });
        }).catch((e) => {
          if (e instanceof errors.teamcity) {
            // TODO: отрефакторить prepare, прекращать работу модуля на этом этапе
            return currentJSON;
          } else {
            throw new Error(e);
          }
        });
      });
      resultJSONPath = mainArgs.eslint.resultJSON ? mainArgs.eslint.resultJSON : path.resolve(path.dirname(procArg[1]), `result.json`);
      // FIXME возвращать в виде объекта, использовать деструктуризацию
      input = Promise.all([masterJSON, currentJSON, resultJSONPath, masterPath]);
      break;
    case allowedModes.teamcity:
      input = mapTeamcityConfig(mainArgs);
  }

  return input;
}

/**
 * Смаппировать конфигурацию для temcity
 * @param {Config} mainArgs - аргументы
 * @returns {teamcityConfig}
 */
function mapTeamcityConfig (mainArgs) {
  const teamcityConfig = {
    username: mainArgs.login,
    password: mainArgs.password,
    host: '',
    buildTypeId: '',
    buildId: ''
  };
  let _teamcityConfig = clone(mainArgs.teamcity);

  teamcityConfig.username = _teamcityConfig.login;
  teamcityConfig.password = _teamcityConfig.pass;
  teamcityConfig.host = _teamcityConfig.host;
  teamcityConfig.buildTypeId = _teamcityConfig.buildTypeId;
  teamcityConfig.masterBranch = _teamcityConfig.masterBranch;

  return teamcityConfig;
}
