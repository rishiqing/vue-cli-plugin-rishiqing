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
    userInfo = await loadUserInfo()
  } else {
    userInfo = await login(username, password)
  }
  return userInfo
}

export async function fetchUserTree() {
  const userTree = await loadDeptList()
  return userTree
}
