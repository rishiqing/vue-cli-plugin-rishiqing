/* eslint-disable no-console */
/*
* @Author: qinyang
* @Date:   2018-07-21 16:16:05
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:10:59
*/
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack')
const MemoryFS = require('memory-fs')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const path = require('path')
const fs = require('fs')
const Scss = require('./scss')
const Sprites = require('./sprites')

module.exports = (api, projectOptions) => {
  // 获取对本插件的配置信息
  // 写在项目 vue.config.js 文件中, pluginOptions 属性
  const pluginConfig = (projectOptions.pluginOptions || {}).rishiqing || {}

  api.chainWebpack((webpackConfig) => {
    // 配置`DefinePlugin`插件
    webpackConfig
      .plugin('define')
      .tap((options) => {
        options[0] = Object.assign(options[0], pluginConfig.define)
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

    // 处理 scss 代码
    Scss(api, webpackConfig)

    // 路径大小写敏感插件
    webpackConfig
      .plugin('CaseSensitivePathsPlugin')
      .use(CaseSensitivePathsPlugin)

    // `调试账户选择`功能所需的脚本
    if (process.env.NODE_ENV === 'development') {
      if (pluginConfig.enableDevAccountSel) {
        webpackConfig
          .entry('app')
          .prepend(path.join(__dirname, 'devAccountSel', 'dev-account-sel.js'))
          .end()
      }

      // 读取 rsq-dev-account.json 中设置的账号服务器信息
      api.configureDevServer((app) => {
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
  })

  // 注册`生成雪碧图`命令
  api.registerCommand('sprites', () => {
    const chain = api.resolveChainableWebpackConfig()
    // 把devServer配置给删掉
    chain.devServer.clear()
    Sprites(api, chain)
    const mfs = new MemoryFS()
    const compiler = webpack(chain.toConfig())
    compiler.outputFileSystem = mfs
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err)
        if (err.details) {
          console.error(err.details)
        }
        return
      }

      const info = stats.toJson()

      if (stats.hasErrors()) {
        console.error(info.errors)
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings)
      }
      console.log('sprites DONE!')
    })
  })
}

module.exports.defaultModes = {
  sprites: 'development',
}
