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
      isEqual = require('lodash.isequal'),
      clone = require('lodash.clone'),
      procArg = process.argv;
let currentJSON,
    masterJSON,
    resultJSONPath;

if (require.main === module) {
  currentJSON = fs.readJSON(`${procArg[procArg.indexOf('-current') + 1]}`);
  masterJSON = fs.readJSON(`${procArg[procArg.indexOf('-master') + 1]}`);
  resultJSONPath = path.resolve(path.dirname(procArg[1]), `result.json`);
  main(masterJSON, currentJSON);
} else {
  module.exports = main;
}

// FIXME: убрать за флаг, т.к. используется только для отладки
console.log(`${procArg[procArg.indexOf('-current') + 1]}`);
console.log(`${procArg[procArg.indexOf('-master') + 1]}`);
console.log(resultJSONPath);

function main (masterJSON, currentJSON) {
  return Promise.all([masterJSON, currentJSON]).then((resultObjectArrays) => {
    return {
      master: customEslintResultsIterator(resultObjectArrays[0]),
      current: customEslintResultsIterator(resultObjectArrays[1])
    };
  }).then((resultMapsObject) => {
    return getUnicalNewErrors(resultMapsObject.master, resultMapsObject.current);
  }).then((unicalErrors) => {
    writeResult(unicalErrors, resultJSONPath);
  });
};

/**
 * Получение результатов проверки с уникальными сообщений об ошибках
 * @param {LintResult} lintResultMaster - мастер
 * @param {LintResult} lintResultCurrent - текущая
 * @return {LintResult} рузультат проверки с уникальными ошибками
 */
function getLintResultWithUnicalNewMessages (lintResultMaster, lintResultCurrent) {
  let unicalNewMessages = clone(lintResultCurrent),
      result,
      warningCount = 0,
      errorCount = 0;

  unicalNewMessages.messages = lintResultCurrent.messages.filter((item, i) => {
    let elementExist;

    elementExist = lintResultMaster.messages.some((masterItem) => {
      return isEqual(item, masterItem);
    });

    return !elementExist;
  }, 0).map((item) => {
    item.severity.toString() === '1' ? warningCount++ : errorCount++;
    return item;
  });

  unicalNewMessages.warningCount = warningCount;
  unicalNewMessages.errorCount = errorCount;

  if (unicalNewMessages.messages.length > 0) {
    result = unicalNewMessages;
  }
  return result;
}

/**
 * Получить уникальные, новые ошибки. Старые берутся с master ветки
 * @param {Map.<EslintErrorFileName, LintResult[]>} errorsMapMaster ошибки ветки
 * @param {Map.<EslintErrorFileName, LintResult[]>} errorsMapCurrent ошибки текущей ветки
 * @return {LintResult[]} обработанные результаты проверок. Только уникальные
 */
function getUnicalNewErrors (errorsMapMaster, errorsMapCurrent) {
  let errorsMapMasterEmpty = errorsMapMaster.size === 0,
      errorsMapCurrentEmpty = errorsMapCurrent.size === 0,
      unicalNewErrors = new Map(),
      lintResultWithUnicalNewMessages;

  if (!errorsMapCurrentEmpty) {
    if (errorsMapMasterEmpty) {
      unicalNewErrors = [...errorsMapMasterEmpty.values()];
    } else {
      errorsMapCurrent.forEach((value, key) => {
        let masterHasErrorInFile = errorsMapMaster.has(key),
            errorsInFileIsIden = isEqual(value, errorsMapMaster.get(key));

        if (masterHasErrorInFile && !errorsInFileIsIden) {
          lintResultWithUnicalNewMessages = getLintResultWithUnicalNewMessages(errorsMapMaster.get(key), value);
          if (lintResultWithUnicalNewMessages) {
            unicalNewErrors.set(key, lintResultWithUnicalNewMessages);
          }
        } else if (!errorsInFileIsIden) {
          unicalNewErrors.set(key, value);
        }
      });
    }
  }
  return [...unicalNewErrors.values()];
}

/**
 *
 * @param {LintResult} unicalErrors
 * @param {String} resultJSONPath
 */
function writeResult (unicalErrors, resultJSONPath) {
  fs.writeJSON(resultJSONPath, unicalErrors);
}

/**
 * Результаты проверок файлов линтером Eslint
 * @typedef {LintResult[]} EslintResults
 */

/**
 * Имя файла, в котором найдены ошибки
 * @typedef {String} EslintErrorFileName
 */

/**
 * A linting warning or error.
 * @typedef {Object} LintMessage
 * @property {string} message The message to display to the user.
 */

/**
 * A linting result.
 * @typedef {Object} LintResult
 * @property {string} filePath The path to the file that was linted.
 * @property {LintMessage[]} messages All of the messages for the result.
 * @property {number} errorCount Number of errors for the result.
 * @property {number} warningCount Number of warnings for the result.
 * @property {number} fixableErrorCount Number of fixable errors for the result.
 * @property {number} fixableWarningCount Number of fixable warnings for the result.
 * @property {string=} [source] The source code of the file that was linted.
 * @property {string=} [output] The source code of the file that was linted, with as many fixes applied as possible.
 */

/**
 * Итератор по результату eslint
 * @param {EslintResults} _resultObjectArray
 * @return {Map<filePath, LintResult>} объект с key - имя файла с
 * ошибкой
 */
function customEslintResultsIterator (_resultObjectArray) {
  let resultMap = new Map();

  if (_resultObjectArray.length === 1 &&
    Object.keys(_resultObjectArray[0]).length === 0) {
    return resultMap;
  }

  _resultObjectArray.forEach((item) => {
    resultMap.set(item.filePath, item);
  });

  return resultMap;
}
