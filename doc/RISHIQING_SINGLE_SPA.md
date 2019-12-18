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

##### 使用webpackSystemRegister处理一些特殊包

```js
webpackConfig.plugins.push(new WebpackSystemRegister({
  systemjsDeps: [
    /^share-data/,
  ],
}))
```



#### 普通模式

##### 颜色变量引入

普通模式下，会引入kite-design的主题颜色变量，以及对应的rgb变量：

```css
:root {
  /* 主题色变量 */
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
  
  /* 错误色变量 */
  --kite-error-color-1: #fff1f0;
  --kite-error-color-1-rgb: 255, 241, 240;
  --kite-error-color-2: #ffccc7;
  --kite-error-color-2-rgb: 255, 204, 199;
  --kite-error-color-3: #ffa39e;
  --kite-error-color-3-rgb: 255, 163, 158;
  --kite-error-color-4: #ff7875;
  --kite-error-color-4-rgb: 255, 120, 117;
  --kite-error-color-5: #ff4d4f;
  --kite-error-color-5-rgb: 255, 77, 79;
  --kite-error-color-6: #f5222d;
  --kite-error-color-6-rgb: 245, 34, 45;
  --kite-error-color-7: #cf1322;
  --kite-error-color-7-rgb: 207, 19, 34;
  --kite-error-color-8: #a8071a;
  --kite-error-color-8-rgb: 168, 7, 26;
  --kite-error-color-9: #820014;
  --kite-error-color-9-rgb: 130, 0, 20;
  --kite-error-color-10: #5c0011;
  --kite-error-color-10-rgb: 92, 0, 17;
}
```

开发中，可直接使用这几个颜色变量

还引入了kite-design的4个功能色变量，以及对应的rgb变量：

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



### 获取用户基础数据

获取用户的基础数据主要分两种情况：

1、微应用模式     2、普通模式

#### 微应用模式

这种模式下，应用需要接入到主工程里才能使用，用户的基础数据可以从主工程提供的`share-data`获取

```js
const data = {}
const ShareData = require('share-data')
const basicData = ShareData.getBasicData()
data.USER_INFO = basicData.USER_INFO
data.USER_TREE = basicData.USER_TREE || []
```



#### 普通模式

普通模式，也就是我们通常用的调试环境，由于没有接入到主工程，没有`share-data`可用，所以使用账号密码登录或者token来获取用户信息

```js
const password = window.localStorage.getItem('dev-account-password')
const username = window.localStorage.getItem('dev-account-username')
const token = window.localStorage.getItem('dev-account-token')
if (token) {
  service.defaults.headers.token = token
}
// 获取用户数据
let userInfo
if (token) {
  userInfo = await loadUserInfo()
} else {
  userInfo = await login(username, password)
}

// 获取部门数据
const userTree = await loadDeptList()
```

从代码可以看到，我们利用了我们的账号调试。当配置了token，会优先使用token，如果没有配置token，则会使用账号和密码



#### 整合两种模式

为了在两种模式下都能非常方便的获取到用户基础数据，新增`lib/single-spa-data.js `用来处理用户的基础数据。

上demo:

在main.js里初始化数据：

```js
import {
  initData,
} from 'rishiqing/single-spa-data'

async function init() {
  // 先初始化数据，需要注意，initData是一个异步函数
  await initData()
  new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
  }).$mount('#app')
}

if (!RISHIQING_SINGLE_SPA) {
  init()
}
```



在其他组件里使用数据：

```vue
<script>
import {
  getUserInfo,
  getToken,
  getDeptList,
  getFreshTime,
} from 'rishiqing/single-spa-data'

export default {
  mounted() {
    // 获取用户的基本信息
    const userInfo = getUserInfo()
    // 获取用户的token
    const token = getToken()
    // 获取部门树列表
    const deptList = getDeptList()
    // 获取freshTime
    const freshTime = getFreshTime()
  }
}
</script>
```

