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
    resultJSONPath = path.resolve(path.dirname(procArg[1]), `result.json`);

if (require.main === module) {
  currentJSON = fs.readJSON(`${procArg[procArg.indexOf('-current') + 1]}`);
  masterJSON = fs.readJSON(`${procArg[procArg.indexOf('-master') + 1]}`);
  resultJSONPath = path.resolve(procArg.indexOf('-result') !== -1 ? procArg[procArg.indexOf('-result') + 1] : resultJSONPath);
  main(masterJSON, currentJSON, resultJSONPath);
} else {
  module.exports = {
    main: main,
    countHowMuchKindOfErrors: countHowMuchKindOfErrors
  };
}

// FIXME получать в виде объекта, использовать деструктуризацию
/**
 * Входная точка
 * @param {Object} masterJSON - json с мастер ветки
 * @param {Object} currentJSON - текущий json
 * @param {String} [_resultJSONPath] - путь, куда записывать результат
 * @return {Promise.<Array>} - результат мержа
 */
function main (masterJSON, currentJSON, _resultJSONPath) {
  return Promise.all([masterJSON, currentJSON]).then((resultObjectArrays) => {
    return {
      master: customEslintResultsIterator(resultObjectArrays[0]),
      current: customEslintResultsIterator(resultObjectArrays[1])
    };
  }).then((resultMapsObject) => {
    return getUnicalNewErrors(resultMapsObject.master, resultMapsObject.current);
  }).then((unicalErrors) => {
    writeResult(unicalErrors, _resultJSONPath || path.resolve(process.cwd, 'result.json'));
    return unicalErrors;
  });
};

/**
 * Получение результатов проверки с уникальными сообщений об ошибках
 * @param {LintResult} lintResultCurrent - текущая
 * @param {LintResult} lintResultMaster - мастер
 * @return {LintResult} рузультат проверки с уникальными ошибками
 */
function getLintResultWithUnicalNewMessages (lintResultCurrent, lintResultMaster) {
  let unicalNewMessages = clone(lintResultCurrent),
      result,
      warningCount = 0,
      errorCount = 0;

  unicalNewMessages.messages = lintResultCurrent.messages.filter((item) => {
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
 * @param {Map.<EslintErrorFileName, LintResult[]>} errorsMapCurrent ошибки текущей ветки
 * @param {Map.<EslintErrorFileName, LintResult[]>} errorsMapMaster ошибки ветки
 * @return {LintResult[]} обработанные результаты проверок. Только уникальные
 */
function getUnicalNewErrors (errorsMapMaster, errorsMapCurrent) {
  let errorsMapMasterNotEmpty = errorsMapMaster.size > 0,
      errorsMapCurrentNotEmpty = errorsMapCurrent.size > 0,
      unicalNewErrors = new Map(),
      lintResultWithUnicalNewMessages,
      errorsIsEqual = isEqual(errorsMapCurrent, errorsMapMaster);

  if (errorsMapCurrentNotEmpty && !errorsIsEqual) {
    // Если есть описания ошибок для текущей проверки
    errorsMapCurrent.forEach((value, key) => {
      let masterHasDescriptionOfFile = errorsMapMaster.has(key),
          masterDescriptionOfFile = errorsMapMaster.get(key);

      if (errorsMapMasterNotEmpty && masterHasDescriptionOfFile) {
        lintResultWithUnicalNewMessages = getLintResultWithUnicalNewMessages(value, masterDescriptionOfFile);
        if (lintResultWithUnicalNewMessages) {
          unicalNewErrors.set(key, lintResultWithUnicalNewMessages);
        }
      } else if (value.messages.length > 0) {
      // если в master json нет описания ошибок файла, и описание ошибок файла в текущем json не пусто
        unicalNewErrors.set(key, value);
      }
    });
  }
  return [...unicalNewErrors.values()];
}

/**
 *
 * @param {LintResult} unicalErrors
 * @param {String} _resultJSONPath
 */
function writeResult (unicalErrors, _resultJSONPath) {
  fs.writeJSONSync(_resultJSONPath, unicalErrors);
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

/**
 * Как много ошибок разного вида
 * @param eslintResult
 * @return {{error: number, warning: number}}
 */
function countHowMuchKindOfErrors (eslintResult) {
  let errorCount = 0,
      warningCount = 0;

  eslintResult.forEach((item) => {
    errorCount += item.errorCount;
    warningCount += item.warningCount;
  });

  return {
    error: errorCount,
    warning: warningCount
  };
}
