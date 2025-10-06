<template>
  <div class="analytics-grid">
    <!-- Performance Summary -->
    <div class="analytics-section">
      <h4>📊 Tổng quan hiệu suất</h4>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-icon">👀</div>
          <div class="summary-info">
            <div class="summary-value">{{ formatViews(totalViews) }}</div>
            <div class="summary-label">Tổng lượt xem</div>
            <div class="summary-change" :class="totalViewsGrowth >= 0 ? 'positive' : 'negative'">
              {{ totalViewsGrowth >= 0 ? '+' : '' }}{{ totalViewsGrowth }}%
            </div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">📈</div>
          <div class="summary-info">
            <div class="summary-value">{{ channelPerformanceScore }}/10</div>
            <div class="summary-label">Điểm hiệu suất kênh</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">📅</div>
          <div class="summary-info">
            <div class="summary-value">{{ uploadFrequencyScore }}/10</div>
            <div class="summary-label">Tần suất đăng video</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">⭐</div>
          <div class="summary-info">
            <div class="summary-value">{{ contentQualityScore }}/10</div>
            <div class="summary-label">Chất lượng nội dung</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Alerts -->
    <div v-if="performanceAlerts.length > 0" class="analytics-section">
      <h4>⚠️ Cảnh báo hiệu suất</h4>
      <div class="alerts-list">
        <div 
          v-for="alert in performanceAlerts" 
          :key="alert.id"
          :class="['alert-card', `alert-${alert.type}`]"
          @click="$emit('view-alert', alert)"
        >
          <div class="alert-icon">{{ alert.icon }}</div>
          <div class="alert-content">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-description">{{ alert.description }}</div>
          </div>
          <div class="alert-action">▶</div>
        </div>
      </div>
    </div>

    <!-- Top Performing Video -->
    <div v-if="topPerformingVideo" class="analytics-section">
      <h4>🏆 Video hiệu suất cao nhất</h4>
      <div class="top-video-card">
        <div class="video-thumbnail">
          <img v-if="topPerformingVideo.thumbnail" :src="topPerformingVideo.thumbnail" :alt="topPerformingVideo.title" />
          <div v-else class="placeholder-thumbnail">
            {{ topPerformingVideo.isShort ? '📱' : '🎥' }}
          </div>
        </div>
        <div class="video-info">
          <h5 class="video-title">{{ topPerformingVideo.title }}</h5>
          <div class="video-stats">
            <span class="stat-item">👀 {{ formatViews(topPerformingVideo.views) }}</span>
            <span class="stat-item">📈 {{ topPerformingVideo.viewGrowth >= 0 ? '+' : '' }}{{ topPerformingVideo.viewGrowth }}%</span>
            <span class="stat-item">{{ topPerformingVideo.isShort ? '📱 Shorts' : '🎥 Video' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div v-if="recentActivities.length > 0" class="analytics-section">
      <h4>📋 Hoạt động gần đây</h4>
      <div class="activities-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <div class="activity-text">{{ activity.text }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Channel Comparison -->
    <div v-if="channelComparison.length > 0" class="analytics-section">
      <h4>📊 So sánh kênh</h4>
      <div class="comparison-table">
        <div class="comparison-header">
          <div class="comparison-cell">Kênh</div>
          <div class="comparison-cell">Videos</div>
          <div class="comparison-cell">Views</div>
          <div class="comparison-cell">TB Views</div>
          <div class="comparison-cell">Tăng trưởng</div>
          <div class="comparison-cell">Điểm</div>
        </div>
        <div v-for="channel in channelComparison" :key="channel.id" class="comparison-row">
          <div class="comparison-cell channel-name">{{ channel.name }}</div>
          <div class="comparison-cell">{{ channel.videoCount }}</div>
          <div class="comparison-cell">{{ formatViews(channel.totalViews) }}</div>
          <div class="comparison-cell">{{ formatViews(channel.avgViews) }}</div>
          <div class="comparison-cell" :class="channel.growth >= 0 ? 'positive' : 'negative'">
            {{ channel.growth >= 0 ? '+' : '' }}{{ channel.growth }}%
          </div>
          <div class="comparison-cell">{{ channel.score }}/100</div>
        </div>
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
    totalViews: {
      type: Number,
      required: true
    },
    totalViewsGrowth: {
      type: Number,
      required: true
    },
    channelPerformanceScore: {
      type: Number,
      required: true
    },
    uploadFrequencyScore: {
      type: Number,
      required: true
    },
    contentQualityScore: {
      type: Number,
      required: true
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
    }
  }
}
</script>

<style scoped>
.analytics-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.analytics-section {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
}

.analytics-section h4 {
  margin: 0 0 16px 0;
  color: #000000;
  font-weight: 700;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: #f8f9fa;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
}

.summary-card:hover {
  border-color: #cccccc;
  transform: translateY(-1px);
}

.summary-icon {
  font-size: 1.8rem;
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 0.9rem;
  color: #666666;
  margin-bottom: 4px;
}

.summary-change {
  font-size: 0.8rem;
  font-weight: 600;
}

.summary-change.positive {
  color: #28a745;
}

.summary-change.negative {
  color: #dc3545;
}

/* Alerts */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alert-card:hover {
  transform: translateX(4px);
}

.alert-warning {
  background: #fff3cd;
  border: 2px solid #ffeaa7;
}

.alert-danger {
  background: #f8d7da;
  border: 2px solid #f5c6cb;
}

.alert-info {
  background: #d1ecf1;
  border: 2px solid #bee5eb;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
}

.alert-description {
  font-size: 0.9rem;
  color: #666666;
  line-height: 1.4;
}

.alert-action {
  color: #666666;
  font-size: 1.2rem;
}

/* Top Video */
.top-video-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
}

.video-thumbnail {
  width: 120px;
  height: 90px;
  flex-shrink: 0;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  background: #e5e5e5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.video-info {
  flex: 1;
}

.video-title {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000;
  line-height: 1.4;
}

.video-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
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
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.activity-icon {
  font-size: 1.2rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #000000;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.8rem;
  color: #666666;
}

/* Comparison Table */
.comparison-table {
  display: flex;
  flex-direction: column;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 2px solid #e5e5e5;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #e5e5e5;
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-cell {
  padding: 12px 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.comparison-header .comparison-cell {
  font-weight: 600;
  color: #000000;
}

.channel-name {
  font-weight: 600;
  color: #000000;
}

.positive {
  color: #28a745;
  font-weight: 600;
}

.negative {
  color: #dc3545;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .top-video-card {
    flex-direction: column;
  }
  
  .video-thumbnail {
    width: 100%;
    height: 200px;
  }
  
  .comparison-header,
  .comparison-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .comparison-cell {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .comparison-header .comparison-cell {
    background: #f8f9fa;
    font-weight: 600;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .video-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>