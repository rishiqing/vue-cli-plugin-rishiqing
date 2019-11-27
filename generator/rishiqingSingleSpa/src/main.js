import Vue from 'vue'
// import VurRx from 'vue-rx'
// 按需引入kite-design组件
import { Button } from '@rishiqing/kite-design'
import '@rishiqing/kite-design/lib/style/utils.css'

import App from './App.vue'
import router from './router'
import store from './store'


export * from './singleSpa'

// Vue.use(VurRx)
Vue.use(Button)

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
