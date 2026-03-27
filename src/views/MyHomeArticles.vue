<template>
  <div class="my-articles-container">
    <div class="section-header">
      <!-- <h3 class="section-title">我的文章</h3> -->
      <div class="header-actions">
        <el-tooltip content="批量管理" placement="bottom">
          <el-button size="small" plain>批量管理</el-button>
        </el-tooltip>
      </div>
    </div>
    
    <div v-loading="loading" element-loading-text="加载中...">
      <div v-if="articleList.length > 0" class="article-list">
        <div v-for="article in articleList" :key="article.id" class="article-item">
          <div class="article-content">
            <div class="article-info">
              <div class="title-row">
                <h3 class="title" @click="navigateToArticle(article.id)">{{ article.title }}</h3>
                <div class="article-actions">
                  <el-button 
                    v-if="article.isTop === 1" 
                    type="warning" 
                    size="small" 
                    link
                    @click.stop="toggleTop(article, 0)"
                  >
                    <el-icon><Bottom /></el-icon> 取消置顶
                  </el-button>
                  <el-button 
                    v-else 
                    type="primary" 
                    size="small" 
                    link
                    @click.stop="toggleTop(article, 1)"
                  >
                    <el-icon><Top /></el-icon> 置顶
                  </el-button>
                  <el-button 
                    type="primary" 
                    size="small" 
                    link
                    @click.stop="editArticle(article.id)"
                  >
                    <el-icon><Edit /></el-icon> 编辑
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    link
                    @click.stop="deleteArticle(article.id)"
                  >
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </div>
              </div>
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
                  <span class="date">{{ formatTime(article.updatedAt) }}</span>
                  <span class="divider">|</span>
                  <span class="tag">{{ (article as any).categoryName || '未分类' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="暂无文章" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Star, ChatDotRound, Top, Bottom, Edit, Delete } from '@element-plus/icons-vue'
import { getMyArticleListApi, type Article } from '@/api/article'
import { updateTopStatusApi, deleteArticleApi } from '@/api/article'

const router = useRouter()
const loading = ref(false)
const articleList = ref<Article[]>([])
const pageNum = ref(1)
const pageSize = ref(10)

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return date.toLocaleDateString()
  }
}

// 跳转到文章详情页
const navigateToArticle = (articleId: number) => {
  router.push(`/article/${articleId}`)
}

// 编辑文章
const editArticle = (articleId: number) => {
  ElMessage.info(`编辑文章 ${articleId}`)
  // TODO: 跳转到编辑页面或打开弹窗
}

// 删除文章
const deleteArticle = async (articleId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇文章吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteArticleApi(articleId)
    ElMessage.success('删除成功')
    // 重新加载文章列表
    await loadArticleList()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 切换置顶状态
const toggleTop = async (article: Article, isTop: number) => {
  try {
    await updateTopStatusApi({ articleId: article.id, isTop })
    ElMessage.success(isTop === 1 ? '置顶成功' : '取消置顶成功')
    // 更新本地状态
    article.isTop = isTop
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 加载文章列表
const loadArticleList = async () => {
  loading.value = true
  try {
    const res = await getMyArticleListApi({ pageNum: pageNum.value, pageSize: pageSize.value })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (res.data as any)
    if (data && data.data && data.data.list) {
      articleList.value = data.data.list
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticleList()
})
</script>

<style scoped>
.my-articles-container {
  background: #fff;
  border-radius: 8px;
  /* padding: 30px; */
  min-height: 400px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.article-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.article-content {
  display: flex;
  gap: 16px;
}

.article-info {
  flex: 1;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.article-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #030404;
  margin: 0 0 10px 0;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1.4;
}

.title:hover {
  color: #030404;
}

.abstract {
  font-size: 14px;
  color: #515767;
  margin: 0 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9399a6;
}

.actions {
  display: flex;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.action-item:hover {
  color: #1e80ff;
}

.article-meta-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author {
  color: #515767;
}

.divider {
  color: #c2c7d3;
}

.date {
  color: #9399a6;
}

.tag {
  background: #f2f3f5;
  padding: 2px 8px;
  border-radius: 2px;
  color: #515767;
  font-size: 12px;
}
</style>