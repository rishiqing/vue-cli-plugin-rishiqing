import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

let vueContainer

// singleSpa 启动函数
export async function bootstrap() {}

// singleSpa 挂载函数
export async function mount(options) {
  vueContainer = new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount()

  const el = document.querySelector(`#${options.containerId}`)
  el.append(vueContainer.$el)
}

// singleSpa 卸载函数
export async function unmount() {
  if (vueContainer) {
    vueContainer.$destroy()
    vueContainer.$el.parentElement.removeChild(vueContainer.$el)
  }
}
