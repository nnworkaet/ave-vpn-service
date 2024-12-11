<template>
  <div class="dep-container">
    <BackButton />
    <div class="sum-inputer">
      <div class="top-inputer">
        <label class="input-label" for="depositAmount"></label>
        <input
          id="depositAmount"
          type="number"
          v-model="depositAmount"
          @input="calculateStars"
          inputmode="numeric"
          placeholder="Введите"
          class="input-field"
          ref="depositInput"
        />
        <span class="currency-symbol">₽</span>

        <!-- Отображаем звёзды, если выбран метод Telegram Stars -->
        <span
          v-if="selectedPaymentMethod === 'Telegram Stars'"
          class="stars-amount"
        >
          {{ starsAmount }}⭐
        </span>

        <div @click="goTo('payment-history')" class="help-icon">
          <label style="font-weight: bold">⏳</label>
        </div>
      </div>
      <div class="num-buttons">
        <button class="button1" @click="updateAmount(100)">100</button>
        <button class="button2" @click="updateAmount(200)">200</button>
        <button class="button3" @click="updateAmount(300)">300</button>
        <button class="button4" @click="updateAmount(400)">400</button>
      </div>
    </div>
    <KeyboardCloser :targetRef="depositInput" />

    <div class="min-dep-warn" v-if="depositAmount < 100">
      <p>Минимальный депозит 100₽</p>
    </div>

    <div class="deposit-requester">
      <div @click="openModal('payment')" class="payment-method">
        <div v-if="selectedPaymentMethod" class="choosen-method">
          <label>{{ selectedPaymentMethod }}</label>
        </div>
        <img src="../../public/open_icon.svg" alt="open icon" />
      </div>

      <ModalComponent
        ref="paymentMethodModalRef"
        class="payment-modal"
        :modalClass="'payment-modal'"
      >
        <div class="payment-modal-container">
          <label>Способы оплаты</label>
          <div class="methods-container">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="method"
              @click="method.onClick"
            >
              <div class="icon-container">
                <img
                  v-if="method.type === 'image'"
                  :src="method.icon"
                  style="justify-content: center"
                  :alt="method.name"
                />
                <label v-else :style="method.iconStyle">{{ method.icon }}</label>
              </div>
              <div class="method-description">
                <label class="method-name">{{ method.name }}</label>
                <label class="method-outline">{{ method.description }}</label>
              </div>
            </div>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent ref="StarsInfoModal" class="stars-info">
        <p>Как купить звезды?</p>
        <div class="buy-stars-text">
          <p>💳 Для оплаты картой:</p>
          <ol>
            <li>
              Перейдите в
              <a href="https://t.me/premiumBot?start=stars" target="_blank"
                >этот бот</a
              >
            </li>
            <li>Напишите <code>/stars</code></li>
            <li>
              Нажмите «Купить Звёзды Telegram» и выберите нужное количество
            </li>
          </ol>
          <p>💸 Для оплаты криптовалютой:</p>
          <p>
            Зайдите на
            <a href="https://fragment.com/stars" target="_blank"
              >fragment.com/stars</a
            >
            и приобретите звёзды
          </p>
        </div>
        <button class="stars-info-modal-button" @click="closeStarsInfoModal">
          Продолжить
        </button>
      </ModalComponent>

      <button
        class="choose-payment-method"
        @click="handlePayment"
        :disabled="!selectedPaymentMethod || selectedPaymentMethod === 'Выберите метод оплаты' || isLoading || depositAmount < 100"
      >
        Оплатить
      </button>
    </div>

    <!-- Блок со ссылкой на оплату -->
    <div v-if="paymentLink" class="payment-link-block">
      <div class="payment-link-title">Счет на оплату</div>
      <div class="payment-link-subtitle">на случай если не открылось автоматически</div>
      <button @click="openPaymentLink(paymentLink)" class="payment-link-button">Открыть счет</button>
    </div>

    <div class="deposit-history"></div>
  </div>

  <div v-if="selectedPaymentMethod === 'TelegaPay' & depositAmount >= 100" class="telegapay-popup-overlay">
    <TelegaPayPopup 
      :depositAmount="depositAmount"
      @method-selected="handleTelegaPayMethodSelect"
      @close="closeTelegaPayPopup"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import BackButton from "@/components/BackButton.vue";
import KeyboardCloser from "@/components/KeyboardCloser.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import TelegaPayPopup from "@/components/TelegaPayPopup.vue";
import { useWebAppNavigation } from "vue-tg";
import { useRouter } from "vue-router";
import { haptic } from "@/utils/telegram";
import axios from 'axios';

