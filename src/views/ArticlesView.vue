<template>
  <div class="articles-view">
    <el-card class="articles-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>文章列表</span>
        </div>
      </template>
      <div class="articles-content">
        <el-empty description="暂无文章" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.articles-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;
}

.articles-card {
  width: 100%;
  max-width: 800px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.articles-content {
  padding: 40px 0;
}
</style>
