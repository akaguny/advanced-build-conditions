#!/usr/bin/env node

/** run from commandline:
 * node index.js
 * -master /home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/error.json
 * -current /home/alexey/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/empty.json
 */
/* eslint-env es6:true */
'use-strict';
const fs = require('fs-extra'),
      path = require('path'),
      ensureArray = require('ensure-array'),
      procArg = process.argv,
      allowedModes = {
        eslint: 'eslint'
      };

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

  return runChecks(currentMode, args);
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
  let checkCompletePromise,
      preparedInput;
  switch (mode) {
    case allowedModes.eslint:
      preparedInput = prepareInput(mode, mainArgs);
      checkCompletePromise = require(path.resolve(__dirname, 'lib/eslint')).apply(null, preparedInput)
          .then((mergeResult) => {
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
 * @param {Aray} mainArgs - аргументы
 * @return {Array} подготовленные входные данные
 */
function prepareInput (mode, mainArgs) {
  let currentJSON,
      masterJSON,
      resultJSONPath,
      input;

  switch (mode) {
    case allowedModes.eslint:
      if (currentExecutionMode === 'console') {
        currentJSON = fs.readJSONSync(`${mainArgs[mainArgs.indexOf('-current') + 1]}`);
        masterJSON = fs.readJSONSync(`${mainArgs[mainArgs.indexOf('-master') + 1]}`);
        resultJSONPath = path.resolve(mainArgs.indexOf('-result') !== -1 ? mainArgs[mainArgs.indexOf('-result') + 1] : path.dirname(mainArgs[1]), `result.json`);
      } else {
        currentJSON = fs.readJSONSync(mainArgs.currentJson);
        masterJSON = fs.readJSONSync(mainArgs.masterJSON);
        resultJSONPath = mainArgs.resultJSON ? mainArgs.resultJSON : path.resolve(path.dirname(procArg[1]), `result.json`);
      }
      // FIXME возвращать в виде объекта, использовать деструктуризацию
      input = [masterJSON, currentJSON, resultJSONPath];
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
