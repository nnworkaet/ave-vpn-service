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
          </button>
          <div v-if="activeIndex === index" class="accordion-content">
            <!-- Обернули иконку и описание в ссылку -->
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
          </button>
          <div v-if="activeIndex === index" class="accordion-content">
            <video controls :src="app.videoUrl" class="instruction-video" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import BackButton from "@/components/BackButton.vue";

export default defineComponent({
  components: { BackButton },
  setup() {
    const link = sessionStorage.getItem("subscription_link");
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
      { name: "nekoray", videoUrl: "/videos/app1-instruction.mp4" },
      { name: "V2Box", videoUrl: "/videos/app2-instruction.mp4" },
      { name: "FoXray", videoUrl: "/videos/app3-instruction.mp4" },
    ]);

    // Функция для копирования ссылки
    const copyLink = () => {
      const linkInput = document.querySelector(".link-field"); // прямой доступ к DOM элементу
      if (linkInput) {
        linkInput.select();
        document.execCommand("copy");
        alert("Ссылка скопирована в буфер обмена!");
      } else {
        console.error("Поле ввода ссылки не найдено");
      }
    };

    const openLink = (url) => {
      window.open(url, "_blank");
    };

    // Функция для переключения вкладок
    const selectTab = (tab) => {
      selectedTab.value = tab;
      activeIndex.value = null; // Сбросить активный элемент при переключении вкладки
    };

    // Функция для раскрытия вкладки
    const toggleAccordion = (index) => {
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
  width: 90%;
  height: 90%;
  padding: 20px;
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
}

.app-name {
  margin-bottom: auto;
}

.instruction-video {
  width: 100%;
  height: 300px;
}
</style>
