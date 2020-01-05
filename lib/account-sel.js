import axios from 'axios'

let BASE_URL = '/task'

if (__DEV__) {
  const serverPath = window.localStorage.getItem('dev-server-path')
  BASE_URL = serverPath || '/task'
}

const service = axios.create({
  timeout: 30000,
  baseURL: BASE_URL,
})

async function login(username, password) {
  return service.post('/j_spring_security_check', `j_username=${username}&j_password=${password}`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(res => res.data)
}
async function loadDeptList() {
  return service.get('/v1/department/list').then(res => res.data)
}
async function loadUserInfo() {
  return service.get('/login/authAjax').then(res => res.data)
}

export async function fetchUserInfo() {
  const password = window.localStorage.getItem('dev-account-password')
  const username = window.localStorage.getItem('dev-account-username')
  const token = window.localStorage.getItem('dev-account-token')
  if (token) {
    service.defaults.headers.token = token
  }
  let userInfo
  if (token) {
    try {
      userInfo = await loadUserInfo()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      // eslint-disable-next-line no-console
      console.error(`通过token获取用户信息出错，请检查token是否过期. token: ${token}`)
    }
  } else {
    try {
      userInfo = await login(username, password)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      // eslint-disable-next-line no-console
      console.error('通过账号密码获取用户信息出错，请检查账号密码是否匹配')
    }
  }
  return userInfo
}

export async function fetchUserTree() {
  const userTree = await loadDeptList()
  return userTree
}
