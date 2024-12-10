<template>
  <div class="container">
    <div class="balance">
      <div class="top-balance">
        <span :class="['balance-text', { 'skeleton': balance === null }]">
          {{ balance !== null ? `${balance}₽` : '0₽' }}
        </span>
        <div @click="goTo('faq')" class="help-icon">
          <label style="font-weight: bold">?</label>
        </div>
      </div>
      <div class="down-balance">
        <button class="button-deposit" @click="goTo('deposit')" :disabled="isLoading">
          Пополнить
        </button>
      </div>
    </div>

    <div class="referral" @click="goTo('referal')">
      <p>Приглашайте друзей, получайте до +2 дней</p>
      <div class="faces">
        <img src="ref_icon_main_screen.svg" alt="refs" />
      </div>
    </div>

    <button
      v-if="!tariffName"
      class="button-buy-main" 
      @click="goTo('buyVPN')" 
      :disabled="isLoading"
    >
      Купить VPN
    </button>

    <div class="tariffs-container" 
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd"
         @mousedown="handleMouseDown"
         @mousemove="handleMouseMove"
         @mouseup="handleMouseUp"
         @mouseleave="handleMouseUp">
      <div class="tariffs-wrapper" :style="swipeStyle">
        <div
          v-if="isFreeTariffAvailable"
          class="vpn-buttons"
          :class="[
            'subscribed',
            { 'gradient-animate': true }
          ]"
        >
          <div class="sub-container">
            <div class="top-sub-container">
              <p class="p-container">
                {{ freeTariff.tariff_name }}
              </p>
            </div>
            <div class="traffic-container">
              <p class="time-container">
                {{ freeTariff.tariff_left }}
              </p>
              <div class="traffic-bar" :class="trafficBarClass">
                <div
                  class="traffic-progress"
                  :style="{ width: `${trafficPercentage}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div class="vpn-buttons-container">
            <button class="button-buy-vpn" @click="goTo('tasks')" :disabled="isLoading">
              Продлить
            </button>
            <button class="button-install-vpn" @click="handleInstallVPN('free')" :disabled="isLoading">
              Установить
            </button>
          </div>
        </div>

        <div
          v-if="isPaidTariffAvailable"
          class="vpn-buttons"
          :class="[
            'subscribed',
            { 'gradient-animate': tariffName }
          ]"
        >
          <div v-if="tariffName !== null" class="sub-container">
            <div class="top-sub-container">
              <p class="p-container" :class="{ 'skeleton': !tariffName }">
                {{ tariffName || '' }}
              </p>
            </div>
            <div class="traffic-container">
              <p class="time-container" :class="{ 'skeleton': !subscriptionEnd }">
                {{ subscriptionEnd || animationMessages[currentMessageIndex] }}
              </p>
            </div>
          </div>
          <div class="vpn-buttons-container">
            <button class="button-buy-vpn" :class="{ 'paid-available': isPaidTariffAvailable }" @click="goTo('buyVPN')" :disabled="isLoading">
              {{ tariffName !== null ? "Продлить VPN" : "Купить VPN" }}
            </button>
            <button class="button-install-vpn" @click="handleInstallVPN('paid')" :disabled="isLoading">
              Установить
            </button>
          </div>
        </div>
      </div>
      
      <div class="swipe-indicators" v-if="hasMultipleTariffs">
        <div v-for="index in 2" 
             :key="index" 
             :class="['indicator', { active: currentTariffIndex === index - 1 }]">
        </div>
      </div>
    </div>
    <InstructionPopup 
      :is-visible="showInstructions" 
      @close="closeInstructions" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { haptic, disableSwipes } from "@/utils/telegram";
import InstructionPopup from "@/components/InstructionPopup.vue";

const router = useRouter();

const telegramId = ref(null);
const hash = ref(null);
const initData = ref(null);
const jwtToken = ref(null);
const balance = ref(null);
const tariffName = ref("");
const subscriptionEnd = ref("");
const subscription_link = ref("");
const link_state = ref(null);
const history_payments = ref([])
const freeTariff = ref(null);

const touchStart = ref(null);
const touchEnd = ref(null);
const currentTariffIndex = ref(0);
const swipeStyle = ref({});
const isDragging = ref(false);
const startX = ref(null);

const isLoading = ref(true);
const showInstructions = ref(false);

const animationMessages = [
  "Подготавливаем VPN",
  "Настраиваем бесплатный тариф",
  "Защищаем ваши данные от РКН",
  "Пьём кофе <3"
];
const currentMessageIndex = ref(0);

const isFreeTariffAvailable = computed(() => {
  return freeTariff.value && freeTariff.value.tariff_name;
});

const isPaidTariffAvailable = computed(() => {
  return tariffName.value !== null;
});

