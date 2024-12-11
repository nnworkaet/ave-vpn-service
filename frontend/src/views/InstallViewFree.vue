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

    <div class="install-info">
      <p>Скопируйте ссылку и вставьте её в приложении для вашей ОС</p>
      <p>🔥- обозначен выбор редакции</p>
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
            <div v-if="activeIndex === index" class="accordion-content-app">
              <div
                v-for="(icon, iconIndex) in os.icons"
                :key="iconIndex"
                class="icon-description"
                @click="openLink(os.links[iconIndex])"
              >
                <div class="icon-wrapper">
                  <img :src="icon" alt="app icon" class="app-icon" />
                  <span
                    v-if="isEditorChoice(os.descriptions[iconIndex])"
                    class="editor-choice"
                  >
                    🔥
                  </span>
                </div>
                <p class="app-name">{{ os.descriptions[iconIndex] }}</p>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-if="selectedTab === 'instruction'">
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
              <button
                class="instruction-button"
                @click="openLink(app.instructionUrl)"
              >
                Перейти к инструкции
              </button>
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
import axios from "axios";

export default defineComponent({
  components: { BackButton },
  setup() {
    const link = ref(sessionStorage.getItem("free_subscription_link"));
    const selectedTab = ref("app");
    const activeIndex = ref(null);
    const editorChoiceApps = ["hiddify", "FoXray"];
    const isEditorChoice = (appName) => editorChoiceApps.includes(appName);

    const osList = ref([
      {
        name: "Windows",
        icons: ["NekoRay-55x55.png", "https://play-lh.googleusercontent.com/Dm_6ugf7Wwib_A3AFFdtkktufYGGOamhb072Ii46zYyb__qZHSocnJGErEUWxp7UWaGG=w240-h480"],
        descriptions: ["nekoray", "hiddify"],
        links: ["https://pipreq.me/pwa/av/nekoray_setup.exe", "https://github.com/hiddify/hiddify-app/releases/latest/download/Hiddify-Windows-Setup-x64.Msix"],
      },
      {
        name: "Android",
        icons: ["https://play-lh.googleusercontent.com/Dm_6ugf7Wwib_A3AFFdtkktufYGGOamhb072Ii46zYyb__qZHSocnJGErEUWxp7UWaGG=w240-h480", "v2box.png"],
        descriptions: ["hiddify", "V2Box"],
        links: [
          "https://play.google.com/store/apps/details?id=app.hiddify.com&hl=en_GB",
          "https://play.google.com/store/apps/details?id=dev.hexasoftware.v2box&hl=en_US",
        ],
      },
      {
        name: "IOS",
        icons: ["foXray.png", "v2box.png"],
        descriptions: ["FoXray", "V2Box"],
        links: [
          "https://apps.apple.com/ru/app/foxray/id6448898396",
          "https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690",
        ],
      },
      {
        name: "MacOS",
        icons: ["foXray.png", "v2box.png", ],
        descriptions: ["FoXray", "V2Box"],
        links: [
          "https://apps.apple.com/ru/app/foxray/id6448898396",
          "https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690",
        ],
      },
    ]);

    const appList = ref([
      { name: "nekoray", videoUrl: "nekobox.mp4", instructionUrl: "https://example.com/nekoray" },
      { name: "V2Box", videoUrl: "v2box-video.mp4", instructionUrl: "https://t.me/AveVpnInstruction/2" },
      { name: "FoXray", videoUrl: "foxray-video.mp4", instructionUrl: "https://example.com/foxray" },
    ]);

    const copyLink = async () => {
      haptic.impact();
      try {
        if (!link.value) {
          alert("Ссылка недоступна");
          return;
        }

        const linkState = sessionStorage.getItem("link_state");
        const jwtToken = sessionStorage.getItem("jwtToken");

        if (!linkState || linkState === "0" || linkState === "false" || linkState === "null") {
          try {
            await axios.post(
              "https://back.avevpn.su/requestLinkState",
              { link_state: true },
              {
                headers: {
                  Authorization: `${jwtToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            sessionStorage.setItem("link_state", "true");
          } catch (error) {
            console.error("Failed to update link state:", error);
            alert("Ошибка при обновлении состояния ссылки");
            return;
          }
        }

        try {
          await navigator.clipboard.writeText(link.value);
          alert("Ссылка скопирована в буфер обмена!");
        } catch (clipboardError) {
          const textArea = document.createElement("textarea");
          textArea.value = link.value;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            alert("Ссылка скопирована в буфер обмена!");
          } catch (fallbackError) {
            alert("Не удалось скопировать ссылку. Пожалуйста, скопируйте её вручную.");
          }
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error("Failed to copy text: ", err);
        alert("Произошла ошибка при копировании ссылки");
      }
    };

    const openLink = (url) => {
      haptic.medium();
      window.open(url, "_blank");
    };

    const selectTab = (tab) => {
      haptic.selection();
      selectedTab.value = tab;
      activeIndex.value = null;
    };

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
      isEditorChoice,
    };
  },
});
</script>

<style scoped lang="scss">
.instruction-button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #59a776;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}

.install-info {
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 1px 15px 1px 15px;
  margin-bottom: 10px;
  font-style: italic;
  font-size: 14px;
}

.icon-wrapper {
  position: relative;
  display: inline-block;

  .app-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
  }

  .editor-choice {
    position: absolute;
    top: -5px;
    left: 0;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border-radius: 5px;
    transform: translate(-25%, -25%);
  }
}

.container {
  width: 95%;
  height: 90%;
  padding: 20px 10px 20px 10px;
  border-radius: 20px;
}
.copy-link {
  display: flex;
  margin-bottom: 10px;
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
  max-height: 50vh; /* Ограничиваем высоту */
  overflow-y: auto;

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
    display: flex;
    flex-direction: column;
    padding: 15px;
    border: none;
    border-radius: 0 0 15px 15px;
    color: black;
    background-color: #fafafa;
    transform-origin: top;
    transition: all 0.3s ease;
  }

  .accordion-content-app {
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
