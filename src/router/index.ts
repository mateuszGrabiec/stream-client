import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import ShareUI from '../views/StreamUI.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/share-ui',
    name: 'ShareUI',
    component: ShareUI
  },
  {
    path:'/share-ui/stream',
    name: 'Stream',
    component: () => import('../components/Stream.vue')
  },
  {
    path:'/share-ui/watch',
    name: 'Watch',
    component: () => import('../components/Watcher.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
