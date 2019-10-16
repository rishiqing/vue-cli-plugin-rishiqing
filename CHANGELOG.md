# 2019-10-15

添加 

在RISHIQING_SINGLE-SPA开启状态下，静态资源需要在nginx配置代理才行，比如某个图片，在开发环境下，生成的链接是:`/app/doc/img/logo.82b9c7a5.png` ，但如果是在`localhost:99` 里打开的时候，是访问不到的，需要在nginx里配置代理，把`/app/doc`代理到笔记服务器，或者是把`.env.local`里的`BASE_URL`改成一个完整的带域名的前缀:`localhost:3002/app/doc`