const hasMultipleTariffs = computed(() => {
  return isFreeTariffAvailable.value && isPaidTariffAvailable.value;
});

const trafficPercentage = computed(() => {
  if (!freeTariff.value) return 0;

  const total = 3;
  const left = parseFloat(freeTariff.value.tariff_left);

  let percentage = (left / total) * 100;

  const buffer = Math.min(percentage * 0.1, 60);

  return Math.max(0, percentage - buffer);
});

const startTextAnimation = () => {
  setInterval(() => {
    currentMessageIndex.value =
      (currentMessageIndex.value + 1) % animationMessages.length;
  }, 5000);
};

const trafficBarClass = computed(() => {
  const daysLeft = parseInt(freeTariff.value?.tariff_left || 0);

  if (daysLeft <= 1) {
    return 'red-bar';
  } else if (
    [2, 3, 4].includes(daysLeft % 10) &&
    ![12, 13, 14].includes(daysLeft % 100)
  ) {
    return 'orange-bar';
  } else if (daysLeft >= 3) {
    return 'green-bar';
  } else {
    return 'green-bar';
  }
});

const handleTouchStart = (e) => {
  if (!hasMultipleTariffs.value) return;
  touchStart.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  if (!touchStart.value || !hasMultipleTariffs.value) return;
  
  const currentTouch = e.touches[0].clientX;
  const diff = touchStart.value - currentTouch;
  const direction = diff > 0 ? 1 : -1;

  const basePosition = currentTariffIndex.value * -95;
  const swipeAmount = Math.abs(diff) * 0.3;
  const newPosition = basePosition - (direction * swipeAmount);
  
  swipeStyle.value = {
    transform: `translateX(${newPosition}vw)`,
    transition: 'none'
  };
};

const handleTouchEnd = (e) => {
  if (!touchStart.value || !hasMultipleTariffs.value) return;
  
  touchEnd.value = e.changedTouches[0].clientX;
  const swipeDistance = touchStart.value - touchEnd.value;
  const threshold = window.innerWidth * 0.15;
  
  if (Math.abs(swipeDistance) > threshold) {
    if (swipeDistance > 0 && currentTariffIndex.value === 0) {
      currentTariffIndex.value = 1;
    } else if (swipeDistance < 0 && currentTariffIndex.value === 1) {
      currentTariffIndex.value = 0;
    }
  }

  swipeStyle.value = {
    transform: `translateX(${currentTariffIndex.value * -95}vw)`,
    transition: 'transform 0.3s ease-out'
  };
  
  touchStart.value = null;
  touchEnd.value = null;
};

const handleMouseDown = (e) => {
  if (!hasMultipleTariffs.value) return;
  isDragging.value = true;
  startX.value = e.clientX;
};

const handleMouseMove = (e) => {
  if (!isDragging.value || !hasMultipleTariffs.value) return;
  
  const diff = startX.value - e.clientX;
  const direction = diff > 0 ? 1 : -1;
  
  const basePosition = currentTariffIndex.value * -95;
  const swipeAmount = Math.abs(diff) * 0.3;
  const newPosition = basePosition - (direction * swipeAmount);
  
  swipeStyle.value = {
    transform: `translateX(${newPosition}vw)`,
    transition: 'none'
  };
};

const handleMouseUp = (e) => {
  if (!isDragging.value || !hasMultipleTariffs.value) {
    isDragging.value = false;
    return;
  }
  
  const diff = startX.value - (e.clientX || startX.value);
  const threshold = window.innerWidth * 0.15;
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentTariffIndex.value === 0) {
      currentTariffIndex.value = 1;
    } else if (diff < 0 && currentTariffIndex.value === 1) {
      currentTariffIndex.value = 0;
    }
  }
  
  swipeStyle.value = {
    transform: `translateX(${currentTariffIndex.value * -95}vw)`,
    transition: 'transform 0.3s ease-out'
  };
  
  isDragging.value = false;
  startX.value = null;
};

const switchTariff = (direction) => {
  if (!hasMultipleTariffs.value) return;
  
  if (direction === 'next' && currentTariffIndex.value === 0) {
    currentTariffIndex.value = 1;
  } else if (direction === 'prev' && currentTariffIndex.value === 1) {
    currentTariffIndex.value = 0;
  }
  
  swipeStyle.value = {
    transform: `translateX(${currentTariffIndex.value * -95}vw)`,
    transition: 'transform 0.3s ease-out'
  };
};

const handleInstallVPN = (tariffType) => {
  haptic.impact();
  
  if (tariffType === 'free') {
    const freeLink = freeTariff.value?.subscription_link;
    if (freeLink) {
      sessionStorage.setItem("free_subscription_link", freeLink);
    }
    router.push('/installVPNFree');
  } else {
    if (subscription_link.value) {
      sessionStorage.setItem("subscription_link", subscription_link.value);
    }
    router.push('/installVPN');
  }
};

