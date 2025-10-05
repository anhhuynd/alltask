<template>
  <div class="task-progress" :class="timeBasedTheme">
    <div class="progress-stats">
      <div class="stat-item">
        <div class="stat-number">{{ completedTasksCount }}</div>
        <div class="stat-label">Đã hoàn thành</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ remainingTasksCount }}</div>
        <div class="stat-label">Còn lại</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ totalTasksCount }}</div>
        <div class="stat-label">Tổng cộng</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
    </div>
    <div class="progress-text">
      {{ progressPercentage }}% hoàn thành
    </div>
    <div class="time-indicator">
      <span class="current-time">{{ currentTime }}</span>
      <span class="time-period">{{ timePeriodText }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskProgress',
  props: {
    completedTasksCount: {
      type: Number,
      default: 0
    },
    remainingTasksCount: {
      type: Number,
      default: 0
    },
    totalTasksCount: {
      type: Number,
      default: 0
    }
  },
  computed: {
    progressPercentage() {
      if (this.totalTasksCount === 0) return 0
      return Math.round((this.completedTasksCount / this.totalTasksCount) * 100)
    },
    
    currentTime() {
      return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    timePeriodText() {
      const hour = new Date().getHours()
      if (hour < 12) return 'Buổi sáng'
      if (hour < 18) return 'Buổi chiều'
      return 'Buổi tối'
    },
    
    timeBasedTheme() {
      const hour = new Date().getHours()
      if (hour < 6) return 'night'
      if (hour < 12) return 'morning'
      if (hour < 18) return 'afternoon'
      return 'evening'
    }
  }
}
</script>

<style scoped>
.task-progress {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(79, 70, 229, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 16px;
}

.time-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.morning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.afternoon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.evening {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
}

.night {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}
</style>