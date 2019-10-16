import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

let vueContainer

// singleSpa 启动函数
// eslint-disable-next-line no-empty-function
export async function bootstrap() {}

// singleSpa 挂载函数
export async function mount(props) {
  vueContainer = new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount()

  const el = document.querySelector(`#${props.containerId}`)
  el.appendChild(vueContainer.$el)
}

// singleSpa 卸载函数
export async function unmount() {
  if (vueContainer) {
    vueContainer.$destroy()
    if (vueContainer.$el.parentElement) {
      vueContainer.$el.parentElement.removeChild(vueContainer.$el)
    }
  }
}
