<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal analytics-modal" @click.stop>
      <h3>📊 Chi Tiết Video: {{ selectedVideo?.title }}</h3>
      <div v-if="selectedVideo" class="video-analytics-content">
        <div class="analytics-summary">
          <div class="summary-item">
            <div class="summary-label">Views hiện tại:</div>
            <div class="summary-value">{{ formatViews(selectedVideo.views) }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tăng trưởng:</div>
            <div class="summary-value" :class="getGrowthClass(selectedVideo.viewGrowth)">
              {{ selectedVideo.viewGrowth > 0 ? '+' : '' }}{{ selectedVideo.viewGrowth }}%
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Loại:</div>
            <div class="summary-value">{{ selectedVideo.isShort ? 'YouTube Shorts' : 'Video dài' }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Thời lượng:</div>
            <div class="summary-value">{{ selectedVideo.duration }}</div>
          </div>
        </div>
        
        <div class="view-history">
          <h4>Lịch Sử Views</h4>
          <div class="history-list">
            <div v-for="(record, index) in selectedVideo.viewHistory" :key="index" class="history-item">
              <div class="history-date">{{ formatDate(record.date) }}</div>
              <div class="history-views">{{ formatViews(record.views) }}</div>
              <div v-if="index > 0" class="history-change">
                {{ getViewChange(selectedVideo.viewHistory, index) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <button @click="$emit('close')" class="modal-btn primary">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoAnalyticsModal',
  props: {
    selectedVideo: {
      type: Object,
      default: null
    }
  },
  emits: ['close'],
  methods: {
    formatViews(views) {
      if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M'
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K'
      }
      return views.toString()
    },
    
    formatDate(date) {
      if (!date) return 'Không rõ'
      return new Date(date).toLocaleDateString('vi-VN')
    },
    
    getGrowthClass(growth) {
      if (growth > 0) return 'positive'
      if (growth < 0) return 'negative'
      return 'neutral'
    },
    
    getViewChange(viewHistory, index) {
      if (index === 0) return ''
      const current = viewHistory[index].views
      const previous = viewHistory[index - 1].views
      const change = current - previous
      return `${change > 0 ? '+' : ''}${this.formatViews(change)}`
    }
  }
}
</script>