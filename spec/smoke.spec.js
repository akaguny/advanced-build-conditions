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
    case 'newErrorsAndFiles':
      master = error;
      current = testCase;
      break;
    case 'onesLessErrorFile':
      master = identInputForTest('newErrorsAndFiles').masterInputName;
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

  console.log({
    masterInputName: master,
    currentInputName: current
  });

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
  sh.exec(`cd ${basePackagePath}; node index.js -master ${basePackagePath}/fromMaster.json -current ${basePackagePath}/fromCurrent.json`);
  console.log(`cd ${basePackagePath}; node index.js -master ${basePackagePath}/fromMaster.json -current ${basePackagePath}/fromCurrent.json`);
};

/**
 * Очистить входные данные после теста
 */
clearInputForTest = () => {
  sh.rm(`${basePackagePath}/fromCurrent.json`);
  sh.rm(`${basePackagePath}/fromMaster.json`);
  sh.rm(`${basePackagePath}/result.json`);
};

describe('Смок тест модуля работы с eslint', () => {
  describe('исключающий мерж', () => {
    beforeAll(() => {
      sh.chmod('+x', `${basePackagePath}/index.js`);
    });

    afterEach(() => {
      clearInputForTest();
    });

    it('создан результирующий файл', () => {
      prepareInput('empty');
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
        expect(resultJSON).toEqual([]);
      });

      it('одинаковы', function () {
        let resultFixtureName = 'empty';
        prepareInput('equal');
        runApp();

        resultJSON = readJSON(`${basePackagePath}/result.json`);
        expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
        expect(resultJSON).toEqual(expectedJSON);
      });

      describe('не одинаковы', function () {
        it('новый файл с ошибками', () => {
          let resultFixtureName = 'newErrorsAndFiles';
          prepareInput(resultFixtureName);
          runApp();
          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);

          expect(resultJSON).toEqual(expectedJSON);
        });

        it('новые ошибки в файле, в котором уже были ошибки', () => {
          let resultFixtureName = 'oneMoreErrorInExistErrorFile';
          prepareInput(resultFixtureName);
          runApp();
          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);

          expect(resultJSON).toEqual(expectedJSON);
        });

        it('уменьшение количества ошибок', () => {
          let resultFixtureName = 'onesLessErrorInExistErrorFile';
          prepareInput('onesLessErrorInExistErrorFile');
          runApp();

          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);
          expect(resultJSON).toEqual(expectedJSON);
        });

        it('уменьшение количества файлов с ошибками', () => {
          let resultFixtureName = 'onesLessErrorFile';
          prepareInput('onesLessErrorFile');
          runApp();

          expectedJSON = readJSON(`${resultFixturePath}/${resultFixtureName}.json`);
          resultJSON = readJSON(`${basePackagePath}/result.json`);
          expect(resultJSON).toEqual(expectedJSON);
        });
      });
    });
  });
});
