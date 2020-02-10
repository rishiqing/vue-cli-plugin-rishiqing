/* eslint-disable no-use-before-define */
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

const TeamLevelList = [
  'free', // 免费会员 0
  'professional', // 专业会员 1
  'enterprise', // 企业会员 2
  'ultimate', // 旗舰版会员 3
]

/**
 * 判断是否为某个级别以上的会员
 * @param {Number} level 会员级别
 */
function isTeamLevel(level) {
  const userInfo = getUserInfo()
  const teamLevel = userInfo.team ? userInfo.team.status.teamLevel : 'free'
  return TeamLevelList.indexOf(teamLevel) >= level
}

const data = {
  USER_INFO: {},
  USER_TREE: [],
  USER_LIST: [],
  DEPT_UNFOLD_LIST: [],
  // 用户的id和用户数据的映射，方便查询
  USER_LIST_MAP: {},
  // 部门id和部门数据的映射，方便查询
  DEPT_LIST_MAP: {},
}

// 日事清消息客户端
let messageClient
let systemConfig = {}

const freshTime = new Date().getTime()

// 拉取本地的项目根路径下的文件
// 能拉取的文件，需要在index.js文件里用 createFetchLocalApi 创建对应的api才行
function fetchLocalFile(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('get', url)
    xhr.onload = function ajaxOnLoad() {
      if (xhr.status === 500) {
        reject(JSON.parse(xhr.response).error)
      } else {
        resolve(JSON.parse(xhr.response))
      }
    }
    xhr.onerror = function ajaxOnError() {
      reject()
    }
    xhr.send()
  })
}

/**
 * 把部门树转换成用户列表
 * @param {Array} tree 部门树
 * @param {Array} userList 待添加用户的用户列表
 * @param {Object} map 成员缓存映射
 */
function convertUserTreeToUserList(deptList, userList, map) {
  // 由于支持多部门，成员可能出现重复的，需要记录然后过滤
  const cache = {}
  function nextDept(dept) {
    if (dept.userList && dept.userList.length) {
      dept.userList.forEach((user) => {
        if (!cache[user.id]) {
          // 克隆用户数据
          const userClone = Object.assign({}, user)
          // clone 一下角色
          if (userClone.role) {
            userClone.role = Object.assign({}, userClone.role)
          }
          // 在user里添加一个deptIdList字段，标明这个用户属于那些部门
          userClone.deptIdList = [dept.id]
          cache[userClone.id] = userClone
          userList.push(userClone)
          map[userClone.id] = userClone
        } else {
          cache[user.id].deptIdList.push(dept.id)
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
 * @param {Array} deptList 原始部门列表
 * @param {Array} unfoldList 待添加的展开式的部门列表
 * @param {Object} map 部门缓存映射
 */
function convertUserTreeToUnfoldDeptList(deptList, unfoldList, map) {
  function nextDept(dept) {
    unfoldList.push(dept)
    map[dept.id] = dept
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

    // 从shareData获取消息客户端
    if(ShareData && ShareData.getMessageClient){
      messageClient = ShareData.getMessageClient()
    }
    // 从shareData获取systemConfig
    if(systemConfig && ShareData.getSystemConfig){
      systemConfig = ShareData.getSystemConfig()
    }
  }
  // 这里必须单独用一个if，不然前面的share-data会报错
  if (!RISHIQING_SINGLE_SPA && __DEV__) {
    // 不然就自己调用接口，用本地存储的账号，拉取基本数据
    const AccountSel = require('./account-sel')
    try {
      data.USER_INFO = await AccountSel.fetchUserInfo() || {}
      if (data.USER_INFO.team) {
        data.USER_TREE = await AccountSel.fetchUserTree()
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
    
    const EventEmitter = require('eventemitter3')
    messageClient = new EventEmitter()
    systemConfig = await fetchLocalFile('/fetch-local/system-config.json')
  }
  convertUserTreeToUserList(data.USER_TREE, data.USER_LIST, data.USER_LIST_MAP)
  convertUserTreeToUnfoldDeptList(data.USER_TREE, data.DEPT_UNFOLD_LIST, data.DEPT_LIST_MAP)
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
 * 通过部门id列表，获取到对应的部门数据列表
 * @param {Array} ids 部门id列表
 */
export function getDeptListByIds(ids) {
  return ids.map(id => data.DEPT_LIST_MAP[id])
}

/**
 * 通过成员id列表，获取对应的成员数据列表
 * @param {Array} ids 用户id列表
 */
export function getUserListByIds(ids) {
  return ids.map(id => data.USER_LIST_MAP[id])
}

/**
 * 获取传入的部门id列表对应的部门的所有上级部门的id列表
 * @param {Number} deptIdList 部门id列表
 */
export function getParentIdListByDeptIdList(deptIdList) {
  const cache = {}
  const list = []
  function nextDept(dept) {
    // 如果某个部门的id已经处理过，则可以直接终端处理，因为他的父级肯定也被处理过了
    if (dept.parentId && !cache[dept.parentId]) {
      list.push(dept.parentId)
      cache[dept.parentId] = true
      const parent = data.DEPT_LIST_MAP[dept.parentId]
      if (parent) {
        nextDept(parent)
      }
    }
  }
  deptIdList.forEach((deptId) => {
    const dept = data.DEPT_LIST_MAP[deptId]
    if (dept) nextDept(dept)
  })
  return list
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

/**
 * 获取消息客户端
 */
export function getMessageClient() {
  return messageClient
}

/**
 * 获取系统配置信息
 */
export function getSystemConfig() {
  if (__DEV__) {
    // 如果返回的数据是不存在，则提示用户
    if (systemConfig.noExist) {
      // eslint-disable-next-line no-console
      console.warn(`
开发环境下想获取systemConfig数据用作平台的判断
可在根目录下添加一个 system-config.json 文件，参考内容为:
${JSON.stringify(require('./default-system-config.json'), null, 2)}
注：system-config.json 的内容修改之后，不用重启webpack，刷新页面即可生效
      `)
    }
  }
  return systemConfig.noExist ? {} : systemConfig
}

/**
 * 是否为会员，和isZyVip一样
 */
export function isVip() {
  return isTeamLevel(1)
}

/**
 * 是不是专业版会员，或专业版以上会员
 */
export function isZyVipOrMore() {
  return isTeamLevel(1)
}

/**
 * 是否为企业会员，或企业以上会员
 */
export function isQyVipOrMore() {
  return isTeamLevel(2)
}

/**
 * 是否为旗舰版，或旗舰版以上会员
 */
export function isUltimateVipOrMore() {
  return isTeamLevel(3)
}
