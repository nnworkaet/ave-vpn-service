<template>
  <BackButton />
  <div class="container">
    <div class="top-text">
      <label style="font-weight: bold">Выберите тариф</label>
    </div>
    <div class="period-selection">
      <button
        v-for="(period, index) in periods"
        :key="index"
        :class="{ active: selectedPeriod === period }"
        @click="selectPeriod(period)"
      >
        <transition name="fade" mode="out-in">
          <div class="period-content">
            <span class="period-name">{{ selectedPeriod === period ? period.fullLabel : period.shortLabel }}</span>
          </div>
        </transition>
      </button>
    </div>
    <div class="protocol-selection">
      <button
        v-for="(protocol, index) in protocols"
        :key="index"
        :class="{ active: selectedProto === protocol }"
        @click="selectProto(protocol)"
      >
        {{ protocol.name }}
      </button>
    </div>
    <div class="tariff-selection">
      <button
        v-for="(tariff, index) in tariffs"
        :key="index"
        :class="{ active: selectedTariff === tariff }"
        @click="selectTariff(tariff)"
      >
        <transition name="fade" mode="out-in">
          <div class="tariff-name">{{ tariff.name }}</div>
        </transition>
        <transition name="fade" mode="out-in">
          <div class="tariff-devices">{{ tariff.devices }}</div>
        </transition>
        <transition name="fade" mode="out-in">
          <div class="tariff-price">{{ calculatePrice(tariff.basePrice) }}</div>
        </transition>
      </button>
    </div>
    <div class="buy-button">
      <button @click="purchase" :disabled="isLoading">Приобрести</button>
    </div>
  </div>
  <Teleport to="body">
    <div v-if="alertMessage" class="alert" :class="alertType">
      <div class="alert-content">
        {{ alertMessage }}
      </div>
    </div>
  </Teleport>
</template>

<script>
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";
import { haptic } from "@/utils/telegram";
import { getSafeAreaInsets, isMobileDevice } from "../utils/telegram";

