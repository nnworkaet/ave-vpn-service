<template>
  <div></div>
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
    function handleOutsideClick(event) {
      const targetElement = props.targetRef.value;

      if (
        targetElement &&
        targetElement instanceof HTMLElement &&
        !targetElement.contains(event.target)
      ) {
        targetElement.blur();
      }
    }

    onMounted(() => {
      document.addEventListener("touchstart", handleOutsideClick);
      document.addEventListener("mousedown", handleOutsideClick);
    });

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
