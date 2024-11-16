<template>
  <div></div>
  <!-- Этот компонент не должен отображать ничего, он только обрабатывает логику -->
</template>

<script>
export default {
  name: "BackButton",
  mounted() {
    // Проверяем, доступен ли Telegram.WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const backButton = window.Telegram.WebApp.BackButton;

      // Делаем кнопку "Назад" видимой
      backButton.show();

      // Добавляем обработчик нажатия на кнопку "Назад"
      backButton.onClick(() => {
        // Переходим на главную страницу
        this.$router.push("/");
      });
    }
  },
  beforeUnmount() {
    // Убираем обработчик при демонтировании компонента
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    }
  },
};
</script>
