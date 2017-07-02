const sh = require('shelljs'),
      path = require('path'),
      fs = require('fs-extra'),
      basePackagePath = path.resolve(__dirname, '..'),
      fixturePath = path.resolve(__dirname, 'fixtures'),
      resultFixturePath = path.resolve(__dirname, 'fixtures', 'result'),
      readJSON = fs.readJSONSync;

let prepareInput,
    identInputForTest,
    clearInputForTest,
    runApp;
/**
 * Идентификация входных данных
 * на основе кейса определяет имена json файлов с тестовыми данными
 * @param {string} testCase - кейс использования:
 * (equal|oneMoreError|oneMoreNewError|empty)
 * @typedef {Object} testDataJSONNames имена обозначающие JSON с тестовыми
 * данными
 * @property {String} masterInputName - мастер ветку
 * @property {String} currentInputName - текущую ветку
 * @return {testDataJSONNames}
 */
identInputForTest = (testCase) => {
  let current,
      master,
      error = 'error';

  switch (testCase) {
    case 'equal':
      master = error;
      current = error;
      break;
    case 'oneMoreErrorFile':
      master = error;
      current = testCase;
      break;
    case 'onesLessErrorFile':
      master = identInputForTest('oneMoreErrorFile').masterInputName;
      current = error;
      break;
    case 'oneMoreErrorInExistErrorFile':
      master = error;
      current = testCase;
      break;
    case 'onesLessErrorInExistErrorFile':
      master = identInputForTest('oneMoreErrorInExistErrorFile').masterInputName;
      current = testCase;
      break;
    case 'empty':
      master = testCase;
      current = testCase;
      break;
    default:
      break;
  }
  return {
    masterInputName: master,
    currentInputName: current
  };
};

/**
 * функия копирует входные json в корень
 * @param {string} testCase - кейс использования:
 * (equal|oneMoreError|oneMoreNewError|empty)
 */
prepareInput = (testCase) => {
  const testDataPath = identInputForTest(testCase);

  sh.cp(`${fixturePath}/${testDataPath.masterInputName}.json`, `${basePackagePath}/fromMaster.json`);
  sh.cp(`${fixturePath}/${testDataPath.currentInputName}.json`,
    `${basePackagePath}/fromCurrent.json`);
};

/**
 * Запуск приложения
 */
runApp = () => {
  sh.exec(`cd ${basePackagePath}; node index.js
       -master ${__dirname}/fromMaster.json
       -merge ${__dirname}/fromCurrent.json`);
};

/**
 * Очистить входные данные после теста
 */
clearInputForTest = () => {
  sh.rm(`${basePackagePath}/fromCurrent.json`);
  sh.rm(`${basePackagePath}/fromMaster.json`);
};

describe('Смок тест модуля работы с eslint', () => {
  describe('исключающий мерж', () => {
    beforeAll(() => {
      sh.chmod('+x', `${basePackagePath}/index.js`);
    });

    afterAll(() => {
      clearInputForTest();
    });

    it('создан результирующий файл', () => {
      runApp();

      expect(sh.test('-f', `${basePackagePath}/result.json`)).toBeTruthy();
    });

    describe('файлы идентичны', function () {
      let resultJSON,
          expectedJSON;

      afterEach(() => {
        resultJSON = undefined;
      });

      it('пусты', function () {
        prepareInput('empty');
        runApp();
        expectedJSON = readJSON(`${resultFixturePath}/empty.json`);
        resultJSON = readJSON(`${basePackagePath}/result.json`);
        expect(resultJSON).toEqual(0);
      });

      it('одинаковы', function () {
        prepareInput('equal');
        runApp();

        resultJSON = readJSON(`${basePackagePath}/result.json`);
        expect(resultJSON.length).toEqual(0);
      });

      describe('не одинаковы', function () {
        it('новый файл с ошибками', () => {
          prepareInput('oneMoreErrorFile');
          runApp();

          resultJSON = readJSON(`${basePackagePath}/result.json`);
        });

        it('новые ошибки в файле, в котором уже были ошибки', () => {
          prepareInput('oneMoreErrorInExistErrorFile');
          runApp();

          resultJSON = readJSON(`${basePackagePath}/result.json`);
        });

        it('уменьшение количества ошибок', () => {
          prepareInput('onesLessErrorInExistErrorFile');
          runApp();

          resultJSON = readJSON(`${basePackagePath}/result.json`);
        });

        it('уменьшение количества файлов с ошибками', () => {
          prepareInput('onesLessErrorFile');
          runApp();

          resultJSON = readJSON(`${basePackagePath}/result.json`);
        });
      });
    });
  });
});
