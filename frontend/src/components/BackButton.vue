<template>
  <div></div>
  <!-- Этот компонент не должен отображать ничего, он только обрабатывает логику -->
</template>

<script>
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { haptic } from "@/utils/telegram";

export default defineComponent({
  setup() {
    const router = useRouter();

    const goBack = () => {
      haptic.impact();
      router.back();
    };

    return {
      goBack,
    };
  },
  mounted() {
    if (window.Telegram && window.Telegram.WebApp) {
      const backButton = window.Telegram.WebApp.BackButton;

      backButton.show();

      backButton.onClick(() => {
        this.goBack();
      });
    }
  },
  beforeUnmount() {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.BackButton.offClick();
      window.Telegram.WebApp.BackButton.hide();
    }
  },
});
</script>
