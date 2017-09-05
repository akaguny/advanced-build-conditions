const sh = require('shelljs'),
      path = require('path'),
      fs = require('fs-extra'),
      basePackagePath = path.resolve(__dirname, '../..'),
      fixturePath = path.resolve(basePackagePath, 'spec', 'fixtures'),
      resultFixturePath = path.resolve(fixturePath, 'result'),
      readJSON = fs.readJSONSync,
      helpers = require('../helpers');

let prepareInput,
    clearInputForTest,
    runAppFromConsole;

/**
 * функия копирует входные json в корень
 * @param {string} testCase - кейс использования:
 * (equal|oneMoreError|oneMoreNewError|empty)
 */
prepareInput = (testCase) => {
  const testDataPath = helpers.identInputForTest(testCase, fixturePath);

  sh.cp(testDataPath.masterJSON, `${basePackagePath}/fromMaster.json`);
  sh.cp(testDataPath.currentJson,
    `${basePackagePath}/fromCurrent.json`);
};

/**
 * Запуск приложения
 * @param {string} [specifyTempPath] - специфичный путь для хранения результата
 */
runAppFromConsole = (specifyTempPath) => {
  console.log(`cd ${basePackagePath}; node index.js eslint -master ${basePackagePath}/fromMaster.json -current ${basePackagePath}/fromCurrent.json`);
  sh.exec(`cd ${basePackagePath}`);
  sh.exec(`node index.js eslint -master ${basePackagePath}/fromMaster.json -current ${basePackagePath}/fromCurrent.json ${specifyTempPath ? '-result ' + specifyTempPath : ''}`);
};

/**
 * Очистить входные данные после теста
 */
clearInputForTest = () => {
  const filesForRemove = [
    `${basePackagePath}/fromCurrent.json`,
    `${basePackagePath}/fromMaster.json`,
    `${basePackagePath}/result.json`
  ];

  filesForRemove.forEach((item) => {
    if (sh.test('-e', item)) {
      sh.rm(item);
    }
  });
};

describe('eslint', () => {
  let resultJSON,
      expectedJSON;

  afterEach(() => {
    clearInputForTest();
  });

  describe('исключающий мерж', () => {
    beforeAll(() => {
      sh.chmod('+x', `${basePackagePath}/index.js`);
    });

    describe('создан результирующий файл', () => {
      it('в папке от куда вызывается скрипт', () => {
        prepareInput('empty');
        runAppFromConsole();

        expect(sh.test('-f', `${basePackagePath}/result.json`)).toBeTruthy();
      });

      it('в указанной папке', () => {
        prepareInput('empty');
        runAppFromConsole(basePackagePath);

        expect(sh.test('-f', `${basePackagePath}/result.json`)).toBeTruthy();
      });
    });

    describe('файлы', function () {
      afterEach(() => {
        resultJSON = undefined;
      });

      it('пусты', function () {
        prepareInput('empty');
        runAppFromConsole();
        expectedJSON = readJSON(`${resultFixturePath}/empty.json`);
        resultJSON = readJSON(`${basePackagePath}/result.json`);

        expect(resultJSON).toEqual([]);
      });

      it('одинаковы', function () {
        let resultFixtureName = 'empty';
        prepareInput('equal');
        runAppFromConsole();

        resultJSON = readJSON(`${basePackagePath}/result.json`);
        expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);

        expect(resultJSON).toEqual(expectedJSON);
      });

      describe('не одинаковы', function () {
        it('новый файл с ошибками', () => {
          let resultFixtureName = 'newErrorsAndFiles';
          prepareInput(resultFixtureName);
          runAppFromConsole();
          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);

          expect(resultJSON).toEqual(expectedJSON);
        });

        it('новые ошибки в файле, в котором уже были ошибки', () => {
          let resultFixtureName = 'oneMoreErrorInExistErrorFile';
          prepareInput(resultFixtureName);
          runAppFromConsole();
          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);

          expect(resultJSON).toEqual(expectedJSON);
        });

        it('уменьшение количества ошибок', () => {
          let resultFixtureName = 'empty';
          prepareInput('onesLessErrorInExistErrorFile');
          runAppFromConsole();

          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);

          expect(resultJSON).toEqual(expectedJSON);
        });

        it('уменьшение количества файлов с ошибками', () => {
          let resultFixtureName = 'onesLessErrorFile';
          prepareInput('onesLessErrorFile');
          runAppFromConsole();

          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);

          expect(resultJSON).toEqual(expectedJSON);
        });
      });
    });
  });

  describe('Интерфейс модуля', () => {
    let buildFailedConditions;

    beforeEach(() => {
      buildFailedConditions = require(`${path.resolve(basePackagePath, 'index.js')}`);
    });

    it('реализует экспорт', () => {
      expect(typeof buildFailedConditions).toEqual('function');
    });

    it('релизует мерж', () => {
      let resultFixtureName = 'oneMoreErrorInExistErrorFile';

      prepareInput(resultFixtureName);
      buildFailedConditions({
        eslint: {
          currentJson: `${basePackagePath}/fromCurrent.json`,
          masterJSON: `${basePackagePath}/fromMaster.json`,
          resultJSON: `${basePackagePath}/result.json`
        }
      }).then(function () {
        expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
        resultJSON = readJSON(`${basePackagePath}/result.json`);

        expect(resultJSON).toEqual(expectedJSON);
      });
    });
  });
});
