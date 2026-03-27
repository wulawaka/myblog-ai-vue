<template>
  <div class="create-article-container">
    <div class="article-editor">
      <h2 class="page-title">创作文章</h2>
      
      <el-form :model="articleForm" :rules="articleRules" ref="articleFormRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input 
            v-model="articleForm.title" 
            placeholder="请输入文章标题（最多 200 字符）" 
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="概述" prop="summary">
          <el-input
            v-model="articleForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章概述（最多 500 字符）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="主分类" prop="categoryId">
          <el-select v-model="articleForm.categoryId" placeholder="请选择主分类" style="width: 100%">
            <el-option
              v-for="tag in mainTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="子标签" prop="scategoryId">
          <el-select 
            v-model="articleForm.scategoryId" 
            placeholder="请选择子标签（最多 5 个）" 
            multiple
            collapse-tags
            collapse-tags-tooltip
            style="width: 100%"
            :limit="5"
          >
            <el-option
              v-for="subTag in subTags"
              :key="subTag.id"
              :label="subTag.name"
              :value="subTag.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="articleForm.content"
            type="textarea"
            :rows="20"
            placeholder="请输入文章内容（支持 Markdown 格式）"
          />
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="articleForm.isTop">置顶文章</el-checkbox>
          <el-checkbox v-model="articleForm.isDraft" style="margin-left: 20px;">保存为草稿</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            发布文章
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { createArticleApi, type CreateArticleParams } from '@/api/article'
import { getTagTreeApi, type TagTreeNode } from '@/api/category'
import { getUserInfo } from '@/utils/auth'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/utils/request'

const router = useRouter()
const submitting = ref(false)
const articleFormRef = ref<FormInstance>()

// 表单数据
const articleForm = ref<CreateArticleParams>({
  userId: 0,
  categoryId: 0,
  title: '',
  summary: '',
  content: '',
  isTop: 0,
  isDraft: 0,
  isDeleted: 0,
  scategoryId: '',
})

// 表单验证规则
const articleRules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 1, max: 200, message: '标题长度 1-200 字符', trigger: 'blur' },
  ],
  summary: [
    { required: true, message: '请输入文章概述', trigger: 'blur' },
    { min: 1, max: 500, message: '概述长度 1-500 字符', trigger: 'blur' },
  ],
  categoryId: [
    { required: true, message: '请选择主分类', trigger: 'change' },
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
  ],
}

// 标签数据
const mainTags = ref<TagTreeNode[]>([])
const subTags = ref<{ id: number; name: string }[]>([])

// 加载标签树
const loadTagTree = async () => {
  try {
    const res = await getTagTreeApi()
    const data = (res.data as unknown) as { data: TagTreeNode[] }
    if (data && data.data) {
      mainTags.value = data.data
      // 提取所有子标签
      const allSubTags: { id: number; name: string }[] = []
      data.data.forEach((mainTag: TagTreeNode) => {
        if (mainTag.children) {
          mainTag.children.forEach((subTag: TagTreeNode) => {
            allSubTags.push({ id: subTag.id, name: subTag.name })
          })
        }
      })
      subTags.value = allSubTags
    }
  } catch (error) {
    console.error('获取标签树失败:', error)
  }
}

// 提交文章
const handleSubmit = async () => {
  if (!articleFormRef.value) return
  
  await articleFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 获取用户 ID
    const userInfo = getUserInfo()
    if (!userInfo) {
      ElMessage.error('用户未登录')
      return
    }
    
    articleForm.value.userId = userInfo.id
    
    // 处理子标签 ID，转为逗号分隔的字符串
    if (Array.isArray(articleForm.value.scategoryId)) {
      articleForm.value.scategoryId = articleForm.value.scategoryId.join(',')
    }
    
    submitting.value = true
    try {
      await createArticleApi(articleForm.value)
      ElMessage.success(articleForm.value.isDraft ? '草稿保存成功' : '文章发布成功')
      router.push('/home') // 跳转到我的主页
    } catch (error) {
      console.error('发布失败:', error)
      const axiosError = error as AxiosError<ApiResponse>
      ElMessage.error(axiosError.response?.data?.msg || '发布失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadTagTree()
})
</script>

<style scoped>
.create-article-container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  min-height: 600px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.article-editor {
  max-width: 900px;
  margin: 0 auto;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>

