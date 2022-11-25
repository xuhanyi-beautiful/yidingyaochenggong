import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginP from '../components/LoginP.vue'
import HomeComponent from '../components/HomeComponent.vue'
import WelcomeComponent from '../components/WelcomeComponent.vue'
import UsersComponent from '../components/user/UsersComponent.vue'
import RightsP from '../components/power/RightsP.vue'
import RolesP from '../components/power/RolesP.vue'
import GoodsCate from '../components/goods/GoodsCate.vue'
import ParamsP from '../components/goods/ParamsP.vue'
import GoodsList from '../components/goods/GoodsList.vue'
import AddGood from '../components/goods/AddGood.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginP },
  {
    path: '/home',
    component: HomeComponent,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: WelcomeComponent },
      { path: '/users', component: UsersComponent },
      { path: '/rights', component: RightsP },
      { path: '/roles', component: RolesP },
      { path: '/categories', component: GoodsCate },
      { path: '/params', component: ParamsP },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: AddGood }

    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to表示将要访问的路径，from表示从哪个路径跳转而来 next放行
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
