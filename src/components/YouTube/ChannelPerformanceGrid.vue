<template>
  <div class="channel-performance-grid">
    <div class="performance-card total">
      <div class="performance-icon">🎯</div>
      <div class="performance-stats">
        <div class="performance-number">{{ totalChannels }}</div>
        <div class="performance-label">Tổng Kênh</div>
      </div>
    </div>
    <div class="performance-card views">
      <div class="performance-icon">👁️</div>
      <div class="performance-stats">
        <div class="performance-number">{{ formatViews(totalViews) }}</div>
        <div class="performance-label">Tổng Views</div>
      </div>
    </div>
    <div class="performance-card growth">
      <div class="performance-icon">📈</div>
      <div class="performance-stats">
        <div class="performance-number">{{ averageGrowthRate }}%</div>
        <div class="performance-label">Tăng trưởng TB</div>
      </div>
    </div>
    <div class="performance-card alerts">
      <div class="performance-icon">⚠️</div>
      <div class="performance-stats">
        <div class="performance-number">{{ alertsCount }}</div>
        <div class="performance-label">Cảnh báo</div>
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
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    averageGrowthRate: {
      type: Number,
      default: 0
    },
    alertsCount: {
      type: Number,
      default: 0
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
.channel-performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.performance-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.performance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.performance-card.total {
  border-left: 4px solid #4f46e5;
}

.performance-card.views {
  border-left: 4px solid #10b981;
}

.performance-card.growth {
  border-left: 4px solid #f59e0b;
}

.performance-card.alerts {
  border-left: 4px solid #ef4444;
}

.performance-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.performance-stats {
  flex: 1;
}

.performance-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 4px;
}

.performance-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}
</style>