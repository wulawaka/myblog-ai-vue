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
            placeholder="探索稀土掘金"
            class="search-input"
            :prefix-icon="Search"
          />
          
          <span class="greeting-text" @click="handleGreetingClick">{{ greetingText }}</span>
        </div>
      </div>
    </header>

    <main class="main-container">
      
      <div class="content-area">
        <div class="list-header">
          <a href="#" class="active">推荐</a>
          <a href="#">最新</a>
          <a href="#">置顶</a>
        </div>
        
        <div class="article-list">
          <div class="article-item">
            
            <div class="article-content">
              <div class="article-info">
                <h3 class="title">单位：px、em、rem、vw、vh、clamp 怎么选？</h3>
                <p class="abstract">在前端开发中，尺寸单位的选择直接影响到页面的响应式表现和用户体验。本文将深入探讨不同场景下的单位选择，帮你理清这些相对单位与绝对单位的最佳实践...</p>
                
                <div class="item-footer">
                  <div class="actions">
                    <span class="action-item"><el-icon><View /></el-icon> 8512</span>
                    <span class="action-item"><el-icon><Star /></el-icon> 128</span>
                    <span class="action-item"><el-icon><ChatDotRound /></el-icon> 36</span>
                  </div>

                  <div class="article-meta-bottom">
                    <span class="author">Moment</span>
                    <span class="divider">|</span>
                    <span class="date">2小时前</span>
                    <span class="divider">|</span>
                    <span class="tag">前端</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="sidebar">
        <div class="sidebar-card sign-card">
          <div class="sign-info">
            <h4>下午好！</h4>
            <p>点亮在社区的每一天</p>
          </div>
          <el-button plain class="sign-btn">去签到</el-button>
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
// 需要引入 Element Plus 的图标
import { Search, View, Star, ChatDotRound } from '@element-plus/icons-vue'
import { getUserInfo, isLoggedIn } from '@/utils/auth'

const router = useRouter()
const route = useRoute()

// 搜索框数据绑定 (为后续接入 Pinia 或 API 留存)
const searchQuery = ref('')

// 登录状态
const isLogin = ref(false)

// 用户名
const username = ref('')

// 问候语文本（改为 ref，不用 computed）
const greetingText = ref('您还没有登录')

// 更新用户信息
const updateUserInfo = () => {
  isLogin.value = isLoggedIn()
  
  // 只有在已登录时才获取用户信息
  if (isLogin.value) {
    const userInfo = getUserInfo()
    username.value = userInfo?.username || ''
    
    // 直接更新 greetingText
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

// 处理问候语点击
const handleGreetingClick = () => {
  if (!isLogin.value) {
    window.location.href = '/login'
  }
}

// 监听路由变化，更新用户信息
watch(
  () => route.fullPath,
  () => {
    // 延迟一点执行，确保 localStorage 已经写入
    setTimeout(() => {
      updateUserInfo()
    }, 100)
  }
)

// 页面加载时更新用户信息
onMounted(() => {
  // 延迟执行，确保有足够时间从登录页跳转过来
  setTimeout(() => {
    updateUserInfo()
  }, 100)
})

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 判断是否为当前激活的路由
const isActiveRoute = (path: string) => {
  return route.path === path
}
</script>

<style scoped>
/* --- 核心修复：重置 Vite 默认样式，并铺满一整块完美背景 --- */
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
}
.greeting-text:hover {
  color: #1e80ff;
}
/* 未登录状态下的样式 */
.greeting-text.not-logged-in {
  color: #909090;
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

.creator-btn {
  background-color: #1e80ff;
  border-radius: 4px;
}

.user-avatar {
  cursor: pointer;
}

.main-container {
  width: 1000px; 
  margin: 0 auto;
  display: flex;
  justify-content: space-between; 
  gap: 20px;
}

.content-area {
  flex: 1; 
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.list-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e6eb;
  display: flex;
  gap: 24px;
}

.list-header a {
  text-decoration: none;
  color: #909090;
  font-size: 14px;
}

.list-header a.active {
  color: #1e80ff;
}

.article-item {
  padding: 20px;
  border-bottom: 1px solid #e4e6eb;
  cursor: pointer;
  transition: background-color 0.2s;
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

/* 【新增】标签云容器样式：实现错落放着、不一行一行 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap; /* 自动换行，形成错落感 */
  gap: 10px; /* 标签之间的间距 */
  padding-top: 4px;
}

/* 【新增】自定义小圆形卡片标签基础样式 */
.blog-tag {
  display: inline-block;
  padding: 6px 14px; /* 上下少，左右多，形成椭圆感 */
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px; /* 大圆角，形成圆形卡片感 */
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent; /* 预留边框位置 */
}

.blog-tag:hover {
  transform: translateY(-2px); /* 悬浮微动效 */
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* 【新增】定义不同的莫兰迪色系（淡雅，不刺眼）给不同的标签 */
.tag-java {
  background-color: #e8f4ff;
  color: #1e80ff;
}
.tag-python {
  background-color: #fff7e6;
  color: #fa8c16;
}
.tag-vue {
  background-color: #e6fffb;
  color: #00b96b;
}
.tag-ts {
  background-color: #f0f5ff;
  color: #2f54eb;
}
.tag-react {
  background-color: #e6f7ff;
  color: #13c2c2;
}
.tag-node {
  background-color: #f6ffed;
  color: #52c41a;
}
.tag-css {
  background-color: #fff0f6;
  color: #eb2f96;
}
.tag-docker {
  background-color: #e6f7ff;
  color: #1890ff;
}
.tag-ai {
  background-color: #f9f0ff;
  color: #722ed1;
}
.tag-go {
  background-color: #e6fffb;
  color: #08979c;
}
</style>