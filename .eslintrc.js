module.exports = {
  'plugins': ['jasmine'],
  'env': {
    'node': true,
    'jasmine': true,
    'es6': true
  },
  'extends': ['plugin:jasmine/recommended'],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 8,
  },
  'rules': {
    'linebreak-style': [
      'error'
    ],
    // Настройка отступов
    "indent": [
      "warn",
      2,
      {
        "VariableDeclarator": {
          // 4 для var
          "var": 2,
          // 4 для let
          "let": 2,
          // 6 для const
          "const": 3
        },
        "SwitchCase": 1
      }
    ],
    'semi': [
      'error',
      'always',
    ],
    'one-var': ["error", "always"],
    'func-style': ['error', 'declaration', {'allowArrowFunctions': true}],
      'jasmine/no-disabled-tests': 0,
  },
};