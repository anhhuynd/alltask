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
          <div v-for="stat in statistics" :key="stat.id" class="stat-card">
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
              <div class="stat-extra">
                <span class="extra-label">Từ {{ selectedPeriod === 'today' ? 'hôm qua' : selectedPeriod === 'week' ? 'tuần trước' : 'tháng trước' }}:</span>
                <span class="extra-value">{{ stat.previousValue }}</span>
              </div>
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
              <div class="activity-meta">
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                <span class="activity-location">{{ activity.location }}</span>
              </div>
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
          <div class="chart-info">
            <div class="chart-summary">
              <div class="summary-item">
                <div class="summary-label">Tổng cộng</div>
                <div class="summary-value">{{ chartData.reduce((a, b) => a + b, 0) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Trung bình</div>
                <div class="summary-value">{{ Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length) }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">Cao nhất</div>
                <div class="summary-value">{{ Math.max(...chartData) }}</div>
              </div>
            </div>
          </div>
          <div class="chart-bars">
            <div 
              v-for="(value, index) in chartData" 
              :key="index"
              class="chart-bar"
              :style="{ height: (value / Math.max(...chartData)) * 100 + '%' }"
            >
              <div class="bar-value">{{ value }}</div>
              <div class="bar-label">{{ getBarLabel(index) }}</div>
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
        <div class="system-summary">
          <span class="summary-text">{{ onlineServices }}/{{ systemServices.length }} dịch vụ hoạt động</span>
        </div>
      </div>
      <div class="section-content">
        <div class="system-status-grid">
          <div v-for="service in systemServices" :key="service.id" class="service-card">
            <div class="service-header">
              <div class="service-info">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-description">{{ service.description }}</div>
              </div>
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
              <div class="metric">
                <span class="metric-label">Last Check:</span>
                <span class="metric-value">{{ service.lastCheck }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Usage Statistics -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">💾</span>
          Thống kê sử dụng
        </h2>
      </div>
      <div class="section-content">
        <div class="usage-grid">
          <div v-for="usage in usageStats" :key="usage.id" class="usage-card">
            <div class="usage-header">
              <div class="usage-icon">{{ usage.icon }}</div>
              <div class="usage-title">{{ usage.title }}</div>
            </div>
            <div class="usage-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: usage.percentage + '%' }"></div>
              </div>
              <div class="progress-text">{{ usage.used }} / {{ usage.total }} ({{ usage.percentage }}%)</div>
            </div>
            <div class="usage-details">
              <div class="detail-item">
                <span>Còn lại:</span>
                <span>{{ usage.remaining }}</span>
              </div>
              <div class="detail-item">
                <span>Ước tính hết:</span>
                <span>{{ usage.estimatedEnd }}</span>
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
          description: 'Thêm công việc mới'
        },
        {
          id: 'tts-convert',
          icon: '🎵',
          title: 'TTS Convert',
          description: 'Chuyển đổi text to speech'
        },
        {
          id: 'translate',
          icon: '🌐',
          title: 'Dịch phụ đề',
          description: 'Dịch subtitle nhanh'
        },
        {
          id: 'generate-prompt',
          icon: '🎨',
          title: 'Tạo Prompt',
          description: 'Generate image prompt'
        }
      ],
      statistics: [
        {
          id: 'total-tasks',
          icon: '📋',
          label: 'Tổng Tasks',
          value: 156,
          previousValue: 139,
          change: 12,
          trend: 'up',
          description: 'Tasks đã tạo'
        },
        {
          id: 'completed',
          icon: '✅',
          label: 'Hoàn thành',
          value: 89,
          previousValue: 82,
          change: 8,
          trend: 'up',
          description: 'Tasks đã xong'
        },
        {
          id: 'tts-generated',
          icon: '🎵',
          label: 'TTS Generated',
          value: 234,
          previousValue: 241,
          change: -3,
          trend: 'down',
          description: 'Audio files'
        },
        {
          id: 'prompts-created',
          icon: '🎨',
          label: 'Prompts tạo',
          value: 67,
          previousValue: 58,
          change: 15,
          trend: 'up',
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
          status: 'success',
          location: 'Task Manager'
        },
        {
          id: 2,
          type: 'tts',
          title: 'TTS conversion completed',
          description: 'Đã chuyển đổi 15 audio files thành công',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'success',
          location: 'TTS Module'
        },
        {
          id: 3,
          type: 'translate',
          title: 'Subtitle translation',
          description: 'Dịch 327 phụ đề từ Tiếng Trung sang Tiếng Việt',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          status: 'processing',
          location: 'Translator'
        },
        {
          id: 4,
          type: 'prompt',
          title: 'Generated image prompts',
          description: 'Tạo 5 prompts cho nội dung mới',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          status: 'success',
          location: 'Prompt Generator'
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
          description: 'AI text generation service',
          status: 'online',
          uptime: '99.9%',
          responseTime: 245,
          lastCheck: '2 phút trước'
        },
        {
          id: 'api-elevenlabs',
          name: 'ElevenLabs API',
          description: 'Text-to-speech service',
          status: 'online',
          uptime: '98.7%',
          responseTime: 189,
          lastCheck: '1 phút trước'
        },
        {
          id: 'storage',
          name: 'File Storage',
          description: 'Local file management',
          status: 'online',
          uptime: '100%',
          responseTime: 56,
          lastCheck: '30 giây trước'
        },
        {
          id: 'database',
          name: 'Local Database',
          description: 'Data persistence layer',
          status: 'warning',
          uptime: '95.2%',
          responseTime: 423,
          lastCheck: '5 phút trước'
        }
      ],
      usageStats: [
        {
          id: 'storage',
          icon: '💾',
          title: 'Dung lượng lưu trữ',
          used: '45.2 GB',
          total: '100 GB',
          remaining: '54.8 GB',
          percentage: 45,
          estimatedEnd: '3 tháng'
        },
        {
          id: 'api-calls',
          icon: '🔌',
          title: 'API Calls (tháng này)',
          used: '2,340',
          total: '10,000',
          remaining: '7,660',
          percentage: 23,
          estimatedEnd: '25 ngày'
        },
        {
          id: 'bandwidth',
          icon: '🌐',
          title: 'Băng thông',
          used: '12.5 GB',
          total: '50 GB',
          remaining: '37.5 GB',
          percentage: 25,
          estimatedEnd: '20 ngày'
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
    },
    onlineServices() {
      return this.systemServices.filter(service => service.status === 'online').length
    }
  },
  methods: {
    handleQuickAction(actionId) {
      switch(actionId) {
        case 'new-task':
          this.$emit('navigate', 'TaskManagerClassic')
          break
        case 'tts-convert':
          this.$emit('navigate', 'TTSSubtitleNew')
          break
        case 'translate':
          this.$emit('navigate', 'SubtitleTranslatorClassic')
          break
        case 'generate-prompt':
          this.$emit('navigate', 'PromptImageClassic')
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
    getBarLabel(index) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      return days[index] || `Ngày ${index + 1}`
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Welcome Section */
.welcome-section {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.welcome-subtitle {
  font-size: 16px;
  margin: 0;
  color: #666666;
}

.welcome-stats {
  display: flex;
  gap: 20px;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.stat-icon {
  font-size: 24px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.stat-label {
  font-size: 12px;
  color: #666666;
  margin: 0;
}

/* Section Card */
.section-card {
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.section-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a1a1a;
}

.section-icon {
  font-size: 18px;
}

.section-content {
  padding: 20px;
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.quick-action-btn:hover {
  border-color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #1a1a1a;
}

.action-description {
  font-size: 12px;
  color: #666666;
}

/* Statistics Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-icon {
  font-size: 20px;
}

.stat-trend.up {
  color: #10b981;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.down {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.stat-description {
  font-size: 12px;
  color: #666666;
  margin-bottom: 8px;
}

.stat-extra {
  font-size: 11px;
  color: #666666;
  display: flex;
  justify-content: space-between;
}

.extra-label {
  color: #999999;
}

.extra-value {
  font-weight: 500;
  color: #1a1a1a;
}

/* Activities */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: #e1e5e9;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1a1a1a;
  font-size: 14px;
}

.activity-description {
  font-size: 12px;
  color: #666666;
  margin-bottom: 6px;
}

.activity-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #999999;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
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
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e1e5e9;
}

.chart-info {
  margin-bottom: 20px;
}

.chart-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 120px;
  justify-content: center;
}

.chart-bar {
  width: 32px;
  background: #1a1a1a;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 10px;
  font-weight: 600;
  color: #1a1a1a;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  font-size: 10px;
  color: #666666;
}

/* System Status */
.system-summary {
  font-size: 12px;
  color: #666666;
}

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
  align-items: flex-start;
  margin-bottom: 12px;
}

.service-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.service-description {
  font-size: 11px;
  color: #666666;
  margin-top: 2px;
}

.service-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
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
  width: 6px;
  height: 6px;
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
  font-size: 11px;
}

.metric-label {
  color: #666666;
}

.metric-value {
  font-weight: 500;
  color: #1a1a1a;
}

/* Usage Statistics */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.usage-card {
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
}

.usage-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.usage-icon {
  font-size: 20px;
}

.usage-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.usage-progress {
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #1a1a1a;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666666;
  text-align: center;
}

.usage-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666666;
}

.detail-item span:last-child {
  font-weight: 500;
  color: #1a1a1a;
}

/* Controls */
.period-select {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 12px;
  background: #ffffff;
  color: #1a1a1a;
}

.chart-controls {
  display: flex;
  gap: 4px;
}

.chart-type-btn {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666666;
}

.chart-type-btn.active {
  background: #1a1a1a;
  color: #ffffff;
  border-color: #1a1a1a;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666666;
}

.refresh-btn:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
}

.refresh-icon {
  font-size: 12px;
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

  .usage-grid {
    grid-template-columns: 1fr;
  }

  .chart-summary {
    justify-content: space-around;
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

  .chart-summary {
    flex-direction: column;
    gap: 8px;
  }
}
</style>