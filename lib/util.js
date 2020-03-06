import client from 'rishiqing/client'

// 所有通过iframe下载的iframe都放到这里面
const downloadIframesWrap = document.createElement('div')
document.body.appendChild(downloadIframesWrap)

// 通过一个Url来下载一个文件
// 这里需要判断一下运行环境
// 如果是在普通的浏览器里，则直接在一个新页面里打开
// 如果是在pc端里，则新建一个a标签，模拟点击下载
export function downloadFileByUrl(_url, name) {
  const urlUtil = require('url')
  const url = urlUtil.resolve(window.location.href, _url)
  if (client.isPc) {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.innerText = '下载'
    a.download = name || ''
    a.click()
  } else if (client.isQywx && client.system.mac) {
    // 如果企业微信mac端，就直接往window.location.href赋值
    // 根据之前的记录，往 window.location.href赋值，会导致通知中心的问题
    // 但是在企业微信的mac端试验了一下，发现没有这个问题
    window.location.href = url
  } else {
    // 如果用window.open(url)会导致弹出打开弹窗警告，如果用户不注意，可能就没法下载文件
    // 所以直接给location.href赋值
    // window.location.href = url;
    //
    // 直接给window.location.href赋值，会导致window触发 beforeunload 事件
    // 而rishiqing-message-client这个第三方包里，会在beforeunload事件里断开websocket的连接
    // 导致导出数据的时候，一直收不到导出结束的通知
    // 所以这里用iframe的方式
    const iframe = document.createElement('iframe')
    iframe.style = 'display: none'
    // downloadIframesWrap不是jquery对象，是原生dom节点，所以要用appendChild。
    // 之前用append导致企业微信无法下载文件。
    downloadIframesWrap.appendChild(iframe)
    iframe.src = url
  }
}

/**
 * 把json数据转换成query字符串
 * @param {Object} json json数据
 */
export function jsonToQueryString(json) {
  const query = Object.keys(json).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(json[key])}`).join('&')
  return `?${query}`
}

// 清理字符串里的垂直制表符
// 后台返回的数据垂直制表符直接显示的\v, 没有转换成\u000b，造成这样的json字符串无法正常转码
// 所以先暂时在前端手动清理
export function clearVerticalTab(str) {
  return str.replace(/\\v/g, (match, index, s) => {
    let pre
    if (index > 0) pre = s[index - 1]
    if (pre === '\\') return match
    return ''
  })
}
