import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { isLoggedIn, handleTokenExpiry } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'articles',
          component: () => import('@/views/ArticlesView.vue'),
          children: [
            {
              path: 'profile',
              name: 'profile',
              component: () => import('@/views/ProfileView.vue'),
              meta: { title: '个人信息' }
            },
            {
              path: 'change-password',
              name: 'change-password',
              component: () => import('@/views/ChangePasswordView.vue'),
              meta: { title: '修改密码' }
            },
            {
              path: 'article/:id',
              name: 'article-detail',
              component: () => import('@/views/ArticleDetailView.vue'),
              meta: { title: '文章详情' }
            },
            {
              path: 'home',
              name: 'home',
              component: () => import('@/views/MyHomeView.vue'),
              meta: { title: '我的主页' }
            }
          ]
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/AboutView.vue'),
        },
      ],
    },
    {
      path: '/article/create',
      name: 'article-create',
      component: () => import('@/views/CreateArticleView.vue'),
      meta: { title: '创作文章' },
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
    '/',           // 文章列表页（首页）
    '/about',      // 关于页面
    '/login',      // 登录
    '/register'    // 注册
  ]
  
  if (whiteList.includes(to.path)) {
    // 白名单路由，直接放行
    next()
  } else {
    // 其他路由需要登录（如：创建文章、分类管理等后台功能）
    if (isLoggedIn()) {
      // 已登录，放行
      next()
    } else {
      // 未登录或 token 已过期，跳转到登录页
      next('/login')
    }
  }
})

router.afterEach((to, from) => {
  // 路由切换后的操作，例如滚动到顶部
  window.scrollTo(0, 0)
})

export default router
