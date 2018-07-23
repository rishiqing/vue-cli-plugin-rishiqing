export default {
  AUTH_ACTION: '/login/authAjax', // 验证用户是否登录
  LOGOUT: '/logout/index', // 退出登录
  LOGOUT_AJAX: '/logout/index2', // 通过调用ajax接口来退出，服务器不会控制页面跳转
  LOGIN: '/j_spring_security_check', // 用于用户登录
  DELETE_ACCOUNT: '/rsqCommonUser/deleteAccount', // 用于删除账号
  FETCH_USERLIST: '/rsqCommonUser/getAllCompanyUserList', // 获取公司成员列表
  SIDEBAR_FLEX: '/rsqCommonUser/narrowUserUI',
  AVATAR_URL: 'https://rishiqing-avatar.oss-cn-beijing.aliyuncs.com', // 阿里云，头像连接
  IMAGE_URL: 'https://images.timetask.cn',
  OSS_ENDPOINT: 'https://oss-cn-beijing.aliyuncs.com',
  GET_GHOST_UPDATE_STATUS: '/blog/ghost/api/v0.1/posts/?filter=featured:true&limit=1&client_id=ghost-frontend&client_secret=1df9c19e9b25', // 博客
}