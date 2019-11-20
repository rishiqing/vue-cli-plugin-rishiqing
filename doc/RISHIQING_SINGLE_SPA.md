## rishiqingSingleSpa项目初始化配置

### 初始化rishiqingSingleSpa项目

假设你要初始化一个项目叫: rishiqing-kanban

```shell
vue create rishiqing-kanban
```

根据提示，选择`rishiqing`这个preset，然后回车

![84D64C97-D9FD-48D2-A52C-ECD551068B9D](assets/84D64C97-D9FD-48D2-A52C-ECD551068B9D.png)

之后就会进入自动安装依赖包，安装完成之后，vue-cli会自动invoke vue-cli-plugin-rishiqing，然后根据提示，选择对应的预置代码：

![C34BE5B6-0233-4F81-AEF5-4FD60AFD1692](assets/C34BE5B6-0233-4F81-AEF5-4FD60AFD1692.png)

在默认勾选的几个配置上，再勾选上 `rishiqingSingleSpa`，余下的根据需求选择，然后按回车

接下来就是根据插件的提示，填写CDN, 项目地址前缀, 调试端口, 然后插件会自动进一步安装所需依赖，以及生成默认代码。



### 开发环境

#### RISHIQING_SINGLE_SPA

项目初始化之后，在`.env.*`文件里，会预置一个名为`RISHIQING_SINGLE_SPA`的环境变量，这个环境变量的值可配置为`true`或者`false`。

`RISHIQING_SINGLE_SPA`为true，表示应用打包的时候，会打包成一个微应用，必须要接入主工程之后才能使用

`RISHIQING_SINGLE_SPA`为false，表示应用还是按照常规打包，方便单独开发调试

`.env.beta`和`.env.release`里的`RISHIQING_SINGLE_SPA`都默认为`true`

`.env.local`里的`RISHIQING_SINGLE_SPA` 默认为`false`

而我们的开发环境，主要是根据`RISHIQING_SINGLE_SPA`来区分的，为`true`的时候，就开启微应用模式，为`false`的时候，就开启普通模式

#### 微应用模式

当`.env.*`文件里的`RISHIQING_SINGLE_SPA`置为`true`的时候，就会开启微应用模式。开启微应用模式，会做如下特殊处理

##### 删掉html相关插件

```js
api.chainWebpack((webpackChain) => {
  webpackChain.plugins.delete('html')
  webpackChain.plugins.delete('preload')
  webpackChain.plugins.delete('prefetch')
})
```

会删掉和index.html有关的插件，在微应用模式下，我们不需要html文件作为入口

##### 修改js入口文件

```js
webpackConfig.entry = {
  app: './src/main.js',
}
webpackConfig.output.filename = '[name].js'
```

把entry统一配置为 `./src/main.js`，且生成一个名为app.js的文件。

假设你在初始化项目的时候，项目地址前缀，也就是`.env.*`文件里的BASE_URL填的是 `/app/kanban`，项目运行起来的端口是 3001，那么这个微应用的js文件的路径就是: http://localhost:3001/app/kanban/app.js

##### 禁止掉runtimeChunk和splitChunks

```js
webpackConfig.optimization = {
  runtimeChunk: false,
  splitChunks: false,
}
```

##### 把部分第三方库配置成external

```js
const ExternalsList = [
  'vue',
  'vuex',
  'vue-router',
  // 'vue-rx',
  'axios',
  // '@rishiqing/sdk',
  '@rishiqing/kite-design/dist/kite-basic',
  '@rishiqing/kite-design/dist/kite-business',
  'kite-basic',
  'kite-business',
  '@rishiqing/kite-design/dist/kite-basic.css',
  '@rishiqing/kite-design/dist/kite-business.css',
]

webpackConfig.externals = [
  function externals(context, request, callback) {
    if (ExternalsList.includes(request)) {
      return callback(null, `var window.app.require('${request}')`)
    }
    callback()
  },
]
```

`ExternalsList`里列出的这几个库，在微应用打包的时候，不会直接把这些库的代码直接打包到app.js文件里，而是调用`window.app.require`直接从主工程里引用。这样可以有效的减小微应用的体积。

但这样也会带来版本依赖的问题，比如kite-design，项目A需要依赖0.0.30，项目B需要依赖0.0.35，如果都统一从主工程里引入了，那么kite-design的版本肯定只有一个，所以会带来问题

##### 使用webpackSystemRegister处理一些特殊包

```js
webpackConfig.plugins.push(new WebpackSystemRegister({
  systemjsDeps: [
    /^share-data/,
  ],
}))
```



#### 普通模式

##### kite-design-theme-color.css

普通模式下，会引入 kite-design的10个主题颜色变量，以及对应的rgb变量：

```css
:root {
  --kite-theme-color-1: #f0f9ff;
  --kite-theme-color-1-rgb: 240, 249, 255;
  --kite-theme-color-2: #cfeaff;
  --kite-theme-color-2-rgb: 207, 234, 255;
  --kite-theme-color-3: #a6d5ff;
  --kite-theme-color-3-rgb: 166, 213, 255;
  --kite-theme-color-4: #7dbeff;
  --kite-theme-color-4-rgb: 125, 190, 255;
  --kite-theme-color-5: #54a4ff;
  --kite-theme-color-5-rgb: 84, 164, 255;
  --kite-theme-color-6: #2b88fe;
  --kite-theme-color-6-rgb: 43, 136, 254;
  --kite-theme-color-7: #1a66d9;
  --kite-theme-color-7-rgb: 26, 102, 217;
  --kite-theme-color-8: #0c49b3;
  --kite-theme-color-8-rgb: 12, 73, 179;
  --kite-theme-color-9: #03318c;
  --kite-theme-color-9-rgb: 3, 49, 140;
  --kite-theme-color-10: #011f66;
  --kite-theme-color-10-rgb: 1, 31, 102;
}
```

开发中，可直接使用这几个颜色变量

##### kite-design-func-color.css

引入kite-design的4个功能色变量，以及对应的rgb变量：

```css
:root {
  --kite-func-color-link: #2B88FE;
  --kite-func-color-link-rgb: 43, 136, 254;
  --kite-func-color-success: #51C419;
  --kite-func-color-success-rgb: 81, 196, 25;
  --kite-func-color-warn: #FAAD15;
  --kite-func-color-warn-rgb: 250, 173, 21;
  --kite-func-color-error: #F5222D;
  --kite-func-color-error-rgb: 245, 34, 45;
}
```

##### normalize.css

引入了[normalize.css](https://www.npmjs.com/package/normalize.css)@8.0.1来重置各浏览器的样式区别，所以就不用在项目里单独引入了。

如果项目是用旧版vue-cli-plugin-rishiqing插件初始化的，更新插件之后，需要把之前引入的normalize.css给去掉.

##### 全局变量

`RISHIQING_SINGLE_SPA`，true/false，表示是否是在微应用模式

`ROUTER_BASE`，字符串，表示项目的地址前缀，主要用在router.js里的base



