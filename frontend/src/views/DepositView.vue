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

        <div @click="openModal('help')" class="help-icon">
          <label style="font-weight: bold">?</label>
        </div>
        <ModalComponent ref="helpModalRef" class="help-modal">
          <p>payments FAQ</p>
        </ModalComponent>
      </div>
      <div class="num-buttons">
        <button class="button1" @click="updateAmount(100)">100</button>
        <button class="button2" @click="updateAmount(200)">200</button>
        <button class="button3" @click="updateAmount(300)">300</button>
        <button class="button4" @click="updateAmount(400)">400</button>
      </div>
    </div>
    <KeyboardCloser :targetRef="depositInput" />
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
              class="method"
              @click="
                selectPaymentMethod('Telegram Stars');
                openModal('StarsInfo');
              "
            >
              <div class="icon-container">
                <img
                  style="justify-content: center"
                  src="../../public/tg_star.svg"
                  alt="tg star"
                />
              </div>
              <div class="method-description">
                <label class="method-name">Telegram Stars</label>
                <label class="method-outline">Оплата картой</label>
              </div>
            </div>
            <div class="method" @click="selectPaymentMethod('Cryptomus soon')">
              <div class="icon-container">
                <label style="font-size: 37px">₿</label>
              </div>
              <div class="method-description">
                <label class="method-name">Cryptomus soon</label>
                <label class="method-outline">Оплата криптовалютой</label>
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
      <button class="choose-payment-method" @click="processPayment">
        Оплатить
      </button>
    </div>
    <div class="deposit-history"></div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import BackButton from "@/components/BackButton.vue";
import KeyboardCloser from "@/components/KeyboardCloser.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import { useWebAppNavigation } from "vue-tg";

export default defineComponent({
  components: { ModalComponent, BackButton, KeyboardCloser },
  setup() {
    const depositAmount = ref(150);
    const depositInput = ref(null);
    const helpModalRef = ref(null);
    const paymentMethodModalRef = ref(null);
    const selectedPaymentMethod = ref("Выберите метод оплаты");
    const StarsInfoModal = ref(null);
    const webAppNavigation = useWebAppNavigation();

    // Вычисляем сумму в звёздах
    const starsAmount = computed(() => {
      const stars = depositAmount.value * 0.478;
      return Math.round(stars);
    });

    const updateAmount = (amount) => {
      depositAmount.value = amount;
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
      StarsInfoModal.value.closeModal();
    };

    // Функция для отправки запроса и открытия ссылки
    const processPayment = async () => {
      try {
        const response = await fetch("https://matcher.fun/requestGetInvoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: starsAmount.value }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        let result = await response.text();
        console.log("Ссылка перед обработкой:", result);

        // Если `result` — строка в формате JSON, попробуем её распарсить
        try {
          result = JSON.parse(result);
        } catch {
          // Если не получилось, значит это уже строка, просто удалим кавычки
          result = result.replace(/^"|"$/g, "");
        }

        console.log("Ссылка после обработки:", result);

        if (result) {
          webAppNavigation.openInvoice(result);
        } else {
          console.error("Ошибка: ссылка не найдена в ответе");
        }
      } catch (error) {
        console.error("Ошибка при отправке запроса:", error);
      }
    };

    return {
      depositAmount,
      depositInput,
      starsAmount,
      updateAmount,
      openModal,
      helpModalRef,
      paymentMethodModalRef,
      selectedPaymentMethod,
      selectPaymentMethod,
      StarsInfoModal,
      closeStarsInfoModal,
      processPayment,
    };
  },
});
</script>

<style scoped>
.dep-container {
  width: 90%;
  height: 90%;
  padding: 20px;
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
  height: 6vw;
  width: 6vw;
  text-align: center;
  justify-content: center;
  color: #59a776;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.help-modal {
  color: white;
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
  width: 90%;
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
  margin-top: 8px;
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
</style>
