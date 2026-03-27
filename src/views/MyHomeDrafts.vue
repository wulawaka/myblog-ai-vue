<template>
  <div class="drafts-container">
    <div class="section-title">草稿箱</div>
    
    <!-- 草稿列表占位 -->
    <div class="drafts-list-placeholder">
      <el-empty description="暂无草稿" />
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 后续接入 API 获取用户草稿列表
</script>

<style scoped>
.drafts-container {
  background: #fff;
  border-radius: 8px;
  padding: 30px;
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

.drafts-list-placeholder {
  padding: 60px 20px;
  text-align: center;
}
</style>
