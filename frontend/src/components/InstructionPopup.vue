<template>
  <div v-if="isVisible" class="instruction-popup">
    <div class="instruction-content">
      
      <div class="instruction-slider" 
           @touchstart="handleTouchStart"
           @touchmove="handleTouchMove"
           @touchend="handleTouchEnd">
        <div class="instruction-pages" :style="{ transform: `translateX(-${currentPage * 100}%)` }">
          <!-- Страница 1 -->
          <div class="instruction-page">
            <h2>Добро пожаловать в AVE VPN!</h2>
            <div class="page-content">
              <img src="free-tariff.jpg" alt="free-tariff-img" class="page-image">
              <p>При первом входе вы получаете бесплатную подписку на 3 дня для одного устройства.</p>
            </div>
          </div>

          <!-- Страница 2 -->
          <div class="instruction-page">
            <h2>Продление бесплатного тарифа</h2>
            <div class="page-content">
              <img src="tasks-img.jpg" alt="Balance" class="page-image">
              <p>Выполняйте задания и получайте от 24 часов VPN без рекламы и ограничений за каждое задание.</p>
            </div>
          </div>

          <!-- Страница 3 -->
          <div class="instruction-page">
            <h2>Выбор тарифа</h2>
            <div class="page-content">
              <img src="all-tariffs.jpg" alt="Tariff" class="page-image">
              <p></p>
              <p>Тариф можно приобрести на срок от 1 до 12 месяцев.</p>
              <p>В этом случае вам не обязательно выполнять задания.</p>
            </div>
          </div>

          <!-- Страница 4 -->
          <div class="instruction-page">
            <h2>Пополнение баланса</h2>
            <div class="page-content">
              <img src="payment-methods.jpg" alt="Install" class="page-image">
              <p>Пополните баланс на сумму от 100₽ любым удобным способом</p>
            </div>
          </div>

          <!-- Страница 5 -->
          <div class="instruction-page">
            <h2>Установка VPN</h2>
            <div class="page-content">
              <img src="get-link-img.jpg" alt="Traffic" class="page-image">
              <p>Есть подробные видео инструкции для легкой и удобной установки VPN </p>
            </div>
          </div>

          <!-- Страница 6 -->
          <div class="instruction-page">
            <h2>Поддержка и FAQ</h2>
            <div class="page-content">
              <img src="faq-img.jpg" alt="Ready" class="page-image">
              <p>FAQ: ответы на часто задаваемые вопросы доступны в правом верхнем углу экрана.</p>
              <p>Поддержка: напишите нам, если у вас возникнут вопросы.
                <a href="https://t.me/ave_helper" target="_blank" style="color: #59a776">@ave_helper</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="navigation">
        <div class="dots">
          <span v-for="n in 6" 
                :key="n" 
                :class="['dot', { active: currentPage === n - 1 }]"
                @click="goToPage(n - 1)">
          </span>
        </div>
        <div class="buttons">
          <button v-if="currentPage > 0" 
                  class="nav-button prev" 
                  @click="prevPage">
            Назад
          </button>
          <button v-if="currentPage < 5" 
                  class="nav-button next" 
                  @click="nextPage">
            Далее
          </button>
          <button v-if="currentPage === 5" 
                  class="start-button" 
                  @click="$emit('close')">
            Начать работу
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InstructionPopup',
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      currentPage: 0,
      touchStartX: 0,
      touchEndX: 0
    }
  },
  methods: {
    nextPage() {
      if (this.currentPage < 5) {
        this.currentPage++
      }
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--
      }
    },
    goToPage(pageNumber) {
      this.currentPage = pageNumber
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
    },
    handleTouchMove(e) {
      this.touchEndX = e.touches[0].clientX
    },
    handleTouchEnd() {
      const swipeThreshold = 50
      const diff = this.touchStartX - this.touchEndX

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && this.currentPage < 5) {
          this.nextPage()
        } else if (diff < 0 && this.currentPage > 0) {
          this.prevPage()
        }
      }
    }
  }
}
</script>

<style scoped>
.instruction-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.instruction-content {
  background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 15px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
  color: white;
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  z-index: 2;
}

.instruction-slider {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.instruction-pages {
  display: flex;
  transition: transform 0.3s ease;
  height: 100%;
}

.instruction-page {
  min-width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #fff;
}

.page-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 60px);
}

.page-image {
  width: 150px;
  margin-bottom: 20px;
  object-fit: contain;
  border-radius: 15px;
}

.navigation {
  padding: 20px 0;
}

.dots {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background: #4CAF50;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.nav-button {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-button:active {
  background: rgba(255, 255, 255, 0.2);
}

.start-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.start-button:active {
  opacity: 0.8;
}

p {
  text-align: center;
  line-height: 1.5;
  color: #ddd;
  margin: 0;
}
</style>
