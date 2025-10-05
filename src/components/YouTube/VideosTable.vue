<template>
  <div>
    <!-- Video Filters -->
    <div class="video-filters">
      <input 
        v-model="searchQuery" 
        placeholder="🔍 Tìm kiếm video..."
        class="search-input"
        @input="$emit('search-change', searchQuery)"
      >
      <select v-model="filterChannel" class="filter-select" @change="$emit('filter-change', { channel: filterChannel, type: filterVideoType, performance: filterPerformance })">
        <option value="">Tất cả kênh</option>
        <option v-for="channel in channels" :key="channel.id" :value="channel.id.toString()">
          {{ channel.name }}
        </option>
      </select>
      <select v-model="filterVideoType" class="filter-select" @change="$emit('filter-change', { channel: filterChannel, type: filterVideoType, performance: filterPerformance })">
        <option value="">Tất cả loại</option>
        <option value="video">Video dài</option>
        <option value="short">YouTube Shorts</option>
      </select>
      <select v-model="filterPerformance" class="filter-select" @change="$emit('filter-change', { channel: filterChannel, type: filterVideoType, performance: filterPerformance })">
        <option value="">Tất cả hiệu suất</option>
        <option value="good">Hiệu suất tốt</option>
        <option value="low">Hiệu suất thấp</option>
      </select>
    </div>

    <!-- Videos Table -->
    <div class="table-container">
      <div class="table-header">
        <h4>Danh Sách Video ({{ videos.length }})</h4>
        <div class="table-controls">
          <select v-model="sortBy" class="sort-select" @change="$emit('sort-change', { sortBy, sortOrder })">
            <option value="createdAt">Ngày tạo</option>
            <option value="views">Views</option>
            <option value="viewGrowth">Tăng trưởng</option>
            <option value="title">Tên video</option>
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
              <th>Video</th>
              <th>Kênh</th>
              <th>Loại</th>
              <th>Views Hiện Tại</th>
              <th>Views Trước</th>
              <th>Tăng Trưởng</th>
              <th>Thời Lượng</th>
              <th>Ngày Tạo</th>
              <th>Hiệu Suất</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="video in videos" :key="video.id"
                :class="{ 'low-performance-row': isLowPerformance(video) }">
              <td class="video-cell">
                <div class="video-info">
                  <div class="video-thumbnail">
                    <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="thumbnail-img">
                    <div v-else class="thumbnail-placeholder">🎥</div>
                    <div v-if="video.isShort" class="short-indicator">Shorts</div>
                  </div>
                  <div class="video-details">
                    <div class="video-title">{{ video.title }}</div>
                    <div class="video-link">
                      <a :href="video.link" target="_blank" class="link-text">
                        {{ video.link.substring(0, 50) }}...
                      </a>
                    </div>
                  </div>
                </div>
              </td>
              <td class="channel-name-cell">{{ getChannelName(video.channelId) }}</td>
              <td class="type-cell">
                <span :class="['type-badge', video.isShort ? 'short' : 'video']">
                  {{ video.isShort ? 'Shorts' : 'Video' }}
                </span>
              </td>
              <td class="views-cell">{{ formatViews(video.views) }}</td>
              <td class="prev-views-cell">{{ getPreviousViews(video) }}</td>
              <td class="growth-cell">
                <span :class="['growth-badge', getGrowthClass(video.viewGrowth)]">
                  {{ video.viewGrowth > 0 ? '+' : '' }}{{ video.viewGrowth }}%
                </span>
              </td>
              <td class="duration-cell">{{ video.duration }}</td>
              <td class="date-cell">{{ formatDate(video.createdAt) }}</td>
              <td class="performance-cell">
                <span :class="['performance-badge', getPerformanceClass(video)]">
                  {{ getPerformanceText(video) }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button @click="$emit('update-views', video)" class="action-btn update" title="Cập nhật views">
                    🔄
                  </button>
                  <button @click="$emit('view-analytics', video)" class="action-btn analytics" title="Xem chi tiết">
                    📊
                  </button>
                  <button @click="$emit('delete-video', video.id)" class="action-btn delete" title="Xóa video">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="$emit('page-change', Math.max(1, currentPage - 1))" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ← Trước
        </button>
        <span class="pagination-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          @click="$emit('page-change', Math.min(totalPages, currentPage + 1))" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Sau →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideosTable',
  props: {
    videos: {
      type: Array,
      default: () => []
    },
    channels: {
      type: Array,
      default: () => []
    },
    currentPage: {
      type: Number,
      default: 1
    },
    totalPages: {
      type: Number,
      default: 1
    },
    initialSortBy: {
      type: String,
      default: 'createdAt'
    },
    initialSortOrder: {
      type: String,
      default: 'desc'
    }
  },
  emits: ['search-change', 'filter-change', 'sort-change', 'page-change', 'update-views', 'view-analytics', 'delete-video'],
  data() {
    return {
      searchQuery: '',
      filterChannel: '',
      filterVideoType: '',
      filterPerformance: '',
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
    
    formatDate(date) {
      if (!date) return 'Không rõ'
      return new Date(date).toLocaleDateString('vi-VN')
    },
    
    getChannelName(channelId) {
      const channel = this.channels.find(c => c.id === channelId)
      return channel ? channel.name : 'Unknown Channel'
    },
    
    getPreviousViews(video) {
      if (!video.viewHistory || video.viewHistory.length < 2) {
        return this.formatViews(0)
      }
      const previousViews = video.viewHistory[video.viewHistory.length - 2].views
      return this.formatViews(previousViews)
    },

    isLowPerformance(video) {
      const daysSinceCreated = Math.floor((new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24))
      
      if (video.isShort) {
        return daysSinceCreated >= 7 && video.views < 1000
      } else {
        return daysSinceCreated >= 30 && video.views < 5000
      }
    },

    getGrowthClass(growth) {
      if (growth > 0) return 'positive'
      if (growth < 0) return 'negative'
      return 'neutral'
    },

    getPerformanceClass(video) {
      if (this.isLowPerformance(video)) return 'poor'
      if (video.viewGrowth > 10) return 'excellent'
      if (video.viewGrowth > 0) return 'good'
      return 'average'
    },

    getPerformanceText(video) {
      if (this.isLowPerformance(video)) return 'Thấp'
      if (video.viewGrowth > 10) return 'Xuất sắc'
      if (video.viewGrowth > 0) return 'Tốt'
      return 'Trung bình'
    }
  }
}
</script>

<style scoped>
.video-filters {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  min-width: 200px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 150px;
  font-size: 0.9rem;
}

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

.low-performance-row {
  background: #fffbeb;
}

.video-cell {
  min-width: 300px;
}

.video-info {
  display: flex;
  gap: 12px;
}

.video-thumbnail {
  position: relative;
  width: 80px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  color: #9ca3af;
  font-size: 1.2rem;
}

.short-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.6rem;
  font-weight: 600;
}

.video-details {
  flex: 1;
  min-width: 0;
}

.video-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.video-link {
  margin-top: 4px;
}

.link-text {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.8rem;
}

.link-text:hover {
  color: #4f46e5;
  text-decoration: underline;
}

.type-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-badge.short {
  background: #fee2e2;
  color: #dc2626;
}

.type-badge.video {
  background: #dbeafe;
  color: #1d4ed8;
}

.growth-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.growth-badge.positive {
  background: #dcfce7;
  color: #16a34a;
}

.growth-badge.negative {
  background: #fee2e2;
  color: #dc2626;
}

.growth-badge.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

.performance-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.performance-badge.excellent {
  background: #dcfce7;
  color: #16a34a;
}

.performance-badge.good {
  background: #dbeafe;
  color: #1d4ed8;
}

.performance-badge.average {
  background: #fef3c7;
  color: #d97706;
}

.performance-badge.poor {
  background: #fee2e2;
  color: #dc2626;
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

.action-btn.update {
  background: #dcfce7;
  color: #16a34a;
}

.action-btn.update:hover {
  background: #bbf7d0;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}
</style>