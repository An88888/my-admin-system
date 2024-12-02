<template>
  <div class="home-container">
    <h1 class="welcome-text">Hello, {{ userStore.username }}!</h1>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.welcome-text {
  font-size: 48px;
  text-align: center;
  margin-top: 100px;
}
</style> 