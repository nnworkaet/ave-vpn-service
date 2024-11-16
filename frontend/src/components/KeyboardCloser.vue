<template>
  <div></div>
  <!-- Этот компонент не рендерит ничего на экране -->
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount } from "vue";

export default defineComponent({
  name: "KeyboardCloser",
  props: {
    targetRef: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // Функция для закрытия клавиатуры при клике вне инпута
    function handleOutsideClick(event) {
      const targetElement = props.targetRef.value;

      // Проверяем, что targetRef является DOM-элементом
      if (
        targetElement &&
        targetElement instanceof HTMLElement &&
        !targetElement.contains(event.target)
      ) {
        targetElement.blur();
      }
    }

    // Добавляем слушатели событий
    onMounted(() => {
      document.addEventListener("touchstart", handleOutsideClick);
      document.addEventListener("mousedown", handleOutsideClick); // для десктопных устройств
    });

    // Убираем слушатели при размонтировании компонента
    onBeforeUnmount(() => {
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("mousedown", handleOutsideClick);
    });
  },
});
</script>

<style scoped>
/* Этот компонент не нуждается в стилях */
</style>
