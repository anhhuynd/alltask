<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">📺</div>
      <div class="stat-info">
        <div class="stat-value">{{ totalChannels }}</div>
        <div class="stat-label">Tổng kênh</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🎥</div>
      <div class="stat-info">
        <div class="stat-value">{{ totalVideos }}</div>
        <div class="stat-label">Tổng video</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">👀</div>
      <div class="stat-info">
        <div class="stat-value">{{ formatViews(totalViews) }}</div>
        <div class="stat-label">Tổng lượt xem</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📱</div>
      <div class="stat-info">
        <div class="stat-value">{{ shortsCount }}</div>
        <div class="stat-label">YouTube Shorts</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⚠️</div>
      <div class="stat-info">
        <div class="stat-value">{{ alertsCount }}</div>
        <div class="stat-label">Cảnh báo</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-info">
        <div class="stat-value">{{ averageGrowthRate }}%</div>
        <div class="stat-label">Tăng trưởng TB</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelPerformanceGrid',
  props: {
    totalChannels: {
      type: Number,
      required: true
    },
    totalVideos: {
      type: Number,
      required: true
    },
    totalViews: {
      type: Number,
      required: true
    },
    shortsCount: {
      type: Number,
      required: true
    },
    alertsCount: {
      type: Number,
      required: true
    },
    averageGrowthRate: {
      type: Number,
      required: true
    }
  },
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
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #cccccc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666666;
}
</style>