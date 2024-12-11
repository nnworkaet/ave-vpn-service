<template>
  <BackButton />
  <div class="accordion">
    <div v-for="(faq, index) in faqList" :key="index" class="accordion-item">
      <button
        @click="toggleAccordion(index)"
        :class="['accordion-header', { open: activeIndex === index }]"
      >
        {{ faq.question }}
        <span class="arrow" :class="{ rotated: activeIndex === index }">▼</span>
      </button>
      <transition name="accordion">
        <div v-if="activeIndex === index" class="accordion-content">
          <p v-for="(answer, i) in faq.answer" :key="i" class="answer-text">
            {{ answer }}
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { haptic } from "@/utils/telegram";

export default defineComponent({
  components: { BackButton },
  setup() {
    const faqList = ref([
      {
        question: "🌐 В каких странах работают наши VPN-сервера?",
        answer: [
          "Наши VPN-сервера доступны в следующих странах:",
          "🇳🇱 Нидерланды",
          "🇩🇪 Германия",
        ],
      },
      {
        question: "🔒 Какие протоколы используются для подключения?",
        answer: [
          "Мы используем VLESS-протоколы, которые обеспечивают надёжную защиту данных и высокую скорость соединения.",
        ],
      },
      {
        question: "📱 На каких устройствах доступен VPN?",
        answer: [
          "Наш сервис поддерживается на:",
          "iOS",
          "Android",
          "Windows",
          "macOS",
        ],
      },
      {
        question:
          "🚫 Что произойдет, если подключить больше устройств, чем предусмотрено тарифом?",
        answer: [
          "При превышении лимита одно из устройств автоматически отключится от VPN.",
        ],
      },
      {
        question: "🛠 VPN не работает. Что делать?",
        answer: [
          "Проверьте, что другие VPN-приложения отключены. Если проблема остаётся, свяжитесь с нашей службой поддержки. - @ave_helper",
        ],
      },
      {
        question: "📲 Если приложение работает нестабильно или не запускается",
        answer: [
          "Попробуйте другие VPN-приложения для более стабильной работы. На данный момент мы рекомендуем FoXray",
        ],
      },
      {
        question: "Как установить VPN?",
        answer: [
          "1. Откройте приложение.",
          "2. Нажмите +, вставьте ссылку, полученную в разделе «Установить».",
          "📹 Подробные видеоинструкции по настройке доступны для каждой платформы В разделе «Установить» -> Инструкция",
        ],
      },
    ]);
    const activeIndex = ref(6);

    const toggleAccordion = (index) => {
      haptic.selection();
      activeIndex.value = activeIndex.value === index ? null : index;
    };

    return {
      faqList,
      activeIndex,
      toggleAccordion,
    };
  },
});
</script>

<style scoped>
.accordion {
  padding: 10px;
}

.accordion-item {
  margin-bottom: 10px;
  border-radius: 20px;
  overflow: hidden;
}

.accordion-header {
  width: 100%;
  padding: 15px;
  text-align: left;
  background: #1f1f1f;
  color: white;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.accordion-header.open {
  background: #1f1f1f;
}

.arrow {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.arrow.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  background: #343434;
  padding: 15px;
  transform-origin: top;
  border-radius: 0px 0px 20px 20px;
  will-change: transform, opacity;
}

.answer-text {
  opacity: 0;
  transform: translateY(10px);
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.answer-text:nth-child(2) {
  animation-delay: 0.1s;
}

.answer-text:nth-child(3) {
  animation-delay: 0.2s;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 1000px;
  opacity: 1;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-from .answer-text,
.accordion-leave-to .answer-text {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
