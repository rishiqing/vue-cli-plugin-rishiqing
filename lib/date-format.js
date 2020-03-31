/*
* @Author: qinyang
* @Date:   2018-07-05 03:11:55
 * @Last Modified by: qile
 * @Last Modified time: 2020-03-31 14:39:55
*/
// 给月日时分补零
function getDatePaddingZeroBefore(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return {
    month, day, hours, minutes,
  }
}
// 通过比较两个日期，来获得年月日或者月日的时间格式
// 基准时间是base，参与比较的是date
// 两个参数都应该是js原生的时间对象
function getDateTipByTwoDate(date, base, isShowHoursAndMinutes) {
  // 当所对比的base和base的年份是一样的，则只返回 date的月和日信息
  // 否则返回date完整的年月日信息
  const {
    month, day, hours, minutes,
  } = getDatePaddingZeroBefore(date)
  if (date.getFullYear() === base.getFullYear()) {
    if (isShowHoursAndMinutes) return `${month}月${day}日  ${hours}:${minutes}`
    return `${month}月${day}日`
  }
  if (isShowHoursAndMinutes) return `${date.getFullYear()}年${month}月${day}日  ${hours}:${minutes}`
  return `${date.getFullYear()}年${month}月${day}日`
}

const Regs = [
  {
    reg: /^(\d{4}).(\d{2}).(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, // yyyy.mm.dd hh:mm:ss
    // 如果匹配了reg所规定的格式，那么按照下面这个getDateString方法，获取到一个可用于 new Date的时间字符串
    getDateString(string) {
      return `${string.replace(/\./g, '-').replace(' ', 'T')}+08:00`
    },
  },
  {
    reg: /^(\d{4}).(\d{2}).(\d{2}) (\d{2}):(\d{2})$/, // yyyy.mm.dd hh:mm
    // 如果匹配了reg所规定的格式，那么按照下面这个getDateString方法，获取到一个可用于 new Date的时间字符串
    getDateString(string) {
      return `${string.replace(/\./g, '-').replace(' ', 'T')}:00+08:00`
    },
  },
  {
    reg: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, // yyyy-mm-dd hh:mm:ss
    getDateString(string) {
      return `${string.replace(' ', 'T')}+08:00`
    },
  },
  {
    reg: /^(\d{4})-(\d{2})-(\d{2})$/, // yyyy-mm-dd
    getDateString(string) {
      return `${string.replace(/-/g, '/')}`
    },
    // 配置一个handler，可以单独处理时间格式化问题
    handler(date) {
      const n = new Date()
      // 获取到只有年月日的今天的日期
      const now = new Date(n.getFullYear(), n.getMonth(), n.getDate())
      if (now - date === 0) return '今天' // 今天
      if (now - date === 86400000) return '昨天' // 86400000刚好是一天的秒数
      if (date - now === 86400000) return '明天'
      return getDateTipByTwoDate(date, now, false)
    },
  },
]

class DateFormat {
  /*
   * 参数仅支持两种格式： YYYY-MM-DD HH:mm:ss 或者 YYYY-MM-DD (HH代表24小时制 01~24)
   * 如果有HH:mm:ss，日期为今天时，结果为“刚刚、几小时前”等。
   * 如果没有HH:mm:ss，“刚刚、几小时前”等这些结果，会变为“今天”。
   * */
  // eslint-disable-next-line class-methods-use-this
  formatDate(string) {
    if (typeof string !== 'string') return string
    if (!string) return string
    let dateString
    let handler // 独立的方法
    for (let index = 0; index < Regs.length; index += 1) {
      const Reg = Regs[index]
      if (Reg.reg.test(string)) {
        dateString = Reg.getDateString(string)
        // eslint-disable-next-line prefer-destructuring
        handler = Reg.handler
        break
      }
    }
    if (!dateString) return string

    const date = new Date(dateString)
    const now = new Date()
    const { hours: paddingHours, minutes: paddingMinutes } = getDatePaddingZeroBefore(date)
    // 如果配置了hander，说明这种格式的日期需要单独处理，不走统一处理的方式
    if (handler) return handler(date, string)

    const minutes = Math.floor((now - date) / 60000)
    // 如果小于0, 就说明是未来的时间
    if (minutes < 0) {
      return getDateTipByTwoDate(date, now, true)
    }

    if (minutes <= 5) {
      return '刚刚'
    }
    if (minutes < 60) {
      return `${minutes}分钟前`
    }

    const hours = Math.floor(minutes / 60)
    const hoursFromZero = now.getHours() // 获取到从今天凌晨开始，到现在已经过了多少个小时，用来对比date是否在今天

    if (hours <= hoursFromZero) {
      return `今天 ${paddingHours}:${paddingMinutes}`
    }

    if (hours <= 24 + hoursFromZero) {
      return `昨天 ${paddingHours}:${paddingMinutes}`
    }

    return getDateTipByTwoDate(date, now, true)
  }
}

export default new DateFormat()
