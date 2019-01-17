/*
* @Author: qinyang
* @Date:   2018-07-21 16:16:05
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-01-17 15:09:16
*/
const webpack = require('webpack');
const Sprites = require('./sprites');
const Scss = require('./scss');
const MemoryFS = require('memory-fs');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const path = require('path');
const fs = require('fs');

const provideConfigMap = {
  R_URL: ['@/constants/url', 'default']
};

module.exports = (api, projectOptions) => {
  // 获取对本插件的配置信息
  // 写在项目 vue.config.js 文件中, pluginOptions 属性
  const pluginConfig = (projectOptions.pluginOptions || {}).rishiqing || {};

  api.chainWebpack(config => {
    // 修改 webpack.DefinePlugin 插件的配置项
    config
      .plugin('define')
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
        }, {})]);
    }

    // lib 文件夹专用来放置公共基础代码
    // 把rishiqing指向vue-cli-plugin-rishiqing/lib文件夹
    // 方便在业务代码里引用
    // 比如 import client from 'rishiqing/client' 即可方便引用 client
    config
      .resolve
      .alias
      .set('rishiqing', 'vue-cli-plugin-rishiqing/lib');

    // 处理 scss 代码
    Scss(api, config);

    // 路径大小写敏感插件
    config
      .plugin('CaseSensitivePathsPlugin')
      .use(CaseSensitivePathsPlugin);

    // `调试账户选择`功能所需的脚本
    if (process.env.NODE_ENV === 'development') {
      if (pluginConfig.enableDevAccountSel) {
        config
          .entry('app')
          .prepend(path.join(__dirname, 'devAccountSel', 'dev-account-sel.js'))
          .end();
      }

      // 读取 rsq-dev-account.json 中设置的账号服务器信息
      api.configureDevServer((app, server) => {
        app.use('/fetch-local/rsq-dev-account.json', (req, res) => {
          let theFilePath = api.resolve('rsq-dev-account.json');
          try {
            let theFileStr = fs.readFileSync(theFilePath, 'utf8');
            res.json(JSON.parse(theFileStr));
          } catch (error) {
            console.error("读取rsq-dev-account.json文件报错！");
            console.error(error);
            res.status(500).send({ error: '服务端读取rsq-dev-account.json文件报错！' });
          }
        });
      });
    }
  })

  // 运行，生成雪碧图
  api.registerCommand('sprites', () => {
    const chain = api.resolveChainableWebpackConfig();
    // 把devServer配置给删掉
    chain.devServer.clear();
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