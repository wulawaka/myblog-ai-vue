<template>
  <div class="trash-container">
    <div class="section-title">垃圾箱</div>
    
    <!-- 回收站列表占位 -->
    <div class="trash-list-placeholder">
      <el-empty description="垃圾箱是空的" />
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO: 后续接入 API 获取用户删除的文章列表
</script>

<style scoped>
.trash-container {
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

.trash-list-placeholder {
  padding: 60px 20px;
  text-align: center;
}
</style>
