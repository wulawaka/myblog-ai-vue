<template>
  <div class="drafts-container">
    <!-- <div class="section-title">草稿箱</div> -->
    <div class="section-header">
      <!-- <div class="header-actions">
        <el-tooltip content="批量管理" placement="bottom">
          <el-button size="small" plain>批量管理</el-button>
        </el-tooltip>
      </div> -->
    </div>
    
    <div v-loading="loading" element-loading-text="加载中...">
      <div v-if="draftList.length > 0" class="article-list">
        <div v-for="article in draftList" :key="article.id" class="article-item">
          <div class="article-content">
            <div class="article-info">
              <div class="title-row">
                <h3 class="title" @click="navigateToArticle(article.id)">{{ article.title }}</h3>
                <div class="article-actions">
                  <el-button 
                    type="success" 
                    size="small" 
                    link
                    @click.stop="recoverDraft(article.id)"
                  >
                    <el-icon><Refresh /></el-icon> 编辑
                  </el-button>
                </div>
              </div>
              <p class="abstract">{{ article.summary }}</p>
              
              <div class="item-footer">
                <div class="actions">
                  <span class="action-item"><el-icon><View /></el-icon> 0</span>
                  <span class="action-item"><el-icon><Star /></el-icon> 0</span>
                  <span class="action-item"><el-icon><ChatDotRound /></el-icon> 0</span>
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
      
      <el-empty v-else description="暂无草稿" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { View, Star, ChatDotRound, Refresh } from '@element-plus/icons-vue'
import { getArticleStatusApi, type Article } from '@/api/article'

const router = useRouter()
const loading = ref(false)
const draftList = ref<Article[]>([])
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

// 恢复草稿 (功能待实现)
const recoverDraft = (articleId: number) => {
  ElMessage.info(`恢复草稿 ${articleId} (功能开发中)`)
  // TODO: 后续实现恢复功能
}

// 加载草稿列表
const loadDraftList = async () => {
  loading.value = true
  try {
    // 调用 API 查询草稿状态的文章
    const res = await getArticleStatusApi({
      isDraft: 1,    // 草稿状态
      isDeleted: 0,  // 未删除
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    
    // 解析响应数据
    const data = (res.data as unknown) as { data: { list: Article[] } }
    if (data && data.data && data.data.list) {
      draftList.value = data.data.list
    }
  } catch (error) {
    console.error('获取草稿列表失败:', error)
    ElMessage.error('获取草稿列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDraftList()
})
</script>

<style scoped>
.drafts-container {
  background: #fff;
  border-radius: 8px;
  /* padding: 30px; */
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 8px;
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

.drafts-list-placeholder {
  padding: 60px 20px;
  text-align: center;
}
</style>
