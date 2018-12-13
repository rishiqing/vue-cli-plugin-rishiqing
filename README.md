vue-cli-plugin-rishiqing
====
vue-cli 3.0的一个插件，专用于初始化日事清相关的vue项目，方便统一维护和更新常用代码

提供的功能
====
* 自动预置一些开发中常用的代码，比如api常量，网络请求等
* 添加默认的eslint配置
* 项目目录结构

preset
====
vue-cli 3.0在初始化一个项目的时候，可以提供一个预置选项，vue会根据这个预置选项提供的配置生成项目，免去在创建的时候，反复选择需要的功能。preset的具体信息，可以参考[这里](https://cli.vuejs.org/guide/plugins-and-presets.html#presets)。在插件的根目录下有一个`preset.json`文件

```json
{
  "useConfigFiles": true,
  "plugins": {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-eslint": {
      "config": "airbnb",
      "lintOn": [
        "commit"
      ]
    }
  },
  "router": true,
  "vuex": true,
  "cssPreprocessor": "sass"
}
```

`preset.json`配置项说明:

- [x] 使用独立的配置文件，而不是把配置信息放到`package.json`里。如vue的配置文件，就放在项目根目录下的`vue.config.js`文件里，eslint的配置文件，就放在项目根目录下的`.eslintrc.js`文件里
- [x] 安装 babel
- [x] 安装 eslint，同时使用 airbnb提供的默认eslint配置，并且在每次提交commit的时候，会自动跑eslint，如果eslint没过，则无法提交commit
- [x] 安装 vue-router
- [x] 安装 vuex
- [x] 使用sass作为css的预处理器

使用vue-cli 3.0远程预置选项创建项目的功能，即可立即创建:

```shell
vue create --preset rishiqing/vue-cli-plugin-rishiqing my-project # 其中my-project是你的项目名
cd my-project
```


安装插件
====
第三方开发的插件，无法放到`preset.json`里自动安装，必须在项目初始化之后手动安装。推荐使用vue-cli提供的ui工具，进行可视化安装。

也可以使用命令行安装

```shell
npm i vue-cli-plugin-rishiqing -D -d
```

通过命令行安装之后，需要手动执行`vue invoke vue-cli-plugin-rishiqing`，才能配置插件

```shell
vue invoke vue-cli-plugin-rishiqing
```

之后按照提示，一步一步安装即可

详细的配置说明，参考下面的文档

可选的预置代码
====
预置代码全放在了generator文件夹下面，如果想知道详细的预置代码，可自己去查看

constants [默认选中]
------
常量，在`src`下面创建一个`constants`文件夹，用于放置不变的数据。会在`src`下面创建这么一个目录结构:

```
.
├── constatns
│   ├── url
│       ├── api
│           ├── basic.js
│       ├── index.js
```

这里默认的预置代码，都和接口有关。`src/constants/url/index.js`里会暴露一个 BASE_URL 变量，以及 api 下面配置的接口。

在webpack的ProvidePlugin插件里已经配置了一个公共变量，`R_URL`，指向`src/constants/url/index.js`，该变量已经在`.eslintrc.js`里配置成了公共变量。

services [默认选中]
------
网络请求，使用axios。services依赖R_URL，所以要正常使用services，必须选中constants

simditor style [默认未选中]
------
simditor编辑器的样式代码，默认生成一个文件`src/styles/editor.scss`

sprites [默认未选中]
------
雪碧图插件，雪碧图的原图都分类放在 `src/assets/images/original-sprites`下面。默认提供两组雪碧图：logo, third。雪碧图图片的名称必须遵守命名规则：

一倍尺寸图: `picture-name.png`, 两倍尺寸图: `picture-name@2x.png`

只有遵守命名规则，才能正常生成

还会在项目的根目录下生成文件夹`sprites/config`，用来放置生成雪碧图的配置文件。一组雪碧图，就需要一个独立的配置文件。以third雪碧图为例，它的配置文件为:

```js
module.exports = {
  cwd: 'third', // 指定当前组雪碧图，在 src/assets/images/original-sprites 下的哪个文件夹下面
  glob: '**/*.*', // 一个匹配规则，用于匹配 src/assets/images/original-sprites/third 下面的图片名称，被匹配中的图片，就会生成到雪碧图里
  retina: '@2x', // 指定两倍图的文件名后缀，固定使用@2x
}
```

放好原图，配置好配置文件之后，即可运行如下命令，生成雪碧图

```shell
npm run sprites
```

雪碧图的生成结果有两个，一个是合成的雪碧图，一个是scss代码。

* 合成的雪碧图放到了 `src/assets/images/sprites` 下面
* scss代码放到了 `src/styles/sprites` 下面

生成的scss代码，里面全是变量和mixin，可在 `src/styles/common-resources.scss` 里引入，这样就可以方便在.vue组件里，或者在其他scss文件里使用生成的变量和mixin，例如：

```sass
// src/styles/common-resources.scss
@import "sprites/third-sprite";
```

```sass
// 在其他scss文件或者.vue组件的style里面
.third-qq {
  @include third-retina-sprite($icon-third-qq-group);
}
```

另外需要注意，如果在`vue invoke`的时候，选中了`sprites`，需要在`invoke`结束之后，手动执行

```shell
npm run sprites
```

才能生成默认的雪碧图

xss [默认未选中]
------
跨站脚本攻击过滤，主要用于显示富文本，比如笔记打印，笔记分享，任务打印等等地方，需要在显示富文本之前，先进行过滤。

该预置代码，会往vue里注入一个过滤器，`xss`

## i18n[默认未选中]
用于vue项目的国际化（vue-i18n），会在项目目录下的`src`创建一个如下的目录结构
```
├── i18n
│   ├── languages
│       ├── cn(中文的语言包)
│           ├── common.js
│           ├── todo.js
│       ├── en(英文的语言包)
│           ├── common.js
│           ├── todo.js
│   ├── demo.vue
│   ├── index.js
```
1.语言包里面的js文件里的内容就是针对不同组件的数据（可根据项目需要手动配置自己的语言包）
2.使用方法可参考：demo.vue里面的代码（更多的使用请参考官文：http://kazupon.github.io/vue-i18n/guide/started.html）
##### 注意:
+ 目前此功能默认本地语言为cn，如需修改可去index.js里面去设置
```
//整个index.js 暴露出去的东西将通过插件中根目录index.js(Service 插件)中的
//api.injectImports(api.entryFile, `import i18n from './i18n'`)这个方法向项目的main.js 写入下面的内容

    import Vue from 'vue'
    import VueI18n from 'vue-i18n'
    Vue.use(VueI18n) 
    
    //通过webpack的require.contest()方法将languages文件夹中的所有后缀为.js文件名取到
    //（第二个参数为是否获取子目录的文件）
    
    const context = require.context('./languages', true, /\.js$/)
    
    const messages = {}
    
    //context.keys()将以数组的形式返回 
    //eg：["./cn/common.js", "./cn/todo.js","./en/common.js","./en/todo.js"]
    
    context.keys().forEach((item) => { 
      const url = item.split('/')
      const lang = url[1]
      const module = url[2].slice(0, -3)
      const concatObj = messages[lang] ? messages[lang] : {}
      let langSource = require(`./languages/${lang}/${module}`).default
      messages[lang] = Object.assign(concatObj, langSource)	//messages对象合并
    })
    
    //暴露出一个 vuei18n实例 并添加一些配置项
    export default new VueI18n({
      locale: 'cn',  				//默认本地语言为`cn`
      fallbackLocale: 'en', 		//不设置本地语言将设置为‘en’
      messages: messages 			//语言包的数据
    })
```

默认的预置代码
====
为了统一开发环境，插件会往项目里注入一些默认的代码，以及扩展webpack的配置。
* 默认注入的预置代码，在`generator/template`下面
* 扩展webpack的代码在 `index.js` 里面

sass-resources-loader
------
一个webpack loader, 自动往scss文件里引入我们提前配置好的文件.

生成一个文件`src/styles/common-resources.scss`，这个文件已经在`sass-resources-loader`的配置项里被加载，所以不需要再在任何地方引入.可以在这个文件里引入sass的公共变量和mixin。如雪碧图生成的scss代码，就可以在这里引入，然后就方便在.vue文件和其他scss文件里使用了

需要注意：
* 这个文件，就算没有引入任何代码，也不要删除，不然在构建的时候会报错
* 这个文件里引入的代码，必须是sass的变量或者mixin，绝对不能是包含选择符的具体样式代码，例如：

```sass
.third-qq {
  @include third-retina-sprite($icon-third-qq-group);
}
```

如果引入了这种代码，会造成样式代码的重复

resolve-url-loader
------
一个webpack loader, 解析scss代码里，url资源的路径

rishiqing-deploy
------
部署工具，在开发环境中不会接触到

.editorconfig
------
编辑器配置文件，用于简单配置一些代码格式: 缩进用两个空格, 文件末尾留一个空行等

主流编辑器均支持editorconfig

.env.*
------
在 `vue invoke vue-cli-plugin-rishiqing` 完成之后，会在项目的根目录下面，生成三个`.env.`开头的文件，分别是:

* .env.local
* .env.beta
* .env.release

用于放置环境变量。`.env.local` 是默认被`.gitignore`忽略了的

pull_request_template.md
------
提交pull request时的描述模板

其他配置
====

项目地址前缀
------
配置一个统一的项目地址前缀，默认是`/test`
配置之后，会存放到`.env.local`里，后面可自己修改

项目调试端口
------
调试端口，默认是`3001`
配置之后，会存放到`.env.local`里，后面可自己修改

webpack扩展
====
使用vue-cli 3.0搭建项目，有一个非常棒的体验，就是项目目录下的代码，几乎不会看到复杂的webpack配置，大部分的webpack配置都放到了`@vue/cli-service`里面去了。vue-cli 3.0提供的插件机制，可以在插件里扩展webpack的配置，可以把一些常用的配置都放到插件里，在多个项目之间复用非常方便。

`vue.config.js`文件里，有一个选项叫`pluginOptions`，这个选项里可以配置一些插件需要的配置项。该插件会读取`pluginOptions.rishiqing`下面的配置作为配置项

pluginOptions.rishiqing.provide
------
用于定义可自动引入的全局变量

```json
{
  R_URL: ture
}
```

这个配置项，现在就一个可选值, `R_URL`，为true，为false，都一样

如果配置了R_URL，在webpack的ProvidePlugin插件里，会把`R_URL`指向`@/constants/url`，这样在其他地方使用`R_URL`即可方便接口相关的配置

pluginOptions.rishiqing.define
------
这个也是定义全局变量，和provide不同的是，使用在define里定义的变量，在代码构建的时候，会把变量替换成值

```json
{
  __DEV__: process.env.NODE_ENV === 'development'
}
```
在使用的地方:

```js
if (__DEV__) {
  // development环境才执行的代码
}
```

在构建的时候，如果`process.env.NODE_ENV`是`development`，会被构建成

```js
if (true) {
  // development环境才执行的代码
}
```

如果`process.env.NODE_ENV`不是`development`，会被构建成

```js
if (false) {
  // development环境才执行的代码
}
```

`pluginOptions.rishiqing.define`里的配置项可自由配置，默认提供了`__DEV__`

需要注意：
如果在 `pluginOptions.rishiqing.define` 加了新的配置，需要在`.eslintrc.js`文件里把新配置定义为一个全局变量，不然lint的时候会报错

默认的eslint配置
====
我们采用了`airbnb`的js规范，然后再根据项目情况，自定义了一些

* no-console，提交的代码不能写console，调试的时候可以用
* no-param-reassign，不能对传入函数的参数进行赋值，也不能对传入函数的object类型的参数的属性进行赋值。不过可以指定一些参数名，被指定的参数，就可以对它的属性进行修改。现在就指定了一个`error`
* comma-dangle，需要写尾部逗号，防止无意义的git diff. https://eslint.org/docs/rules/comma-dangle.html
* semi, 不用写分号，但是需要注意，如果某一行开头是 [, (, /, +, - ，这几个字符其中一个，那么上一行必须有分号
+ 'import/prefer-default-export': 'off',文件导出的时不指定default，将不会报错

eslint的自动修复功能
------
上面提到的comman-dangle和semi，在`npm run lint`的时候，都能自动修复

需要注意：
有一些 eslint 的规则，可能需要在开发过程中调整，请及时反馈，方便统一加到eslint配置文件

特别提醒
====

vue-router
------
vue create创建的项目，router默认是hash模式，路由里面会带有#，需要手动改为history模式，同时把base改为前面设置的项目地址前缀

```js
export default new Router({
  mode: 'history',
  base: '/test' // 改为你前面定义的项目地址前缀，注意，末尾没有 /
})
```

src/styles/common-resources.scss
------
这个文件需要保留，就算里面没有内容，也需要保留，不然构建会报错

注意提交自己修改的代码
------
`vue invoke vue-cli-plugin-rishiqing`会修改工程下面的文件，为了明确在执行命令之后，都修改了哪些文件，最好是在执行之前，先`git add`，把本地修改的代码先放到暂存区
### 关于es9的promise.finally的使用的浏览器兼容问题
+ 最新的@vue-cli 已经默认的内置了Promise finally polyfill，所以可以在项目中放心使用

### 插件中为webpack预置的第三方插件：CaseSensitivePathsPlugin 
+ caseSensitivePathsPlugin的作用：此插件用于检测在项目中用于区分大小写的路径，若出现路径引用与实际的路径有大小写的误差将会在控制台报错并且打印错误日志

### 插件中内置的一些方法的使用方式：（方法的源码在插件源码目录的lib文件中）
+ 因为在预置的webpack中已经通过配置项 Resolve.alias 来为lib文件设置别名，关于方法的用法如下：
   
      // 比如需要使用lib中检测客户端的client ： import client from 'rishiqing/client' 即只需引用 client
+ 并且插件已经通过vue.config.js的transpileDependencies: ["vue-cli-plugin-rishiqing"]//将lib文件夹下的代码进行babel转化，所以内置的方法中的一些高级语法已经经过babel的处理

### 插件在安装前的其他可选项（cdn域名，项目地址前缀，项目调试端口）
+ 这些都可以在安装插件时手动去配置或者使用默认值
+ 如果安装完以后，想更改设置可以在项目根目录的.env.xxx文件中去修改对应的值即可

推荐的项目目录结构
====
```
.
├── public                                 # 放置 index.html，以及可以直接在index.html里引用的文件
│   ├── index.html                         # 入口html
├── sprites                                # 雪碧图配置文件
├── src                                    # 源代码
│   ├── assets                             # 静态资源文件，如图片和字体
│       ├── images                         # 图片
│       ├── fonts                          # 字体文件
│       ├── original-sprites               # 雪碧图原图
│       ├── sprites                        # 雪碧图合成图
│   ├── components                         # 公共组件
│   ├── constants                          # 常量，如URL,第三方配置
│ 	├── i18n							   # 项目国际化
│		├── languages 					   # 语言包
│		├── demo.vue 					   # 模板
│		├── index.js                       # vue-i18n的使用需要的配置
│   ├── lib                                # 放置自开发的基础库，如filter，日期处理方法，可随处移植的
│       ├── filter                         # 过滤器
│   ├── routers                            # 路由，如果路由配置很简单，则可以使用一个文件，如果复杂，则必须放到文件夹下面分模块管理
│   ├── services                           # 网络请求层，所有的接口请求代码，都放到这里
│   ├── store                              # vuex
│   ├── styles                             # 公共的样式文件，这里不写组件的样式文件，因为组件的样式文件都写到对应的.vue文件里
│       ├── common-resources.scss          # 负责统一引用sass的公共变量和mixin
│   ├── utils                              # 放置和项目息息相关的基础代码，如request.js
│   ├── views                              # 视图层，页面
│   ├── App.vue                            # vue入口组件
│   ├── main.js                            # 项目的入口文件
```
