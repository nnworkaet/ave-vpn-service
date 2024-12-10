<template>
  <BackButton />
  <div class="referral-page">
    <div class="referral-link-section">
      <h3>Ваша реферальная ссылка</h3>
      <div class="link-container">
        <input 
          type="text"
          :value="referralLink" 
          readonly 
          ref="referralInput"
          class="referral-input"
        />
        <button @click="copyReferralLink" class="copy-button">
          <span v-if="!copied">📋</span>
          <span v-else>✔️</span>
        </button>
      </div>
    </div>
    <div class="referral-info">
      <p>
        Чтобы реферал был засчитан и вы получили своё вознаграждение,
        он должен подключиться и использовать не менее 10 МБ трафика.
      </p>
    </div>
    <div class="referrals-section">
      <h3>Ваши рефералы</h3>
      <div v-if="referrals && referrals.length > 0" class="referrals-list">
        <div v-for="(referral, index) in referrals" :key="index" class="referral-card">
          <div class="referral-description">
            <div class="referral-name">{{ referral }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-referrals">
        У вас пока нет рефералов
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import BackButton from "@/components/BackButton.vue"
import { haptic } from "@/utils/telegram";

export default defineComponent({
  name: 'ReferalView',
  components: {
    BackButton,
  },
  setup() {
    const referralLink = ref(sessionStorage.getItem('referral_link'))
    const copied = ref(false)
    const referralInput = ref<HTMLInputElement | null>(null)
    const referralsData = sessionStorage.getItem('referrals')
    const referrals = ref(referralsData && referralsData !== 'null' ? referralsData.split(',') : [])

    const copyReferralLink = () => {
      if (referralInput.value) {
        haptic.impact();
        referralInput.value.select()
        document.execCommand('copy')
        copied.value = true
        setTimeout(() => {
          copied.value = false
        }, 1000)
      }
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }

    return {
      referralLink,
      copied,
      referralInput,
      referrals,
      copyReferralLink,
      formatDate,
    }
  }
})
</script>

<style scoped>
.referral-page {
  max-width: 800px;
  padding: 20px 10px 20px 10px;
}

.referral-link-section {
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 10px;
  text-align: center;
}

.link-container {
  display: flex;
}

.referral-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 15px 0px 0px 15px;
  font-size: 14px;
  background-color: #f8fafc;
}

.copy-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  color: white;
  border: none;
  border-radius: 0px 15px 15px 0px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background-color: #2563eb;
}

.referrals-section {
  margin-top: 10px;
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 10px;
  text-align: center;
}

.referrals-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  color: #64748b;
}

.referral-card {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
}

.referral-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.referral-date {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.no-referrals {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 0.5rem;
}

h3 {
  color: #ffffff;
  margin-top: 0;
}

.referral-info {
  margin-top: 10px;
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 15px;
  font-style: italic;
}

.referral-info p {
  margin: 0;
}
</style>
