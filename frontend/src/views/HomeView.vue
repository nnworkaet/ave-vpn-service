<template>
  <div class="container">
    <div class="balance">
      <div class="top-balance">
        <span class="balance-text">{{ balance }}₽</span>
        <div @click="goTo('faq')" class="help-icon">
          <label style="font-weight: bold">?</label>
        </div>
      </div>
      <div class="down-balance">
        <button class="button-deposit" @click="goTo('deposit')">
          Пополнить
        </button>
      </div>
    </div>

    <div class="referral" @click="goTo('referal')">
      <p>Приглашайте друзей, получайте до 30%</p>
      <div class="faces">
        <img src="../../public/ref_icon_main_screen.svg" alt="refs" />
      </div>
    </div>

    <div
      class="vpn-buttons"
      :class="tariffName !== null ? 'subscribed' : 'not-subscribed'"
    >
      <div v-if="tariffName !== null" class="sub-container">
        <div class="top-sub-container">
          <p class="p-container">{{ tariffName }}</p>
        </div>
        <p class="time-container">{{ subscriptionEnd }}</p>
      </div>
      <div class="vpn-buttons-container">
        <button class="button-buy-vpn" @click="goTo('buyVPN')">
          {{ tariffName !== null ? "Продлить VPN" : "Купить VPN" }}
        </button>
        <button class="button-install-vpn" @click="goTo('installVPN')">
          Установить VPN
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import ModalComponent from "@/components/ModalComponent.vue";

const modalRef = ref(null);
const router = useRouter();

// Переменные для хранения данных
const telegramId = ref(null);
const hash = ref(null);
const initData = ref(null);
const jwtToken = ref(null);
const balance = ref(0);
const tariffName = ref("");
const subscriptionEnd = ref("");
const subscription_link = ref("");

const openModal = () => {
  modalRef.value.openModal();
};

const goTo = (route) => {
  router.push(`/${route}`);
};

// Функция для получения JWT токена с бэкенда
const fetchJwtToken = async () => {
  try {
    const response = await axios.post("https://matcher.fun/tokentg", {
      hash: hash.value,
      init_data: initData.value,
      user_tg_id: telegramId.value,
    });

    const { access_token } = response.data;
    jwtToken.value = `Bearer ${access_token}`;
    console.log(jwtToken.value);

    // Сохраняем токен в sessionStorage и добавляем метку времени
    sessionStorage.setItem("tg_id", telegramId.value);
    sessionStorage.setItem("jwtToken", jwtToken.value);
    sessionStorage.setItem("tokenTimestamp", Date.now());

    // Запрашиваем баланс после получения токена
    await fetchUserInfo();
  } catch (error) {
    console.error("Ошибка при получении токена:", error);
  }
};

const fetchUserInfo = async () => {
  // Получаем токен из sessionStorage (или другого места, где он хранится)
  const jwtToken = sessionStorage.getItem("jwtToken");

  if (!jwtToken) {
    console.error("JWT токен не найден");
    return;
  }

  function getDaysWord(days) {
    if (days % 10 === 1 && days % 100 !== 11) {
      return "день";
    } else if (
      [2, 3, 4].includes(days % 10) &&
      ![12, 13, 14].includes(days % 100)
    ) {
      return "дня";
    } else {
      return "дней";
    }
  }

  try {
    // Отправка POST запроса
    const response = await axios.post(
      "https://matcher.fun/requestGetAllUserInfo",
      {}, // Тело запроса (пустое, если оно не требуется)
      {
        headers: {
          Authorization: `${jwtToken}`, // Используем Bearer токен
          "Content-Type": "application/json", // Устанавливаем тип содержимого
        },
      }
    );

    // Записываем ответ в переменную
    const userInfo = response.data;
    console.log("Ответ с сервера:", userInfo);

    balance.value = userInfo.balance;
    subscription_link.value = userInfo.subscription_link;
    sessionStorage.setItem("subscription_link", subscription_link.value);
    // Присваиваем значения тарифу и окончанию подписки
    tariffName.value = userInfo.tariff_name || null; // Если нет тарифа, выводим "Нет тарифа"

    if (userInfo.subscription_end) {
      const endDate = new Date(userInfo.subscription_end * 1000); // Преобразуем таймстемп в дату
      const currentDate = new Date(); // Текущая дата

      // Вычисляем разницу в миллисекундах и переводим в дни
      const timeDifference = endDate - currentDate;
      const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Округляем вверх

      // Устанавливаем значение subscriptionEnd с правильным падежом слова "день"
      subscriptionEnd.value =
        daysRemaining > 0
          ? `Осталось ${daysRemaining} ${getDaysWord(daysRemaining)}`
          : "Подписка истекла";
    } else {
      subscriptionEnd.value = null;
    }

    // Вернуть или сохранить данные в переменной
    return userInfo;
  } catch (error) {
    console.error("Ошибка при запросе информации о пользователе:", error);
    return null;
  }
};

// Проверка валидности токена (действует 15 минут)
const isTokenValid = () => {
  const token = sessionStorage.getItem("jwtToken");
  const tokenTimestamp = sessionStorage.getItem("tokenTimestamp");
  const max_live = 15 * 60 * 1000;
  return token && tokenTimestamp && Date.now() - tokenTimestamp < max_live;
};

onMounted(async () => {
  // Проверяем, доступен ли Telegram WebApp
  if (window.Telegram && window.Telegram.WebApp) {
    initData.value = window.Telegram.WebApp.initData || "";
    const params = new URLSearchParams(initData.value);
    telegramId.value = window.Telegram.WebApp.initDataUnsafe.user?.id;
    hash.value = params.get("hash") || null;
    window.Telegram.WebApp.setHeaderColor("#2a2a2a");

    console.log("Telegram ID:", telegramId.value);
    console.log("Hash:", hash.value);
    console.log("InitData:", initData.value);

    // Проверяем, существует ли токен и не истек ли его срок, иначе получаем новый
    if (!isTokenValid()) {
      await fetchJwtToken();
    } else {
      jwtToken.value = sessionStorage.getItem("jwtToken");
      await fetchUserInfo(); // Запрашиваем баланс, если токен уже действителен
    }
  } else {
    console.error("Telegram WebApp не инициализирован");
  }
});
</script>

<style scoped>
.container {
  width: 90%;
  height: 90%;
  padding: 20px;
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
  font-size: 100%;
  background-color: #59a776;
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
.vpn-buttons {
  background-color: #1f1f1f;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: space-between;
  margin: 0;
  border: none;
  height: auto;
}
.vpn-buttons-container {
  display: flex;
  flex-direction: row;
  width: 99%;
  gap: 3%;
}
.button-buy-vpn,
.button-install-vpn {
  font-size: 100%;
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
.button-install-vpn {
  width: 50%;
  background-color: #59a776;
  color: #ececec;
}
.subscribed {
  background-color: #1f1f1f;
  color: white;
  padding: 10px;
  display: flex;
  flex-direction: column;
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
.sub-container {
  font-size: 24px;
  display: flex;
  flex-direction: column;
  margin-bottom: -4vw;
  width: 100%;
}
.p-container {
  font-weight: bold;
  display: inline-block;
  background-color: #4d644d;
  border-radius: 15px;
  margin-top: 5px;
  padding: 7px;
}
.time-container {
  font-size: 20px;
  margin-top: -5vw;
  color: #c5c5c5;
}
</style>
