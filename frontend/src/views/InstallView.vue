<template>
  <BackButton />
  <div class="container">
    <!-- Верхнее поле с ссылкой -->
    <div class="copy-link">
      <input
        type="text"
        readonly
        :value="link"
        ref="linkInput"
        class="link-field"
      />
      <button @click="copyLink" class="copy-button">Copy Link</button>
    </div>

    <!-- Переключение между вкладками "Приложение" и "Инструкция" -->
    <div class="tab-buttons">
      <button
        :class="{ active: selectedTab === 'app' }"
        @click="selectTab('app')"
      >
        Приложение
      </button>
      <button
        :class="{ active: selectedTab === 'instruction' }"
        @click="selectTab('instruction')"
      >
        Инструкция
      </button>
    </div>

    <!-- Контент вкладки "Приложение" или "Инструкция" -->
    <div v-if="selectedTab === 'app'">
      <!-- Вкладки с операционками -->
      <div class="accordion">
        <div v-for="(os, index) in osList" :key="index" class="accordion-item">
          <button
            @click="toggleAccordion(index)"
            :class="['accordion-header', { open: activeIndex === index }]"
          >
            {{ os.name }}
            <span class="arrow" :class="{ rotated: activeIndex === index }">▼</span>
          </button>
          <transition name="accordion">
            <div v-if="activeIndex === index" class="accordion-content">
              <div
                v-for="(icon, iconIndex) in os.icons"
                :key="iconIndex"
                class="icon-description"
                @click="openLink(os.links[iconIndex])"
              >
                <img :src="icon" alt="app icon" class="app-icon" />
                <p class="app-name">{{ os.descriptions[iconIndex] }}</p>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-if="selectedTab === 'instruction'">
      <!-- Вкладки с приложениями и видео-инструкциями -->
      <div class="accordion">
        <div
          v-for="(app, index) in appList"
          :key="index"
          class="accordion-item"
        >
          <button
            @click="toggleAccordion(index)"
            :class="['accordion-header', { open: activeIndex === index }]"
          >
            {{ app.name }}
            <span class="arrow" :class="{ rotated: activeIndex === index }">▼</span>
          </button>
          <transition name="accordion">
            <div v-if="activeIndex === index" class="accordion-content">
              <video controls :src="app.videoUrl" class="instruction-video" />
            </div>
          </transition>
        </div>
      </div>
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
    const link = ref(sessionStorage.getItem("subscription_link"));
    const selectedTab = ref("app"); // 'app' или 'instruction'
    const activeIndex = ref(null);

    // Список операционных систем для вкладки "Приложение"
    const osList = ref([
      {
        name: "Windows",
        icons: ["NekoRay-55x55.png"],
        descriptions: ["nekoray"],
        links: ["https://pipreq.me/pwa/av/nekoray_setup.exe"],
      },
      {
        name: "Android",
        icons: ["v2box.png"],
        descriptions: ["V2Box"],
        links: [
          "https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box&hl=en_US",
        ],
      },
      {
        name: "IOS",
        icons: ["v2box.png", "foXray.png"],
        descriptions: ["V2Box", "FoXray"],
        links: [
          "https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690",
          "https://apps.apple.com/ru/app/foxray/id6448898396",
        ],
      },
      {
        name: "MacOS",
        icons: ["v2box.png", "foXray.png"],
        descriptions: ["V2Box", "FoXray"],
        links: [
          "https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690",
          "https://apps.apple.com/ru/app/foxray/id6448898396",
        ],
      },
    ]);

    // Список приложений для вкладки "Инструкция"
    const appList = ref([
      { name: "nekoray", videoUrl: "nekobox.mp4" },
      { name: "V2Box", videoUrl: "v2box-video.mp4" },
      { name: "FoXray", videoUrl: "foxray-video.mp4" },
    ]);

    // Функция для копирования ссылки
    const copyLink = async () => {
      haptic.impact();
      try {
        await navigator.clipboard.writeText(link.value);
        alert("Ссылка скопирована в буфер обмена!");
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    const openLink = (url) => {
      haptic.medium();
      window.open(url, "_blank");
    };

    // Функция для переключения вкладок
    const selectTab = (tab) => {
      haptic.selection();
      selectedTab.value = tab;
      activeIndex.value = null; // Сбросить активный элемент при переключении вкладки
    };

    // Функция для раскрытия вкладки
    const toggleAccordion = (index) => {
      haptic.selection();
      activeIndex.value = activeIndex.value === index ? null : index;
    };

    return {
      link,
      selectedTab,
      osList,
      appList,
      activeIndex,
      selectTab,
      toggleAccordion,
      copyLink,
      openLink,
    };
  },
});
</script>

<style scoped lang="scss">
.container {
  width: 95%;
  height: 90%;
  padding: 20px 10px 20px 10px;
  border-radius: 20px;
}
.copy-link {
  display: flex;
  margin-bottom: 20px;
}

.link-field {
  font-size: 22px;
  width: 80%;
  padding: 10px;
  color: white;
  background-color: #1e1e1e;
  border: none;
  border-radius: 15px 0 0 15px;
}

.copy-button {
  padding: 10px;
  background-color: #59a776;
  color: white;
  border: none;
  border-radius: 0 15px 15px 0;
  cursor: pointer;
}

.tab-buttons {
  display: flex;
  margin-bottom: 20px;
  justify-content: space-between;
}

.tab-buttons button {
  padding: 10px;
  font-size: 20px;
  background-color: #2a2a2a;
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
}

.tab-buttons button.active {
  background-color: #ececec;
  color: black;
}

.accordion {
  .accordion-item {
    margin-bottom: 10px;
  }

  .accordion-header {
    width: 100%;
    font-size: 20px;
    padding: 10px;
    background-color: #1f1f1f;
    color: white;
    border: none;
    border-radius: 15px;
    text-align: left;
    cursor: pointer;
    outline: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .accordion-header.open {
    border-radius: 15px 15px 0 0;
  }

  .accordion-content {
    gap: 20px;
    display: flex;
    padding: 15px;
    border: none;
    border-radius: 0 0 15px 15px;
    color: black;
    background-color: #fafafa;
    transform-origin: top;
    transition: all 0.3s ease;
  }
}

.app-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
}

.icon-description {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  animation-delay: 0.1s;
}

.app-name {
  margin-bottom: auto;
}

.instruction-video {
  width: 100%;
  height: 300px;
}

.arrow {
  transition: transform 0.3s ease;
}

.arrow.rotated {
  transform: rotate(180deg);
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  max-height: 300px; /* Подберите значение под ваш контент */
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
