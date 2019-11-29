import Vue from 'vue'
// import VurRx from 'vue-rx'

// kite-basic基础组件
import KiteBasic from '@rishiqing/kite-design/lib/src/kite-basic'

// 如果需要按需引用 kite 的业务组件，可以参考这种写法
// import { Emoji } from '@rishiqing/kite-design'

// 样式代码
import '@rishiqing/kite-design/lib/src/style'
// kite的工具类css
import '@rishiqing/kite-design/lib/style/utils.css'

import App from './App.vue'
import router from './router'
import store from './store'


export * from './singleSpa'

// Vue.use(VurRx)
Vue.use(KiteBasic)
// Vue.use(Emoji)

Vue.config.productionTip = false

async function init() {
  new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')
}

if (!RISHIQING_SINGLE_SPA) {
  init()
}
