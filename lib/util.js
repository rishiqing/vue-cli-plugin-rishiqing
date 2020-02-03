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
