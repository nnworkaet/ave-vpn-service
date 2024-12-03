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
      <button @click="purchase">Приобрести</button>
    </div>

    <!-- Уведомления -->
    <div v-if="alertMessage" class="alert" :class="alertType">
      {{ alertMessage }}
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
    const periods = ref([
      { shortLabel: "1", fullLabel: "1 месяц", multiplier: 1 },
      { shortLabel: "3", fullLabel: "3 месяца", multiplier: 3 },
      { shortLabel: "6", fullLabel: "6 месяцев", multiplier: 6 },
      { shortLabel: "12", fullLabel: "12 месяцев", multiplier: 12 },
    ]);

    const protocols = ref([{ name: "Vless" }]);
    const tariffs = ref([
      { name: "Basic🌱", devices: "1 устройство", basePrice: 99 },
      { name: "Medium🚀", devices: "2 устройства", basePrice: 179 },
      { name: "Premium💎", devices: "5 устройств", basePrice: 349 },
    ]);

    const selectedPeriod = ref(periods.value[0]);
    const selectedProto = ref(protocols.value[0]);
    const selectedTariff = ref(tariffs.value[0]);

    const alertMessage = ref(""); // Сообщение для алерта
    const alertType = ref(""); // Тип алерта (например, "error", "success")

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

    // Функция для отправки JSON на сервер
    const purchase = async () => {
      haptic.medium();
      const jwtToken = sessionStorage.getItem("jwtToken");
      const tg_id = Number(sessionStorage.getItem("tg_id"));
      const tariff_name = selectedTariff.value.name;
      const tariff_end = selectedPeriod.value.multiplier;

      const payload = {
        jwt: jwtToken,
        tg_id: tg_id,
        tariff_name: tariff_name,
        tariff_end: tariff_end,
      };

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
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const result = await response.json();

        // Проверяем, что за результат мы получили
        if (result === 200) {
          alertMessage.value = "Тариф успешно приобретен";
          haptic.success()
          alertType.value = "success"; // Зеленый или другой цвет для успеха
        } else if (result === "Can't change tariff") {
          alertMessage.value = "У вас уже есть другой тариф";
          haptic.error()
          alertType.value = "error"; // Красный цвет для ошибки
        }

        // Убираем алерт через 2 секунды
        setTimeout(() => {
          alertMessage.value = "";
          alertType.value = "";
        }, 2000);
      } catch (error) {
        console.error("Ошибка при отправке запроса:", error);
        alertMessage.value = "Произошла ошибка при покупке тарифа";
        alertType.value = "error";

        // Убираем алерт через 2 секунды
        setTimeout(() => {
          alertMessage.value = "";
          alertType.value = "";
        }, 2000);
      }
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
  display: flex;
  justify-content: center;
}
.buy-button button {
  margin-top: 20px;
  padding: 25px;
  font-size: 100%;
  background-color: #59a776;
  color: #ececec;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  height: 10vw;
  width: 60%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.alert {
  padding: 10px;
  margin-top: 20px;
  border-radius: 15px;
  text-align: center;
  transition: opacity 0.5s ease;
}

.success {
  background-color: #4caf50;
  color: white;
}

.error {
  background-color: #f44336;
  color: white;
}

/* Когда alert исчезает */
.alert.hidden {
  opacity: 0;
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
