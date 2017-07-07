module.exports = {
  'plugins': ['jasmine'],
  'env': {
    'node': true,
    'jasmine': true,
  },
  'extends': ['standard', 'plugin:jasmine/recommended'],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 6,
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
  },
};