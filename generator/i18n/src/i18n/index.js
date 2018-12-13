import Vue from 'vue'
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)

const context = require.context('./languages', true, /\.js$/)//webpack的context
const messages = {}
context.keys().forEach((item) => {
  const url = item.split('/')
  const lang = url[1]
  const module = url[2].slice(0,-3)
  messages[lang] = Object.assign(messages[lang]?messages[lang]:{},require(`./languages/${lang}/${module}`).default )//合并obj
})
// function getCookie(name,defaultValue) {
//   var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
//   if (arr = document.cookie.match(reg))
//     return unescape(arr[2]);
//   else
//     return defaultValue;
// }
// const cookie = document.cookie.split(";")[0].split("=")[1]
// console.log(getCookie('PLAY_LANG','cn'));
export default new VueI18n({
  locale: 'cn',
  fallbackLocale:'en',
  messages: messages
})
