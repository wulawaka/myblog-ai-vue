<template>
  <div class="article-detail-container">
    <!-- 左侧目录 -->
    <aside class="table-of-contents" ref="tocRef">
      <h3 class="toc-title">目录</h3>
      <nav class="toc-nav">
        <ul class="toc-list">
          <li 
            v-for="(item, index) in tableOfContents" 
            :key="index"
            :class="['toc-item', `toc-level-${item.level}`]"
            @click="scrollToSection(item.id)"
          >
            {{ item.text }}
          </li>
        </ul>
      </nav>
    </aside>

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
            <el-button :type="isTop ? 'warning' : 'info'" plain disabled>
              <el-icon><Top /></el-icon>
              {{ isTop ? '已置顶' : '未置顶' }}
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import markdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import {
  Loading,
  WarningFilled,
  User,
  Calendar,
  Folder,
  PriceTag,
  Top,
  ArrowLeft
} from '@element-plus/icons-vue'
import { getArticleDetailApi } from '@/api/article'

const router = useRouter()
const route = useRoute()

// 初始化 markdown-it 实例
const md = markdownIt({
  html: true,        // 支持 HTML 标签
  linkify: true,     // 自动转换 URL 为链接
  typographer: true, // 支持排版引号等
  breaks: true,      // 支持换行符转 <br>
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch {
        // 忽略高亮错误
      }
    }
    // 自动检测语言
    try {
      return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`
    } catch {
      // 忽略自动检测错误
    }
    return str
  }
})

const loading = ref(false)
const error = ref('')
const isTop = ref(false)
const tocRef = ref<HTMLElement | null>(null)
const tocHeight = ref(200) // 默认高度

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
      
      // 等待DOM更新后生成目录
      await nextTick()
      generateTableOfContents()
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

// 返回上一页
const goBack = () => {
  router.back()
}

// 目录数据结构
interface TocItem {
  level: number
  text: string
  id: string
}

const tableOfContents = ref<TocItem[]>([])

// 生成目录
const generateTableOfContents = () => {
  // 使用 setTimeout 确保 markdown 内容已完全渲染到 DOM
  setTimeout(() => {
    const contentElement = document.querySelector('.article-body')
    if (!contentElement) {
      console.warn('未找到文章内容区域')
      return
    }
    
    // 查找所有标题元素
    const headings = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    console.log('找到的标题数量:', headings.length)
    const tocItems: TocItem[] = []
    
    headings.forEach((heading, index) => {
      // 为每个标题添加ID以便滚动定位
      const id = `heading-${index}`
      heading.setAttribute('id', id)
      
      // 添加到目录
      tocItems.push({
        level: parseInt(heading.tagName.substring(1)), // h1 -> 1, h2 -> 2, etc.
        text: heading.textContent || '',
        id: id
      })
    })
    
    tableOfContents.value = tocItems
    console.log('目录项数量:', tocItems.length)
    
    // 根据目录项数量动态设置目录高度
    updateTocHeight()
  }, 100)
}

// 更新目录高度
const updateTocHeight = () => {
  const itemCount = tableOfContents.value.length
  if (itemCount === 0) {
    tocHeight.value = 0
  } else {
    // 基础高度 + 每项约30px的高度
    const calculatedHeight = Math.max(100, itemCount * 30 + 50)
    tocHeight.value = calculatedHeight
  }
}

// 滚动到指定章节
const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 监听文章内容变化，重新生成目录
watch(renderedContent, () => {
  // 当文章内容渲染完成后，重新生成目录
  nextTick(() => {
    generateTableOfContents()
  })
})

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
  display: flex;
  gap: 20px;
}

/* 左侧目录样式 */
.table-of-contents {
  width: 250px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  position: sticky;
  top: 20px;
  /* 根据内容自动调整高度，但最大不超过视口的80% */
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;
}

.toc-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.toc-nav {
  /* 移除内层滚动，让外层容器统一处理滚动 */
  max-height: none;
  overflow-y: visible;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toc-item:hover {
  background-color: #f5f7fa;
  color: #1e80ff;
}

.toc-level-1 {
  font-weight: 600;
  padding-left: 12px;
}

.toc-level-2 {
  padding-left: 24px;
}

.toc-level-3 {
  padding-left: 36px;
  font-size: 13px;
}

.toc-level-4 {
  padding-left: 48px;
  font-size: 13px;
}

.toc-level-5 {
  padding-left: 60px;
  font-size: 12px;
}

.toc-level-6 {
  padding-left: 72px;
  font-size: 12px;
}

.article-main {
  flex: 1;
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
  background-color: #0d1117;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.article-body :deep(pre code) {
  color: #c9d1d9;
  background-color: transparent;
  padding: 0;
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