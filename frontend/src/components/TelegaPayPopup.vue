<template>
  <div class="telegapay-popup">
    <div class="popup-header">
      <h2>Выберите способ оплаты</h2>
      <button class="close-button" @click="$emit('close')">✕</button>
    </div>
    <div v-if="isLoading" class="loading">
      Загрузка...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else>
      <div v-if="!paymentDetails" class="payment-methods">
        <div v-if="paymentMethods.length === 0" class="no-methods">
          <p>В данный момент нет доступных способов оплаты</p>
          <p class="subtitle">Пожалуйста, выберите другой метод</p>
          <button class="back-button" @click="$emit('close')">
            Вернуться к выбору метода
          </button>
        </div>
        <template v-else>
          <button 
            v-for="method in paymentMethods" 
            :key="method"
            class="payment-method-btn"
            @click="getRequisites(method)"
          >
            {{ formatMethodName(method) }}
          </button>
        </template>
      </div>
      <div v-else class="payment-details">
        <div class="payment-info">
          <h5>Ожидаем отправки перевода</h5>
          <p>Выполните перевод в течении 15 минут на указанные реквизиты, после чего нажмите кнопку "Я оплатил"</p>
        </div>
        <h3>Информация для оплаты</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Банк:</span>
            <span class="value">{{ paymentDetails.payment_details.bank_name }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Получатель:</span>
            <span class="value">{{ paymentDetails.payment_details.holder_name }}</span>
          </div>
          <div v-if="paymentDetails.payment_details.phone_number" class="detail-item">
            <span class="label">Телефон:</span>
            <div class="value-with-copy">
              <span class="value">{{ paymentDetails.payment_details.phone_number }}</span>
              <button 
                class="copy-button" 
                @click="copyToClipboard(paymentDetails.payment_details.phone_number)"
                :class="{ 'copied': copiedField === 'phone' }"
              >
                {{ copiedField === 'phone' ? '✓' : '📋' }}
              </button>
            </div>
          </div>
          <div v-if="paymentDetails.payment_details.card_number" class="detail-item">
            <span class="label">Номер карты:</span>
            <div class="value-with-copy">
              <span class="value">{{ paymentDetails.payment_details.card_number }}</span>
              <button 
                class="copy-button" 
                @click="copyToClipboard(paymentDetails.payment_details.card_number)"
                :class="{ 'copied': copiedField === 'card' }"
              >
                {{ copiedField === 'card' ? '✓' : '📋' }}
              </button>
            </div>
          </div>
          <div class="detail-item">
            <span class="label">Сумма:</span>
            <span class="value">{{ paymentDetails.amount }} {{ paymentDetails.currency }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Осталось времени:</span>
            <span class="value timer" :class="{ 'timer-warning': timeLeft <= 300 }">
              {{ formatTime(timeLeft) }}
            </span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="back-button" @click="paymentDetails = null">
            Назад
          </button>
          <button class="confirm-button" @click="$emit('close')">
            Я оплатил
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TelegaPayPopup',
  props: {
    depositAmount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      paymentMethods: [],
      isLoading: true,
      error: null,
      paymentDetails: null,
      copiedField: null,
      timeLeft: 900,
      timer: null
    }
  },
  watch: {
    paymentDetails(newVal) {
      if (newVal) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    },
    timeLeft(newVal) {
      if (newVal <= 0) {
        this.stopTimer();
        this.$emit('close');
      }
    }
  },
  async created() {
    await this.fetchPaymentMethods();
  },
  methods: {
    async fetchPaymentMethods() {
      const jwtToken = sessionStorage.getItem("jwtToken");
      try {
        const response = await axios.post(
          'https://back.avevpn.su/get_methods',
          {
            amount: this.depositAmount,
            currency: 'RUB'
          },
          {
            headers: {
              Authorization: `${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          this.paymentMethods = response.data.methods;
        } else {
          this.error = 'Не удалось загрузить способы оплаты';
        }
      } catch (err) {
        this.error = 'Ошибка при подключении к сервису оплаты';
        console.error('Error fetching payment methods:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async getRequisites(method) {
      this.isLoading = true;
      const jwtToken = sessionStorage.getItem("jwtToken");
      try {
        const response = await axios.post(
          'https://back.avevpn.su/get_requisites',
          {
            amount: this.depositAmount,
            currency: 'RUB',
            method: method
          },
          {
            headers: {
              Authorization: `${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          this.paymentDetails = response.data;
        } else {
          this.error = 'Не удалось получить реквизиты для оплаты';
        }
      } catch (err) {
        this.error = 'Ошибка при получении реквизитов';
        console.error('Error fetching requisites:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.copiedField = text === this.paymentDetails.payment_details.phone_number ? 'phone' : 'card';
        setTimeout(() => {
          if (this.copiedField === 'phone' || this.copiedField === 'card') {
            this.copiedField = null;
          }
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    },
    formatMethodName(method) {
      const methodMap = {
        'BANK_SBER': 'Сбербанк',
        'BANK_TBANK': 'Тинькофф',
        'BANK_ALFA': 'Альфа-Банк',
        'BANK_RAIF': 'Райффайзен Банк',
        'SBP': 'Система быстрых платежей'
      };
      return methodMap[method] || method;
    },
    formatExpiryDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    startTimer() {
      this.timeLeft = 900;
      this.stopTimer();
      this.timer = setInterval(() => {
        this.timeLeft--;
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
  },
  beforeUnmount() {
    this.stopTimer();
  }
}
</script>

<style scoped>
.telegapay-popup {
  background: #1f1f1f;
  border-radius: 15px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.popup-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-header h2 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.close-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method-btn {
  display: block;
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  color: white;
  text-decoration: none;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.payment-method-btn:hover {
  opacity: 0.9;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  color: white;
}

.error {
  color: #ea7272;
}

.payment-details {
  color: white;
}

.payment-details h3 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 16px;
}

.details-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.detail-item .value {
  font-weight: 500;
  user-select: all;
}

.value-with-copy {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-button {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.copy-button.copied {
  color: #67c289;
  background: rgba(103, 194, 137, 0.1);
}

.back-button {
  display: block;
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.no-methods {
  text-align: center;
  color: white;
  padding: 20px 0;
}

.no-methods p {
  margin: 0 0 8px 0;
}

.no-methods .subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  margin-bottom: 20px;
}

.payment-info {
  background: rgba(103, 194, 137, 0.1);
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
}

.payment-info h5 {
  color: #67c289;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.payment-info p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  gap: 12px;
}

.confirm-button {
  display: block;
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.confirm-button:hover {
  opacity: 0.9;
}

.timer {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold !important;
}

.timer-warning {
  color: #ff6b6b !important;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.payment-info {
  background-color: rgba(103, 194, 137, 0.1);
  border-radius: 15px;
  font-style: italic;
  padding: 1px 15px 1px 15px;
}
.payment-info p {
  font-size: 14px;
}
</style>
