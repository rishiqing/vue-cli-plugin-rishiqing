import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

const context = require.context('./languages', true, /\.js$/)//webpack的context 
const messages = {}
context.keys().forEach((item) => {
  const url = item.split('/')
  const lang = url[1]
  const module = url[2].slice(0, -3)
  let concatObj = messages[lang] ? messages[lang] : {}
  let langSource = require(`./languages/${lang}/${module}`).default
  messages[lang] = Object.assign(concatObj, langSource)//messages对象合并
})
export default new VueI18n({
  locale: 'cn',
  fallbackLocale: 'en',
  messages: messages
})
