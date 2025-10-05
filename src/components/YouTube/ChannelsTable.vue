<template>
  <div class="table-container">
    <div class="table-header">
      <h4>Chi Tiết Kênh</h4>
      <div class="table-controls">
        <select v-model="sortBy" class="sort-select" @change="$emit('sort-change', { sortBy, sortOrder })">
          <option value="name">Tên kênh</option>
          <option value="subscribers">Subscribers</option>
          <option value="totalViews">Tổng views</option>
          <option value="videoCount">Số video</option>
          <option value="avgViews">Views trung bình</option>
        </select>
        <button @click="toggleSortOrder" class="sort-btn">
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>
    
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Kênh</th>
            <th>Subscribers</th>
            <th>Số Video</th>
            <th>Tổng Views</th>
            <th>Views TB/Video</th>
            <th>Video Mới Nhất</th>
            <th>Trạng Thái</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="channel in channels" :key="channel.id">
            <td class="channel-cell">
              <div class="channel-info">
                <div class="channel-avatar" :style="{ background: channel.gradient }">
                  📺
                </div>
                <div class="channel-details">
                  <div class="channel-name">{{ channel.name }}</div>
                  <div class="channel-id">{{ channel.channelId || 'Chưa có ID' }}</div>
                </div>
              </div>
            </td>
            <td class="subscribers-cell">{{ channel.subscribers }}</td>
            <td class="video-count-cell">{{ getChannelVideoCount(channel.id) }}</td>
            <td class="views-cell">{{ formatViews(getChannelTotalViews(channel.id)) }}</td>
            <td class="avg-views-cell">{{ formatViews(getChannelAverageViews(channel.id)) }}</td>
            <td class="latest-video-cell">{{ getLatestVideoDate(channel.id) }}</td>
            <td class="status-cell">
              <span :class="['status-badge', getChannelStatusClass(channel.id)]">
                {{ getChannelStatus(channel.id) }}
              </span>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="$emit('import-videos', channel)" class="action-btn import" title="Import videos">
                  📥
                </button>
                <button @click="$emit('view-analytics', channel.id)" class="action-btn analytics" title="Xem thống kê">
                  📊
                </button>
                <button @click="$emit('delete-channel', channel.id)" class="action-btn delete" title="Xóa kênh">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelsTable',
  props: {
    channels: {
      type: Array,
      default: () => []
    },
    videos: {
      type: Array,
      default: () => []
    },
    initialSortBy: {
      type: String,
      default: 'name'
    },
    initialSortOrder: {
      type: String,
      default: 'asc'
    }
  },
  emits: ['sort-change', 'import-videos', 'view-analytics', 'delete-channel'],
  data() {
    return {
      sortBy: this.initialSortBy,
      sortOrder: this.initialSortOrder
    }
  },
  methods: {
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.$emit('sort-change', { sortBy: this.sortBy, sortOrder: this.sortOrder })
    },
    
    formatViews(views) {
      if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M'
      } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K'
      }
      return views.toString()
    },
    
    getChannelVideoCount(channelId) {
      return this.videos.filter(v => v.channelId === channelId).length
    },
    
    getChannelTotalViews(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      return channelVideos.reduce((sum, video) => sum + video.views, 0)
    },

    getChannelAverageViews(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      if (channelVideos.length === 0) return 0
      return Math.round(this.getChannelTotalViews(channelId) / channelVideos.length)
    },

    getLatestVideoDate(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      if (channelVideos.length === 0) return 'Chưa có video'
      
      const latest = channelVideos.reduce((latest, video) => 
        new Date(video.createdAt) > new Date(latest.createdAt) ? video : latest
      )
      
      return this.getTimeAgo(latest.createdAt)
    },

    getChannelStatus(channelId) {
      const videoCount = this.getChannelVideoCount(channelId)
      const avgViews = this.getChannelAverageViews(channelId)
      
      if (videoCount === 0) return 'Chưa có video'
      if (avgViews > 10000) return 'Hiệu suất cao'
      if (avgViews > 5000) return 'Hiệu suất tốt'
      if (avgViews > 1000) return 'Hiệu suất trung bình'
      return 'Cần cải thiện'
    },

    getChannelStatusClass(channelId) {
      const status = this.getChannelStatus(channelId)
      if (status === 'Hiệu suất cao') return 'status-excellent'
      if (status === 'Hiệu suất tốt') return 'status-good'
      if (status === 'Hiệu suất trung bình') return 'status-average'
      if (status === 'Cần cải thiện') return 'status-poor'
      return 'status-none'
    },

    getTimeAgo(date) {
      const now = new Date()
      const diffTime = Math.abs(now - new Date(date))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Hôm qua'
      if (diffDays < 7) return `${diffDays} ngày trước`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
      return `${Math.floor(diffDays / 30)} tháng trước`
    }
  }
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-header h4 {
  margin: 0;
  color: #374151;
}

.table-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.sort-btn {
  padding: 8px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  background: #e5e7eb;
}

.data-table {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  position: sticky;
  top: 0;
}

.data-table td {
  color: #6b7280;
}

.channel-cell {
  min-width: 200px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.channel-details {
  flex: 1;
}

.channel-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
}

.channel-id {
  font-size: 0.8rem;
  color: #9ca3af;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-excellent {
  background: #dcfce7;
  color: #16a34a;
}

.status-good {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-average {
  background: #fef3c7;
  color: #d97706;
}

.status-poor {
  background: #fee2e2;
  color: #dc2626;
}

.status-none {
  background: #f3f4f6;
  color: #6b7280;
}

.actions-cell {
  min-width: 120px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.action-btn.import {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.import:hover {
  background: #bfdbfe;
}

.action-btn.analytics {
  background: #f3e8ff;
  color: #7c3aed;
}

.action-btn.analytics:hover {
  background: #e9d5ff;
}

.action-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fecaca;
}
</style>