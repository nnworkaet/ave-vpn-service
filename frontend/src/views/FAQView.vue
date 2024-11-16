<template>
  <BackButton />
  <div class="accordion">
    <div v-for="(faq, index) in faqList" :key="index" class="accordion-item">
      <button
        @click="toggleAccordion(index)"
        :class="['accordion-header', { open: activeIndex === index }]"
      >
        {{ faq.question }}
      </button>
      <div v-if="activeIndex === index" class="accordion-content">
        <p v-for="(answer, i) in faq.answer" :key="i">{{ answer }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import BackButton from "@/components/BackButton.vue";

export default {
  components: { BackButton },
  setup() {
    const faqList = ref([
      {
        question: "🌐 В каких странах работают наши VPN-сервера?",
        answer: [
          "Наши VPN-сервера доступны в следующих странах:",
          "🇳🇱 Нидерланды",
          "🇺🇸 США",
          "🇫🇮 Финляндия",
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
          "Проверьте, что другие VPN-приложения отключены. Если проблема остаётся, свяжитесь с нашей службой поддержки.",
        ],
      },
      {
        question: "📲 Если приложение работает нестабильно или не запускается",
        answer: [
          "Попробуйте другие VPN-приложения для более стабильной работы.",
        ],
      },
      {
        question: "💳 Оплата банковской картой",
        answer: [
          "1. Откройте бота для покупки. @PremiumBot",
          "2. Введите команду /stars.",
          "3. Выберите «Купить Звёзды Telegram» и укажите нужное количество звёзд для оплаты.",
        ],
      },
      {
        question: "💸 Оплата криптовалютой",
        answer: [
          "Перейдите на fragment.com/stars, чтобы приобрести звёзды для оплаты через криптовалюту.",
        ],
      },
      {
        question: "Как установить VPN?",
        answer: [
          "1. Откройте приложение.",
          "2. Нажмите +, вставьте ссылку, полученную в разделе «Ваша ссылка».",
          "📹 Подробные видеоинструкции по настройке доступны для каждой платформы В разделе Установить VPN -> Инструкция",
        ],
      },
    ]);
    const activeIndex = ref(faqList.value.length - 1);

    const toggleAccordion = (index) => {
      activeIndex.value = activeIndex.value === index ? null : index;
    };

    return {
      faqList,
      activeIndex,
      toggleAccordion,
    };
  },
};
</script>

<style>
.accordion {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  margin: 20px;
  overflow-y: auto;
}

.accordion-item {
  border-radius: 15px;
  background-color: #1e1e1e;
  margin-bottom: 10px;
  width: 100%;
}

.accordion-header.open {
  background: #59a776;
  color: white;
}

.accordion-header {
  border-radius: 15px;
  background-color: #1f1f1f;
  width: 100%;
  font-size: 16px;
  color: #ececec;
  border: none;
  padding-bottom: 5px;
  padding-top: 5px;
}

.accordion-content {
  padding-right: 10px;
  padding-left: 10px;
}
</style>
