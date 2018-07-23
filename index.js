/*
* @Author: qinyang
* @Date:   2018-07-21 16:16:05
* @Last Modified by:   qinyang
* @Last Modified time: 2018-07-23 00:42:47
*/
const webpack = require('webpack');

const provideConfigMap = {
  R_URL: ['@/constants/url', 'default']
};

module.exports = (api, projectOptions) => {
  const pluginConfig = projectOptions.pluginOptions.rishiqing || {};
  api.chainWebpack(config => {
    config
      .plugin('define') // 修改 webpack.DefinePlugin 插件的配置项
      .tap((options) => {
        options[0] = Object.assign(options[0], {
          __DEV__: process.env.NODE_ENV === 'development'
        });
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
  })
}