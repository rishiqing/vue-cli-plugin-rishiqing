import Vue from 'vue'
import VurRx from 'vue-rx'
import KiteBasic from '@rishiqing/kite-design/dist/kite-basic'
import KiteBusiness from '@rishiqing/kite-design/dist/kite-business'
import App from './App.vue'
import router from './router'
import store from './store'

import '@rishiqing/kite-design/dist/kite-basic.css'
import '@rishiqing/kite-design/dist/kite-business.css'

export * from './singleSpa'

if (!RISHIQING_SINGLE_SPA) {
  Vue.use(VurRx)
  Vue.use(KiteBasic)
  Vue.use(KiteBusiness)
}

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
