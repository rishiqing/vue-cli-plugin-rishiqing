const data = {
  USER_INFO: {},
  USER_TREE: [],
}

const freshTime = new Date().getTime()

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
}

// 获取用户自己的数据
export function getUserInfo() {
  return data.USER_INFO
}

// 获取token
export function getToken() {
  return data.USER_INFO.token
}

// 获取部门列表
export function getDeptList() {
  return data.USER_TREE
}

export function getFreshTime() {
  const userInfo = getUserInfo()
  return `${userInfo.id}${freshTime}`
}
