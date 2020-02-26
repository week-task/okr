import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    if (to.meta.title) {
      document.title = to.meta.title
    }
    if (to.meta.requireAuth) {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && token !== 'null' && (JSON.parse(user).role + '' === token.split('z|')[1])) {
        Vue.prototype.$axios.defaults.headers.common['Authorization'] = 'Bearer ' + token.split('z|')[0]
        next()
      } else {
        next('/login')
      }
    } else {
      next()
    }
  })

  return Router
}
