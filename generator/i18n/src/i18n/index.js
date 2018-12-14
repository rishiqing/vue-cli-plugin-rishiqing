import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

const context = require.context('./languages', true, /\.js$/)
let messages = {}
context.keys().forEach((path) => {
  let list = path.split('/')
  let current = messages
  list.forEach((item, index, list) => {
    if (index === 0) return
    if (index < list.length - 1) {
      if (!current[item]) current[item] = {}
      current = current[item]
    } else {
      current[item.slice(0, -3)] = context(path).default
    }
  })
})

export default new VueI18n({
  locale: 'cn',
  fallbackLocale: 'en',
  messages: messages
})
