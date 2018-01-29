module.exports = {
  'plugins': ['jasmine'],
  'env': {
    'node': true,
    'jasmine': true,
    'es6': true
  },
  "extends": ["eslint:recommended", 'plugin:jasmine/recommended'],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 8,
  },
  'rules': {
    'linebreak-style': [
      'error'
    ],
    'func-style': ['error', 'declaration', {'allowArrowFunctions': true}],
      'jasmine/no-disabled-tests': 0,
  },
};