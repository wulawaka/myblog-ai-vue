<template>
  <div class="about-view">
    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <el-icon><User /></el-icon>
          <span>关于我</span>
        </div>
      </template>
      <div class="about-content">
        <el-descriptions title="个人信息" :column="1" border>
          <el-descriptions-item label="姓名">博主</el-descriptions-item>
          <el-descriptions-item label="职业">开发者</el-descriptions-item>
          <el-descriptions-item label="所在地">中国</el-descriptions-item>
          <el-descriptions-item label="邮箱">example@email.com</el-descriptions-item>
        </el-descriptions>
        
        <div class="about-text">
          <h2>个人简介</h2>
          <p>
            你好！我是一名热爱技术的开发者，喜欢探索新技术和分享知识。
            这个博客是我记录学习心得和技术总结的地方。
          </p>
          <p>
            主要技术栈包括：Vue.js、React、Node.js 等前端技术，
            以及对后端技术也有一定的涉猎。
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
</script>

<style scoped>
.about-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 60vh;
}

.about-card {
  width: 100%;
  max-width: 700px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.about-content {
  padding: 20px 0;
}

.about-text {
  margin-top: 30px;
}

.about-text h2 {
  color: #303133;
  margin-bottom: 20px;
}

.about-text p {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 15px;
}
</style>
