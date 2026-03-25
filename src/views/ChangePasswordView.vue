<template>
  <div class="change-password-container">
    <!-- 修改密码内容 -->
    <main class="password-main">
      <div class="password-card">
        <h2 class="page-title">修改密码</h2>
        
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          label-width="100px"
          label-position="top"
          class="password-form"
        >
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
              clearable
            />
            <div class="form-tip">密码长度 6-20 位，包含字母和数字</div>
          </el-form-item>
          
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                确认修改
              </el-button>
              <el-button @click="handleCancel">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { changePasswordApi, type ChangePasswordParams } from '@/api/user'

const router = useRouter()
const passwordFormRef = ref<FormInstance>()
const submitting = ref(false)

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证新密码强度
const validatePasswordStrength = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback()
    return
  }
  
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  const isValidLength = value.length >= 6 && value.length <= 20
  
  if (!isValidLength) {
    callback(new Error('密码长度必须在 6-20 位之间'))
  } else if (!hasLetter || !hasNumber) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

// 验证两次密码是否一致
const validateConfirmPassword = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证新密码是否与当前密码相同
const validateNewPasswordNotSame = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value && value === passwordForm.oldPassword) {
    callback(new Error('新密码不能与当前密码相同'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { validator: validatePasswordStrength, trigger: 'blur' },
    { validator: validateNewPasswordNotSame, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    submitting.value = true
    
    // TODO: 获取用户名和邮箱（从 localStorage 或其他地方）
    // 这里假设从 localStorage 获取用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    let username = ''
    let email = ''
    
    if (userInfoStr && userInfoStr !== 'undefined') {
      try {
        const userInfo = JSON.parse(userInfoStr)
        username = userInfo.username || ''
        email = userInfo.email || ''
      } catch (e) {
        console.error('解析用户信息失败:', e)
      }
    }
    
    // 调用后端 API 修改密码
    const params: ChangePasswordParams = {
      username,
      email,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    }
    
    await changePasswordApi(params)
    
    ElMessage.success('密码修改成功')
    
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    
    // 延迟跳转到个人信息页面
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error: unknown) {
    console.error('修改密码失败:', error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.message !== 'Validation failed') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ElMessage.error((error as any)?.message || '修改密码失败，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  passwordFormRef.value?.resetFields()
  router.back()
}
</script>

<style scoped>
.change-password-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #f4f5f5;
  padding: 20px;
}

.password-main {
  max-width: 600px;
  margin: 0 auto;
}

.password-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 30px 0;
  text-align: center;
}

.password-form {
  width: 100%;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  width: 100%;
  padding-top: 20px;
}

.form-actions .el-button {
  min-width: 120px;
}

/* 调整表单标签样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

:deep(.el-input__inner) {
  height: 40px;
}
</style>
