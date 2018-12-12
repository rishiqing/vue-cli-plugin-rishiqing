/*
* @Author: qinyang
* @Date:   2018-07-21 16:16:05
 * @Last Modified by: caoHao
 * @Last Modified time: 2018-12-11 21:35:39
*/
const webpack = require('webpack');
const Sprites = require('./sprites');
const Scss    = require('./scss');
const MemoryFS = require('memory-fs');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')

const provideConfigMap = {
  R_URL: ['@/constants/url', 'default']
};

module.exports = (api, projectOptions) => {
  const pluginConfig = (projectOptions.pluginOptions || {}).rishiqing || {};
  api.chainWebpack(config => {
    config
      .plugin('define') // 修改 webpack.DefinePlugin 插件的配置项
      .tap((options) => {
        options[0] = Object.assign(options[0], pluginConfig.define);
        return options;
      });
    const provideConfig = pluginConfig.provide || {};
    const provideConfigKeys = Object.keys(provideConfig).filter(item => provideConfigMap[item]);
    if (provideConfigKeys.length) {
      config
        .plugin('provide')
        .use(webpack.ProvidePlugin, [provideConfigKeys.reduce((acc, item) => {
          acc[item] = provideConfigMap[item];
          return acc;
        } ,{})]);
    }
    config
      .resolve
        .alias
        // lib 文件夹专用来放置公共基础代码
        // 把rishiqing指向vue-cli-plugin-rishiqing/lib文件夹
        // 方便在业务代码里引用
        // 比如 import client from 'rishiqing/client' 即可方便引用 client
        .set('rishiqing', 'vue-cli-plugin-rishiqing/lib');
    Scss(api, config); // 处理 scss 代码
    config
      .plugin('CaseSensitivePathsPlugin')
      .use(CaseSensitivePathsPlugin)
  })

  // 运行，生成雪碧图
  api.registerCommand('sprites', () => {
    const chain = api.resolveChainableWebpackConfig();
    // 把devServer配置给删掉
    chain.devServer.clear()
    Sprites(api, chain);
    const fs = new MemoryFS();
    const compiler = webpack(chain.toConfig());
    compiler.outputFileSystem = fs;
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }
      console.log('sprites DONE!');
    });
  })
}

module.exports.defaultModes = {
  sprites: 'development'
}