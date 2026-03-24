<template>
  <div class="register-container">
    <div class="register-box">
      <div class="left-section"></div>
      
      <div class="right-section glass-effect">
        <div class="form-wrapper">
          <el-form 
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-position="top" 
            class="register-form"
          >
            
            <el-form-item label="用户名" class="left-label" prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="输入用户名" 
                size="large" 
              />
            </el-form-item>

            <el-form-item label="邮箱" class="left-label" prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="请输入邮箱" 
                size="large" 
              />
            </el-form-item>
            
            <el-form-item label="密码" class="left-label" prop="password">
              <el-input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="请输入密码" 
                show-password 
                size="large" 
              />
            </el-form-item>

            <el-form-item label="确认密码" class="left-label" prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="请确认密码" 
                show-password 
                size="large" 
              />
            </el-form-item>

            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                class="register-btn"
                :loading="loading"
                @click="handleRegister"
              >
                注 册
              </el-button>
            </div>
            
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { registerApi } from '@/api/user'
import type { RegisterParams } from '@/api/user'

// 表单引用
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const router = useRouter()

// 表单数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validator: async (rule: any, value: string) => {
        if (value !== registerForm.password) {
          throw new Error('两次输入的密码不一致')
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 构造提交给后端的参数，password 使用第二次输入的密码（confirmPassword）
        const registerData: RegisterParams = {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.confirmPassword // 使用第二次输入的密码
        }
        
        // 调用注册 API
        await registerApi(registerData)
        
        ElMessage.success('注册成功')
        // 注册成功后跳转到登录页
        setTimeout(() => {
          router.push('/login')
        }, 500)
      } catch (error) {
        ElMessage.error('注册失败，请稍后重试')
        console.error('注册错误:', error)
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.error('请填写完整信息并检查格式')
    }
  })
}
</script>

<style scoped>
/* 1. 全局清除浏览器的默认边距，避免撑出滚动条 */
:global(body) {
  margin: 0;
  padding: 0;
  /* 如果整个项目都不需要根级别滚动，可以加上这句，否则只加 margin: 0 即可 */
  overflow: hidden; 
}

/* 2. 修改主容器，严格限制尺寸并隐藏溢出 */
.register-container {
  height: 100vh;  /* 从 min-height 改为 height，严格等于视口高度 */
  width: 100vw;   /* 严格等于视口宽度，防止横向滚动 */
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #4facfe 0%, #a8b0b8 100%);
  overflow: hidden; /* 核心：截断任何超出容器的内容，彻底干掉滚动条 */
}
/* 整个页面背景：从左蓝到右灰渐变 */
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #4facfe 0%, #a8b0b8 100%);
}

/* 外框面板：有一定厚度的边框 */
.register-box {
  display: flex;
  width: 850px; /* 注册表单项较多，稍微加宽一点让视觉更舒展 */
  height: 600px; /* 增加高度以容纳更多的输入框 */
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
  flex: 1.2; /* 右侧稍微给多一点空间，避免表单拥挤 */
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

.register-form {
  width: 100%;
}

/* 标签强制靠左排布且加粗 */
:deep(.el-form-item__label) {
  font-weight: bold;
  color: #333;
  padding-bottom: 4px;
  line-height: 1.2;
}

/* 减小表单项的底部间距，让纵向排列更紧凑 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 按钮区域竖向排列居中 */
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}

.action-buttons .el-button {
  width: 100%;
  margin-left: 0; 
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 4px; /* 让“注册”两个字拉开一点距离，视觉更好看 */
}

/* 注册按钮定制颜色：没选中淡蓝色，选中/悬浮深蓝色 */
.register-btn {
  background-color: #87ceeb !important; /* 淡蓝色 */
  border-color: #87ceeb !important;
  color: #fff !important;
  transition: all 0.3s ease;
}

/* 悬浮、点击激活、获得焦点时变为深蓝色 */
.register-btn:hover,
.register-btn:active,
.register-btn:focus {
  background-color: #00008b !important; /* 深蓝色 */
  border-color: #00008b !important;
}
</style>