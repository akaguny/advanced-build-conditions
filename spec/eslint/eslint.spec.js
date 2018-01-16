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

  describe('файлы', () => {
    it('пусты', async () => {
      let resultFixtureName = 'empty';

      expect(await eslintModule.diff(helpers.prepareConfig(resultFixtureName, fixturePath).eslint)).toEqual([]);
    });

    it('одинаковы', async () => {
      let resultFixtureName = 'empty';

      expect(await eslintModule.diff(helpers.prepareConfig(resultFixtureName, fixturePath).eslint)).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
    });

    describe('не одинаковы', () => {
      it('новый файл с ошибками', async () => {
        let resultFixtureName = 'newErrorsAndFiles';

        expect(await eslintModule.diff(helpers.prepareConfig(resultFixtureName, fixturePath).eslint)).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });

      it('новые ошибки в файле, в котором уже были ошибки', async () => {
        let resultFixtureName = 'oneMoreErrorInExistErrorFile';

        expect(await eslintModule.diff(helpers.prepareConfig(resultFixtureName, fixturePath).eslint)).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });

      it('уменьшение количества ошибок', async () => {
        let resultFixtureName = 'empty';

        expect(await eslintModule.diff(helpers.prepareConfig(resultFixtureName, fixturePath).eslint)).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
      });

      it('уменьшение количества файлов с ошибками', async () => {
        let resultFixtureName = 'onesLessErrorFile';

        expect(await eslintModule.diff(helpers.prepareConfig(resultFixtureName, fixturePath).eslint)).toEqual(readJSON(`${resultFixturePath}/${resultFixtureName}.json`));
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
