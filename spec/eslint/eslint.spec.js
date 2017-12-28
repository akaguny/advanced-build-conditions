const path = require('path'),
      fs = require('fs-extra'),
      basePackagePath = path.resolve(__dirname, '../..'),
      fixturePath = path.resolve(basePackagePath, 'spec', 'fixtures'),
      resultFixturePath = path.resolve(fixturePath, 'result'),
      readJSON = fs.readJSONSync,
      helpers = require('../helpers');

describe('eslint', () => {
  let eslintModule;

  beforeEach(() => {
    eslintModule = require(`${basePackagePath}/lib/eslint.js`);
  });

  describe('файлы', function () {
    it('пусты', function () {
      let resultFixtureName = 'empty';

      expect(eslintModule.diff(helpers.prepareEslintPartOfConfig(resultFixtureName, fixturePath))).toEqual([]);
    });

    it('одинаковы', function () {
      let resultFixtureName = 'empty';

      expect(eslintModule.diff(helpers.prepareEslintPartOfConfig(resultFixtureName, fixturePath))).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
    });

    describe('не одинаковы', function () {
      it('новый файл с ошибками', () => {
        let resultFixtureName = 'newErrorsAndFiles';

        expect(eslintModule.diff(helpers.prepareEslintPartOfConfig(resultFixtureName, fixturePath))).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });

      it('новые ошибки в файле, в котором уже были ошибки', () => {
        let resultFixtureName = 'oneMoreErrorInExistErrorFile';

        expect(eslintModule.diff(helpers.prepareEslintPartOfConfig(resultFixtureName, fixturePath))).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });

      it('уменьшение количества ошибок', () => {
        let resultFixtureName = 'empty';

        expect(eslintModule.diff(helpers.prepareEslintPartOfConfig(resultFixtureName, fixturePath))).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });

      it('уменьшение количества файлов с ошибками', () => {
        let resultFixtureName = 'onesLessErrorFile';

        expect(eslintModule.diff(helpers.prepareEslintPartOfConfig(resultFixtureName, fixturePath))).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });
    });
  });

  describe('Интерфейс модуля реализует', () => {
    let eslintModule;

    beforeEach(() => {
      eslintModule = require(`${basePackagePath}/lib/eslint.js`);
    });

    it('экспорт', () => {
      expect(typeof eslintModule.diff).toEqual('function');
    });

    it('подсчёт количества ошибок типа error и warning', () => {
      const jsonWithDifferentKindOfErrors = readJSON(`${fixturePath}/oneErrorAndOnewarning.json`);

      expect(eslintModule.countHowMuchKindOfErrors(jsonWithDifferentKindOfErrors)).toEqual({
        error: 3,
        warning: 1
      });
    });
  });
});
