module.exports = {
  'root': true,
  'env': {
    node: true,
    browser: true,
  },
  'extends': [
    'airbnb-base'
  ],
  'parser': 'babel-eslint',
  'rules': {
    'no-console': 'error',
    'no-debugger': 'error',
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'global-require': 'off',
    "prefer-destructuring": 0,
    'max-len': 0,
    'no-param-reassign': [
      'error',
      {
        "ignorePropertyModificationsFor": [
          'error',
        ],
      },
    ],
    'semi': [
      'error',
      'never',
      {
        "beforeStatementContinuationChars": 'always',
      },
    ],
    'no-plusplus': [
      'error',
      {
        "allowForLoopAfterthoughts": true
      }
    ],
    'no-unused-expressions': [
      'error',
      {
        "allowShortCircuit": true
      }
    ]
  },
  'globals': {
    RISHIQING_SINGLE_SPA: true,
    ROUTER_BASE: true,
    SINGLE_SPA_ID: true,
  },
}
