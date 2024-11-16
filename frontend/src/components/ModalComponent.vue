<template>
  <div
    v-if="isOpen"
    :class="['modal-overlay', modalClass]"
    @click.self="closeModal"
  >
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "ModalComponent",
  props: {
    modalClass: {
      type: String,
      default: "",
    },
  },
  setup(_, { expose }) {
    const isOpen = ref(false);

    const openModal = () => {
      isOpen.value = true;
    };

    const closeModal = () => {
      isOpen.value = false;
    };

    // Делаем функции openModal и closeModal доступными для родительского компонента
    expose({ openModal, closeModal });

    return { isOpen, closeModal };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* Полупрозрачный фон */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Достаточно высокий z-index */
}

.modal-content {
  background: #2a2a2a;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  box-sizing: border-box;
}

/* Для модального окна payment-modal */
.payment-modal .modal-content {
  position: fixed;
  bottom: 0;
  background-color: #2a2a2a;
  left: 0;
  width: 100vw;
  max-width: 100%;
  height: 40vh;
  border-radius: 15px 15px 0 0;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.3);
}

.stars-info .modal-content {
  background-color: #2a2a2a;
  width: 95vw;
  height: 50vh;
  padding: 20px;
  top: 10vh;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  position: fixed;
}
</style>
