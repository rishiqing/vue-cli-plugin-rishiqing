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
const Color = require('./lib/color')

const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
const styleTypes = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus']

function S4() {
  // eslint-disable-next-line no-bitwise
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

const SingleSpaId = `${S4()}-${S4()}-${S4()}`

// 添加 postcss-custom-properties
// 这样在不支持css变量的浏览器可以使用默认值
function addPostcssCustomProperties(rule) {
  rule.options({
    sourceMap: false,
    plugins: [
      postcssCustomProperties({
        importFrom: [
          {
            customProperties: Color.generateColor('#2B88FE'),
          },
        ],
      }),
    ],
  })
}

// 修改vue-style-loader，让style标签可以自定义属性
function changeVueStyleLoader(rule, singletonStyleTag = false) {
  rule
    .loader('@rishiqing/vue-style-loader')
    .options({
      sourceMap: false,
      shadowMode: false,
      singletonStyleTag,
      attrs: {
        'data-single-spa-id': SingleSpaId,
      },
    })
}

// 创建可以获取到项目根目录下的文件的api
function createFetchLocalApi(app, api, filename) {
  app.use(`/fetch-local/${filename}`, (req, res) => {
    const filePath = api.resolve(filename)
    let isExist = false
    try {
      fs.statSync(filePath)
      isExist = true
    } catch (e) {
      // pass
    }
    // 如果文件存在，解析出现了问题，则直接报错
    if (isExist) {
      try {
        const content = fs.readFileSync(filePath, 'utf8')
        res.json(JSON.parse(content))
      } catch (error) {
        console.error(`读取项目根目录下的 ${filename} 文件报错!`)
        console.error(error)
        res.status(500).send({ error: `读取项目根目录下的 ${filename} 文件报错!` })
      }
    } else {
      // 文件不存在
      res.json({ noExist: true })
    }
  })
}

module.exports = (api, projectOptions) => {
  // 获取对本插件的配置信息
  // 写在项目 vue.config.js 文件中, pluginOptions.rishiqing 属性下面
  const pluginConfig = (projectOptions.pluginOptions || {}).rishiqing || {}

  const isDev = process.env.NODE_ENV === 'development'

  // 如果RISHIQING_SINGLE_SPA环境变量等于true，则开启singleSpaConfig相关配置
  // 注意 process.env.RISHIQING_SINGLE_SPA 和 pluginConfig.rishiqingSingleSpa 的区别
  // process.env.RISHIQING_SINGLE_SPA 为 true，表示需要构建用于在rishiqing-front里加载的single-spa项目
  // 而 pluginConfig.rishiqingSingleSpa 只是表示，这个项目是否需要 single-spa 的相关配置
  // 严格来说，pluginConfig.rishiqingSingleSpa 应该取名为 pluginConfig.needConfigForKiteDesign 需要加上kite-design的相关配置
  const isBuildingRishiqingSingleSpa = process.env.RISHIQING_SINGLE_SPA === 'true'

  api.chainWebpack((webpackConfig) => {
    // 配置`DefinePlugin`插件
    webpackConfig
      .plugin('define')
      .tap((options) => {
        options[0] = Object.assign(options[0], {
          RISHIQING_SINGLE_SPA: isBuildingRishiqingSingleSpa,
          ROUTER_BASE: `'${process.env.ROUTER_BASE}'`,
          SINGLE_SPA_ID: `'${SingleSpaId}'`,
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

    // 判断sortableJs这个依赖包，是否在node_modules下面
    let isSortablejsExistInNodeModules = false
    try {
      fs.statSync(path.resolve(process.cwd(), 'node_modules/sortablejs'))
      isSortablejsExistInNodeModules = true
    } catch (e) {
      // pass
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

    // 如果sortablejs 在node_modules下面，则配置一个alias，防止项目里重复引入多个sortablejs
    if (isSortablejsExistInNodeModules) {
      webpackConfig
        .resolve
        .alias
        .set('sortablejs', path.resolve(process.cwd(), 'node_modules/sortablejs'))
    }

    // 把当前仓库下的node_modules也加为loader的搜寻地址
    // 这样方便直接在vue-cli-plugin-rishiqing里安装loader
    // 比如上面加入的 @rishiqing/vue-style-loader
    webpackConfig
      .resolveLoader
      .modules
      .add(path.resolve(__dirname, 'node_modules'))

    // 把 resolve.symlinks置为false, 这样可以避免很多npm link安装的包，在找文件的时候的错误
    webpackConfig
      .resolve
      .set('symlinks', false)

    webpackConfig
      .resolve
      .modules
      .add(path.resolve(__dirname, 'node_modules'))

    // 处理 scss 代码
    Scss(api, webpackConfig)

    // 开发环境下的配置
    if (isDev) {
      // `调试账户选择`功能所需的脚本
      if (pluginConfig.enableDevAccountSel) {
        webpackConfig
          .entry('app')
          .prepend(path.resolve(__dirname, './devAccountSel/dev-account-sel.js'))
          .end()
      }

      // 读取 rsq-dev-account.json 中设置的账号服务器信息
      api.configureDevServer((app) => {
        app.use((req, res, next) => {
          // 响应头设置 CORS
          res.set('Access-Control-Allow-Origin', '*')
          next()
        })
        // 获取项目根目录下面的rsq-dev-account.json文件里的数据
        createFetchLocalApi(app, api, 'rsq-dev-account.json')
        // 获取项目根目录下面的system-config.json文件里的数据
        createFetchLocalApi(app, api, 'system-config.json', false)
      })
    }

    // 当为开发环境并且 pluginConfig.rishiqingSingleSpa为true 可添加kiteDesign的主题颜色变量和normalize.css
    // 获取配置 pluginConfig.forceAddKiteDesignTheme为true 也可实现强制添加主题颜色变量和normalize.css
    if (
      (isDev && pluginConfig.rishiqingSingleSpa && !isBuildingRishiqingSingleSpa)
      || pluginConfig.forceAddKiteDesignThemeColor
    ) {
      webpackConfig
        .entry('app')
        .prepend(path.resolve(__dirname, './assets/insert-color.js'))
        .prepend(path.resolve(__dirname, './assets/normalize.css'))
        .end()
    }

    // 当为开发环境并且 pluginConfig.rishiqingSingleSpa为true 则引入@rishiqing/vue-package里的vueGlobal.js
    // 引入Vue.mixin等Vue的公共操作
    if (isDev && pluginConfig.rishiqingSingleSpa && !isBuildingRishiqingSingleSpa) {
      webpackConfig
        .entry('app')
        .prepend('@rishiqing/vue-package/lib/vueGlobal.js')
        .end()
    }

    if (pluginConfig.rishiqingSingleSpa) {
      // 当构建适用于rishiqing-front的微应用的时候，开启单个style标签模式，即把所有的css样式全部插入到一个style标签
      const singletonStyleTag = isBuildingRishiqingSingleSpa
      types.forEach((type) => {
        styleTypes.forEach((styleType) => {
          addPostcssCustomProperties(
            webpackConfig.module
              .rule(styleType)
              .oneOf(type)
              .use('css-custom-properties')
              .before('postcss-loader') // 让 css-custom-properties 可以出现在 postcss-loader前面
              .loader('postcss-loader'),
          )
          changeVueStyleLoader(webpackConfig.module.rule(styleType).oneOf(type).use('vue-style-loader'), singletonStyleTag)
        })
      })
    }

    const babelPlugins = []
    if (isBuildingRishiqingSingleSpa) {
      // 如果需要打包微应用，则加入自定义的vue-babel插件
      babelPlugins.push([
        path.resolve(__dirname, 'singleSpaBabelPlugin.js'),
      ])
    }

    const babelOptions = {
      presets: [
        [
          '@vue/cli-plugin-babel/preset',
          {
            targets: {
              chrome: '53',
              ie: '11',
            },
            useBuiltIns: 'usage',
            corejs: '3',
          },
        ],
      ],
      plugins: babelPlugins,
    }

    // 判断是否配置了js这个rule
    if (webpackConfig.module.rules.has('js')) {
      // 兼容chrome53
      webpackConfig.module
        .rule('js')
        .use('babel-loader')
        .options(babelOptions)
    }

    // 判断是否配置了ts这个rule
    if (webpackConfig.module.rules.has('ts')) {
      // typescript
      webpackConfig.module
        .rule('ts')
        .use('babel-loader')
        .options(babelOptions)
    }
  })

  if (isBuildingRishiqingSingleSpa) {
    singleSpaConfig(api, projectOptions)
  }

  registerCommand(api)
}

module.exports.defaultModes = registerCommand.defaultModes
