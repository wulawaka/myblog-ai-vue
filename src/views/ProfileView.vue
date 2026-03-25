<template>
  <div class="profile-container">
    <!-- 个人信息内容 -->
    <main class="profile-main">
      <div class="profile-card">
        <div v-if="loading" class="loading-state">
          <el-icon class="is-loading"><Loading /></el-icon>
          <p>加载中...</p>
        </div>
        
        <div v-else-if="error" class="error-state">
          <el-icon><WarningFilled /></el-icon>
          <p>{{ error }}</p>
          <el-button type="primary" @click="loadUserInfo">重试</el-button>
        </div>
        
        <div v-else class="profile-info">
          <div class="avatar-section">
            <el-avatar :size="100" :icon="UserFilled" class="profile-avatar" />
            <h2 class="username">{{ userInfo.username }}</h2>
          </div>
          
          <div class="info-list">
            <div class="info-item">
              <span class="info-label"><el-icon><User /></el-icon> 用户名</span>
              <span class="info-value">{{ userInfo.username }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label"><el-icon><Message /></el-icon> 昵称</span>
              <span class="info-value">{{ userInfo.nickname || '未设置' }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label"><el-icon><ChatLineRound /></el-icon> 邮箱</span>
              <span class="info-value">{{ userInfo.email }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label"><el-icon><Clock /></el-icon> 注册时间</span>
              <span class="info-value">{{ formatDate(userInfo.createdAt) }}</span>
            </div>
          </div>
          
          <div class="action-section">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon> 编辑资料
            </el-button>
            <el-button @click="handleChangePassword">
              <el-icon><Lock /></el-icon> 修改密码
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  Loading,
  WarningFilled,
  User,
  Message,
  ChatLineRound,
  Clock,
  Edit,
  Lock
} from '@element-plus/icons-vue'
import { getUserInfo } from '@/utils/auth'

const loading = ref(false)
const error = ref('')
const router = useRouter()

interface UserInfo {
  id: number
  username: string
  nickname: string
  email: string
  createdAt?: string
}

const userInfo = ref<UserInfo>({
  id: 0,
  username: '',
  nickname: '',
  email: ''
})

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // TODO: 调用后端 API 获取用户详细信息
    // const res = await getUserProfileApi()
    // userInfo.value = res.data.data
    
    // 临时：从 localStorage 获取基本信息
    const localUserInfo = getUserInfo()
    if (localUserInfo) {
      userInfo.value = {
        id: localUserInfo.id,
        username: localUserInfo.username,
        nickname: localUserInfo.nickname,
        email: localUserInfo.email,
        createdAt: new Date().toISOString() // 临时数据
      }
    } else {
      error.value = '未找到用户信息，请重新登录'
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    error.value = '获取用户信息失败，请稍后重试'
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 编辑资料
const handleEdit = () => {
  ElMessage.info('编辑资料功能开发中...')
}

// 修改密码 - 跳转到修改密码页面
const handleChangePassword = () => {
  router.push('/change-password')
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #f4f5f5;
  padding: 20px;
}

.profile-main {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state .el-icon {
  font-size: 40px;
  color: #1e80ff;
  margin-bottom: 16px;
}

.error-state .el-icon {
  font-size: 40px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.error-state p {
  color: #909399;
  margin-bottom: 20px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-section {
  text-align: center;
  margin-bottom: 40px;
}

.profile-avatar {
  background-color: #e8f4ff;
  margin-bottom: 16px;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.info-list {
  width: 100%;
  margin-bottom: 40px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-label .el-icon {
  font-size: 18px;
  color: #1e80ff;
}

.info-value {
  font-size: 14px;
  color: #303133;
}

.action-section {
  display: flex;
  gap: 16px;
  width: 100%;
}

.action-section .el-button {
  flex: 1;
}
</style>
