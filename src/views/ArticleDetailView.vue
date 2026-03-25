<template>
  <div class="article-detail-container">
    <!-- 文章内容区域 -->
    <main class="article-main">
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <el-icon><WarningFilled /></el-icon>
        <p>{{ error }}</p>
        <el-button type="primary" @click="loadArticleDetail">重试</el-button>
      </div>
      
      <div v-else class="article-content">
        <!-- 文章头部 -->
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ article.username }}
            </span>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.createdAt) }}
            </span>
            <span class="meta-item">
              <el-icon><Folder /></el-icon>
              {{ article.categoryName }}
            </span>
            <span v-if="article.subCategories && article.subCategories.length" class="meta-item">
              <el-icon><PriceTag /></el-icon>
              <span v-for="(tag, index) in article.subCategories" :key="tag.id" class="tag-item">
                {{ tag.name }}<span v-if="index < article.subCategories.length - 1">,</span>
              </span>
            </span>
          </div>
        </header>

        <!-- 文章正文 -->
        <article class="article-body" v-html="renderedContent"></article>

        <!-- 文章底部操作 -->
        <footer class="article-footer">
          <div class="action-buttons">
            <el-button :type="isTop ? 'warning' : 'info'" plain @click="handleToggleTop">
              <el-icon><Top /></el-icon>
              {{ isTop ? '已置顶' : '置顶' }}
            </el-button>
            <el-button type="danger" plain @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
          <div class="back-button">
            <el-button @click="goBack" :icon="ArrowLeft">返回上一页</el-button>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import markdownIt from 'markdown-it'
import {
  Loading,
  WarningFilled,
  User,
  Calendar,
  Folder,
  PriceTag,
  Top,
  Delete,
  ArrowLeft
} from '@element-plus/icons-vue'
import { getArticleDetailApi, deleteArticleApi, updateTopStatusApi } from '@/api/article'

const router = useRouter()
const route = useRoute()

// 初始化 markdown-it 实例
const md = markdownIt({
  html: true,        // 支持 HTML 标签
  linkify: true,     // 自动转换 URL 为链接
  typographer: true, // 支持排版引号等
  breaks: true       // 支持换行符转 <br>
})

const loading = ref(false)
const error = ref('')
const isTop = ref(false)

interface Article {
  id: number
  userId: number
  categoryId: number
  title: string
  summary: string
  content: string
  isTop: number
  isDraft: number
  isDeleted: number
  createdAt: string
  updatedAt: string
  username: string
  categoryName: string
  subCategories?: Array<{
    id: number
    name: string
  }>
}

const article = ref<Article>({
  id: 0,
  userId: 0,
  categoryId: 0,
  title: '',
  summary: '',
  content: '',
  isTop: 0,
  isDraft: 0,
  isDeleted: 0,
  createdAt: '',
  updatedAt: '',
  username: '',
  categoryName: ''
})

// Markdown 渲染
const renderedContent = computed(() => {
  return md.render(article.value.content || '')
})

// 格式化日期
const formatDate = (dateStr: string) => {
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

// 加载文章详情
const loadArticleDetail = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const articleId = route.params.id
    if (!articleId) {
      throw new Error('文章 ID 不存在')
    }
    
    const res = await getArticleDetailApi(Number(articleId))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (res.data as any)
    
    if (data && data.data) {
      article.value = data.data
      isTop.value = data.data.isTop === 1
    } else {
      throw new Error('文章数据格式错误')
    }
  } catch (err: unknown) {
    console.error('获取文章详情失败:', err)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error.value = (err as any)?.message || '获取文章详情失败，请稍后重试'
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}

// 切换置顶状态
const handleToggleTop = async () => {
  try {
    const newTopStatus = isTop.value ? 0 : 1
    
    await updateTopStatusApi({
      articleId: article.value.id,
      isTop: newTopStatus
    })
    
    isTop.value = !isTop.value
    ElMessage.success(newTopStatus === 1 ? '置顶成功' : '取消置顶成功')
  } catch (err: unknown) {
    console.error('更新置顶状态失败:', err)
    ElMessage.error('更新置顶状态失败')
  }
}

// 删除文章
const handleDelete = () => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteArticleApi(article.value.id)
      ElMessage.success('删除成功')
      setTimeout(() => {
        goBack()
      }, 1500)
    } catch (err: unknown) {
      console.error('删除文章失败:', err)
      ElMessage.error('删除文章失败')
    }
  }).catch(() => {
    // 用户取消
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  loadArticleDetail()
})
</script>

<style scoped>
.article-detail-container {
  width: 100%;
  min-height: calc(100vh - 60px);
  background-color: #f4f5f5;
  padding: 20px;
}

.article-main {
  max-width: 900px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 8px;
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

.article-content {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.article-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.article-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.meta-item .el-icon {
  font-size: 16px;
  color: #909399;
}

.tag-item {
  background-color: #e8f4ff;
  color: #1e80ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.article-body {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
}

/* Markdown 样式 */
.article-body :deep(h1),
.article-body :deep(h2),
.article-body :deep(h3),
.article-body :deep(h4),
.article-body :deep(h5),
.article-body :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #303133;
}

.article-body :deep(p) {
  margin-bottom: 16px;
}

.article-body :deep(code) {
  background-color: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}

.article-body :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.article-body :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 16px 0;
}

.article-body :deep(blockquote) {
  border-left: 4px solid #1e80ff;
  padding-left: 16px;
  margin: 16px 0;
  color: #606266;
  background-color: #f6f8fa;
  padding: 12px 16px;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.article-body :deep(th),
.article-body :deep(td) {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  text-align: left;
}

.article-body :deep(th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.article-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 30px;
  margin-top: 40px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.back-button {
  text-align: center;
}
</style>