export default defineComponent({
  components: { ModalComponent, BackButton, KeyboardCloser, TelegaPayPopup },
  setup() {
    const depositAmount = ref(150);
    const depositInput = ref(null);
    const helpModalRef = ref(null);
    const paymentMethodModalRef = ref(null);
    const selectedPaymentMethod = ref("Cryptomus");
    const StarsInfoModal = ref(null);
    const paymentLink = ref("");
    const webAppNavigation = useWebAppNavigation();
    const router = useRouter();
    const isLoading = ref(false);

    const paymentMethods = ref([
      {
        id: 'cryptomus',
        name: 'Cryptomus',
        description: 'Оплата криптовалютой',
        icon: 'cryptomus_logo.svg',
        type: 'image',
        iconStyle: { width: '42px' },
        onClick: () => selectPaymentMethod('Cryptomus')
      },
      {
        id: 'TelegaPay',
        name: 'TelegaPay',
        description: 'Оплата банковским переводом',
        icon: 'telegapay-logo48.png',
        type: 'image',
        iconStyle: { width: '42px' },
        onClick: () => selectPaymentMethod('TelegaPay')
      },
      {
        id: 'telegram_stars',
        name: 'Telegram Stars',
        description: 'Оплата картой / крипто',
        icon: 'tg_star.svg',
        type: 'image',
        onClick: () => {
          selectPaymentMethod('Telegram Stars');
          openModal('StarsInfo');
        }
      }
    ]);

    const starsAmount = computed(() => {
      const stars = depositAmount.value * 0.513392857142857;
      return Math.round(stars);
    });

    const updateAmount = (amount) => {
      haptic.selection();
      depositAmount.value = amount;
    };

    const goTo = (route) => {
      haptic.impact();
      router.push(`/${route}`);
    };

    const openModal = (modal) => {
      if (modal === "help") {
        helpModalRef.value.openModal();
      } else if (modal === "payment") {
        paymentMethodModalRef.value.openModal();
      } else if (modal === "StarsInfo") {
        StarsInfoModal.value.openModal();
      }
    };

    const selectPaymentMethod = (method) => {
      selectedPaymentMethod.value = method;
      paymentMethodModalRef.value.closeModal();
    };

    const closeStarsInfoModal = () => {
      haptic.impact();
      StarsInfoModal.value.closeModal();
    };

    const openPaymentLink = (link) => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(link);
      } else {
        window.open(link, '_self');
      }
    };

    const processTelegramStars = async () => {
      haptic.medium();
      isLoading.value = true;
      const jwtToken = sessionStorage.getItem("jwtToken");
      try {
        const response = await fetch("https://back.avevpn.su/requestGetInvoice", {
          method: "POST",
          headers: {
            Authorization: `${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: starsAmount.value }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        let result = await response.text();

        try {
          result = JSON.parse(result);
        } catch {
          result = result.replace(/^"|"$/g, "");
        }

        if (result) {
          webAppNavigation.openInvoice(result);
        } else {
          console.error("Ошибка: ссылка не найдена в ответе");
        }
      } catch (error) {
        console.error("Ошибка при отправке запроса:", error);
      }
      isLoading.value = false
    };

    const handleTelegaPayMethodSelect = async (method) => {
      console.log('Selected TelegaPay method:', method);
    };

    const closeTelegaPayPopup = () => {
      haptic.impact();
      selectedPaymentMethod.value = "Выберите метод оплаты";
    };

    const handlePayment = () => {
      if (!selectedPaymentMethod.value || selectedPaymentMethod.value === "Выберите метод оплаты") {
        alert("Пожалуйста, выберите метод оплаты");
        return;
      }

      if (isLoading.value) {
        alert("Запрос уже обрабатывается");
        return;
      }

      switch (selectedPaymentMethod.value) {
        case "Telegram Stars":
          processTelegramStars();
          break;
        case "Cryptomus":
          processCryptomus();
          break;
        case "TelegaPay":
          processTelegaPay();
          break;
        default:
          alert("Неподдерживаемый метод оплаты");
      }
    };

    const processCryptomus = async () => {
      haptic.medium();
      isLoading.value = true;
      try {
        const jwtToken = sessionStorage.getItem("jwtToken");
        const response = await axios.post(
          "https://back.avevpn.su/requestBuyCryptomus",
          { amount: String(depositAmount.value) },
          {
            headers: {
              Authorization: `${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          paymentLink.value = response.data;
          openPaymentLink(paymentLink.value);
        } else {
          throw new Error("Не получен URL для оплаты");
        }
      } catch (error) {
        console.error("Ошибка при обработке Cryptomus платежа:", error);
        alert("Произошла ошибка при создании платежа. Пожалуйста, попробуйте позже.");
      }
      isLoading.value = false
    };

    const processTelegaPay = async () => {
      haptic.medium();
      isLoading.value = true;
    }

    return {
      depositAmount,
      paymentMethodModalRef,
      depositInput,
      selectedPaymentMethod,
      paymentLink,
      openPaymentLink,
      paymentMethods,
      updateAmount,
      openModal,
      helpModalRef,
      selectPaymentMethod,
      StarsInfoModal,
      closeStarsInfoModal,
      handlePayment,
      goTo,
      starsAmount,
      isLoading,
      handleTelegaPayMethodSelect,
      closeTelegaPayPopup
    };
  },
});
</script>

<style scoped>
.dep-container {
  width: 95%;
  height: 90%;
  padding: 20px 10px 20px 10px;
  border-radius: 20px;
}
.sum-inputer {
  background-color: #1f1f1f;
  padding: 15px;
  overflow: hidden;
  border-radius: 15px;
  margin-bottom: 10px;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
}
.top-inputer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.help-icon {
  display: flex;
  flex-direction: column;
  border-radius: 50%;
  background-color: #ececec;
  height: 10vw;
  width: 10vw;
  text-align: center;
  justify-content: center;
  color: #59a776;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.help-icon label {
  font-size: 23px;
}
.input-label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #555;
}
.input-field {
  color: white;
  overflow: hidden;
  -webkit-appearance: none;
  appearance: none;
  width: 85%;
  padding: 1px;
  height: 10vh;
  font-size: 8vh;
  background-color: #1f1f1f;
  border: none;
  box-sizing: border-box;
  text-align: left;
}
.currency-symbol {
  position: absolute;
  top: 1vh;
  font-size: 24px;
  color: white;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-field:focus {
  outline: none;
}
.num-buttons {
  display: flex;
  justify-content: space-between;
}
.button1,
.button2,
.button3,
.button4 {
  border-radius: 15px;
  background-color: #eee;
  height: 10vw;
  width: 23%;
  color: #1e1e1e;
  font-size: 100%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.deposit-requester {
  background-color: #1f1f1f;
  padding: 15px;
  overflow: hidden;
  border-radius: 15px;
  margin-bottom: 10px;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
}
.payment-method {
  height: 7vh;
  color: #1e1e1e;
  background-color: #eee;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: 5vw;
  padding-right: 5vw;
  margin-bottom: 2vh;
}
.choose-payment-method {
  font-size: 100%;
  height: 7vh;
  color: #ececec;
  background-color: #59a776;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: none;
}

.choose-payment-method:disabled {
  background-color: rgba(76, 175, 80, 0.3);
  color: #939393;
  cursor: not-allowed;
  animation: pulse 2s infinite;
}

.payment-modal-container {
  height: auto;
  color: white;
  margin-right: 10px;
  text-align: center;
}
.methods-container {
  display: flex;
  flex-direction: column;
}
.method {
  margin-top: 6vh;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.icon-container {
  height: 42px;
  width: 42px;
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: center;
}
.method-description {
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin-left: 15vw;
  position: absolute;
}
.method-name {
  font-weight: bold;
}
.method-outline {
  font-style: italic;
}
.stars-info {
  text-align: center;
  align-items: center;
}
.stars-info-modal-button {
  height: 5vh;
  padding: 20px;
  color: #ececec;
  background-color: #59a776;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
a {
  color: #59a776; /* Цвет для всех гиперссылок */
  text-decoration: none;
}
.buy-stars-text {
  text-align: left;
}
.stars-amount {
  position: absolute;
  font-weight: bold;
  color: #888;
  right: 4vw;
  bottom: 9vh;
}
.payment-link-block {
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  text-align: center;
}

.payment-link-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #fff;
}

.payment-link-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 15px;
}

.payment-link-button {
  display: inline-block;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  border: none;
}

.payment-link-button:hover {
  background: #1976D2;
}

.min-dep-warn {
  background-color: #1f1f1f;
  border-radius: 15px;
  color: #ea7272;
  padding: 1px 15px 1px 15px;
  margin-bottom: 10px;
  font-weight: 600;
  text-align: center;
}
.telegapay-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>
