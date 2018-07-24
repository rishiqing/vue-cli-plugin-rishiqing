/*
* @Author: qinyang
* @Date:   2018-07-24 00:37:16
* @Last Modified by:   qinyang
* @Last Modified time: 2018-07-24 00:53:34
*/
module.exports = (api, config) => {
  // 添加 sass-resources-loader
  // 指定一个文件 src/styles/common-resources.scss
  // 用来存放所有公共mixin和变量等
  config.module
    .rule('scss')
    .oneOf('vue')
    .use('sass-resources')
    .loader('sass-resources-loader')
    .options({
      sourceMap: false,
      resources: [
        api.resolve('src/styles/common-resources.scss'),
      ]
    })
  config.module
    .rule('scss')
    .oneOf('normal')
    .use('sass-resources')
    .loader('sass-resources-loader')
    .options({
      sourceMap: false,
      resources: [
        api.resolve('src/styles/common-resources.scss'),
      ]
    })

  // 添加 resolve-url-loader 
  // 用来解析scss代码里的url里指定的静态文件，如图片和字体文件
  config.module
    .rule('scss')
    .oneOf('vue')
    .use('resolve-url')
    .before('sass-loader')
    .loader('resolve-url-loader')
    .options({
      debug: false,
      root: api.resolve('src')
    })
  config.module
    .rule('scss')
    .oneOf('normal')
    .use('resolve-url')
    .before('sass-loader')
    .loader('resolve-url-loader')
    .options({
      debug: true,
      root: api.resolve('src')
    })

  // 修改 sass-loader 的 options
  // 因为 resolve-url-loader 需要 sourceMap，所以需要把sourceMap置为true
  config.module
    .rule('scss')
    .oneOf('vue')
    .use('sass-loader')
    .tap(options => {
      return Object.assign({}, options, {
        sourceMap: true
      });
    })
  config.module
    .rule('scss')
    .oneOf('normal')
    .use('sass-loader')
    .tap(options => {
      return Object.assign({}, options, {
        sourceMap: true
      });
    })
}