<template>
  <div class="home-view">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎来到我的博客</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-icon :size="100" color="#409EFF"><Promotion /></el-icon>
        <h1>欢迎来到我的个人博客</h1>
        <p>这里是我的个人空间，我会在这里分享我的技术文章、生活感悟等内容。</p>
        <el-button type="primary" size="large" @click="$router.push('/articles')">
          浏览文章
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Promotion } from '@element-plus/icons-vue'
</script>

<style scoped>
.home-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.welcome-card {
  width: 100%;
  max-width: 600px;
}

.card-header {
  display: flex;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.welcome-content {
  text-align: center;
  padding: 20px 0;
}

.welcome-content h1 {
  margin-top: 20px;
  color: #303133;
}

.welcome-content p {
  margin: 20px 0;
  color: #606266;
  line-height: 1.8;
}
</style>
