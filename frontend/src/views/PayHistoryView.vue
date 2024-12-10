<template>
  <div class="history-container">
    <div class="header">
      <BackButton />
      <h2 class="history-title">История платежей</h2>
    </div>
    
    <div class="scrollable-container">
      <div v-if="payments.length" class="payments-list">
        <div v-for="payment in payments" :key="payment.timestamp" class="payment-item">
          <div class="payment-info">
            <div class="payment-amount">
              <span class="source" :class="payment.source">
                {{ payment.source === 'stars' ? '⭐' : '₿' }}
              </span>
              <span class="amount">{{ payment.payment }}₽</span>
            </div>
            <div class="payment-date">{{ formatDate(payment.timestamp) }}</div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-payments">
        <p>История платежей пуста</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import BackButton from "@/components/BackButton.vue";
import {getSafeAreaInsets, isMobileDevice} from "@/utils/telegram";

const safeArea = getSafeAreaInsets({
      top: { value: isMobileDevice() ? 4 : 0, unit: 'vh' },
    });

export default defineComponent({
  name: 'PayHistoryView',
  components: { BackButton },
  setup() {
    const payments = ref([]);
    const safeArea = getSafeAreaInsets();

    const formatDate = (timestamp) => {
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    onMounted(() => {
      const history = sessionStorage.getItem("history_payments");
      if (!history) return;

      try {
        const historyArray = history.split('},{').map(item => {
          let jsonStr = item;
          if (!item.startsWith('{')) jsonStr = '{' + item;
          if (!item.endsWith('}')) jsonStr = jsonStr + '}';
          return JSON.parse(jsonStr);
        });

        payments.value = historyArray.sort((a, b) => b.timestamp - a.timestamp);
      } catch (e) {
        console.error('Error parsing history:', e);
      }
    });

    return {
      payments,
      formatDate,
      safeArea
    };
  }
});
</script>

<style scoped>
.history-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  color: #ffffff;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  padding-top: v-bind('safeArea.top.value + safeArea.top.unit');
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.history-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0;
}

.scrollable-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  /* Добавляем плавный скролл */
  scroll-behavior: smooth;
  /* Стилизация скроллбара */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

/* Стилизация скроллбара для WebKit (Chrome, Safari) */
.scrollable-container::-webkit-scrollbar {
  width: 6px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: transparent;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

.payment-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;
}

.payment-item:hover {
  transform: translateY(-2px);
}

.payment-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  font-size: 18px;
  font-weight: 500;
}

.source {
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.source.stars {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
}

.source.cryptomus {
  color: #F7931A;
  background: rgba(247, 147, 26, 0.1);
}

.payment-date {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.no-payments {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 40px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-top: 20px;
}

/* Добавляем медиа-запрос для мобильных устройств */
@media (max-width: 768px) {
  .header {
    padding: 15px 15px 8px;
  }

  .history-title {
    font-size: 20px;
  }

  .scrollable-container {
    padding: 15px;
  }

  .payment-item {
    padding: 12px;
  }
}
</style>