module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'airbnb-base',
  env: {
    "browser": true
  },
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'webpack.config.js'
      }
    }
  },
  'rules': {
    'import/extensions': ['error', 'always', {
      'js': 'never'
    }],
    'comma-dangle': ['error', 'only-multiline'],
    'no-unused-expressions': ['error', { 'allowShortCircuit': true }],
    'no-param-reassign': ['error', { "props": false }],
    'no-plusplus':  ['error', { 'allowForLoopAfterthoughts': true }],
    'radix': ['error', 'as-needed'],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-console':  process.env.NODE_ENV === 'production' ? 2 : 0
  }
}