/* eslint-disable no-undef */
// eslint-disable-next-line import/no-unresolved
import request from '@/utils/request'

/**
 * 登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @return {promise}
 * 如何用axios提交 application/x-www-form-urlencoded 类型请求，可以参考下面这个issue
 * https://github.com/axios/axios/issues/350#issuecomment-227270046
 */
export function login(username, password) {
  return request.post(R_URL.basic.LOGIN, `j_username=${username}&j_password=${password}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then(res => res.data)
}

/**
 * 获取用户信息
 * @return {promise}
 */
export function getUserInfo() {
  return request({
    url: R_URL.basic.AUTH_ACTION,
    method: 'post',
  })
    .then(res => res.data)
}
