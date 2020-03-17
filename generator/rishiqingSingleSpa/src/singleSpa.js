import Vue from 'vue'
import App from './App.vue'
import {
  createRouter,
  getRouter,
} from './router'
import store from './store'
import init from './init'

let vueContainer
let styleCache

/**
 * 添加被暂时移除的样式
 */
function addStyle() {
  try {
    const head = document.querySelector('head')
    if (styleCache) {
      styleCache.forEach((style) => {
        head.appendChild(style)
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

/**
 * 当singleSpa被移除的时候，暂时移除相关样式
 */
function removeStyle() {
  // 移除掉所有的style
  try {
    styleCache = [...document.querySelectorAll(`style[data-single-spa-id="${SINGLE_SPA_ID}"]`)]
    styleCache.forEach((style) => {
      style.parentNode.removeChild(style)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

// singleSpa 启动函数
// eslint-disable-next-line no-empty-function
export async function bootstrap() {}

// singleSpa 挂载函数
export async function mount(props) {
  addStyle()
  await init()
  createRouter(props.routerBase)
  vueContainer = new Vue({
    router: getRouter(),
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
  removeStyle()
}