export default defineComponent({
  components: { BackButton },
  setup() {
    const periods = ref([
      { shortLabel: "1", fullLabel: "1 месяц", multiplier: 1 },
      { shortLabel: "3", fullLabel: "3 месяца", multiplier: 3 },
      { shortLabel: "6", fullLabel: "6 месяцев", multiplier: 6 },
      { shortLabel: "12", fullLabel: "12 месяцев", multiplier: 12 },
    ]);

    const protocols = ref([{ name: "Vless" }]);
    const tariffs = ref([
      { name: "Basic🧵", devices: "1 устройство", basePrice: 99 },
      { name: "Medium🚀", devices: "2 устройства", basePrice: 179 },
      { name: "Premium💎", devices: "5 устройств", basePrice: 349 },
    ]);

    const selectedPeriod = ref(periods.value[0]);
    const selectedProto = ref(protocols.value[0]);
    const selectedTariff = ref(tariffs.value[0]);

    const alertMessage = ref("");
    const alertType = ref("");
    const isLoading = ref(false);

    const safeArea = getSafeAreaInsets({
      top: { value: isMobileDevice() ? 4 : 0, unit: 'vh' },
    });

    const selectProto = (protocol) => {
      selectedProto.value = protocol;
    };

    const selectPeriod = (period) => {
      haptic.selection();
      selectedPeriod.value = period;
    };

    const selectTariff = (tariff) => {
      haptic.selection();
      selectedTariff.value = tariff;
    };

    const calculatePrice = (basePrice) => {
      return `${basePrice * selectedPeriod.value.multiplier} ₽`;
    };

    const purchase = async () => {
      haptic.medium();

      if (isLoading.value) {
        showAlert("Запрос уже обрабатывается", "info");
        return;
      }

      const jwtToken = sessionStorage.getItem("jwtToken");
      const tg_id = Number(sessionStorage.getItem("tg_id"));
      
      if (!jwtToken || !tg_id) {
        showAlert("Ошибка авторизации", "error");
        return;
      }

      const payload = {
        tg_id: tg_id,
        tariff_name: selectedTariff.value.name,
        tariff_end: selectedPeriod.value.multiplier,
      };

      try {
        isLoading.value = true;
        showAlert("Обработка запроса...", "info");

        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          try {
            const response = await fetch("https://back.avevpn.su/requestBuyTariff", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `${jwtToken}`,
              },
              body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Ошибка HTTP: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (result === 200) {
              showAlert("Тариф успешно приобретен", "success");
              haptic.success();
              return;
            } else if (result === "Can't change tariff") {
              showAlert("У вас уже есть активный тариф", "error");
              haptic.error();
              return;
            } else {
              throw new Error(`Неожиданный ответ сервера: ${result}`);
            }
          } catch (error) {
            console.error(`Попытка ${attempts + 1} не удалась:`, error);
            attempts++;
            
            if (attempts === maxAttempts) {
              throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error('Ошибка при покупке тарифа:', error);
        showAlert("Не удалось выполнить покупку тарифа. Попробуйте позже", "error");
        haptic.error();
      } finally {
        isLoading.value = false;
      }
    };

    const showAlert = (message, type) => {
      alertMessage.value = message;
      alertType.value = type;
      const timeout = type === 'error' ? 2000 : 2000;
      
      setTimeout(() => {
        if (alertMessage.value === message) {
          alertMessage.value = "";
          alertType.value = "";
        }
      }, timeout);
    };

    return {
      periods,
      selectedPeriod,
      selectPeriod,
      protocols,
      selectedProto,
      selectProto,
      tariffs,
      selectTariff,
      selectedTariff,
      calculatePrice,
      purchase,
      alertMessage,
      alertType,
      isLoading,
      safeArea,
    };
  },
});
</script>

<style scoped lang="scss">
.period-selection {
  margin-top: 2vh;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.period-selection button.active {
  font-weight: bold;
  color: black;
  background-color: #ececec;
  border-radius: 15px;
}
.period-selection button {
  padding: 6px;
  font-size: 16px;
  color: white;
  background-color: #2a2a2a;
  border: none;
}
.protocol-selection {
  margin-top: 3vh;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.protocol-selection button.active {
  font-weight: bold;
  color: black;
  background-color: #ececec;
  border-radius: 15px;
}
.protocol-selection button {
  padding: 10px;
  font-size: 24px;
  color: white;
  background-color: #2a2a2a;
  border: none;
}
.container {
  font-size: 4vh;
  width: 90%;
  height: 90%;
  padding: 20px;
  border-radius: 20px;
}
.tariff-selection {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding-top: 10px;
}
.tariff-selection button {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 15px;
  background: #1f1f1f;
  border: none;
  color: white;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tariff-selection button.active {
  background: #343434;
  transform: scale(1.02);
}
.tariff-name, .tariff-devices, .tariff-price {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tariff-name {
  font-weight: bold;
  font-size: 4vh;
}
.tariff-devices {
  font-size: 2vh;
}
.tariff-price {
  background-color: #ececec;
  padding: 5px;
  border-radius: 15px;
  position: absolute;
  font-size: 3vh;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-weight: bold;
  color: #59a776;
}
.tariff-price.active-price {
  background-color: #1e1e1e;
  color: #ececec;
}
.buy-button {
  margin-top: 20px;
  text-align: center;

  button {
    background-color: #59a776;
    color: #ececec;
    border: none;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 15px;
    transition: all 0.3s ease;

    &:disabled {
      background-color: rgba(76, 175, 80, 0.3);
      color: #939393;
      cursor: not-allowed;
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    background-color: rgba(76, 175, 80, 0.3);
  }
  50% {
    background-color: rgba(76, 175, 80, 0.5);
  }
  100% {
    background-color: rgba(76, 175, 80, 0.3);
  }
}

.alert {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: auto;
  padding: 16px;
  transform: translateY(-100%);
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  display: flex;
  justify-content: center;
}

.alert-content {
  padding-top: v-bind('safeArea.top.value + safeArea.top.unit');
  width: 50%;
}

@media (display-mode: fullscreen) {
  .alert {
    padding-top: max(45px, env(safe-area-inset-top, 45px));
  }
}

.alert.success {
  background-color: #4CAF50;
  color: white;
}
.alert.error {
  background-color: #f44336;
  color: white;
}
.alert.info {
  background-color: #2196F3;
  color: white;
}
.alert:not(:empty) {
  transform: translateY(0);
}
.buy-button button {
  opacity: 1;
  transition: opacity 0.3s ease;
}
.buy-button button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}
.buy-button button:disabled {
  animation: pulse 1.5s infinite;
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
