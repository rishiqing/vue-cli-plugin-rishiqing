# 2020-02-24

* lib/single-spa-data.js新增方法：

  getUnDept 获取未分配部门

# 2020-02-19

* lib/single-spa-data.js新增方法：

  findUserById: 通过成员id查找成员的详细数据

  findDeptById: 通过部门id查找部门的详细数据

# 2020-02-08

* 新增 lib/file.js文件，用于放置文件相关的方法

  getByteOfMb: 把兆转换成字节数

  isServerReceivedImg: 判断文件是不是我们可接受的图片类型

  getFileTail: 获取文件的后缀

  getImgSizeLimit: 获取图片尺寸限制

  getFileSizeLimit: 获取普通文件的尺寸限制

  isFileSizeOk: 判断文件的尺寸是否符合

* lib/single-spa-data.js新增方法：

  isVip: 是否是vip

  isZyVipOrMore: 是否是专业或者以上会员

  isQyVipOrMore： 是否是企业或者以上会员

  isUltimateVipOrMore: 是否是旗舰或者以上会员



# 2020-02-06

* vue.config.js里的 `pluginOptions.rishiqing` 下面新增一个参数`forceAddKiteDesignThemeColor`，配置为true，则在打包的时候，会强制加上 kiteDesign的主题色变量和normalize.css样式

  ```js
  module.exports = {
    pluginOptions: {
      rishiqing: {
        provide: {
          R_URL: true,
        },
        define: {
          __DEV__: process.env.NODE_ENV === 'development',
        },
        enableDevAccountSel: true,
        rishiqingSingleSpa: true,
        // 构建的时候，强制加上kiteDesign的主题色和normalize.css
        forceAddKiteDesignThemeColor: true,
      },
    },
  }
  ```



* lib/single-spa-data.js新增方法：

  getMessageClient方法：返回一个 [eventemitter3](https://www.npmjs.com/package/eventemitter3) 事件对象，可监听`message`事件，即可监听到rishiqing-front里收到的实时消息

  getSystemConfig方法：获取到系统配置数据，可用来做平台区分，详细用法，请参考 [RISHIQING_SINGLE_SPA 文档](doc/RISHIQING_SINGLE_SPA.md)

* lib/util.js新增方法：

  clearVerticalTab方法：用于清理字符串里的垂直制表符

* 新增依赖包：eventemitter3

# 2020-02-03

新增 lib/util.js 文件，用来放一些公共基础方法

lib/single-spa-data.js新增方法：

​	getDeptListByIds方法，通过部门id列表，获取部门的数据列表

​	getUserListByIds方法，通过成员id列表，获取成员的数据列表

​	getParentIdListByDeptIdList方法，通过传入的部门id列表，获取对应的上级部门的id列表

lib/single-spa-data.js里的成员数据加入一个 deptIdList 字段，记录一个成员属于哪些部门

# 2020-01-10

lib/single-spa-data.js新增三个方法：

​    getUnfoldDeptList方法，获取部门列表，而不是树结构列表

​    getUserList方法，获取成员列表

​    getCurrentUserCompanyAuthorities方法，获取当前用户在公司层面的权限

# 2020-01-05

新增singleSpa的样式切换功能

# 2019-12-18

用js代码生成kite-design的主题色，并插入到页面里，不再用css文件

修复dev-account-sel的快捷键报错bug，同时支持保存token

新增 lib/single-spa-data.js，在singleSpa项目里，可以更加方便获取基础数据

调整 lib/r-request.js，发起接口调用的时候，请求头里带上token

# 2019-11-20
kite-design相关的主题色和功能色，加入对应的rgb变量.比如`--kite-theme-color-1: #f0f9ff;`对应的rgb变量是`--kite-theme-color-1-rgb: 240, 249, 255;`

# 2019-10-22
resolve.symlinks置为false，避免通过npm link安装的包的依赖解析问题

# 2019-10-15

添加rishiqingSingleSpa项目初始化配置

添加ROUTER_BASE环境变量，用来控制router.js里的base的值

添加`npm start`启动命令

添加devServer代理，把`/task`代理到`https://www.rishiqing.com/task`

初始化的时候选择了`xss`，也不再自动往main.js里注入`import '@/lib/filter/xss'`

不再忽略 `.rishiqing-deploy.yml` 文件

不再替换index.html里的`favicon.ico`

只有选中了`init`，才会初始化`generator/template`下面的模板文件

添加了`r-request` alias，指向`/lib/r-request.js`文件，用来处理kite-design里依赖的`r-request`，如果需要自定义这个r-request，可以在`vue.config.js`里重新配置alias

devServer的接口，添加 `Access-Control-Allow-Origin: *` 响应头，避免跨域问题

升级`rishiqing-deploy`到2.0.9

升级`axios`到0.19.0



