/*
* @Author: qinyang
* @Date:   2018-07-25 17:02:17
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:59:42
*/
import Base64Format from './base64-format'
import StringExtend from './string-extend'

function generateAvatar(char) {
  const color = StringExtend.getStringColor(char).color
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><rect fill='${color}' x='0' y='0' width='100%' height='100%'></rect><text fill='#FFF' x='50%' y='48%' text-anchor='middle' alignment-baseline='central' font-size='30' font-family='Verdana, Geneva, sans-serif'>${char}</text></svg>`
  return `data:image/svg+xml;base64, ${Base64Format.converseToBase64(s)}`
}

export default {
  getAvatarUrl(data) {
    if (!data) return generateAvatar('A')
    let hasAvatar
    let showName
    if (typeof data === 'object') {
      hasAvatar = data.hasAvatar
      showName = data.showName
    } else {
      return generateAvatar('A')
    }
    if (hasAvatar) {
      return data.avatar
    }
    const firstName = showName ? showName[0] : 'A'
    return generateAvatar(firstName)
  },
}
