vue-cli-plugin-rishiqng
-----
一个vue-cli 3.0的插件，专用于初始化日事清相关的vue项目。使用这个插件，可以自动预置一些开发中常用的代码，比如api常量，网络请求等

安装
-----
推荐使用vue-cli提供的ui工具，进行可视化安装。

```shell
npm i 
```

有一些 eslint 的规则，可能需要在开发过程中调整，请及时反馈，方便统一加到eslint配置文件

如果预置了constants, 可通过R_URL访问接口配置

网络请求层 (基于axios)

import/prefer-default-export

'no-param-reassign': ['error', { ignorePropertyModificationsFor: ['error'] }] 可以修改一些常用的函数声明的参数的属性值

comma-dangle 尾部逗号，防止无意义的git diff https://eslint.org/docs/rules/comma-dangle.html

不写分号,

eslint的自动修复功能

会在提交commit的时候，自动运行修改过的js和vue文件

vue create创建的项目，里面的router默认是hash模式，路由里面会带有#，需要手动改为history模式:

```js
export default new Router({
  mode: 'history'
})
```
