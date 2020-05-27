const WebpackSystemRegister = require('@rishiqing/webpack-system-register')
const VuePackageExtarnal = require('@rishiqing/vue-package-external')

module.exports = function singleSpaConfig(api) {
  const isDev = process.env.NODE_ENV === 'development'

  api.chainWebpack((webpackChain) => {
    webpackChain.plugins.delete('html')
    webpackChain.plugins.delete('preload')
    webpackChain.plugins.delete('prefetch')
  })

  api.configureWebpack((webpackConfig) => {
    // 不再对 entry.app 重新赋值了
    // 如果entry.app是个数组，现在 @rishiqing/webpack-system-register 也能正常处理
    // 之前entry.app如果是数组，会出问题
    // webpackConfig.entry = {
    //   app: './src/main.js',
    // }
    webpackConfig.output.filename = '[name].js'

    webpackConfig.optimization = {
      runtimeChunk: false,
      splitChunks: false,
    }

    // 只有构建线上环境的时候才抽取公共依赖包，方便本地调试
    if (!isDev) {
      webpackConfig.externals = [
        VuePackageExtarnal(),
      ]
    }

    // 打包的时候，忽略掉一些包
    webpackConfig.module.rules.push({
      test: [
        ...isDev ? [] : [
          // 忽略kite-design里的css (只在线上环境才去除，开发环境不去除)
          /@rishiqing\/kite-design\/.*\.css$/,
        ],
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
