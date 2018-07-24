/*
* @Author: qinyang
* @Date:   2018-07-05 02:06:49
* @Last Modified by:   qinyang
* @Last Modified time: 2018-07-25 00:59:00
*/
const Regs = [
  {
    reg: /^(\d{4}).(\d{2}).(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, // yyyy.mm.dd hh:mm:ss
    // 如果匹配了reg所规定的格式，那么按照下面这个getDateString方法，获取到一个可用于 new Date的时间字符串
    getDateString(string) {
      return `${string.replace(/\./g, '-').replace(' ', 'T')}+08:00`;
    },
  }, {
    reg: /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/, // yyyy-mm-dd hh:mm:ss
    getDateString(string) {
      return `${string.replace(' ', 'T')}+08:00`;
    },
  }, {
    reg: /^(\d{4})-(\d{2})-(\d{2})$/, // yyyy-mm-dd
    getDateString(string) {
      return `${string}T00:00:00+08:00`;
    },
  },
];

// 计算给定日期的相对时间
// 如：刚刚，1小时前，5小时前，今天...
export default function (string) {
  if (typeof string !== 'string') return string;
  if (!string) return string;
  let dateString;
  for (let index = 0; index < Regs.length; index += 1) {
    const Reg = Regs[index];
    if (Reg.reg.test(string)) {
      dateString = Reg.getDateString(string);
      break;
    }
  }

  const date = new Date(dateString);
  const now = new Date();

  const minutes = Math.floor((now - date) / 60000);
  if (minutes <= 5) {
    return '刚刚';
  }
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }

  const hours = Math.floor(minutes / 60);
  const hoursFromZero = now.getHours(); // 获取到从今天凌晨开始，到现在已经过了多少个小时，用来对比date是否在今天

  if (hours <= hoursFromZero) {
    return `${hours}小时前`;
  }

  if (hours < 24 + hoursFromZero) {
    return '昨天';
  }

  // 当所对比的时间和现在的年份是一样的，则只返回 月和日信息
  // 否则返回完整的年月日信息
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};
