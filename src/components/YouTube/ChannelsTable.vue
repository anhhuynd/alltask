<template>
  <div class="channels-table-container">
    <div class="table-header">
      <h4>📺 Danh sách kênh</h4>
      <div class="table-actions">
        <input 
          v-model="searchQuery" 
          placeholder="🔍 Tìm kiếm kênh..."
          class="search-input"
        >
      </div>
    </div>
    
    <div class="table-wrapper">
      <table class="channels-table">
        <thead>
          <tr>
            <th @click="setSortBy('name')" class="sortable">
              Tên kênh {{ sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th>Channel ID</th>
            <th>Subscribers</th>
            <th @click="setSortBy('videoCount')" class="sortable">
              Videos {{ sortBy === 'videoCount' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th @click="setSortBy('totalViews')" class="sortable">
              Total Views {{ sortBy === 'totalViews' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="channel in sortedChannels" :key="channel.id">
            <td>
              <div class="channel-name-cell">
                <div class="channel-avatar" :style="{ background: channel.gradient }">
                  {{ channel.name.charAt(0) }}
                </div>
                <span class="channel-name">{{ channel.name }}</span>
              </div>
            </td>
            <td class="channel-id-cell">{{ channel.channelId || 'Chưa cấu hình' }}</td>
            <td class="subscribers-cell">{{ channel.subscribers }}</td>
            <td class="video-count-cell">{{ getChannelVideoCount(channel.id) }}</td>
            <td class="views-cell">{{ getChannelTotalViews(channel.id) }}</td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="$emit('import-videos', channel)" :disabled="isUpdating" class="btn btn-sm btn-outline">
                  📥
                </button>
                <button @click="$emit('view-analytics', channel.id)" class="btn btn-sm btn-outline">
                  📊
                </button>
                <button @click="$emit('delete-channel', channel.id)" class="btn btn-sm btn-danger">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="sortedChannels.length === 0" class="no-data">
      <p>{{ searchQuery ? 'Không tìm thấy kênh nào.' : 'Chưa có kênh nào.' }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelsTable',
  props: {
    channels: {
      type: Array,
      required: true
    },
    videos: {
      type: Array,
      required: true
    },
    isUpdating: {
      type: Boolean,
      default: false
    }
  },
  emits: ['import-videos', 'view-analytics', 'delete-channel'],
  data() {
    return {
      searchQuery: '',
      sortBy: 'name',
      sortOrder: 'asc'
    }
  },
  computed: {
    filteredChannels() {
      let filtered = this.channels
      
      if (this.searchQuery) {
        filtered = filtered.filter(channel =>
          channel.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          channel.channelId.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      return filtered
    },
    
    sortedChannels() {
      return [...this.filteredChannels].sort((a, b) => {
        let aValue, bValue
        
        if (this.sortBy === 'videoCount') {
          aValue = this.getChannelVideoCount(a.id)
          bValue = this.getChannelVideoCount(b.id)
        } else if (this.sortBy === 'totalViews') {
          aValue = this.getChannelTotalViewsNumber(a.id)
          bValue = this.getChannelTotalViewsNumber(b.id)
        } else {
          aValue = a[this.sortBy]
          bValue = b[this.sortBy]
        }
        
        if (this.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
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
    },
    
    getChannelVideoCount(channelId) {
      return this.videos.filter(v => v.channelId === channelId).length
    },
    
    getChannelTotalViews(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      const totalViews = channelVideos.reduce((sum, video) => sum + video.views, 0)
      return this.formatViews(totalViews)
    },
    
    getChannelTotalViewsNumber(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      return channelVideos.reduce((sum, video) => sum + video.views, 0)
    },
    
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
.channels-table-container {
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
}

.search-input {
  padding: 8px 12px;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 200px;
  background: #ffffff;
  color: #000000;
}

.search-input:focus {
  outline: none;
  border-color: #000000;
}

.table-wrapper {
  overflow-x: auto;
}

.channels-table {
  width: 100%;
  border-collapse: collapse;
}

.channels-table th,
.channels-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e5e5;
}

.channels-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
}

.channels-table th.sortable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.channels-table th.sortable:hover {
  background: #e9ecef;
}

.channel-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.channel-name {
  font-weight: 600;
  color: #000000;
}

.channel-id-cell {
  font-family: monospace;
  font-size: 0.9rem;
  color: #666666;
}

.subscribers-cell {
  font-weight: 600;
  color: #000000;
}

.video-count-cell {
  font-weight: 600;
  color: #000000;
}

.views-cell {
  font-weight: 600;
  color: #000000;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 8px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  font-size: 0.8rem;
}

.btn-sm {
  padding: 4px 6px;
  font-size: 0.8rem;
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
    gap: 12px;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .channels-table {
    font-size: 0.9rem;
  }
  
  .channels-table th,
  .channels-table td {
    padding: 8px 12px;
  }
  
  .channel-name-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>