<template>
  <div class="videos-table-container">
    <div class="table-header">
      <h4>🎥 Danh sách video</h4>
      <div class="table-actions">
        <input 
          v-model="localSearchQuery" 
          @input="$emit('search-change', localSearchQuery)"
          placeholder="🔍 Tìm kiếm video..."
          class="search-input"
        >
        <select v-model="localFilterChannel" @change="updateFilters" class="filter-select">
          <option value="">Tất cả kênh</option>
          <option v-for="channel in channels" :key="channel.id" :value="channel.id">
            {{ channel.name }}
          </option>
        </select>
        <select v-model="localFilterType" @change="updateFilters" class="filter-select">
          <option value="">Tất cả loại</option>
          <option value="video">Video dài</option>
          <option value="short">Shorts</option>
        </select>
        <select v-model="localFilterPerformance" @change="updateFilters" class="filter-select">
          <option value="">Tất cả hiệu suất</option>
          <option value="good">Hiệu suất tốt</option>
          <option value="low">Hiệu suất thấp</option>
        </select>
      </div>
    </div>
    
    <div class="table-wrapper">
      <table class="videos-table">
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th @click="setSortBy('title')" class="sortable">
              Tiêu đề {{ sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th>Kênh</th>
            <th @click="setSortBy('views')" class="sortable">
              Views {{ sortBy === 'views' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th @click="setSortBy('viewGrowth')" class="sortable">
              Tăng trưởng {{ sortBy === 'viewGrowth' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th>Loại</th>
            <th>Thời lượng</th>
            <th @click="setSortBy('createdAt')" class="sortable">
              Ngày tạo {{ sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="video in paginatedVideos" :key="video.id">
            <td class="thumbnail-cell">
              <div class="video-thumbnail">
                <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" />
                <div v-else class="placeholder-thumbnail">
                  {{ video.isShort ? '📱' : '🎥' }}
                </div>
                <div v-if="video.isShort" class="shorts-badge">Shorts</div>
              </div>
            </td>
            <td class="title-cell">
              <a :href="video.link" target="_blank" class="video-title">{{ video.title }}</a>
              <div v-if="isLowPerformance(video)" class="low-performance-badge">
                ⚠️ Hiệu suất thấp
              </div>
            </td>
            <td class="channel-cell">{{ getChannelName(video.channelId) }}</td>
            <td class="views-cell">{{ formatViews(video.views) }}</td>
            <td :class="['growth-cell', video.viewGrowth >= 0 ? 'positive' : 'negative']">
              {{ video.viewGrowth >= 0 ? '+' : '' }}{{ video.viewGrowth.toFixed(1) }}%
            </td>
            <td class="type-cell">
              <span :class="['type-badge', video.isShort ? 'shorts' : 'video']">
                {{ video.isShort ? 'Shorts' : 'Video' }}
              </span>
            </td>
            <td class="duration-cell">{{ video.duration }}</td>
            <td class="date-cell">{{ formatDate(video.createdAt) }}</td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="$emit('update-views', video)" class="btn btn-sm btn-outline">
                  🔄
                </button>
                <button @click="$emit('view-analytics', video)" class="btn btn-sm btn-outline">
                  📊
                </button>
                <button @click="$emit('delete-video', video.id)" class="btn btn-sm btn-danger">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination Controls -->
    <div class="pagination-container">
      <div class="pagination-info">
        <span>Hiển thị {{ startIndex + 1 }}-{{ endIndex }} của {{ totalVideos }} video</span>
        <select v-model="localPerPage" @change="updatePerPage" class="per-page-select">
          <option value="20">20/trang</option>
          <option value="50">50/trang</option>
          <option value="100">100/trang</option>
        </select>
      </div>
      
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ⏮️
        </button>
        <button 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          ◀️
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :class="['page-btn', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          ▶️
        </button>
        <button 
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          ⏭️
        </button>
      </div>
    </div>
    
    <div v-if="paginatedVideos.length === 0" class="no-data">
      <p>{{ searchQuery ? 'Không tìm thấy video nào.' : 'Chưa có video nào.' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideosTable',
  props: {
    videos: {
      type: Array,
      required: true
    },
    channels: {
      type: Array,
      required: true
    },
    searchQuery: {
      type: String,
      default: ''
    },
    filterChannel: {
      type: String,
      default: ''
    },
    filterVideoType: {
      type: String,
      default: ''
    },
    filterPerformance: {
      type: String,
      default: ''
    },
    currentPage: {
      type: Number,
      default: 1
    },
    perPage: {
      type: Number,
      default: 20
    }
  },
  emits: ['search-change', 'filter-change', 'sort-change', 'page-change', 'per-page-change', 'update-views', 'view-analytics', 'delete-video'],
  data() {
    return {
      localSearchQuery: this.searchQuery,
      localFilterChannel: this.filterChannel,
      localFilterType: this.filterVideoType,
      localFilterPerformance: this.filterPerformance,
      localPerPage: this.perPage,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  },
  computed: {
    filteredVideos() {
      let filtered = this.videos
      
      if (this.localSearchQuery) {
        filtered = filtered.filter(video =>
          video.title.toLowerCase().includes(this.localSearchQuery.toLowerCase())
        )
      }
      
      if (this.localFilterChannel) {
        filtered = filtered.filter(video =>
          video.channelId.toString() === this.localFilterChannel
        )
      }
      
      if (this.localFilterType) {
        if (this.localFilterType === 'short') {
          filtered = filtered.filter(video => video.isShort)
        } else if (this.localFilterType === 'video') {
          filtered = filtered.filter(video => !video.isShort)
        }
      }
      
      if (this.localFilterPerformance) {
        if (this.localFilterPerformance === 'low') {
          filtered = filtered.filter(video => this.isLowPerformance(video))
        } else if (this.localFilterPerformance === 'good') {
          filtered = filtered.filter(video => !this.isLowPerformance(video))
        }
      }
      
      return filtered
    },
    
    sortedVideos() {
      return [...this.filteredVideos].sort((a, b) => {
        let aValue = a[this.sortBy]
        let bValue = b[this.sortBy]
        
        if (this.sortBy === 'createdAt') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (this.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    },
    
    totalVideos() {
      return this.sortedVideos.length
    },
    
    totalPages() {
      return Math.ceil(this.totalVideos / this.localPerPage)
    },
    
    startIndex() {
      return (this.currentPage - 1) * this.localPerPage
    },
    
    endIndex() {
      return Math.min(this.startIndex + this.localPerPage, this.totalVideos)
    },
    
    paginatedVideos() {
      return this.sortedVideos.slice(this.startIndex, this.endIndex)
    },
    
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    }
  },
  methods: {
    setSortBy(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = field
        this.sortOrder = 'desc'
      }
      this.$emit('sort-change', { sortBy: this.sortBy, sortOrder: this.sortOrder })
    },
    
    updateFilters() {
      this.$emit('filter-change', {
        channel: this.localFilterChannel,
        type: this.localFilterType,
        performance: this.localFilterPerformance
      })
    },
    
    updatePerPage() {
      this.$emit('per-page-change', parseInt(this.localPerPage))
    },
    
    goToPage(page) {
      this.$emit('page-change', page)
    },
    
    getChannelName(channelId) {
      const channel = this.channels.find(c => c.id === channelId)
      return channel ? channel.name : 'Unknown Channel'
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
    
    isLowPerformance(video) {
      const daysSinceCreated = Math.floor((new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24))
      
      if (video.isShort) {
        return daysSinceCreated >= 7 && video.views < 1000
      } else {
        return daysSinceCreated >= 30 && video.views < 5000
      }
    }
  }
}
</script>

<style scoped>
.videos-table-container {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 2px solid #e5e5e5;
  background: #f8f9fa;
  flex-wrap: wrap;
  gap: 16px;
}

.table-header h4 {
  margin: 0;
  color: #000000;
  font-weight: 700;
}

.table-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input, .filter-select, .per-page-select {
  padding: 8px 12px;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #ffffff;
  color: #000000;
}

.search-input {
  min-width: 200px;
}

.search-input:focus, .filter-select:focus, .per-page-select:focus {
  outline: none;
  border-color: #000000;
}

.table-wrapper {
  overflow-x: auto;
}

.videos-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.videos-table th,
.videos-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e5e5;
}

.videos-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
}

.videos-table th.sortable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.videos-table th.sortable:hover {
  background: #e9ecef;
}

.thumbnail-cell {
  width: 120px;
}

.video-thumbnail {
  position: relative;
  width: 80px;
  height: 60px;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.shorts-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  background: #ff0000;
  color: #ffffff;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 0.6rem;
  font-weight: 600;
}

.title-cell {
  max-width: 300px;
}

.video-title {
  color: #000000;
  text-decoration: none;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
  line-height: 1.4;
}

.video-title:hover {
  text-decoration: underline;
}

.low-performance-badge {
  background: #fff3cd;
  color: #856404;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-block;
}

.channel-cell {
  color: #666666;
  font-weight: 500;
}

.views-cell {
  font-weight: 600;
  color: #000000;
}

.growth-cell {
  font-weight: 600;
}

.growth-cell.positive {
  color: #28a745;
}

.growth-cell.negative {
  color: #dc3545;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.type-badge.shorts {
  background: #ffebee;
  color: #c62828;
}

.type-badge.video {
  background: #e3f2fd;
  color: #1565c0;
}

.duration-cell {
  font-family: monospace;
  color: #666666;
}

.date-cell {
  color: #666666;
  font-size: 0.9rem;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn {
  padding: 4px 6px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  font-size: 0.8rem;
}

.btn-sm {
  padding: 3px 5px;
  font-size: 0.7rem;
}

.btn-outline {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  color: #000000;
}

.btn-outline:hover {
  border-color: #cccccc;
  background: #f5f5f5;
}

.btn-danger {
  background: #dc3545;
  color: #ffffff;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.9rem;
  color: #666666;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn, .page-btn {
  padding: 6px 10px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000000;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled), .page-btn:hover {
  border-color: #cccccc;
  background: #f5f5f5;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666666;
  font-style: italic;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-actions {
    justify-content: stretch;
    flex-direction: column;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .videos-table {
    font-size: 0.8rem;
    min-width: 800px;
  }
  
  .videos-table th,
  .videos-table td {
    padding: 8px 10px;
  }
  
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>