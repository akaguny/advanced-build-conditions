# advanced build conditions
Решение для выставление статусов сборки ct(continues test) на основе дополнительных
проверок, основанных на результатах проверок unit тестов, линтеров и т.д.

---
[![Flow](./img/flow358.jpg)](./img/flow.jpg)
[![Flow](./img/before358.jpg)](./img/before.jpg)
[![Flow](./img/after358.jpg)](./img/after.jpg)
## Установка
`npm i advanced-build-conditions@^2.0.2-beta --save-dev`
### Требования
* NodeJs 8+
* npm5
* linux(желательно)
## Использование
```
const buildFailedConditions = require('buildFailedConditions'),
procCwd = process.cwd(),
// for use that npm install eslint-teamcity --save
eslintTeamcity = require('eslint-teamcity'),
// for use that npm install eslint --save
eslintCodeframe = require('eslint/lib/formatters/codeframe');
let config = {eslint: {}, teamcity: {}};
config.teamcity = {
  host: testHost,
  buildTypeId: testBuildTypeId,
  masterBranch: testMasterBranch
};
config.local = !process.env.TEAMCITY_VERSION;
console.log(buildFailedConditions(config));
```
#### Описание:
## Конфигурация teamcity
## Grunt таск
Скоро... есть прототип, заведена задача #13
## Модули
### Teamcity
Позволяет взаимодействовать с teamcity по REST, читать параметры сборки и взаимодействовать через teamcity service messages.

### Eslint
Умеет сравнивать 2 результата проверок codestyle и выявляет униклаьные

### Участие в разработке
Задачи и обсуждения заводятся в issue.
Проверка codestyle и запуск юнит-тестов выполняется автоматически
по PR в репозиторий. Для локального запуска тестов и проверок codestyle необходимо запустить
соответственно `npm test` и `npm codestyle`

## Внимание - известные ограничения
Если в путях присутствуют пробелы, то модуль работать не будет!
  
## Полезные ссылки
* [teamcity service messages](https://confluence.jetbrains.com/display/TCD10/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-Supportedtestservicemessages)
* [eslint-teamcity](https://www.npmjs.com/package/eslint-teamcity)
* [teamcity-properties](https://www.npmjs.org/package/teamcity-properties)

# TODO:
- убрать:
  * убрать лишние параметры:
    - config.eslint.masterPath на ci можно узнать из переменной окружения, локльно поиском package/.git
  * переделать api главного модуля:
   `{onMetricChange, onCommandExecuteFail, onCustomFunctionExecuteResultFail} = require('advanced-build-conditions');`
    - onMetricChange может принимать что-то вроде
    ```javascript
    ['eslintViolations'|'karmaCoverage']:{
      compare: ['>'|'<'|'==='|'>='|'<='|'!='],
      with: 'function' | 'branchName'
    }
    ```

    ```javascript
    {
      eslintViolations : {
        compare: ['>'|'<'|'==='|'>='|'<='|'!='],
        with: 'master'
      },
      karmaCoverage: {
        compare: '>=',
        with: function (branches) {
          return branches[0];  
        }
      }
    }

    ```
  * использовать lib @XFree/grunt-eslint-differ