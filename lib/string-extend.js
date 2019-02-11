/* eslint-disable class-methods-use-this */
/*
* @Author: qinyang
* @Date:   2018-01-15 12:55:08
 * @Last Modified by: TimZhang
 * @Last Modified time: 2019-02-02 10:13:24
* @for: 做一些字符串扩展，该方法用于直接使用
* 汉字常用范围是0x4E00 - 0x9FA5
*/

class StringExtend {
  // 把一个字符串按中文和其他语言分开，用于下面排序比较
  splitString(s) {
    const codeList = s.split('').map(item => item.codePointAt(0))
    const list = []
    codeList.forEach((code) => {
      const last = list[list.length - 1]
      if (code >= 0x4e00 && code <= 0x9fa5) {
        if (last && last.lang === 'chinese') {
          last.codeList.push(code)
        } else {
          list.push({
            codeList: [code],
            lang: 'chinese',
          })
        }
      } else if (last && last.lang === 'other') {
        last.codeList.push(code)
      } else {
        list.push({
          codeList: [code],
          lang: 'other',
        })
      }
    })
    const result = list.map(item => ({
      string: item.codeList.map(c => String.fromCodePoint(c)).join(''),
      lang: item.lang,
    }))
    return result
  }

  // 分段比较一个字符串
  // 保证数字和字母在前面
  // 中文在后面
  compare(a, b) {
    const listA = this.splitString(a)
    const listB = this.splitString(b)
    let key = 0
    const length = listA.length > listB.length ? listB.length : listA.length
    for (let i = 0; i < length; i++) {
      const infoA = listA[i]
      const infoB = listB[i]
      if (infoA.string === infoB.string) {
        // eslint-disable-next-line no-continue
        continue
      }
      if (infoA.lang === 'other' && infoB.lang === 'chinese') {
        key = -1
      } else if (infoA.lang === 'chinese' && infoB.lang === 'other') {
        key = 1
      } else if (infoA.lang === 'chinese') {
        key = infoA.string.localeCompare(infoB.string, 'zh-Hans-CN', { sensitivity: 'accent' })
      } else {
        key = infoA.string.localeCompare(infoB.string)
      }
      break
    }

    // 如果key === 0， 则再判断一下listA和listB的长度，越长的应该排在后面
    if (key === 0) {
      key = listA.length - listB.length
    }
    return key
  }

  /* 把一个字符串对应某种序列号和颜色
   0  #96D530
   1  #30D539
   2  #7F67FF
   3  #F7E437
   4  #55E6A5
   5  #9467FF
   6  #F7A437
   7  #4FDFDD
   8  #E567FF
   9  #F77C37
   10 #67C9FF
   11 #FF67B2
   12 #F73737
   13 #678FFF
   14 #FF6767
   */
  getStringColor(s) {
    if (!s[0]) {
      return {
        index: 0,
        color: '#96D530',
      }
    }
    const colorList = [
      '#96D530',
      '#30D539',
      '#7F67FF',
      '#F7E437',
      '#55E6A5',
      '#9467FF',
      '#F7A437',
      '#4FDFDD',
      '#E567FF',
      '#F77C37',
      '#67C9FF',
      '#FF67B2',
      '#F73737',
      '#678FFF',
      '#FF6767',
    ]
    const uniCode = s.codePointAt(0)
    const index = uniCode % 15
    const color = colorList[index]
    return {
      index,
      color,
    }
  }

  // 解析多行文字，并把每一行的首尾空字符给去掉
  multiLines(s) {
    return s.split('\n').map(_s => _s.trim()).filter(_s => _s)
  }
}

export default new StringExtend()
