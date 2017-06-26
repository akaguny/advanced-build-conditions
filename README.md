Пакет для установки переменных окружения.
Есть 2 режима работы, в зависимости от аргументов:
* JSON с настройками
* функция, которая возвращает JSON
Принимает в качестве параметров JSON, в котором должна быть секция teamcityParameters
```
{JSON} teamcityParameters
{STRING} teamcityParameters.key ключ - имя параметра
{*} teamcityParameters.value - значение параметра
```
Для установки значений используется пакет teamcity-service-messages.

Тестирование `npm test`
