/*
* @Author: qinyang
* @Date:   2018-07-21 16:46:58
 * @Last Modified by: qile
 * @Last Modified time: 2019-11-29 16:03:36
*/

// 这是 https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-eslint/eslintOptions.js
// 里提供的一个方法，可以在扩展 .eslintrc.js 或者 vue.config.js 等配置文件的时候
// 可以通过扩展 package.json 里对应的字段的方式，来修改对应的配置文件
// 这个方法，可以实现 往 package.json里写入类似于 process.env.NODE_ENV === 'production' ? 'error' : 'off'
// 这样需要执行js的代码
// __expression is a special flag that allows us to customize stringification
// output when extracting configs into standalone files
function makeJSOnlyValue(str) {
  const fn = () => { }
  // eslint-disable-next-line no-underscore-dangle
  fn.__expression = str
  return fn
}

// eslint-disable-next-line no-unused-vars
module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      'build-beta': 'vue-cli-service build --mode beta',
      'build-release': 'vue-cli-service build --mode release',
      deploy: 'rishiqing-deploy',
      start: 'vue-cli-service serve',
    },
    devDependencies: {
      'rishiqing-deploy': '^2.0.9',
      'sass-resources-loader': '^1.3.3',
      'resolve-url-loader': '^2.3.0',
      'babel-plugin-import': '^1.13.0',
      'worker-loader': '^2.0.0',
    },
  })

  // 基础 vue.config.js 参数设置
  api.extendPackage({
    vue: {
      lintOnSave: false,
      // baseUrl Deprecated since Vue CLI 3.3, 使用 publicPath 替代
      publicPath: makeJSOnlyValue('process.env.BASE_URL'),
      devServer: {
        port: makeJSOnlyValue('process.env.PORT || 3001'),
        proxy: {
          '/task': {
            target: 'https://www.rishiqing.com',
            changeOrigin: true,
            logLevel: 'debug',
            protocolRewrite: 'http',
          },
        },
      },
      // 将lib文件夹下的代码进行babel转化——modify cwp
      transpileDependencies: ['vue-cli-plugin-rishiqing'],
    },
  })

  // 基础 babel.config.js 参数设置
  api.extendPackage({
    babel: {
      plugins: [
        ['import',
          {
            libraryName: '@rishiqing/kite-design',
            libraryDirectory: 'lib/components',
            style: name => `${name}/style.css`,
          },
        ],
      ],
    },
  })

  // 向 vue.config.js 中写入本插件的 配置信息
  if (options.presetCodeList.includes('constants')) {
    api.extendPackage({
      vue: {
        pluginOptions: {
          rishiqing: {
            provide: {
              // 设为`false`,则不添加此全局模块
              R_URL: true,
            },
            define: {
              __DEV__: makeJSOnlyValue('process.env.NODE_ENV === \'development\''),
            },
          },
        },
      },
    })
  }

  // prompts 如果中用户选择 devAccountSel 功能，则置 true
  if (options.presetCodeList.includes('devAccountSel')) {
    api.extendPackage({
      vue: {
        pluginOptions: {
          rishiqing: {
            enableDevAccountSel: true,
          },
        },
      },
    })
  }

  if (options.presetCodeList.includes('services')) {
    api.extendPackage({
      dependencies: {
        axios: '^0.19.0',
      },
    })
  }

  if (options.presetCodeList.includes('xss')) {
    api.extendPackage({
      dependencies: {
        xss: '^1.0.3',
      },
    })
    // api.injectImports(api.entryFile, 'import \'@/lib/filter/xss\'')
  }

  if (options.presetCodeList.includes('sprites')) {
    api.extendPackage({
      scripts: {
        sprites: 'vue-cli-service sprites',
      },
    })
  }

  if (options.presetCodeList.includes('i18n')) {
    api.extendPackage({
      dependencies: {
        'vue-i18n': '^8.4.0',
      },
    })

    // 向 main.js 写入东西
    api.injectImports(api.entryFile, 'import i18n from \'./i18n\'')
    api.injectRootOptions(api.entryFile, 'i18n,')
  }

  if (options.presetCodeList.includes('rishiqingSingleSpa')) {
    api.extendPackage({
      dependencies: {
        '@rishiqing/kite-design': '^1.0.1',
        axios: '^0.19.0',
      },
      eslintConfig: {
        globals: {
          RISHIQING_SINGLE_SPA: true,
          ROUTER_BASE: true,
          SINGLE_SPA_ID: true,
        },
      },
      vue: {
        css: {
          extract: false,
        },
        pluginOptions: {
          rishiqing: {
            rishiqingSingleSpa: true,
          },
        },
      },
    })
    // 因为 rishiqingSingleSpa里直接覆盖了main.js文件，所以，如果引入了i18n，需要再单独处理
    if (options.presetCodeList.includes('i18n')) {
      api.injectImports(api.entryFile, 'import i18n from \'./i18n\'')
      api.injectRootOptions(api.entryFile, 'i18n,')

      api.injectImports('src/singleSpa.js', 'import i18n from \'./i18n\'')
      api.injectRootOptions('src/singleSpa.js', 'i18n,')
    }
  }
  // .eslintrc.js 配置
  const eslintGlobals = {
    // 默认把__DEV__加进去
    __DEV__: true,
    KITE_DESIGN_THEME_COLOR: true,
  }

  if (options.presetCodeList.includes('constants')) {
    eslintGlobals.R_URL = true
  }

  api.extendPackage({
    eslintConfig: {
      rules: {
        'import/prefer-default-export': 'off',
        'no-console': 'error',
        'no-debugger': 'error',
        'consistent-return': 'off',
        'no-underscore-dangle': 'off',
        'import/no-extraneous-dependencies': 'off',
        'arrow-body-style': 'off',
        'object-curly-newline': 'off',
        'no-param-reassign': ['error', { ignorePropertyModificationsFor: ['error'] }],
        // 不写分号，但如果下一行是 [, (, /, +, or - 开头，则上一行必须写分号
        semi: ['error', 'never', { beforeStatementContinuationChars: 'always' }],
      },
      globals: eslintGlobals,
    },
  })

  api.postProcessFiles((files) => {
    if (files['.gitignore']) {
      files['.gitignore'] += '\n'
      // 忽略调试账号配置文件
      files['.gitignore'] += 'rsq-dev-account.json\n'
    }
  })

  if (options.presetCodeList.includes('init')) {
    // 先渲染默认的模板文件
    api.render('./template', Object.assign({}, options, rootOptions))
  }

  // 根据用户的需要，预置代码
  options.presetCodeList.forEach((item) => {
    if (item === 'init') return
    api.render(`./${item}`, Object.assign({}, options, rootOptions))
  })
}
