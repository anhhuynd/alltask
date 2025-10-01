<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">Chào mừng trở lại!</h1>
          <p class="welcome-subtitle">{{ currentGreeting }} - Hôm nay là {{ currentDate }}</p>
        </div>
        <div class="welcome-stats">
          <div class="quick-stat">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-number">{{ todayTasks }}</div>
              <div class="stat-label">Tasks hôm nay</div>
            </div>
          </div>
          <div class="quick-stat">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-number">{{ completionRate }}%</div>
              <div class="stat-label">Hoàn thành</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">⚡</span>
          Quick Actions
        </h2>
      </div>
      <div class="section-content">
        <div class="quick-actions-grid">
          <button 
            v-for="action in quickActions" 
            :key="action.id"
            @click="handleQuickAction(action.id)"
            class="quick-action-btn"
            :class="action.color"
          >
            <div class="action-icon">{{ action.icon }}</div>
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-description">{{ action.description }}</div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Overview -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📈</span>
          Tổng quan thống kê
        </h2>
        <select v-model="selectedPeriod" class="period-select">
          <option value="today">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
        </select>
      </div>
      <div class="section-content">
        <div class="stats-grid">
          <div v-for="stat in statistics" :key="stat.id" class="stat-card" :class="stat.type">
            <div class="stat-header">
              <div class="stat-icon">{{ stat.icon }}</div>
              <div class="stat-trend" :class="stat.trend">
                {{ stat.change > 0 ? '↗️' : stat.change < 0 ? '↘️' : '➡️' }}
                {{ Math.abs(stat.change) }}%
              </div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ formatNumber(stat.value) }}</div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-description">{{ stat.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🕒</span>
          Hoạt động gần đây
        </h2>
        <button @click="refreshActivities" class="refresh-btn">
          <span class="refresh-icon">🔄</span>
          Làm mới
        </button>
      </div>
      <div class="section-content">
        <div class="activities-list">
          <div 
            v-for="activity in recentActivities" 
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="activity.type">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-description">{{ activity.description }}</div>
              <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
            </div>
            <div class="activity-status" :class="activity.status">
              {{ getStatusText(activity.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Chart -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          Biểu đồ hiệu suất
        </h2>
        <div class="chart-controls">
          <button 
            v-for="type in chartTypes" 
            :key="type.id"
            @click="selectedChartType = type.id"
            class="chart-type-btn"
            :class="{ active: selectedChartType === type.id }"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
      <div class="section-content">
        <div class="chart-container">
          <div class="chart-placeholder">
            <div class="chart-icon">📈</div>
            <div class="chart-text">
              <div class="chart-title">{{ getChartTitle() }}</div>
              <div class="chart-subtitle">Dữ liệu {{ selectedPeriod === 'today' ? 'hôm nay' : selectedPeriod === 'week' ? 'tuần này' : 'tháng này' }}</div>
            </div>
          </div>
          <!-- Simulated chart bars -->
          <div class="chart-bars">
            <div 
              v-for="(value, index) in chartData" 
              :key="index"
              class="chart-bar"
              :style="{ height: (value / Math.max(...chartData)) * 100 + '%' }"
            >
              <div class="bar-value">{{ value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">⚙️</span>
          Trạng thái hệ thống
        </h2>
      </div>
      <div class="section-content">
        <div class="system-status-grid">
          <div v-for="service in systemServices" :key="service.id" class="service-card">
            <div class="service-header">
              <div class="service-name">{{ service.name }}</div>
              <div class="service-status" :class="service.status">
                <div class="status-dot"></div>
                {{ getServiceStatusText(service.status) }}
              </div>
            </div>
            <div class="service-metrics">
              <div class="metric">
                <span class="metric-label">Uptime:</span>
                <span class="metric-value">{{ service.uptime }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Response:</span>
                <span class="metric-value">{{ service.responseTime }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      selectedPeriod: 'today',
      selectedChartType: 'tasks',
      quickActions: [
        {
          id: 'new-task',
          icon: '➕',
          title: 'Tạo Task mới',
          description: 'Thêm công việc mới',
          color: 'primary'
        },
        {
          id: 'tts-convert',
          icon: '🎵',
          title: 'TTS Convert',
          description: 'Chuyển đổi text to speech',
          color: 'success'
        },
        {
          id: 'translate',
          icon: '🌐',
          title: 'Dịch phụ đề',
          description: 'Dịch subtitle nhanh',
          color: 'info'
        },
        {
          id: 'generate-prompt',
          icon: '🎨',
          title: 'Tạo Prompt',
          description: 'Generate image prompt',
          color: 'warning'
        }
      ],
      statistics: [
        {
          id: 'total-tasks',
          icon: '📋',
          label: 'Tổng Tasks',
          value: 156,
          change: 12,
          trend: 'up',
          type: 'primary',
          description: 'Tasks đã tạo'
        },
        {
          id: 'completed',
          icon: '✅',
          label: 'Hoàn thành',
          value: 89,
          change: 8,
          trend: 'up',
          type: 'success',
          description: 'Tasks đã xong'
        },
        {
          id: 'tts-generated',
          icon: '🎵',
          label: 'TTS Generated',
          value: 234,
          change: -3,
          trend: 'down',
          type: 'info',
          description: 'Audio files'
        },
        {
          id: 'prompts-created',
          icon: '🎨',
          label: 'Prompts tạo',
          value: 67,
          change: 15,
          trend: 'up',
          type: 'warning',
          description: 'Image prompts'
        }
      ],
      recentActivities: [
        {
          id: 1,
          type: 'task',
          title: 'Hoàn thành task "Build kênh giải đoán"',
          description: 'Task đã được đánh dấu hoàn thành',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          status: 'success'
        },
        {
          id: 2,
          type: 'tts',
          title: 'TTS conversion completed',
          description: 'Đã chuyển đổi 15 audio files',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'success'
        },
        {
          id: 3,
          type: 'translate',
          title: 'Subtitle translation',
          description: 'Dịch 327 phụ đề từ Tiếng Trung sang Tiếng Việt',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          status: 'processing'
        },
        {
          id: 4,
          type: 'prompt',
          title: 'Generated image prompts',
          description: 'Tạo 5 prompts cho nội dung mới',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          status: 'success'
        }
      ],
      chartTypes: [
        { id: 'tasks', label: 'Tasks' },
        { id: 'tts', label: 'TTS' },
        { id: 'translations', label: 'Dịch thuật' },
        { id: 'prompts', label: 'Prompts' }
      ],
      chartData: [45, 67, 23, 89, 34, 78, 56],
      systemServices: [
        {
          id: 'api-chatgpt',
          name: 'ChatGPT API',
          status: 'online',
          uptime: '99.9%',
          responseTime: 245
        },
        {
          id: 'api-elevenlabs',
          name: 'ElevenLabs API',
          status: 'online',
          uptime: '98.7%',
          responseTime: 189
        },
        {
          id: 'storage',
          name: 'File Storage',
          status: 'online',
          uptime: '100%',
          responseTime: 56
        },
        {
          id: 'database',
          name: 'Local Database',
          status: 'warning',
          uptime: '95.2%',
          responseTime: 423
        }
      ]
    }
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    currentGreeting() {
      const hour = new Date().getHours()
      if (hour < 12) return 'Chào buổi sáng'
      if (hour < 18) return 'Chào buổi chiều'
      return 'Chào buổi tối'
    },
    todayTasks() {
      return 12 // Mock data
    },
    completionRate() {
      return 78 // Mock data
    }
  },
  methods: {
    handleQuickAction(actionId) {
      switch(actionId) {
        case 'new-task':
          this.$emit('navigate', 'task')
          break
        case 'tts-convert':
          this.$emit('navigate', 'tts')
          break
        case 'translate':
          this.$emit('navigate', 'subtitle')
          break
        case 'generate-prompt':
          this.$emit('navigate', 'prompt')
          break
      }
    },
    getActivityIcon(type) {
      const icons = {
        task: '📋',
        tts: '🎵',
        translate: '🌐',
        prompt: '🎨'
      }
      return icons[type] || '📄'
    },
    getStatusText(status) {
      const texts = {
        success: 'Thành công',
        processing: 'Đang xử lý',
        error: 'Lỗi',
        pending: 'Chờ xử lý'
      }
      return texts[status] || 'Không rõ'
    },
    getServiceStatusText(status) {
      const texts = {
        online: 'Hoạt động',
        offline: 'Ngưng hoạt động',
        warning: 'Cảnh báo'
      }
      return texts[status] || 'Không rõ'
    },
    getChartTitle() {
      const titles = {
        tasks: 'Thống kê Tasks',
        tts: 'TTS Conversions',
        translations: 'Dịch thuật',
        prompts: 'Image Prompts'
      }
      return titles[this.selectedChartType] || 'Biểu đồ'
    },
    formatNumber(num) {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },
    formatTime(timestamp) {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      
      if (minutes < 60) {
        return `${minutes} phút trước`
      } else if (hours < 24) {
        return `${hours} giờ trước`
      } else {
        return timestamp.toLocaleDateString('vi-VN')
      }
    },
    refreshActivities() {
      // Mock refresh
      this.recentActivities = [...this.recentActivities]
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Welcome Section */
.welcome-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  margin-bottom: 8px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.welcome-stats {
  display: flex;
  gap: 24px;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-icon {
  font-size: 24px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
}

/* Section Card */
.section-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.section-header {
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 20px;
}

.section-content {
  padding: 24px;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn.primary {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
}

.quick-action-btn.success {
  border-color: #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #f0fdf4 100%);
}

.quick-action-btn.info {
  border-color: #06b6d4;
  background: linear-gradient(135deg, #cffafe 0%, #f0fdfa 100%);
}

.quick-action-btn.warning {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
}

.action-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.action-description {
  font-size: 14px;
  color: #6b7280;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.stat-card.primary {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, white 100%);
}

.stat-card.success {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, white 100%);
}

.stat-card.info {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(135deg, #cffafe 0%, white 100%);
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, white 100%);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-trend.up {
  color: #10b981;
}

.stat-trend.down {
  color: #ef4444;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.stat-description {
  font-size: 12px;
  color: #6b7280;
}

/* Activities */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e1e5e9;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: #e1e5e9;
}

.activity-icon.task {
  background: #dbeafe;
}

.activity-icon.tts {
  background: #d1fae5;
}

.activity-icon.translate {
  background: #cffafe;
}

.activity-icon.prompt {
  background: #fef3c7;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

.activity-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.activity-status.success {
  background: #d1fae5;
  color: #065f46;
}

.activity-status.processing {
  background: #fef3c7;
  color: #92400e;
}

/* Chart */
.chart-container {
  position: relative;
  height: 300px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-icon {
  font-size: 48px;
  opacity: 0.5;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
}

.chart-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 120px;
}

.chart-bar {
  width: 24px;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #374151;
}

/* System Status */
.system-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.service-card {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.service-name {
  font-weight: 600;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.service-status.online {
  color: #10b981;
}

.service-status.warning {
  color: #f59e0b;
}

.service-status.offline {
  color: #ef4444;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.service-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.metric-label {
  color: #6b7280;
}

.metric-value {
  font-weight: 500;
}

/* Controls */
.period-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-type-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-type-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #f3f4f6;
}

.refresh-icon {
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
    gap: 16px;
  }

  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-stats {
    width: 100%;
    justify-content: space-between;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .system-status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-stats {
    flex-direction: column;
    gap: 12px;
  }

  .quick-stat {
    width: 100%;
  }
}
</style>