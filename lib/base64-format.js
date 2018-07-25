/*
 * @Author: shejuly
 * @Date: 2018-04-16
 * @for: 转base64方法
 */
export default {
  converseToBase64(data) {
    let s = '';
    if (typeof data === 'string') {
      s = data;
    } else if (typeof data === 'object') {
      s = JSON.stringify(data);
    }
    return window.btoa(unescape(encodeURIComponent(s)));
  }
}
