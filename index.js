/* eslint-disable no-console */
/*
* @Author: qinyang
* @Date:   2018-07-21 16:16:05
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:10:59
*/
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack')
const postcssCustomProperties = require('postcss-custom-properties')
const path = require('path')
const fs = require('fs')
const Scss = require('./scss')
const registerCommand = require('./registerCommand')
const singleSpaConfig = require('./singleSpaConfig')

const types = ['vue-modules', 'vue', 'normal-modules', 'normal']

// 添加 postcss-custom-properties
// 这样在不支持css变量的浏览器可以使用默认值
function addPostcssCustomProperties(rule) {
  rule.tap(options => Object.assign({}, options, {
    plugins: function plugins() {
      return [
        postcssCustomProperties({
          importFrom: [
            path.resolve(__dirname, './assets/kite-design-theme-color.css'),
            path.resolve(__dirname, './assets/kite-design-func-color.css'),
          ],
        }),
      ]
    },
  }))
}

module.exports = (api, projectOptions) => {
  // 获取对本插件的配置信息
  // 写在项目 vue.config.js 文件中, pluginOptions 属性
  const pluginConfig = (projectOptions.pluginOptions || {}).rishiqing || {}

  const KITE_DESIGN_THEME_COLOR = fs
    .readFileSync(path.resolve(__dirname, './assets/kite-design-theme-color.css'), 'utf8')
    .replace(/\n/g, '')

  api.chainWebpack((webpackConfig) => {
    // 配置`DefinePlugin`插件
    webpackConfig
      .plugin('define')
      .tap((options) => {
        options[0] = Object.assign(options[0], {
          KITE_DESIGN_THEME_COLOR: `'${KITE_DESIGN_THEME_COLOR}'`,
          RISHIQING_SINGLE_SPA: process.env.RISHIQING_SINGLE_SPA === 'true',
          ROUTER_BASE: `'${process.env.ROUTER_BASE}'`,
        }, pluginConfig.define)
        return options
      })

    // 配置`ProvidePlugin`插件,添加全局模块，目前只有一个 R_URL
    const provideConfig = pluginConfig.provide || {}
    const provideConfigMap = {
      R_URL: ['@/constants/url', 'default'],
    }
    // 插件配置中此`true`且 provideConfigMap 中存在
    const theKeys = Object.keys(provideConfig).filter(item => provideConfig[item] && provideConfigMap[item])
    if (theKeys.length) {
      // 过滤 provideConfigMap
      const optionForProvide = theKeys.reduce((tempObj, item) => {
        tempObj[item] = provideConfigMap[item]
        return tempObj
      }, {})

      const optArr = []
      optArr.push(optionForProvide)

      webpackConfig
        .plugin('provide')
        .use(webpack.ProvidePlugin, optArr)
    }

    // lib 文件夹专用来放置公共基础代码
    // 把rishiqing指向vue-cli-plugin-rishiqing/lib文件夹
    // 方便在业务代码里引用
    // 比如 import client from 'rishiqing/client' 即可方便引用 client
    webpackConfig
      .resolve
      .alias
      .set('rishiqing', 'vue-cli-plugin-rishiqing/lib')
      // kite-design 里会依赖 r-request
      .set('r-request', path.resolve(__dirname, './lib/r-request.js'))
      // 只所以配置vue和vuex的alias，是为了保证在打包构建过程中，vue和vuex始终只用当前项目下安装的
      // 不会出现不同的第三方包，引入不同的vue或者vuex的问题
      // 之前由于引入不同的vue，导致kite-design里的k-modal不能正常使用的问题
      // https://github.com/vuejs/vue/issues/6698
      .set('vue', path.resolve(process.cwd(), 'node_modules/vue'))
      .set('vuex', path.resolve(process.cwd(), 'node_modules/vuex'))

    // 把 resolve.symlinks置为false, 这样可以避免很多npm link安装的包，在找文件的时候的错误
    webpackConfig
      .resolve
      .set('symlinks', false)

    // 处理 scss 代码
    Scss(api, webpackConfig)

    if (process.env.NODE_ENV === 'development') {
      // `调试账户选择`功能所需的脚本
      if (pluginConfig.enableDevAccountSel) {
        webpackConfig
          .entry('app')
          .prepend(path.resolve(__dirname, './devAccountSel/dev-account-sel.js'))
          .end()
      }

      if (pluginConfig.rishiqingSingleSpa) {
        // 添加css变量 & 浏览器样式初始化
        webpackConfig
          .entry('app')
          .prepend(path.resolve(__dirname, './assets/normalize.css'))
          .prepend(path.resolve(__dirname, './assets/kite-design-theme-color.css'))
          .prepend(path.resolve(__dirname, './assets/kite-design-func-color.css'))
          .end()
      }

      // 读取 rsq-dev-account.json 中设置的账号服务器信息
      api.configureDevServer((app) => {
        app.use((req, res, next) => {
          // 响应头设置 CORS
          res.set('Access-Control-Allow-Origin', '*')
          next()
        })
        app.use('/fetch-local/rsq-dev-account.json', (req, res) => {
          const theFilePath = api.resolve('rsq-dev-account.json')
          try {
            const theFileStr = fs.readFileSync(theFilePath, 'utf8')
            res.json(JSON.parse(theFileStr))
          } catch (error) {
            console.error('读取rsq-dev-account.json文件报错！')
            console.error(error)
            res.status(500).send({ error: '服务端读取rsq-dev-account.json文件报错！' })
          }
        })
      })
    }

    if (pluginConfig.rishiqingSingleSpa) {
      types.forEach(type => addPostcssCustomProperties(webpackConfig.module.rule('scss').oneOf(type).use('postcss-loader')))
    }
  })

  // 如果RISHIQING_SINGLE_SPA环境变量等于true，则开启singleSpaConfig相关配置
  if (process.env.RISHIQING_SINGLE_SPA === 'true') {
    singleSpaConfig(api, projectOptions)
  }

  registerCommand(api)
}

module.exports.defaultModes = registerCommand.defaultModes
