const WebpackSystemRegister = require('@rishiqing/webpack-system-register')
const ExternalsList = require('@rishiqing/vue-package/lib/externalList')

module.exports = function singleSpaConfig(api) {
  api.chainWebpack((webpackChain) => {
    webpackChain.plugins.delete('html')
    webpackChain.plugins.delete('preload')
    webpackChain.plugins.delete('prefetch')
  })

  api.configureWebpack((webpackConfig) => {
    webpackConfig.entry = {
      app: './src/main.js',
    }
    webpackConfig.output.filename = '[name].js'

    webpackConfig.optimization = {
      runtimeChunk: false,
      splitChunks: false,
    }

    webpackConfig.externals = [
      function externals(context, request, callback) {
        if (ExternalsList.includes(request)) {
          return callback(null, `var window.__rsq_common_package__.require('${request}')`)
        }
        callback()
      },
    ]

    // 打包的时候，忽略掉一些包
    webpackConfig.module.rules.push({
      test: [
        // 忽略kite-design里的css
        /@rishiqing\/kite-design\/.*\.css$/,
        // 忽略systemjs，打包成微应用，不能再引入systemjs
        /systemjs/,
      ],
      use: 'null-loader',
    })

    webpackConfig.plugins.push(new WebpackSystemRegister({
      systemjsDeps: [
        /^share-data/,
      ],
    }))

    /**
     * 由于webpack在内部也引入了System.js，但我们在项目中使用System.import()的时候
     * 需要使用自己主工程引入的System.js，因此此处需要将webpack中的system配置为false。
     */
    webpackConfig.module.rules.push({ parser: { system: false } })
  })
}
