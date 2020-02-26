
const routes = [
  {
    path: '/login',
    component: () => import('pages/login')
  },
  {
    path: '/',
    component: () => import('pages/okr'),
    meta: {
      requireAuth: true,
      title: '月报OKR'
    }
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
