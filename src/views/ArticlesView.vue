<template>
  <div class="juejin-layout">
    <header class="navbar">
      <div class="nav-content">
        <div class="nav-left">
          <span class="logo-text" @click="navigateTo('/')">我的博客</span>
          <ul class="nav-menu">
            <li :class="{ active: isActiveRoute('/') }" @click="navigateTo('/')">首页</li>
            <li :class="{ active: isActiveRoute('/about') }" @click="navigateTo('/about')">关于</li>
          </ul>
        </div>
        <div class="nav-right">
          <el-input
            v-model="searchQuery"
            placeholder="探索这里"
            class="search-input"
            :prefix-icon="Search"
          />
          
          <el-dropdown v-if="isLogin" trigger="hover" @command="handleDropdownCommand">
            <span class="greeting-text">
              {{ greetingText }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="homepage">我的主页</el-dropdown-item>
                <el-dropdown-item command="tags">标签管理</el-dropdown-item>
                <el-dropdown-item command="drafts">草稿箱</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span v-else class="greeting-text" @click="handleGreetingClick">{{ greetingText }}</span>
        </div>
      </div>
    </header>

    <main class="main-container">
      <!-- 子路由视图：用于显示个人信息、修改密码等子页面 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      
      <!-- 默认内容：文章列表和侧边栏 -->
      <div v-if="$route.name === 'articles'" class="content-area">
        <div class="category-nav">
          
          <div class="fixed-tabs">
            <a href="#" class="active">推荐</a>
            <a href="#">最新</a>
            <a href="#">置顶</a>
          </div>

          <div class="tabs-divider"></div>

          <div class="scroll-tabs-wrapper">
            <div class="scroll-arrow left-arrow" @click="scrollTabs(-150)">
              <el-icon><ArrowLeft /></el-icon>
            </div>
            
            <div class="scroll-viewport" ref="tabsContainer">
              <a 
                v-for="tag in tagTreeList" 
                :key="tag.id" 
                href="#"
                @click.prevent="handleTagClick(tag.id)"
                :class="{ active: selectedCategoryId === tag.id }"
              >
                {{ tag.name }}
              </a>
            </div>

            <div class="scroll-arrow right-arrow" @click="scrollTabs(150)">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
        
        <div class="article-list">
          <div v-for="article in articleList" :key="article.id" class="article-item">
            <div class="article-content">
              <div class="article-info">
                <h3 class="title" @click="navigateToArticle(article.id)">{{ article.title }}</h3>
                <p class="abstract">{{ article.summary }}</p>
                        
                <div class="item-footer">
                  <div class="actions">
                    <span class="action-item"><el-icon><View /></el-icon> 8512</span>
                    <span class="action-item"><el-icon><Star /></el-icon> 128</span>
                    <span class="action-item"><el-icon><ChatDotRound /></el-icon> 36</span>
                  </div>
        
                  <div class="article-meta-bottom">
                    <span class="author">{{ (article as any).username || '未知作者' }}</span>
                    <span class="divider">|</span>
                    <span class="date">2 小时前</span>
                    <span class="divider">|</span>
                    <span class="tag">{{ (article as any).categoryName || '前端' }}</span>
                  </div>
                </div>
        
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页组件 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pageNum"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next, jumper"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <aside v-if="$route.name === 'articles'" class="sidebar">
        <div class="sidebar-card sign-card">
          <div class="sign-info">
            <h4>下午好！</h4>
            <p>点亮在这里的每一天</p>
          </div>
          <el-button plain class="sign-btn" @click="handleWriteArticle">写文章</el-button>
        </div>

        <div class="sidebar-card tag-card">
          <div class="card-header">
            <span>🏷️ 标签</span>
          </div>
          
          <div class="tag-cloud">
            <span class="blog-tag tag-java">Java</span>
            <span class="blog-tag tag-python">Python</span>
            <span class="blog-tag tag-vue">Vue3</span>
            <span class="blog-tag tag-ts">TypeScript</span>
            <span class="blog-tag tag-react">React</span>
            <span class="blog-tag tag-node">Node.js</span>
            <span class="blog-tag tag-css">CSS3</span>
            <span class="blog-tag tag-docker">Docker</span>
            <span class="blog-tag tag-ai">AI</span>
            <span class="blog-tag tag-go">Go</span>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
// 【新增】引入了 ArrowLeft 图标
import { Search, View, Star, ChatDotRound, ArrowDown, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import { getUserInfo, isLoggedIn, logout } from '@/utils/auth'
import { getArticleListApi, type Article } from '@/api/article'
import { getTagTreeApi, type TagTreeNode } from '@/api/category'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const isLogin = ref(false)
const username = ref('')
const greetingText = ref('您还没有登录')
const articleList = ref<Article[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0) // 总记录数

// 标签树列表
const tagTreeList = ref<TagTreeNode[]>([])

// 当前选中的分类 ID（null 表示全部）
const selectedCategoryId = ref<number | null>(null)

// 【修改】标签栏滚动逻辑，接收一个偏移量参数，正数向右，负数向左
const tabsContainer = ref<HTMLElement | null>(null)
const scrollTabs = (offset: number) => {
  if (tabsContainer.value) {
    tabsContainer.value.scrollBy({ left: offset, behavior: 'smooth' })
  }
}

const updateUserInfo = () => {
  isLogin.value = isLoggedIn()
  if (isLogin.value) {
    const userInfo = getUserInfo()
    username.value = userInfo?.username || ''
    if (username.value) {
      greetingText.value = `你好！${username.value}`
    } else {
      greetingText.value = '您好'
    }
  } else {
    username.value = ''
    greetingText.value = '您还没有登录'
  }
}

const handleGreetingClick = () => {
  if (!isLogin.value) {
    window.location.href = '/login'
  }
}

const handleDropdownCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'homepage':
      router.push('/home')
      break
    case 'tags':
      ElMessage.info('标签管理功能开发中...')
      break
    case 'drafts':
      ElMessage.info('草稿箱功能开发中...')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = () => {
  logout()
}

// 跳转到文章详情页
const navigateToArticle = (articleId: number) => {
  router.push(`/article/${articleId}`)
}

const loadArticleList = async () => {
  try {
    const params: Record<string, string | number | undefined> = { 
      pageNum: pageNum.value, 
      pageSize: pageSize.value 
    }
    
    // 如果有选中的分类，添加 categoryId 参数
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
    }
    
    const res = await getArticleListApi(params)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (res.data as any)
    if (data && data.data && data.data.list) {
      articleList.value = data.data.list
      // 保存总记录数
      total.value = data.data.total || 0
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    // 页面纯视觉演示时不强制报错弹窗
  }
}

const loadTagTree = async () => {
  try {
    const res = await getTagTreeApi()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (res.data as any)
    if (data && data.data) {
      tagTreeList.value = data.data
    }
  } catch (error) {
    console.error('获取标签树失败:', error)
    ElMessage.error('获取标签树失败，请稍后重试')
  }
}

watch(
  () => route.fullPath,
  () => {
    setTimeout(() => {
      updateUserInfo()
    }, 100)
  }
)

onMounted(() => {
  setTimeout(() => {
    updateUserInfo()
  }, 100)
  loadArticleList()
  loadTagTree()
})

const navigateTo = (path: string) => {
  router.push(path)
}

const isActiveRoute = (path: string) => {
  return route.path === path
}

// 跳转到写文章页面
const handleWriteArticle = () => {
  router.push('/article/create')
}

// 处理标签点击事件
const handleTagClick = async (categoryId: number) => {
  // 如果点击的是已选中的标签，取消选中（显示全部）
  if (selectedCategoryId.value === categoryId) {
    selectedCategoryId.value = null
  } else {
    selectedCategoryId.value = categoryId
  }
  
  // 重置页码
  pageNum.value = 1
  
  // 重新加载文章列表
  await loadArticleList()
}

// 处理分页变化
const handlePageChange = async (page: number) => {
  pageNum.value = page
  await loadArticleList()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
:global(body), :global(html) {
  margin: 0;
  padding: 0;
  background-color: #f4f5f5 !important; 
}

:global(#app) {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
}

.juejin-layout::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #f4f5f5;
  z-index: -999;
}

.juejin-layout {
  min-height: 100vh;
  font-family: -apple-system, system-ui, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
  position: relative;
  z-index: 1;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #f1f1f1;
  z-index: 100;
  display: flex;
  justify-content: center;
}

.nav-content {
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 22px;             
  font-weight: 800;            
  margin-right: 30px;          
  letter-spacing: 2px;         
  cursor: pointer;             
  background: linear-gradient(135deg, #1e80ff 0%, #4facfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0px 2px 4px rgba(30, 128, 255, 0.1);
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 24px;
}

.nav-menu li {
  color: #515767;
  font-size: 14px;
  cursor: pointer;
}

.nav-menu li:hover, .nav-menu li.active {
  color: #1e80ff; 
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.greeting-text {
  font-size: 15px;
  color: #515767;
  font-weight: 600;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}
.greeting-text:hover {
  color: #1e80ff;
}

:deep(.el-dropdown-menu__item) {
  border: none !important;
}
:deep(.el-dropdown-menu) {
  border: none !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

.search-input {
  width: 300px;
}

:deep(.search-input .el-input__wrapper) {
  background-color: #f2f3f5;
  border-radius: 4px;
  box-shadow: none;
}
:deep(.search-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #1e80ff inset;
  background-color: #fff;
}

/* 核心修复：删除了 padding-top: 80px，改用 margin-top 完美避开导航栏高度并留一点间距 */
.main-container {
  width: 1000px; 
  margin: 1px auto 0;
  display: flex;
  justify-content: space-between; 
  gap: 20px;
}

.content-area {
  flex: 1; 
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* --- 分类导航栏样式重构 --- */
.category-nav {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e6eb;
  padding: 0 20px;
  height: 50px; /* 固定高度，统一内外布局 */
}

/* 固定的左侧标签 */
.fixed-tabs {
  display: flex;
  gap: 24px;
  flex-shrink: 0; /* 确保不被右侧挤压 */
}

.fixed-tabs a {
  text-decoration: none;
  color: #909090;
  font-size: 14px;
}
.fixed-tabs a.active {
  color: #1e80ff;
}

/* 分割线 */
.tabs-divider {
  width: 1px;
  height: 14px;
  background-color: #e4e6eb;
  margin: 0 20px;
  flex-shrink: 0;
}

/* 包含箭头和滚动视口的外部包装器 */
.scroll-tabs-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  overflow: hidden;
  height: 100%;
}

/* 实际进行滚动的视口容器 */
.scroll-viewport {
  display: flex;
  gap: 24px;
  flex: 1;
  align-items: center;
  height: 100%;
  overflow-x: auto;
  white-space: nowrap;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scroll-viewport::-webkit-scrollbar {
  display: none;
}

.scroll-viewport a {
  text-decoration: none;
  color: #909090;
  font-size: 14px;
  flex-shrink: 0;
}
.scroll-viewport a:hover {
  color: #1e80ff;
}
/* 选中的标签高亮样式 */
.scroll-viewport a.active {
  color: #1e80ff;
  font-weight: 600;
  border-bottom: 2px solid #1e80ff;
  padding-bottom: 2px;
}

/* 左右滚动箭头的通用样式 */
.scroll-arrow {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  color: #8a919f;
  cursor: pointer;
  z-index: 2;
  padding: 0 8px;
}
.scroll-arrow:hover {
  color: #1e80ff;
}

/* 左箭头：靠左，带有向右扩散的白色遮罩渐变效果 */
.left-arrow {
  left: 0;
  box-shadow: 12px 0 10px -5px rgba(255, 255, 255, 0.9);
}

/* 右箭头：靠右，带有向左扩散的白色遮罩渐变效果 */
.right-arrow {
  right: 0;
  box-shadow: -12px 0 10px -5px rgba(255, 255, 255, 0.9);
}
/* -------------------- */


.article-item {
  padding: 20px;
  border-bottom: 1px solid #e4e6eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 20px;
  background: #fff;
}

.article-item:hover {
  background-color: #fafafa;
}

.article-info .title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin: 0 0 8px 0;
  line-height: 24px;
}

.article-info .abstract {
  font-size: 13px;
  color: #86909c;
  margin: 0 0 12px 0; 
  line-height: 22px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 20px;
  color: #8a919f;
  font-size: 13px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-item:hover {
  color: #1e80ff;
}

.article-meta-bottom {
  font-size: 13px;
  color: #8a919f;
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-meta-bottom .author {
  color: #4e5969;
}

.article-meta-bottom .divider {
  color: #e4e6eb;
}

.sidebar {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.sign-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sign-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #1d2129;
}

.sign-info p {
  margin: 0;
  font-size: 12px;
  color: #8a919f;
}

.sign-btn {
  color: #1e80ff;
  border-color: rgba(30, 128, 255, 0.3);
  background-color: rgba(30, 128, 255, 0.05);
}

.sign-btn:hover {
  background-color: rgba(30, 128, 255, 0.1);
}

.card-header {
  font-size: 14px;
  color: #1d2129;
  border-bottom: 1px solid #e4e6eb;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap; 
  gap: 10px; 
  padding-top: 4px;
}

.blog-tag {
  display: inline-block;
  padding: 6px 14px; 
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px; 
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent; 
}

.blog-tag:hover {
  transform: translateY(-2px); 
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

:deep(.el-tooltip__trigger),
:deep(.el-tooltip__trigger:focus-visible),
:deep(.el-dropdown),
:deep(.el-dropdown:focus-visible),
.greeting-text:focus,
.greeting-text:focus-visible {
  outline: none !important;
}

.tag-java { background-color: #e8f4ff; color: #1e80ff; }
.tag-python { background-color: #fff7e6; color: #fa8c16; }
.tag-vue { background-color: #e6fffb; color: #00b96b; }
.tag-ts { background-color: #f0f5ff; color: #2f54eb; }
.tag-react { background-color: #e6f7ff; color: #13c2c2; }
.tag-node { background-color: #f6ffed; color: #52c41a; }
.tag-css { background-color: #fff0f6; color: #eb2f96; }
.tag-docker { background-color: #e6f7ff; color: #1890ff; }
.tag-ai { background-color: #f9f0ff; color: #722ed1; }
.tag-go { background-color: #e6fffb; color: #08979c; }

/* 子路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>