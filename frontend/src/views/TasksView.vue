<template>
  <BackButton />
  <div class="tasks-container">
    <div class="tasks-header">
      <h1>Задания</h1>
    </div>

    <div class="tasks-tutorial">
      <p>Чтобы получать бесплатные дни трафика, вы можете выполнять задания, указанные ниже.</p>
      <p>Задание засчитывается только в случае получения статуса 'выполнено'.</p>
    </div>

    <div class="tasks-list" 
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd"
         @mousedown="handleMouseDown"
         @mousemove="handleMouseMove"
         @mouseup="handleMouseUp"
         @mouseleave="handleMouseUp">
      <div class="tasks-wrapper" :style="{ transform: `translateX(${-currentPage * 110}%)` }">
        <div v-for="(page, pageIndex) in groupedTasks" :key="pageIndex" class="tasks-page">
          <div v-for="task in page" 
               :key="task.id" 
               class="task-card" 
               :class="{ 'done': task.is_done }"
               @click="openTaskDetails(task)">
            <div class="task-header">
              <div class="task-icon">
                <img :src="task.icon" :alt="task.name" />
              </div>
              <div class="task-title">
                <h2>{{ task.name }}</h2>
                <p class="task-reward">+ {{ task.payout }} {{ task.currency }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <div v-for="n in totalPages" 
           :key="n" 
           class="indicator" 
           :class="{ active: currentPage === n - 1 }"
           @click="currentPage = n - 1">
      </div>
    </div>
  </div>

  <!-- Попап с деталями таска -->
  <div v-if="selectedTask" class="task-popup-overlay" @click.self="closeTaskDetails">
    <div class="task-popup" @click.stop>
      <div class="task-popup-header">
        <div class="task-popup-icon">
          <img :src="selectedTask.icon" :alt="selectedTask.name" />
        </div>
        <div class="task-popup-title">
          <h2>{{ selectedTask.name }}</h2>
          <p class="task-popup-reward">+ {{ selectedTask.payout }} {{ selectedTask.currency }}</p>
        </div>
        <button class="close-button" @click="closeTaskDetails">×</button>
      </div>
      
      <div class="task-popup-content">
        <p class="task-popup-description">{{ selectedTask.description }}</p>
        <template v-if="!selectedTask.is_done">
          <a :href="selectedTask.url" 
             target="_blank" 
             class="task-popup-button"
             @click="handleTaskClick(selectedTask)">
            {{ selectedTask.btn_label }}
          </a>
        </template>
        <template v-else>
          <div class="task-completed-status">
            Выполнено
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BackButton from '@/components/BackButton.vue'
import { haptic } from "@/utils/telegram";

const tasks = ref([])
const currentPage = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)
const selectedTask = ref(null)

const TASKS_PER_PAGE = 4
const SWIPE_THRESHOLD = 50

const groupedTasks = computed(() => {
  const sortedTasks = [...tasks.value].sort((a, b) => {
    if (a.is_done === b.is_done) return 0;
    return a.is_done ? 1 : -1;
  });

  const groups = [];
  for (let i = 0; i < sortedTasks.length; i += TASKS_PER_PAGE) {
    groups.push(sortedTasks.slice(i, i + TASKS_PER_PAGE));
  }
  return groups;
})

const totalPages = computed(() => groupedTasks.value.length)

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const swipeDistance = touchStartX.value - touchEndX.value
  
  if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
    if (swipeDistance > 0 && currentPage.value < totalPages.value - 1) {
      currentPage.value++
    } else if (swipeDistance < 0 && currentPage.value > 0) {
      currentPage.value--
    }
  }
}

const handleMouseDown = (e) => {
  isDragging.value = true
  touchStartX.value = e.clientX
}

const handleMouseMove = (e) => {
  if (isDragging.value) {
    touchEndX.value = e.clientX
  }
}

const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    handleTouchEnd()
  }
}

const openTaskDetails = (task) => {
  haptic.selection()
  selectedTask.value = task
}

const closeTaskDetails = () => {
  haptic.selection()
  selectedTask.value = null
}

const handleTaskClick = async (task) => {
  const tg_id = String(sessionStorage.getItem("tg_id"))
  try {
    const response = await fetch('https://back.avevpn.su/requestClick', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tg_id: tg_id,
        task_id: String(task.id)
      })
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    closeTaskDetails()
    fetchTasks()
  } catch (error) {
    console.error('Error sending click:', error)
  }
}

const fetchTasks = async () => {
  const tg_id = String(sessionStorage.getItem("tg_id"))
  try {
    const response = await fetch('https://back.avevpn.su/requestGetFeed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tg_id: tg_id })
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()
    tasks.value = data
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.tasks-container {
  padding: 10px;
  max-width: 800px;
  position: relative;
  overflow: hidden;
}

.tasks-header {
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 4px;
  text-align: center;
  margin-bottom: 10px;
}

.tasks-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #ececec;
}

.tasks-tutorial {
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 1px 15px 1px 15px;
  margin-bottom: 10px;
  font-style: italic;
  font-size: 14px;
}

.tasks-list {
  background-color: #1f1f1f;
  border-radius: 15px;
  padding: 15px;
  overflow: hidden;
}

.tasks-wrapper {
  display: flex;
  transition: transform 0.3s ease;
  width: 100%;
  gap: 10%;
}

.tasks-page {
  min-width: 100%;
  display: grid;
  gap: 10px;
  grid-template-rows: repeat(4, 1fr);
}

.task-card {
  background: #ffffff;
  border-radius: 15px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
}

.task-card.done {
  filter: brightness(0.5)
}

.task-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
}

.task-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-title {
  flex: 1;
}

.task-title h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e1e1e;
}

.task-reward {
  font-size: 14px;
  color: #67c289;
  margin: 4px 0 0;
  font-weight: 600;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(89, 167, 118, 0.3);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.indicator.active {
  background-color: #59a776;
}

.task-status {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  background: #f5f5f5;
  color: #666;
}

.task-status.done {
  background: #e8f5e9;
  color: #67c289;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.4;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

.task-button {
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.task-button:hover {
  opacity: 0.9;
}

.task-button:active {
  opacity: 0.8;
}

.task-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.task-popup {
  background: #1f1f1f;
  border-radius: 15px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.task-popup-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.task-popup-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
}

.task-popup-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-popup-title {
  flex: 1;
}

.task-popup-title h2 {
  color: #ffffff;
  font-size: 20px;
  margin: 0;
}

.task-popup-reward {
  color: #67c289;
  font-size: 16px;
  margin: 5px 0 0;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-popup-content {
  color: #ffffff;
}

.task-popup-description {
  margin-bottom: 20px;
  line-height: 1.5;
}

.task-popup-button {
  display: block;
  background: linear-gradient(45deg, #67c289 0%, #3d8a57 100%);
  color: white;
  text-decoration: none;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
}

.task-completed-status {
  text-align: center;
  color: #67c289;
  font-weight: 600;
  padding: 12px;
  background: rgba(103, 194, 137, 0.1);
  border-radius: 12px;
  margin-top: 20px;
}
</style>