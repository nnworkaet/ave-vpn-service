<template>
  <!-- Убираем навигацию на отдельных страницах -->

  <!-- Здесь будет отображаться компонент маршрута -->
  <router-view />
</template>

<script setup></script>

<style lang="scss">
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #2a2a2a;
  min-height: 100vh;
  overflow: hidden;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}
</style>
