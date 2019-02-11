module.exports = {
    'root': true,
    'env': {
        node: true,
    },
    'extends': [
        'airbnb-base'
    ],
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
}
