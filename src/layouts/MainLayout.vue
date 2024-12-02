<template>
  <el-container>
    <el-header height="60px">
      <div class="header-container">
        <div class="logo">
          不知名系统
        </div>
        <div class="user-info">
          <el-avatar 
            :size="40" 
            :src="userStore.userInfo?.avatar || '/default-avatar.png'"
          />
          <span class="username">{{ userStore.userInfo?.username }}</span>
          <el-dropdown @command="handleCommand">
            <el-button link>
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px">
        <el-menu 
          router 
          :default-active="route.path"
          class="side-menu"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/tasks">
            <el-icon><Cpu /></el-icon>
            <span>任务管理</span>
          </el-menu-item>
          <el-menu-item index="/events">
            <el-icon><Calendar /></el-icon>
            <span>事件管理</span>
          </el-menu-item>
       
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Calendar, User, ArrowDown, Cpu } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}

const handleLogout = () => {
  userStore.clearUserData()
  router.push('/login')
}
</script>

<style scoped>
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
}

.header-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-size: 14px;
  margin-right: 8px;
}

.el-dropdown {
  cursor: pointer;
}

.side-menu {
  height: 100%;
  border-right: none;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  border-right: 2px solid var(--el-color-primary);
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-menu-item .el-icon) {
  margin-right: 12px;
}
</style>