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



