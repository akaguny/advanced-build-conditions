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
### nodejs module
```
const buildFailedConditions = require('buildFailedConditions'),
let config = {eslint: {}, teamcity: {}};

config.eslint = {
  // https://eslint.org/docs/user-guide/configuring
};

config.teamcity = {
  // Опциональный параметр
  // buildTypeId: process.env.TEAMCITY_BUILD_TYPE_ID,
  // Опциональный параметр
  // serverUrl: process.env.TEAMCITY_SERVER_URL,
  login: process.env.TEAMCITY_AUTH_USERID,
  password: process.env.TEAMCITY_AUTH_PASSWORD,
  // string|function
  branch: function (branches) {
    return branches[0];
  };
}
console.log(buildFailedConditions(config));
```
#### Описание:
config.eslint.masterPath - путь к базовой директории,директории в которую происходит чекаут(локально)
config.eslint.masterJSON - путь к json с сервера, json с результатами проверки мастер ветки. Если параметр отстутсвует,
то json будет скачан с сервера на основании конфигурации config.teamcity.
config.eslint.currentJSON - путь к текущему json, полученному как результат проверки eslint с форматтером json и выводом
по указанному пути
config.eslint.resultJSON - путь, по которому будет сохранён JSON с новыми ошибками.
## Конфигурация teamcity
Для использования получения config.eslint.masterJSON с сервера с использованием модуля teamcity необходимо:
* на вкладке `General Settings` настроек проекта сборки выставить
 `Build number format:` в значение `%teamcity.build.branch%`.
* заполнить/дополнить поле `Artifact paths:` таким образом, что-бы папка, указанная как путь к resultJSON в конфигурации
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
    eslintViolations:{
      compare: [>|<|=|!=],
      with: ['local'|'master'|'function']
    }
    ```
    или
    `eslintViolations > master`/`eslintViolations != master`/`karmaCoverage < master`
  * использовать lib @XFree/grunt-eslint-differ