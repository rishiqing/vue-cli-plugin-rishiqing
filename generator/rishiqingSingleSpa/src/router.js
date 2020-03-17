import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

Vue.use(Router)

let router

export function getRouter() {
  return router
}

export function createRouter(routerBase) {
  // 这里传入 routerBase，是允许signleSpa在挂载的时候，可以自定义路由的base
  const base = routerBase ? `${routerBase}<%= baseUrl %>` : ROUTER_BASE
  // 如果已经初始化了router，则不初始化
  if (router) return
  router = new Router({
    mode: 'history',
    base,
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
      },
      {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        // component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
        component: About,
      },
    ],
  })
}
