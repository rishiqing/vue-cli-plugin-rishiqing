/*
* @Author: qinyang
* @Date:   2018-07-21 16:46:58
 * @Last Modified by: caoHao
 * @Last Modified time: 2018-12-13 09:40:05
*/
const fs = require('fs');

// 这是 https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-plugin-eslint/eslintOptions.js
// 里提供的一个方法，可以在扩展 .eslintrc.js 或者 vue.config.js 等配置文件的时候
// 可以通过扩展package.json里对应的字段的方式，来修改对应的配置文件
// 这个方法，可以实现 往 package.json里写入类似于 process.env.NODE_ENV === 'production' ? 'error' : 'off'
// 这样需要执行js的代码
// __expression is a special flag that allows us to customize stringification
// output when extracting configs into standalone files
function makeJSOnlyValue(str) {
  const fn = () => { }
  fn.__expression = str
  return fn
};

module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      "build-beta": "vue-cli-service build --mode beta",
      "build-release": "vue-cli-service build --mode release",
      "deploy": "rishiqing-deploy --config='.rishiqing-deploy.yml'"
    },
    devDependencies: {
      "rishiqing-deploy": "^1.0.4",
      "webpack-spritesmith": "^0.5.1",
      "sass-resources-loader": "^1.3.3",
      "resolve-url-loader": "^2.3.0",
      "case-sensitive-paths-webpack-plugin": "^2.1.2"
    }
  });

  if (options.presetCodeList.includes('services')) {
    api.extendPackage({
      dependencies: {
        "axios": "^0.18.0"
      }
    });
  }

  if (options.presetCodeList.includes('xss')) {
    api.extendPackage({
      dependencies: {
        "xss": "^1.0.3"
      }
    });
    api.injectImports(api.entryFile, `import '@/lib/filter/xss'`);
  }

  if (options.presetCodeList.includes('sprites')) {
    api.extendPackage({
      scripts: {
        "sprites": "vue-cli-service sprites"
      }
    });
  }

  if (options.presetCodeList.includes('constants')) {
    api.extendPackage({
      vue: {
        pluginOptions: {
          rishiqing: {
            provide: {
              R_URL: true
            },
            define: {
              __DEV__: makeJSOnlyValue(`process.env.NODE_ENV === 'development'`)
            }
          }
        }
      }
    });
  }
  if (options.presetCodeList.includes('i18n')) {
    api.extendPackage({
      dependencies: {
        "vue-i18n": "^8.4.0"
      }
    });
    //向main.js写入东西
    api.injectImports(api.entryFile, `import i18n from './i18n'`)
    api.injectRootOptions(api.entryFile, `i18n,`)
  }

  api.extendPackage({
    vue: {
      lintOnSave: false,
      baseUrl: makeJSOnlyValue('process.env.BASE_URL'),
      devServer: {
        port: makeJSOnlyValue('process.env.PORT || 3001')
      },
      transpileDependencies: ["vue-cli-plugin-rishiqing"]//将lib文件夹下的代码进行babel转化——modify cwp
    }
  });

  const eslintGlobals = {
    __DEV__: true // 默认把__DEV__加进去
  };

  if (options.presetCodeList.includes('constants')) {
    eslintGlobals.R_URL = true;
  }

  api.extendPackage({
    eslintConfig: {
      rules: {
        'import/prefer-default-export': 'off',
        'no-console': 'error',
        'no-debugger': 'error',
        'consistent-return': 'off',
        'no-param-reassign': ['error', { ignorePropertyModificationsFor: ['error'] }],
        'semi': ['error', 'never', { beforeStatementContinuationChars: 'always' }] // 不写分号，但如果下一行是 [, (, /, +, or - 开头，则上一行必须写分号
      },
      globals: eslintGlobals
    }
  });

  api.postProcessFiles(files => {
    if (files['.gitignore']) {
      files['.gitignore'] += '\n# rishiqing-deploy config file\n';
      files['.gitignore'] += '.rishiqing-deploy.yml\n';
    }
    if (files['public/index.html']) {
      files['public/index.html'] = files['public/index.html'].replace(/<%= BASE_URL %>favicon\.ico/, '//res-front-cdn.timetask.cn/common/img/web-icon/icon.png');
    }
  })

  // 根据用户的需要，预置代码
  options.presetCodeList.forEach(item => {
    api.render(`./${item}`, options);
  })
  api.render('./template', options);
}