<template>
  <div class="progress-card">
    <div class="progress-header">
      <h3>📊 Tiến độ hôm nay</h3>
      <div class="progress-stats">
        <span class="completed">{{ completedTasksCount }} hoàn thành</span>
        <span class="remaining">{{ remainingTasksCount }} còn lại</span>
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <span class="progress-text">{{ progressPercentage }}%</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskProgress',
  props: {
    completedTasksCount: {
      type: Number,
      required: true
    },
    remainingTasksCount: {
      type: Number,
      required: true
    },
    totalTasksCount: {
      type: Number,
      required: true
    }
  },
  computed: {
    progressPercentage() {
      if (this.totalTasksCount === 0) return 0
      return Math.round((this.completedTasksCount / this.totalTasksCount) * 100)
    }
  }
}
</script>

<style scoped>
.progress-card {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h3 {
  margin: 0;
  color: #000000;
  font-weight: 700;
}

.progress-stats {
  display: flex;
  gap: 16px;
  font-size: 0.9rem;
}

.progress-stats .completed {
  color: #28a745;
  font-weight: 600;
}

.progress-stats .remaining {
  color: #dc3545;
  font-weight: 600;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 600;
  color: #000000;
  min-width: 40px;
}
</style>