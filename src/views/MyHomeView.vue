<template>
  <div class="my-home-container">
    <div class="profile-wrapper">
      
      <header class="user-info-banner">
        <div class="banner-content">
          <el-avatar 
            :size="88" 
            src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" 
            class="user-avatar" 
          />
          
          <div class="user-details">
            <h1 class="username">{{ username }} <span class="user-level">Lv4</span></h1>
            <p class="bio">✨ 保持热爱，奔赴山海。前端/全栈开发工程师。</p>
            
            <div class="user-stats">
              <div class="stat-item">
                <span class="count">128</span>
                <span class="label">关注</span>
              </div>
              <div class="stat-item">
                <span class="count">1024</span>
                <span class="label">粉丝</span>
              </div>
              <div class="stat-item">
                <span class="count">85</span>
                <span class="label">获赞</span>
              </div>
            </div>
          </div>
          
          <div class="action-area">
            <el-button plain class="edit-btn" @click="goToProfile">编辑个人资料</el-button>
          </div>
        </div>
      </header>

      <div class="tabs-section">
        <el-tabs v-model="activeTab" class="home-tabs">
          <el-tab-pane label="📝 我的文章" name="articles"></el-tab-pane>
          <el-tab-pane label="🏷️ 标签管理" name="tags"></el-tab-pane>
          <el-tab-pane label="📦 草稿箱" name="drafts"></el-tab-pane>
          <el-tab-pane label="🗑️ 垃圾箱" name="trash"></el-tab-pane>
        </el-tabs>
      </div>

      <main class="home-main">
        <div v-show="activeTab === 'articles'" class="tab-content">
          <MyHomeArticles />
        </div>
        <div v-show="activeTab === 'tags'" class="tab-content">
          <MyHomeTags />
        </div>
        <div v-show="activeTab === 'drafts'" class="tab-content">
          <MyHomeDrafts />
        </div>
        <div v-show="activeTab === 'trash'" class="tab-content">
          <MyHomeTrash />
        </div>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MyHomeArticles from './MyHomeArticles.vue'
import MyHomeTags from './MyHomeTags.vue'
import MyHomeDrafts from './MyHomeDrafts.vue'
import MyHomeTrash from './MyHomeTrash.vue'

const router = useRouter()

// 默认激活第一个 Tab
const activeTab = ref('articles')

// 获取当前登录用户的用户名
const username = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr && userInfoStr !== 'undefined') {
    try {
      const userInfo = JSON.parse(userInfoStr)
      return userInfo.username || '我的昵称'
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }
  return '我的昵称'
})

// 跳转到个人信息页面
const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped>
/* 页面大背景 */
.my-home-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #f4f5f5;
  /* padding: 24px 0 40px 0; */
  box-sizing: border-box;
}

/* 核心白色外壳：增加更柔和的阴影 */
.profile-wrapper {
  max-width: 1000px; 
  margin: 0 auto;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* ================== 个人信息 Banner ================== */
.user-info-banner {
  background: linear-gradient(180deg, #f2f7ff 0%, #ffffff 100%);
  padding: 40px 32px 24px;
  border-bottom: 1px solid #f1f2f5;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}
.user-avatar:hover {
  transform: scale(1.05) rotate(3deg);
}

.user-details {
  flex: 1;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: #252933;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 仿掘金的等级小标 */
.user-level {
  font-size: 12px;
  background: #eaf2ff;
  color: #1e80ff;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  font-style: italic;
}

.bio {
  font-size: 14px;
  color: #515767;
  margin: 0 0 16px 0;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .count {
  font-size: 18px;
  font-weight: 600;
  color: #252933;
}

.stat-item .label {
  font-size: 12px;
  color: #8a919f;
  margin-top: 4px;
}

.action-area {
  align-self: flex-start;
}

.edit-btn {
  color: #1e80ff;
  border-color: rgba(30, 128, 255, 0.3);
  border-radius: 4px;
}
.edit-btn:hover {
  background-color: #f2f7ff;
}

/* ================== 选项卡美化 ================== */
.tabs-section {
  padding: 0 32px;
  border-bottom: 1px solid #f1f2f5;
}

:deep(.el-tabs__header) {
  margin: 0;
}
:deep(.el-tabs__nav-wrap::after) {
  display: none; /* 隐藏原本粗糙的底线 */
}
:deep(.el-tabs__item) {
  font-size: 16px;
  color: #515767;
  height: 60px;
  line-height: 60px;
  font-weight: 500;
}
:deep(.el-tabs__item.is-active) {
  color: #1e80ff;
  font-weight: 600;
}
:deep(.el-tabs__active-bar) {
  background-color: #1e80ff;
  height: 3px;
  border-radius: 2px;
}

/* ================== 底部内容区域 ================== */
.home-main {
  padding: 24px 32px;
  min-height: 500px;
}

.tab-content {
  width: 100%;
  animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

/* 丝滑的切换动画 */
@keyframes slideUpFade {
  0% { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
</style>