/* eslint-disable no-console */
const webpack = require('webpack')
const MemoryFS = require('memory-fs')
const Sprites = require('./sprites')

module.exports = function registerCommand(api) {
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
