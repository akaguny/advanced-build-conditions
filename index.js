#!/usr/bin/env node

/** run from commandline:
 * node index.js
 * eslint
 * -master /home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/error.json
 * -current /home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/empty.json
 * teamcity
 * -login testUsername
 * -pass testPassword
 * -host testHost
 * -projectId testProjectId
 * -buildId testBuildId
 */

/**
 * run as nodejs module
 * const buildFailedConditions = require('buildFailedConditions');
 * let config = {eslint: {}, teamcity: {}};
 * config.eslint = {
    masterJSON: `/home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/error.json`,
    currentJson: `/home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/empty.json`
  };
 * config.teamcity = {
    login: testUsername,
    pass: testPassword,
    host: testHost,
    projectId: testProjectId,
    buildId: testBuildId
  };
 * console.log(buildFailedConditions(config));
 */
/* eslint-env es6:true */
'use-strict';
const fs = require('fs-extra'),
      path = require('path'),
      ensureArray = require('ensure-array'),
      procArg = process.argv,
      allowedModes = {
        eslint: 'eslint'
      },
      tc = require('./lib/teamcity');

let currentExecutionMode = '';

if (require.main === module) {
  currentExecutionMode = 'console';
  main(procArg.slice(1));
} else {
  currentExecutionMode = 'module';
  module.exports = main;
}

/**
 *
 * @param args
 * @return {Promise}
 */
function main (args) {
  let currentMode = getCurrentMode(args);

  return runChecks(currentMode, args).then((result) => {
    reportStatus(result);
    return result;
  });
};

/**
 * Определить текущий режим работы
 * @param {Array} - mainArgs массив аргументов коммандной
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
 * Запустить проверки
 * @param {String} mode - режим
 * @param {Aray} mainArgs - аргументы
 * @return {Promise} - обещание оеончания проверки
 */
function runChecks (mode, mainArgs) {
  let checkCompletePromise;
  switch (mode) {
    case allowedModes.eslint:
      checkCompletePromise = prepareInput(mode, mainArgs).then((preparedInput) => {
        return require(path.resolve(__dirname, 'lib/eslint')).apply(null, preparedInput);
      }).then((mergeResult) => {
        console.log(ensureArray(mergeResult).length === 0);
        return ensureArray(mergeResult).length === 0;
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
 * @return {Promise} подготовленные входные данные
 */
function prepareInput (mode, mainArgs) {
  let currentJSON,
      masterJSON,
      resultJSONPath,
      input,
      eslintConfigSection,
      teamcityConfig,
      teamcityConfigStartPosition,
      currentModeIsConsole = currentExecutionMode === 'console',
      masterPararameterIndex;

  switch (mode) {
    case allowedModes.eslint:
      if (currentModeIsConsole) {
        teamcityConfigStartPosition = mainArgs.indexOf('teamcity');
        eslintConfigSection = mainArgs.slice(mainArgs.indexOf('eslint'), teamcityConfigStartPosition !== -1 ? teamcityConfigStartPosition : mainArgs.length);
        currentJSON = fs.readJSON(`${eslintConfigSection[eslintConfigSection.indexOf('-current') + 1]}`);
        masterPararameterIndex = eslintConfigSection.indexOf('-master');
        if (masterPararameterIndex === -1) {
          teamcityConfig = mapTeamcityConfig(mainArgs);
          tc.init(teamcityConfig, teamcityConfig.buildId);
          masterJSON = tc.getBuildArtifact();
        } else {
          masterJSON = fs.readJSON(eslintConfigSection[masterPararameterIndex + 1]);
        }
        resultJSONPath = path.resolve(eslintConfigSection.indexOf('-result') !== -1 ? eslintConfigSection[eslintConfigSection.indexOf('-result') + 1] : path.dirname(mainArgs[1]), `result.json`);
      } else {
        currentJSON = fs.readJSON(mainArgs.eslint.currentJson);
        masterJSON = fs.readJSON(mainArgs.eslint.masterJSON);
        resultJSONPath = mainArgs.eslint.resultJSON ? mainArgs.eslint.resultJSON : path.resolve(path.dirname(procArg[1]), `result.json`);
      }
      // FIXME возвращать в виде объекта, использовать деструктуризацию
      input = Promise.all([masterJSON, currentJSON, resultJSONPath]);
  }

  return input;
}

/**
 * Выставление статуса
 * @param {Boolean} isSuccess
 * @param {String} [reason='']
 */
function reportStatus (isSuccess, reason) {
  let _reason = reason ? `=== Reason: ${reason}` : '';
  console.log(`\n\n=== Build ${isSuccess ? 'Success' : 'Failed'}\n${_reason}`);
};

/**
 * @typedef {Object} teamcityConfig
 * @property {String} username - имя пользователя
 * @property {String} password - пароль пользователя
 * @property {String} host - хост, вместе с протоколом и портом
 * @property {String} projectId - id проекта
 * @property {String} buildId - id сборки
 */

/**
 * Смаппировать конфигурацию для temcity
 * @param {Array} mainArgs - аргументы
 * @returns {teamcityConfig}
 */
function mapTeamcityConfig (mainArgs) {
  const teamcityConfig = {
    username: '',
    password: '',
    host: '',
    projectId: '',
    buildId: ''
  };
  let positionOfTcConf;

  if (currentExecutionMode === 'console') {
    positionOfTcConf = mainArgs.indexOf('teamcity');
    teamcityConfig.username = mainArgs.indexOf('login', positionOfTcConf);
    teamcityConfig.password = mainArgs.indexOf('pass', positionOfTcConf);
    teamcityConfig.host = mainArgs.indexOf('host', positionOfTcConf);
    teamcityConfig.projectId = mainArgs.indexOf('projectid', positionOfTcConf);
    teamcityConfig.buildId = mainArgs.indexOf('buildid', positionOfTcConf);
  } else {
    teamcityConfig.username = mainArgs.login;
    teamcityConfig.password = mainArgs.pass;
    teamcityConfig.host = teamcityConfig.host;
    teamcityConfig.projectId = teamcityConfig.projectId;
    teamcityConfig.buildId = teamcityConfig.buildId;
  }
}
