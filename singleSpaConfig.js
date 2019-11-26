const WebpackSystemRegister = require('@rishiqing/webpack-system-register')

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

    // const ExternalsList = [
    //   'vue',
    //   'vuex',
    //   'vue-router',
    //   // 'vue-rx',
    //   'axios',
    //   // '@rishiqing/sdk',
    //   '@rishiqing/kite-design/dist/kite-basic',
    //   '@rishiqing/kite-design/dist/kite-business',
    //   'kite-basic',
    //   'kite-business',
    //   '@rishiqing/kite-design/dist/kite-basic.css',
    //   '@rishiqing/kite-design/dist/kite-business.css',
    // ]

    webpackConfig.externals = [
      // 暂时屏蔽掉提取公共包，因为会导致版本依赖的问题
      // function externals(context, request, callback) {
      //   if (ExternalsList.includes(request)) {
      //     return callback(null, `var window.app.require('${request}')`)
      //   }
      //   callback()
      // },
    ]

    webpackConfig.plugins.push(new WebpackSystemRegister({
      systemjsDeps: [
        /^share-data/,
      ],
    }))
  })
}