const goTo = (route) => {
  haptic.impact();
  router.push(`/${route}`);
};

const fetchJwtToken = async () => {
  try {
    const response = await axios.post("https://back.avevpn.su/tokentg", {
      hash: hash.value,
      init_data: initData.value,
      user_tg_id: telegramId.value,
    });

    const { access_token } = response.data;
    jwtToken.value = `Bearer ${access_token}`;

    sessionStorage.setItem("tg_id", telegramId.value);
    sessionStorage.setItem("jwtToken", jwtToken.value);
    sessionStorage.setItem("tokenTimestamp", Date.now());

    await fetchUserInfo();
  } catch (error) {
    console.error("Ошибка при получении токена:", error);
  }
};

function getDaysWord(days) {
    if (days % 10 === 1 && days % 100 !== 11) {
      return "День";
    } else if (
      [2, 3, 4].includes(days % 10) &&
      ![12, 13, 14].includes(days % 100)
    ) {
      return "Дня";
    } else {
      return "Дней";
    }
  }

const fetchUserInfo = async () => {
  isLoading.value = true;
  const jwtToken = sessionStorage.getItem("jwtToken");

  if (!jwtToken) {
    console.error("JWT токен не найден");
    isLoading.value = false;
    return;
  }

  try {
    const response = await axios.post(
      "https://back.avevpn.su/requestGetAllUserInfo",
      {},
      {
        headers: {
          Authorization: `${jwtToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const userInfo = response.data;

    balance.value = userInfo.balance;
    subscription_link.value = userInfo.subscription_link;
    link_state.value = userInfo.link_state;
    history_payments.value = userInfo.history_payments
    sessionStorage.setItem("subscription_link", subscription_link.value);
    sessionStorage.setItem("link_state", link_state.value);
    sessionStorage.setItem("history_payments", history_payments.value)
    sessionStorage.setItem("referral_link", userInfo.referral_link)
    sessionStorage.setItem("referrals", userInfo.referrals)
    tariffName.value = userInfo.tariff_name || null;

    if (userInfo.subscription_end) {
      const endDate = new Date(userInfo.subscription_end * 1000);
      const currentDate = new Date();

      const timeDifference = endDate - currentDate;
      const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      subscriptionEnd.value =
        daysRemaining > 0
          ? `Осталось ${daysRemaining} ${getDaysWord(daysRemaining)}`
          : "Подписка истекла";
    } else {
      subscriptionEnd.value = null;
    }

    parseFreeTariff(userInfo.free_tariff);
  } catch (error) {
    console.error("Ошибка при запросе информации о пользователе:", error);
  } finally {
    isLoading.value = false;
  }
};

const parseFreeTariff = (freeTariffData) => {
  if (!freeTariffData || freeTariffData === "0") {
    freeTariff.value = null;
    return;
  }

  try {
    const parsedData = JSON.parse(freeTariffData);
    if (parsedData && parsedData.tariff_name) {
      freeTariff.value = parsedData;
      if (parsedData.subscription_link) {
        sessionStorage.setItem("free_subscription_link", parsedData.subscription_link);
      }
    } else {
      freeTariff.value = null;
    }
  } catch (error) {
    console.error("Error parsing free tariff:", error);
    freeTariff.value = null;
  }
};

const isTokenValid = () => {
  const token = sessionStorage.getItem("jwtToken");
  const tokenTimestamp = sessionStorage.getItem("tokenTimestamp");
  const max_live = 15 * 60 * 1000;
  return token && tokenTimestamp && Date.now() - tokenTimestamp < max_live;
};

onMounted(async () => {
  disableSwipes();
  startTextAnimation();
  const isFirstVisit = !localStorage.getItem("visited");
  
  if (window.Telegram && window.Telegram.WebApp) {
    initData.value = window.Telegram.WebApp.initData || "";
    const params = new URLSearchParams(initData.value);
    telegramId.value = window.Telegram.WebApp.initDataUnsafe.user?.id;
    hash.value = params.get("hash") || null;
    window.Telegram.WebApp.setHeaderColor("#2a2a2a");

    sessionStorage.setItem("tg_id", telegramId.value)
    if (!isTokenValid()) {
      await fetchJwtToken();
    } else {
      jwtToken.value = sessionStorage.getItem("jwtToken");
      await fetchUserInfo();
    }

    if (isFirstVisit) {
      showInstructions.value = true;
      localStorage.setItem("visited", "true");
    }
  } else {
    console.error("Telegram WebApp не инициализирован");
  }
});

const closeInstructions = () => {
  showInstructions.value = false;
};

</script>

<style scoped>
.container {
  width: 95%;
  height: 90%;
  padding: 20px 10px 20px 10px;
  border-radius: 20px;
}
.balance {
  background-color: rgb(31, 31, 31);
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: space-between;
}
.balance-text {
  font-size: 5vh;
  font-weight: bold;
}
.top-balance {
  margin-bottom: 1vh;
  margin-left: 1vh;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.down-balance {
  display: flex;
  justify-content: space-between;
  margin: 0;
}
.button-deposit {
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  color: #ececec;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  height: 10vw;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.button-withdraw {
  font-size: 100%;
  background-color: #eee;
  color: #1e1e1e;
  border: none;
  border-radius: 12px;
  margin-left: 1vh;
  cursor: pointer;
  height: 10vw;
  width: 40%;
  margin-right: 1vh;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.referral {
  font-size: 20px;
  cursor: pointer;
  background-color: #1f1f1f;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  gap: 5vw;
  align-items: center;
  position: relative;
}
.referral:hover {
  background-color: #494949; /* цвет при наведении */
  color: #fff;
}
.faces {
  height: 100%;
}
.tariffs-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  user-select: none; /* Предотвращаем выделение текста при перетаскивании */
  cursor: grab; /* Показываем, что элемент можно перетаскивать */
}

.tariffs-container:active {
  cursor: grabbing; /* Меняем курсор при перетаскивании */
}

.tariffs-wrapper {
  display: flex;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.3s ease-out;
}

.vpn-buttons {
  width: 50%;
  flex-shrink: 0;
  padding: 0 15px;
  box-sizing: border-box;
}

.vpn-buttons.subscribed {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 20px;
  background-color: #1f1f1f;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vpn-buttons-container {
  display: flex;
  flex-direction: row;
  width: 99%;
  gap: 3%;
}

.button-buy-vpn,
.button-install-vpn {
  font-size: 16px;
  font-weight: 600;
  border-radius: 15px;
  border: none;
  height: 10vw;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.button-buy-vpn {
  width: 50%;
  background-color: #eee;
  color: #1e1e1e;
}

.button-buy-vpn.paid-available {
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  color: white;
}

.button-install-vpn {
  width: 50%;
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  color: #ececec;
}

.gradient-animate {
  background: linear-gradient(
    120deg,
    #1f1f1f 0%,
    #1f1f1f 25%,
    #2c2c2c 45%,
    #343434 50%,
    #2c2c2c 55%,
    #1f1f1f 75%,
    #1f1f1f 100%
  );
  background-size: 200% 100%;
  animation: gradientMove 8s linear infinite;
}

@keyframes gradientMove {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.sub-container {
  position: relative;
  z-index: 1;
  font-size: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
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

.p-container {
  font-weight: bold;
  display: inline-block;
  background-color: #4d644d;
  border-radius: 15px;
  margin-top: 5px;
  margin-bottom: 0;
  padding: 7px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
}

.time-container {
  font-size: 18px;
  margin: 0;
  color: #c5c5c5;
}

.traffic-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 8px;
  margin-left: 7px;
}

.traffic-bar {
  width: 80%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.traffic-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.red-bar .traffic-progress {
  background: linear-gradient(45deg,
    #ff0000 0%,
    #ff4d4d 25%,
    #ff0000 50%,
    #ff4d4d 75%,
    #ff0000 100%
  );
  background-size: 200% 200%;
  animation: progressAnimationRed 3s ease infinite;
}

.orange-bar .traffic-progress {
  background: linear-gradient(45deg,
    #ff7f00 0%,
    #f6a152 25%,
    #ff7f00 50%,
    #f6a152 75%,
    #ff7f00 100%
  );
  background-size: 200% 200%;
  animation: progressAnimationOrange 3s ease infinite;
}

.green-bar .traffic-progress {
  background: linear-gradient(45deg,
    #67c289 0%,
    #3d8a57 25%,
    #67c289 50%,
    #3d8a57 75%,
    #67c289 100%
  );
  background-size: 200% 200%;
  animation: progressAnimation 3s ease infinite;
}

@keyframes progressAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.skeleton {
  position: relative;
  overflow: hidden;
  background: #1f1f1f;
  border-radius: 16px;
}

.skeleton::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.balance-text.skeleton {
  min-width: 80px;
  height: 5vh;
}

.p-container.skeleton {
  min-width: 150px;
  height: 20px;
}

.time-container.skeleton {
  min-width: 120px;
  height: 20px;
  margin-top: -3vw;
  animation: fadeInOut 5s ease-in-out infinite;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  25% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; }
}

.swipe-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 10px 0;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transition: background-color 0.3s ease;
}

.indicator.active {
  background-color: #59a776;
}

.button-buy-main {
  width: 100%;
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 15px;
  background: linear-gradient(90deg, #4776E6 0%, #8E54E9 100%);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.button-buy-main:active {
  opacity: 0.8;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
