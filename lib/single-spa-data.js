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

service.interceptors.request.use((config) => {
  // eslint-disable-next-line no-use-before-define
  config.headers.token = getToken()
  // eslint-disable-next-line no-use-before-define
  config.headers.freshTime = getFreshTime()
  return config
}, error => Promise.reject(error))

const data = {
  USER_INFO: {},
  USER_TREE: [],
  USER_LIST: [],
  DEPT_UNFOLD_LIST: [],
}

const freshTime = new Date().getTime()

/**
 * 把部门树转换成用户列表
 * @param {Array} tree 部门树
 * @param {Array} userList 待添加用户的用户列表
 */
function convertUserTreeToUserList(deptList, userList) {
  // 由于支持多部门，成员可能出现重复的，需要记录然后过滤
  const cache = {}
  function nextDept(dept) {
    if (dept.userList && dept.userList.length) {
      dept.userList.forEach((user) => {
        if (!cache[user.id]) {
          cache[user.id] = true
          userList.push(user)
        }
      })
    }
    if (dept.childList && dept.childList.length) {
      dept.childList.forEach(nextDept)
    }
  }
  deptList.forEach(nextDept)
}

/**
 * 把原始部门列表转换成展开式的部门列表
 * @param {*} deptList 原始部门列表
 * @param {*} unfoldList 待添加的展开式的部门列表
 */
function convertUserTreeToUnfoldDeptList(deptList, unfoldList) {
  function nextDept(dept) {
    unfoldList.push(dept)
    if (dept.childList && dept.childList.length) {
      dept.childList.forEach(nextDept)
    }
  }
  deptList.forEach(nextDept)
}

/**
 * 初始化数据
 * 必须先调用这个方法，进行数据初始化，才能调用其他方法
 */
export async function initData() {
  // 如果USER_INFO.id存在，则说明已经初始化，可直接返回
  if (data.USER_INFO.id) return
  // 如果是singleSpa模式运行，则直接从share-data获取基本数据
  if (RISHIQING_SINGLE_SPA) {
    // eslint-disable-next-line import/no-unresolved, import/extensions, global-require
    const ShareData = require('share-data')
    const basicData = ShareData.getBasicData()
    data.USER_INFO = basicData.USER_INFO
    data.USER_TREE = basicData.USER_TREE || []
  }
  // 这里必须单独用一个if，不然前面的share-data会报错
  if (!RISHIQING_SINGLE_SPA && __DEV__) {
    // 不然就自己调用接口，用本地存储的账号，拉取基本数据
    const AccountSel = require('./account-sel')
    data.USER_INFO = await AccountSel.fetchUserInfo()
    if (data.USER_INFO.team) {
      data.USER_TREE = await AccountSel.fetchUserTree()
    }
  }
  convertUserTreeToUserList(data.USER_TREE, data.USER_LIST)
  convertUserTreeToUnfoldDeptList(data.USER_TREE, data.DEPT_UNFOLD_LIST)
}

/**
 * 获取用户自己的数据
 */
export function getUserInfo() {
  return data.USER_INFO
}

/**
 * 获取token
 */
export function getToken() {
  return data.USER_INFO.token
}

/**
 * 获取部门列表
 */
export function getDeptList() {
  return data.USER_TREE
}

/**
 * 获取用户列表
 */
export function getUserList() {
  return data.USER_LIST
}

/**
 * 获取展开式的部门列表
 */
export function getUnfoldDeptList() {
  return data.DEPT_UNFOLD_LIST
}

/**
 * 获取当前用户公司层面的全部权限
 */
export async function getCurrentUserCompanyAuthorities() {
  const result = await service.get('/v1/authority/currentCompanyAuthorities')
  return result.data
}

/**
 * 获取刷新时间
 */
export function getFreshTime() {
  const userInfo = getUserInfo()
  return `${userInfo.id}${freshTime}`
}
