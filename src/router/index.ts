import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { isLoggedIn } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('@/views/ArticlesView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { title: '注册' },
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 我的博客`
  }
  
  // 白名单路由（不需要登录）
  const whiteList = [
    '/',           // 首页
    '/articles',   // 文章列表
    '/about',      // 关于页面
    '/login',      // 登录
    '/register'    // 注册
  ]
  
  if (whiteList.includes(to.path)) {
    // 如果已登录，访问登录/注册页则跳转到首页
    if (isLoggedIn() && (to.path === '/login' || to.path === '/register')) {
      next('/')
    } else {
      next()
    }
  } else {
    // 其他路由需要登录（如：创建文章、分类管理等后台功能）
    if (isLoggedIn()) {
      next()
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  }
})

router.afterEach((to, from) => {
  // 路由切换后的操作，例如滚动到顶部
  window.scrollTo(0, 0)
})

export default router
