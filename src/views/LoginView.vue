<template>
  <div class="login-container">
    <div class="login-box">
      <div class="left-section">
        <div ref="lottieContainer" class="lottie-box"></div>
      </div>
      
      <div class="right-section glass-effect">
        <div class="form-wrapper">
          <el-form 
            ref="loginFormRef"
            :model="loginForm" 
            :rules="loginRules"
            label-position="top" 
            class="login-form"
          >
            <el-form-item label="用户名" prop="username" class="left-label">
              <el-input 
                v-model="loginForm.username" 
                placeholder="输入用户名" 
                size="large" 
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password" class="left-label">
              <el-input 
                type="password" 
                v-model="loginForm.password"
                placeholder="请输入密码" 
                show-password 
                size="large" 
              />
            </el-form-item>

            <div class="forgot-password">
              <el-link :underline="false" type="info" @click="handleForgotPassword">
                忘记密码
              </el-link>
            </div>

            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                :class="['login-btn', { 'login-btn--disabled': !isPasswordValid }]"
                :loading="loading"
                :disabled="!isPasswordValid"
                @click="handleLogin"
              >
                登录
              </el-button>
              <el-button 
                size="large" 
                class="register-btn"
                @click="handleRegister"
              >
                注册
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { loginApi } from '@/api/user'
import { setToken, setUserInfo } from '@/utils/auth'
import type { AnimationItem } from 'lottie-web'
import lottie from 'lottie-web'
import carAnimation from '@/assets/car-loading.json'

const lottieContainer = ref(null);
let animationInstance: AnimationItem | null = null;
const router = useRouter()
const loading = ref(false)
const loginFormRef = ref<FormInstance>()

// 计算密码长度是否有效（6-20位）
const isPasswordValid = computed(() => {
  const len = loginForm.password.length
  return len >= 6 && len <= 20
})

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单校验规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    loading.value = true
    const res = await loginApi(loginForm)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loginData = (res.data as any)?.data
    
    // 注意：后端返回的格式是 {code, msg, data: {token, userInfo}}
    if (loginData?.token) {
      setToken(loginData.token)
    }
    if (loginData?.userInfo) {
      setUserInfo(loginData.userInfo)
    }
    
    ElMessage.success('登录成功')
    setTimeout(() => {
      router.push('/')
    }, 500)
  } catch (error: unknown) {
    const err = error as Error & { code?: number; msg?: string }
    
    if (err.code === 40110) {
      // 账户被锁定，显示后端返回的具体信息（如："密码错误，已失败3/3次，请15分钟后再试"）
      ElMessage.error(err.msg || '密码错误次数过多，账户已锁定，请15分钟后再试')
    } else if (err.message && !err.message.includes('登录失败')) {
      // 表单验证失败，Element Plus 会自动显示错误提示
      console.log('表单验证失败:', err)
    } else {
      // 普通登录失败（用户名或密码错误）
      ElMessage.error('用户名或密码错误')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 处理注册跳转
 */
const handleRegister = () => {
  router.push('/register')
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能开发中...')
}

onMounted(() => {
  // 初始化 Lottie 动画
  animationInstance = lottie.loadAnimation({
    container: lottieContainer.value!, // 绑定 DOM 元素
    renderer: 'svg', // 渲染方式，推荐 svg
    loop: true, // 是否循环播放
    autoplay: true, // 是否自动播放
    animationData: carAnimation // 引入的 json 数据
  });
});

onBeforeUnmount(() => {
  // 组件销毁前，销毁动画实例，防止内存泄漏
  if (animationInstance) {
    animationInstance.destroy();
  }
});
</script>

<style scoped>
/* 整个页面背景：从左蓝到右灰渐变 */
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #4facfe 0%, #a8b0b8 100%);
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 外框面板：有一定厚度的边框 */
.login-box {
  display: flex;
  width: 800px;
  height: 500px;
  /* 增加边框厚度和半透明效果 */
  border: 16px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  background-clip: padding-box;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* 左侧保持透明，用于衬托背景 */
.left-section {
  flex: 1;
}

/* 右侧毛玻璃特效 */
.right-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

/* 表单容器，使其内部居中但自适应宽度 */
.form-wrapper {
  width: 75%;
  display: flex;
  flex-direction: column;
  align-items: center; /* 整体居中 */
}

.login-form {
  width: 100%;
}

/* 标签强制靠左 */
:deep(.el-form-item__label) {
  font-weight: bold;
  color: #333;
  padding-bottom: 4px;
}

/* 忘记密码靠右或居中配置，这里略微靠右更符合常见UX，如果需要完全居中可改成 center */
.forgot-password {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
  width: 100%;
}

/* 按钮区域竖向排列居中 */
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.action-buttons .el-button {
  width: 100%;
  margin-left: 0; /* 覆盖 el-button 默认的相邻 margin */
  border-radius: 8px;
}

/* 登录按钮：默认灰色（无效状态） */
.login-btn {
  background-color: #ccc !important;
  border-color: #ccc !important;
  color: #fff !important;
  transition: all 0.3s ease;
}

/* 登录按钮：密码有效时显示深蓝色 */
.login-btn:not(.login-btn--disabled) {
  background-color: #00008b !important;
  border-color: #00008b !important;
}

.login-btn:not(.login-btn--disabled):hover,
.login-btn:not(.login-btn--disabled):active,
.login-btn:not(.login-btn--disabled):focus {
  background-color: #0000cd !important;
  border-color: #0000cd !important;
}

/* 禁用状态样式 */
.login-btn--disabled {
  cursor: not-allowed !important;
  opacity: 0.6 !important;
}

/* 注册按钮稍微调优以适配毛玻璃 */
.register-btn {
  background-color: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  color: #333 !important;
}

.register-btn:hover {
  background-color: rgba(255, 255, 255, 0.9) !important;
}
</style>
