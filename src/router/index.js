import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
  },
  {
    path: '/modify',
    name: 'Modify',
    component: () => import('@/views/modify/index.vue'),
  },
  {
    path: '/modify/detail',
    name: 'ModifyDetail',
    component: () => import('@/views/modify/detail.vue'),
  },
  {
    path: '/paper',
    name: 'Paper',
    component: () => import('@/views/paper/index.vue'),
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

export default router
