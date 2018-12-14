import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

const context = require.context('./languages', true, /\.js$/)
const messages = {}
context.keys().forEach((item) => {
  const url = item.split('/')
  const lang = url[1]
  const module = url[2].slice(0, -3)
  if (!messages[lang]) messages[lang] = {}
  messages[lang][module] = require(`./languages/${lang}/${module}`).default
})

export default new VueI18n({
  locale: 'cn',
  fallbackLocale: 'en',
  messages: messages
})
