import Vue from 'vue'
import whiteList from '@/constants/whiteList'
import xss from 'xss'

Vue.filter('xss', function (content) {
  if (typeof content !== 'string') return content
  const wl = {} // _whiteList
  whiteList.tags.forEach((item) => {
    wl[item] = []
  })
  Object.assign(wl, whiteList.attributes)

  return xss(content, {
    whiteList: wl,
    onIgnoreTagAttr(tag, name, value) {
      if (name === 'style') {
        return `${name}="${value}"`
      }
    },
  })
})