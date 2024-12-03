<template>
  <!-- Убираем навигацию на отдельных страницах -->

  <!-- Здесь будет отображаться компонент маршрута -->
  <div class="safe-area">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { initTelegram, requestFullscreen, getSafeAreaInsets, isMobileDevice } from './utils/telegram';


// Устанавливаем отступы в зависимости от платформы
const safeArea = ref(getSafeAreaInsets({
  top: { value: isMobileDevice() ? 12 : 0, unit: 'vh' },
}));

onMounted(() => {
  initTelegram();
  requestFullscreen();
});
</script>

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
  flex-direction: column;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

.safe-area {
  width: 100%;
  height: 100%;
  padding: v-bind('safeArea.top.value + safeArea.top.unit') 
          v-bind('safeArea.right?.value + (safeArea.right?.unit ?? "px")') 
          v-bind('safeArea.bottom?.value + (safeArea.bottom?.unit ?? "px")') 
          v-bind('safeArea.left?.value + (safeArea.left?.unit ?? "px")');
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
