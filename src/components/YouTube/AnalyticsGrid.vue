<template>
  <div>
    <!-- Performance Alerts -->
    <div v-if="performanceAlerts.length > 0" class="alerts-section">
      <h4>⚠️ Cảnh Báo Hiệu Suất</h4>
      <div class="alerts-list">
        <div v-for="alert in performanceAlerts" :key="alert.id" :class="['alert-item', alert.type]">
          <div class="alert-icon">{{ alert.icon }}</div>
          <div class="alert-content">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-description">{{ alert.description }}</div>
          </div>
          <div class="alert-actions">
            <button @click="$emit('view-alert', alert)" class="alert-btn">Xem chi tiết</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Analytics -->
    <div class="analytics-grid">
      <div class="analytics-card">
        <div class="analytics-header">
          <h4>📈 Tăng Trưởng Views</h4>
        </div>
        <div class="analytics-content">
          <div class="analytics-number">{{ totalViewsGrowth }}%</div>
          <div class="analytics-description">So với tuần trước</div>
          <div class="analytics-trend">
            <span :class="['trend-indicator', totalViewsGrowth > 0 ? 'positive' : 'negative']">
              {{ totalViewsGrowth > 0 ? '↗️' : '↘️' }} {{ Math.abs(totalViewsGrowth) }}%
            </span>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-header">
          <h4>🎯 Hiệu Suất Kênh</h4>
        </div>
        <div class="analytics-content">
          <div class="analytics-number">{{ channelPerformanceScore }}/10</div>
          <div class="analytics-description">Điểm hiệu suất trung bình</div>
          <div class="performance-breakdown">
            <div class="breakdown-item">
              <span>Tần suất đăng:</span>
              <span class="breakdown-score">{{ uploadFrequencyScore }}/10</span>
            </div>
            <div class="breakdown-item">
              <span>Chất lượng nội dung:</span>
              <span class="breakdown-score">{{ contentQualityScore }}/10</span>
            </div>
          </div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-header">
          <h4>🏆 Top Performer</h4>
        </div>
        <div class="analytics-content">
          <div class="top-performer" v-if="topPerformingVideo">
            <div class="performer-title">{{ topPerformingVideo.title }}</div>
            <div class="performer-stats">{{ formatViews(topPerformingVideo.views) }} views</div>
            <div class="performer-growth">+{{ topPerformingVideo.viewGrowth }}% tăng trưởng</div>
          </div>
          <div v-else class="no-data">Chưa có dữ liệu</div>
        </div>
      </div>

      <div class="analytics-card">
        <div class="analytics-header">
          <h4>📅 Hoạt Động Gần Đây</h4>
        </div>
        <div class="analytics-content">
          <div class="recent-activities">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-text">{{ activity.text }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Channel Comparison -->
    <div class="comparison-section">
      <h4>⚖️ So Sánh Kênh</h4>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Kênh</th>
              <th>Số Video</th>
              <th>Tổng Views</th>
              <th>Views TB</th>
              <th>Tăng Trưởng</th>
              <th>Điểm Hiệu Suất</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="channel in channelComparison" :key="channel.id">
              <td class="channel-name">{{ channel.name }}</td>
              <td>{{ channel.videoCount }}</td>
              <td>{{ formatViews(channel.totalViews) }}</td>
              <td>{{ formatViews(channel.avgViews) }}</td>
              <td>
                <span :class="['growth-indicator', channel.growth > 0 ? 'positive' : 'negative']">
                  {{ channel.growth > 0 ? '+' : '' }}{{ channel.growth }}%
                </span>
              </td>
              <td>
                <span :class="['score-badge', getScoreClass(channel.score)]">
                  {{ channel.score }}/10
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalyticsGrid',
  props: {
    performanceAlerts: {
      type: Array,
      default: () => []
    },
    totalViewsGrowth: {
      type: Number,
      default: 0
    },
    channelPerformanceScore: {
      type: Number,
      default: 0
    },
    uploadFrequencyScore: {
      type: Number,
      default: 0
    },
    contentQualityScore: {
      type: Number,
      default: 0
    },
    topPerformingVideo: {
      type: Object,
      default: null
    },
    recentActivities: {
      type: Array,
      default: () => []
    },
    channelComparison: {
      type: Array,
      default: () => []
    }
  },
  emits: ['view-alert'],
  methods: {
    formatViews(views) {
      if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M'
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K'
      }
      return views.toString()
    },

    getScoreClass(score) {
      if (score >= 8) return 'excellent'
      if (score >= 6) return 'good'
      if (score >= 4) return 'average'
      return 'poor'
    }
  }
}
</script>

<style scoped>
.alerts-section {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.alerts-section h4 {
  margin: 0 0 16px 0;
  color: #92400e;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid #f59e0b;
}

.alert-item.warning {
  border-left-color: #f59e0b;
}

.alert-item.info {
  border-left-color: #3b82f6;
}

.alert-item.danger {
  border-left-color: #ef4444;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.alert-description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.alert-actions {
  display: flex;
  gap: 8px;
}

.alert-btn {
  padding: 6px 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alert-btn:hover {
  background: #4338ca;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.analytics-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.analytics-header {
  background: #f9fafb;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.analytics-header h4 {
  margin: 0;
  color: #374151;
  font-size: 1rem;
}

.analytics-content {
  padding: 20px;
}

.analytics-number {
  font-size: 2rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.analytics-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.analytics-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-indicator {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.trend-indicator.positive {
  background: #dcfce7;
  color: #16a34a;
}

.trend-indicator.negative {
  background: #fee2e2;
  color: #dc2626;
}

.performance-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.breakdown-score {
  font-weight: 600;
  color: #4f46e5;
}

.top-performer {
  text-align: center;
}

.performer-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  line-height: 1.3;
}

.performer-stats {
  font-size: 1.2rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 4px;
}

.performer-growth {
  color: #6b7280;
  font-size: 0.9rem;
}

.recent-activities {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.2rem;
}

.activity-text {
  flex: 1;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.3;
}

.activity-time {
  font-size: 0.8rem;
  color: #9ca3af;
}

.no-data {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
}

.comparison-section {
  margin-top: 30px;
}

.comparison-section h4 {
  margin: 0 0 20px 0;
  color: #374151;
}

.comparison-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.comparison-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.comparison-table td {
  color: #6b7280;
}

.channel-name {
  font-weight: 600;
  color: #374151;
}

.growth-indicator {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.growth-indicator.positive {
  background: #dcfce7;
  color: #16a34a;
}

.growth-indicator.negative {
  background: #fee2e2;
  color: #dc2626;
}

.score-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.score-badge.excellent {
  background: #dcfce7;
  color: #16a34a;
}

.score-badge.good {
  background: #dbeafe;
  color: #1d4ed8;
}

.score-badge.average {
  background: #fef3c7;
  color: #d97706;
}

.score-badge.poor {
  background: #fee2e2;
  color: #dc2626;
}
</style>