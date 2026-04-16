<template>
  <div class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">我的博客</router-link>
        </div>
        <el-menu
          mode="horizontal"
          :ellipsis="false"
          class="nav-menu"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/about">
            <el-icon><User /></el-icon>
            <span>关于</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="layout-main">
      <router-view />
    </el-main>

    <!-- 底部 -->
    <el-footer class="layout-footer">
      <div class="footer-content">
        <p>&copy; 2026 我的博客。All rights reserved.</p>
      </div>
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { House, User } from '@element-plus/icons-vue'
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background-color: #545c64;
  padding: 0;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo a {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-decoration: none;
}

.nav-menu {
  border-bottom: none;
  background-color: transparent;
}

.layout-main {
  flex: 1;
  padding: 0;
  background-color: #f5f7fa;
  width: 100%;
  overflow: visible !important; /* 确保 sticky 定位正常工作 */
}

.layout-footer {
  background-color: #545c64;
  color: #fff;
  padding: 20px 0;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content p {
  margin: 0;
}
</style>
