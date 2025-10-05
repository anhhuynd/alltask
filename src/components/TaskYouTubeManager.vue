<template>
  <div class="desktop-app">
    <!-- Header Bar -->
    <div class="header-bar">
      <div class="header-left">
        <div class="window-controls">
          <div class="control-btn red"></div>
          <div class="control-btn yellow"></div>
          <div class="control-btn green"></div>
        </div>
        <h1 class="app-title">Task & YouTube Manager</h1>
      </div>
      <div class="header-right">
        <span class="current-date">{{ currentDate }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          :class="['tab-btn', { active: activeTab === 'tasks' }]"
          @click="activeTab = 'tasks'"
        >
          📅 Task Manager
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'youtube' }]"
          @click="activeTab = 'youtube'"
        >
          📺 YouTube Dashboard
        </button>
      </div>

      <!-- Task Manager Tab -->
      <div v-if="activeTab === 'tasks'" class="tab-content">
        <!-- Date Navigation -->
        <div class="date-navigation">
          <button 
            v-for="(label, index) in ['Hôm qua', 'Hôm nay', 'Ngày mai']"
            :key="index"
            :class="['nav-btn', { active: selectedDateIndex === index }]"
            @click="selectDateByIndex(index)"
          >
            {{ label }}
          </button>
        </div>

        <!-- Task Progress -->
        <TaskProgress
          :completed-tasks-count="completedTasksCount"
          :remaining-tasks-count="remainingTasksCount"
          :total-tasks-count="totalTasksCount"
        />

        <!-- Task Actions -->
        <div class="task-actions-bar">
          <div class="task-filters">
            <button 
              v-for="filter in taskFilters"
              :key="filter.key"
              :class="['filter-btn', { active: taskFilter === filter.key }]"
              @click="taskFilter = filter.key"
            >
              {{ filter.label }}
            </button>
          </div>
          <div class="task-search">
            <input 
              v-model="searchQuery" 
              placeholder="🔍 Tìm kiếm công việc..."
              class="search-input"
            >
            <button class="add-task-btn" @click="showAddTaskModal = true">
              ➕ Thêm Task
            </button>
          </div>
        </div>

        <!-- Tasks List -->
        <div class="tasks-section">
          <div v-if="filteredTasks.length === 0" class="no-tasks">
            <p>{{ searchQuery ? 'Không tìm thấy công việc nào.' : 'Chưa có công việc nào cho ngày này' }}</p>
          </div>
          
          <div v-else class="tasks-list">
            <TaskItem
              v-for="task in filteredTasks"
              :key="task.id"
              :task="task"
              :sub-tasks="getSubTasks(task.id)"
              :expanded-tasks="expandedTasks"
              @toggle-task="toggleTask"
              @edit-task="editTask"
              @add-subtask="addSubTask"
              @copy-task="copyIndividualTask"
              @delete-task="deleteTask"
              @toggle-expansion="toggleTaskExpansion"
            />
          </div>
        </div>
      </div>

      <!-- YouTube Dashboard Tab -->
      <div v-if="activeTab === 'youtube'" class="tab-content">
        <!-- YouTube Header -->
        <div class="youtube-header">
          <div class="youtube-title">
            <h2>📺 YouTube Analytics Dashboard</h2>
            <p>Theo dõi hiệu suất kênh YouTube với phân tích chi tiết và cảnh báo thông minh</p>
          </div>
          <div class="youtube-actions">
            <button @click="exportToCSV" class="btn btn-outline">
              📊 Export CSV
            </button>
            <button @click="updateAllViews" :disabled="isUpdating" class="btn btn-primary">
              {{ isUpdating ? "🔄 Đang cập nhật..." : "🔄 Cập nhật tất cả" }}
            </button>
          </div>
        </div>

        <!-- YouTube Tabs -->
        <div class="youtube-tabs">
          <button 
            v-for="tab in youtubeTabs"
            :key="tab.id"
            :class="['youtube-tab-btn', { active: youtubeActiveTab === tab.id }]"
            @click="youtubeActiveTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Channels Tab -->
        <div v-if="youtubeActiveTab === 'channels'" class="youtube-content">
          <div class="content-header">
            <h3>📺 Quản Lý Kênh</h3>
            <button @click="showAddChannelModal = true" class="btn btn-primary">
              ➕ Thêm Kênh
            </button>
          </div>
          
          <!-- Channel Performance Summary -->
          <ChannelPerformanceGrid
            :total-channels="channels.length"
            :total-views="totalViews"
            :average-growth-rate="averageGrowthRate"
            :alerts-count="lowPerformanceVideos.length"
          />

          <!-- Channels Table -->
          <ChannelsTable
            :channels="channels"
            :videos="videos"
            :initial-sort-by="channelSortBy"
            :initial-sort-order="channelSortOrder"
            @sort-change="handleChannelSort"
            @import-videos="importChannelVideos"
            @view-analytics="viewChannelAnalytics"
            @delete-channel="deleteChannel"
          />
        </div>

        <!-- Videos Tab -->
        <div v-if="youtubeActiveTab === 'videos'" class="youtube-content">
          <div class="content-header">
            <h3>🎥 Quản Lý Video</h3>
            <div class="content-actions">
              <button @click="showAddVideoModal = true" class="btn btn-primary">
                ➕ Thêm Video
              </button>
            </div>
          </div>

          <!-- Video Table -->
          <VideosTable
            :videos="filteredVideos"
            :channels="channels"
            :search-query="videoSearchQuery"
            :filter-channel="filterChannel"
            :filter-video-type="filterVideoType"
            :filter-performance="filterPerformance"
            :current-page="currentVideoPage"
            :total-pages="totalVideoPages"
            :initial-sort-by="videoSortBy"
            :initial-sort-order="videoSortOrder"
            @search-change="videoSearchQuery = $event"
            @filter-change="handleVideoFilters"
            @sort-change="handleVideoSort"
            @page-change="currentVideoPage = $event"
            @update-views="updateVideoViews"
            @view-analytics="viewVideoAnalytics"
            @delete-video="deleteVideo"
          />
        </div>

        <!-- Analytics Tab -->
        <div v-if="youtubeActiveTab === 'analytics'" class="youtube-content">
          <h3>📊 Thống Kê Tổng Quan</h3>
          
          <!-- Analytics Grid -->
          <AnalyticsGrid
            :performance-alerts="performanceAlerts"
            :total-views-growth="totalViewsGrowth"
            :channel-performance-score="channelPerformanceScore"
            :upload-frequency-score="uploadFrequencyScore"
            :content-quality-score="contentQualityScore"
            :top-performing-video="topPerformingVideo"
            :recent-activities="recentActivities"
            :channel-comparison="channelComparison"
            @view-alert="viewAlertDetails"
          />
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div v-if="showAddTaskModal || editingTask" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h3>{{ editingTask ? 'Sửa Công Việc' : (taskForm.parentId ? 'Thêm Subtask' : 'Thêm Công Việc Mới') }}</h3>
        <input 
          v-model="taskForm.title" 
          placeholder="Tên công việc"
          class="modal-input"
        >
        <textarea 
          v-model="taskForm.description" 
          placeholder="Mô tả"
          class="modal-input"
        ></textarea>
        <input 
          v-model="taskForm.time" 
          placeholder="Thời gian (VD: 9:00 AM)"
          class="modal-input"
        >
        <select v-model="taskForm.priority" class="modal-input" v-if="!taskForm.parentId">
          <option value="">Chọn độ ưu tiên</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
        <div class="modal-actions">
          <button @click="closeModal" class="modal-btn cancel">Hủy</button>
          <button @click="saveTask" class="modal-btn primary">
            {{ editingTask ? 'Cập nhật' : 'Thêm' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Copy Individual Task Modal -->
    <div v-if="showCopyModal" class="modal-overlay" @click="closeCopyModal">
      <div class="modal" @click.stop>
        <h3>Copy Task: "{{ taskToCopy?.title }}"</h3>
        <p v-if="getSubTasks(taskToCopy?.id).length > 0">
          Task này có {{ getSubTasks(taskToCopy?.id).length }} subtask(s) sẽ được copy cùng.
        </p>
        <p>Copy task sang:</p>
        <div class="copy-options">
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="yesterday">
            <span>Hôm qua ({{ getDateLabel(-1) }})</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="today">
            <span>Hôm nay ({{ getDateLabel(0) }})</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="tomorrow">
            <span>Ngày mai ({{ getDateLabel(1) }})</span>
          </label>
          <label class="copy-option">
            <input type="radio" v-model="copyTarget" value="custom">
            <span>Ngày khác</span>
          </label>
        </div>
        <input 
          v-if="copyTarget === 'custom'" 
          type="date" 
          v-model="customCopyDate" 
          class="modal-input"
        >
        <div class="modal-actions">
          <button @click="closeCopyModal" class="modal-btn cancel">Hủy</button>
          <button @click="copyIndividualTaskConfirm" class="modal-btn primary">Copy Task</button>
        </div>
      </div>
    </div>

    <!-- Add Channel Modal -->
    <div v-if="showAddChannelModal" class="modal-overlay" @click="closeAddChannelModal">
      <div class="modal" @click.stop>
        <h3>Thêm Kênh YouTube Mới</h3>
        <input v-model="newChannel.name" placeholder="Tên kênh" class="modal-input">
        <input v-model="newChannel.channelId" placeholder="Channel ID hoặc Handle (@username)" class="modal-input">
        <input v-model="newChannel.subscribers" placeholder="Số subscribers (VD: 10.5K)" class="modal-input">
        <div class="modal-actions">
          <button @click="closeAddChannelModal" class="modal-btn cancel">Hủy</button>
          <button @click="addChannel" class="modal-btn primary">Thêm Kênh</button>
        </div>
      </div>
    </div>

    <!-- Add Video Modal -->
    <div v-if="showAddVideoModal" class="modal-overlay" @click="closeAddVideoModal">
      <div class="modal" @click.stop>
        <h3>Thêm Video từ YouTube</h3>
        <p class="modal-note">Hỗ trợ cả video dài và YouTube Shorts</p>
        <input v-model="newVideo.link" placeholder="Link YouTube (youtube.com/watch?v=... hoặc youtube.com/shorts/... hoặc youtu.be/...)" class="modal-input">
        <select v-model="newVideo.channelId" class="modal-input">
          <option value="">Chọn kênh</option>
          <option v-for="channel in channels" :key="channel.id" :value="channel.id">
            {{ channel.name }}
          </option>
        </select>
        <div class="modal-actions">
          <button @click="closeAddVideoModal" class="modal-btn cancel">Hủy</button>
          <button @click="addVideoFromYouTube" class="modal-btn primary">Thêm Video</button>
        </div>
      </div>
    </div>

    <!-- Video Analytics Modal -->
    <div v-if="showVideoAnalyticsModal" class="modal-overlay" @click="closeVideoAnalyticsModal">
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
          <button @click="closeVideoAnalyticsModal" class="modal-btn primary">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TaskProgress from './TaskManager/TaskProgress.vue'
import TaskItem from './TaskManager/TaskItem.vue'
import ChannelPerformanceGrid from './YouTube/ChannelPerformanceGrid.vue'
import ChannelsTable from './YouTube/ChannelsTable.vue'
import VideosTable from './YouTube/VideosTable.vue'
import AnalyticsGrid from './YouTube/AnalyticsGrid.vue'

export default {
  name: 'TaskYouTubeManager',
  components: {
    TaskProgress,
    TaskItem,
    ChannelPerformanceGrid,
    ChannelsTable,
    VideosTable,
    AnalyticsGrid
  },
  data() {
    return {
      // UI State
      activeTab: 'tasks',
      youtubeActiveTab: 'channels',
      selectedDateIndex: 1,
      selectedDate: new Date(),
      taskFilter: 'all',
      searchQuery: '',
      videoSearchQuery: '',
      filterChannel: '',
      filterVideoType: '',
      filterPerformance: '',
      isUpdating: false,
      
      // Task expansion state
      expandedTasks: [],
      
      // Modals
      showAddTaskModal: false,
      showAddChannelModal: false,
      showAddVideoModal: false,
      showCopyModal: false,
      showVideoAnalyticsModal: false,
      editingTask: null,
      selectedVideo: null,
      
      // Copy functionality
      copyTarget: 'tomorrow',
      customCopyDate: '',
      taskToCopy: null,
      
      // Pagination
      currentVideoPage: 1,
      videosPerPage: 10,
      
      // Sorting
      videoSortBy: 'createdAt',
      videoSortOrder: 'desc',
      channelSortBy: 'name',
      channelSortOrder: 'asc',
      
      // Forms
      taskForm: {
        title: '',
        description: '',
        time: '',
        priority: '',
        parentId: null
      },
      
      newChannel: {
        name: '',
        channelId: '',
        subscribers: ''
      },
      
      newVideo: {
        link: '',
        channelId: ''
      },
      
      youtubeTabs: [
        { id: 'channels', label: '📺 Kênh' },
        { id: 'videos', label: '🎥 Video' },
        { id: 'analytics', label: '📊 Thống kê' }
      ],
      
      // Sample data
      tasks: [
        {
          id: 1,
          title: 'Build kênh giải đoán đầu',
          description: 'Báo cáo tiến độ công việc tuần',
          time: '17:00',
          priority: 'high',
          completed: false,
          date: new Date().toDateString(),
          parentId: null
        },
        {
          id: 2,
          title: 'kênh boxing',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 3,
          title: 'kênh history',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 4,
          title: 'Kênh sinh tồn',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 5,
          title: 'kênh cải tạo nhà',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: 1
        },
        {
          id: 6,
          title: 'Tìm nguồn video',
          description: '',
          time: '',
          priority: '',
          completed: false,
          date: new Date().toDateString(),
          parentId: null
        }
      ],
      
      channels: [
        {
          id: 1,
          name: 'Tech Channel',
          channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
          subscribers: '10.5K',
          gradient: 'linear-gradient(135deg, #2364aa 0%, #3da5d9 100%)'
        },
        {
          id: 2,
          name: 'Gaming Channel',
          channelId: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
          subscribers: '25.2K',
          gradient: 'linear-gradient(135deg, #297373 0%, #73bfb8 100%)'
        },
        {
          id: 3,
          name: 'Lifestyle Channel',
          channelId: 'UC123456789',
          subscribers: '5.8K',
          gradient: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)'
        }
      ],
      
      videos: [
        {
          id: 1,
          title: 'Vue.js Tutorial for Beginners - Complete Guide 2024',
          channelId: 1,
          views: 15420,
          viewGrowth: 12,
          duration: '15:30',
          link: 'https://youtube.com/watch?v=example1',
          thumbnail: null,
          isShort: false,
          createdAt: new Date('2024-01-15'),
          viewHistory: [
            { date: '2024-01-15', views: 13750 },
            { date: '2024-01-16', views: 15420 }
          ]
        },
        {
          id: 2,
          title: 'Quick Gaming Tips #Shorts',
          channelId: 2,
          views: 1200,
          viewGrowth: -5,
          duration: '0:45',
          link: 'https://youtube.com/shorts/example2',
          thumbnail: null,
          isShort: true,
          createdAt: new Date('2024-01-20'),
          viewHistory: [
            { date: '2024-01-20', views: 1500 },
            { date: '2024-01-21', views: 1200 }
          ]
        },
        {
          id: 3,
          title: 'Advanced JavaScript Concepts',
          channelId: 1,
          views: 8750,
          viewGrowth: 8,
          duration: '22:15',
          link: 'https://youtube.com/watch?v=example3',
          thumbnail: null,
          isShort: false,
          createdAt: new Date('2024-01-18'),
          viewHistory: [
            { date: '2024-01-18', views: 8100 },
            { date: '2024-01-19', views: 8750 }
          ]
        },
        {
          id: 4,
          title: 'Daily Lifestyle Vlog',
          channelId: 3,
          views: 2300,
          viewGrowth: 15,
          duration: '8:30',
          link: 'https://youtube.com/watch?v=example4',
          thumbnail: null,
          isShort: false,
          createdAt: new Date('2024-01-22'),
          viewHistory: [
            { date: '2024-01-22', views: 2000 },
            { date: '2024-01-23', views: 2300 }
          ]
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
    
    selectedDayTasks() {
      return this.tasks.filter(task => task.date === this.selectedDate.toDateString())
    },
    
    completedTasksCount() {
      return this.selectedDayTasks.filter(task => task.completed).length
    },
    
    remainingTasksCount() {
      return this.selectedDayTasks.filter(task => !task.completed).length
    },
    
    totalTasksCount() {
      return this.selectedDayTasks.length
    },
    
    taskFilters() {
      return [
        { key: 'all', label: `Tất cả (${this.selectedDayTasks.length})` },
        { key: 'completed', label: `Đã xong (${this.completedTasksCount})` },
        { key: 'pending', label: `Chưa xong (${this.remainingTasksCount})` }
      ]
    },
    
    filteredTasks() {
      let filtered = this.selectedDayTasks.filter(task => !task.parentId)
      
      if (this.searchQuery) {
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      if (this.taskFilter === 'completed') {
        filtered = filtered.filter(task => task.completed)
      } else if (this.taskFilter === 'pending') {
        filtered = filtered.filter(task => !task.completed)
      }
      
      return filtered
    },
    
    filteredVideos() {
      let filtered = this.videos
      
      if (this.videoSearchQuery) {
        filtered = filtered.filter(video =>
          video.title.toLowerCase().includes(this.videoSearchQuery.toLowerCase())
        )
      }
      
      if (this.filterChannel) {
        filtered = filtered.filter(video =>
          video.channelId.toString() === this.filterChannel
        )
      }
      
      if (this.filterVideoType) {
        if (this.filterVideoType === 'short') {
          filtered = filtered.filter(video => video.isShort)
        } else if (this.filterVideoType === 'video') {
          filtered = filtered.filter(video => !video.isShort)
        }
      }
      
      if (this.filterPerformance) {
        if (this.filterPerformance === 'low') {
          filtered = filtered.filter(video => this.isLowPerformance(video))
        } else if (this.filterPerformance === 'good') {
          filtered = filtered.filter(video => !this.isLowPerformance(video))
        }
      }
      
      return filtered
    },
    
    sortedVideos() {
      return [...this.filteredVideos].sort((a, b) => {
        let aValue = a[this.videoSortBy]
        let bValue = b[this.videoSortBy]
        
        if (this.videoSortBy === 'createdAt') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (this.videoSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
    },
    
    paginatedVideos() {
      const start = (this.currentVideoPage - 1) * this.videosPerPage
      const end = start + this.videosPerPage
      return this.sortedVideos.slice(start, end)
    },
    
    totalVideoPages() {
      return Math.ceil(this.sortedVideos.length / this.videosPerPage)
    },
    
    totalViews() {
      return this.videos.reduce((total, video) => total + video.views, 0)
    },
    
    lowPerformanceVideos() {
      return this.videos.filter(video => this.isLowPerformance(video))
    },

    averageGrowthRate() {
      if (this.videos.length === 0) return 0
      const totalGrowth = this.videos.reduce((sum, video) => sum + video.viewGrowth, 0)
      return Math.round(totalGrowth / this.videos.length)
    },

    totalViewsGrowth() {
      const currentViews = this.totalViews
      const previousViews = this.videos.reduce((total, video) => {
        if (video.viewHistory && video.viewHistory.length > 1) {
          return total + video.viewHistory[video.viewHistory.length - 2].views
        }
        return total + video.views
      }, 0)
      
      if (previousViews === 0) return 0
      return Math.round(((currentViews - previousViews) / previousViews) * 100)
    },

    channelPerformanceScore() {
      if (this.channels.length === 0) return 0
      const scores = this.channels.map(channel => this.calculateChannelScore(channel.id))
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      return Math.round(avgScore * 10) / 10
    },

    uploadFrequencyScore() {
      const recentVideos = this.videos.filter(video => {
        const daysSince = (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24)
        return daysSince <= 30
      })
      return Math.min(10, Math.round(recentVideos.length / 3))
    },

    contentQualityScore() {
      if (this.videos.length === 0) return 0
      const avgViews = this.totalViews / this.videos.length
      const score = Math.min(10, Math.round(avgViews / 1000))
      return Math.max(1, score)
    },

    topPerformingVideo() {
      if (this.videos.length === 0) return null
      return this.videos.reduce((top, video) => 
        video.views > top.views ? video : top
      )
    },

    recentActivities() {
      const activities = []
      
      const recentVideos = this.videos
        .filter(video => {
          const daysSince = (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24)
          return daysSince <= 7
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)
      
      recentVideos.forEach(video => {
        activities.push({
          id: `video-${video.id}`,
          icon: video.isShort ? '📱' : '🎥',
          text: `Đăng ${video.isShort ? 'Short' : 'video'}: ${video.title.substring(0, 30)}...`,
          time: this.getTimeAgo(video.createdAt)
        })
      })
      
      const lowPerformanceCount = this.lowPerformanceVideos.length
      if (lowPerformanceCount > 0) {
        activities.push({
          id: 'alert-performance',
          icon: '⚠️',
          text: `${lowPerformanceCount} video có hiệu suất thấp`,
          time: 'Hôm nay'
        })
      }
      
      return activities.slice(0, 5)
    },

    performanceAlerts() {
      const alerts = []
      
      if (this.lowPerformanceVideos.length > 0) {
        alerts.push({
          id: 'low-performance',
          type: 'warning',
          icon: '📉',
          title: `${this.lowPerformanceVideos.length} video có hiệu suất thấp`,
          description: 'Một số video của bạn có lượt xem thấp hơn kỳ vọng. Hãy xem xét tối ưu hóa tiêu đề, thumbnail hoặc nội dung.'
        })
      }
      
      const recentUploads = this.videos.filter(video => {
        const daysSince = (new Date() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24)
        return daysSince <= 7
      })
      
      if (recentUploads.length === 0) {
        alerts.push({
          id: 'no-uploads',
          type: 'info',
          icon: '📅',
          title: 'Chưa có video mới trong tuần',
          description: 'Việc đăng video thường xuyên giúp duy trì sự tương tác với khán giả.'
        })
      }
      
      if (this.totalViewsGrowth < -10) {
        alerts.push({
          id: 'growth-decline',
          type: 'danger',
          icon: '📊',
          title: 'Lượt xem giảm mạnh',
          description: `Tổng lượt xem giảm ${Math.abs(this.totalViewsGrowth)}% so với tuần trước.`
        })
      }
      
      return alerts
    },

    channelComparison() {
      return this.channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        videoCount: this.getChannelVideoCount(channel.id),
        totalViews: this.getChannelTotalViewsNumber(channel.id),
        avgViews: this.getChannelAverageViews(channel.id),
        growth: this.getChannelGrowthRate(channel.id),
        score: Math.round(this.calculateChannelScore(channel.id) * 10)
      }))
    }
  },
  
  mounted() {
    this.loadData()
    this.setupAutoUpdate()
  },
  
  methods: {
    // Task Management
    selectDateByIndex(index) {
      this.selectedDateIndex = index
      const today = new Date()
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + (index - 1))
      this.selectedDate = targetDate
    },
    
    getSubTasks(parentId) {
      return this.tasks.filter(task => task.parentId === parentId)
    },

    toggleTaskExpansion(taskId) {
      const index = this.expandedTasks.indexOf(taskId)
      if (index > -1) {
        this.expandedTasks.splice(index, 1)
      } else {
        this.expandedTasks.push(taskId)
      }
    },
    
    toggleTask(taskId) {
      const task = this.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        this.saveTasks()
      }
    },
    
    addSubTask(parentId) {
      this.taskForm = {
        title: '',
        description: '',
        time: '',
        priority: '',
        parentId: parentId
      }
      this.showAddTaskModal = true
    },
    
    editTask(task) {
      this.editingTask = task
      this.taskForm = {
        title: task.title,
        description: task.description,
        time: task.time,
        priority: task.priority,
        parentId: task.parentId
      }
    },
    
    deleteTask(taskId) {
      if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
        this.tasks = this.tasks.filter(t => t.id !== taskId && t.parentId !== taskId)
        this.saveTasks()
        this.showToast('Task đã được xóa!', 'success')
      }
    },
    
    saveTask() {
      if (!this.taskForm.title.trim()) return
      
      if (this.editingTask) {
        Object.assign(this.editingTask, this.taskForm)
        this.editingTask = null
      } else {
        const newTask = {
          id: Date.now(),
          ...this.taskForm,
          completed: false,
          date: this.selectedDate.toDateString()
        }
        this.tasks.push(newTask)
      }
      
      this.saveTasks()
      this.closeModal()
      this.showToast('Task đã được lưu!', 'success')
    },
    
    closeModal() {
      this.showAddTaskModal = false
      this.editingTask = null
      this.taskForm = {
        title: '',
        description: '',
        time: '',
        priority: '',
        parentId: null
      }
    },
    
    // Copy functionality
    copyIndividualTask(task) {
      this.taskToCopy = task
      this.showCopyModal = true
      this.copyTarget = 'tomorrow'
      this.customCopyDate = ''
    },
    
    closeCopyModal() {
      this.showCopyModal = false
      this.taskToCopy = null
      this.copyTarget = 'tomorrow'
      this.customCopyDate = ''
    },
    
    getDateLabel(dayOffset) {
      const date = new Date()
      date.setDate(date.getDate() + dayOffset)
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    },
    
    copyIndividualTaskConfirm() {
      if (!this.taskToCopy) return
      
      let targetDate
      const today = new Date()
      
      if (this.copyTarget === 'yesterday') {
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() - 1)
      } else if (this.copyTarget === 'today') {
        targetDate = new Date(today)
      } else if (this.copyTarget === 'tomorrow') {
        targetDate = new Date(today)
        targetDate.setDate(today.getDate() + 1)
      } else if (this.copyTarget === 'custom' && this.customCopyDate) {
        targetDate = new Date(this.customCopyDate)
      }
      
      if (!targetDate) {
        this.showToast('Vui lòng chọn ngày để copy!', 'error')
        return
      }
      
      const newTaskId = Date.now() + Math.random()
      
      const copiedTask = {
        ...this.taskToCopy,
        id: newTaskId,
        date: targetDate.toDateString(),
        completed: false
      }
      
      this.tasks.push(copiedTask)
      
      const subTasks = this.getSubTasks(this.taskToCopy.id)
      let copiedSubTasksCount = 0
      
      subTasks.forEach(subTask => {
        const copiedSubTask = {
          ...subTask,
          id: Date.now() + Math.random() + Math.random(),
          parentId: newTaskId,
          date: targetDate.toDateString(),
          completed: false
        }
        this.tasks.push(copiedSubTask)
        copiedSubTasksCount++
      })
      
      this.saveTasks()
      this.closeCopyModal()
      
      const message = copiedSubTasksCount > 0 
        ? `Đã copy task "${this.taskToCopy.title}" và ${copiedSubTasksCount} subtask(s)!`
        : `Đã copy task "${this.taskToCopy.title}"!`
      
      this.showToast(message, 'success')
    },
    
    // YouTube Management - Event handlers
    handleChannelSort({ sortBy, sortOrder }) {
      this.channelSortBy = sortBy
      this.channelSortOrder = sortOrder
    },
    
    handleVideoSort({ sortBy, sortOrder }) {
      this.videoSortBy = sortBy
      this.videoSortOrder = sortOrder
    },

    handleVideoFilters({ channel, type, performance }) {
      this.filterChannel = channel
      this.filterVideoType = type
      this.filterPerformance = performance
    },
    
    viewAlertDetails(alert) {
      if (alert.id === 'low-performance') {
        this.filterPerformance = 'low'
        this.youtubeActiveTab = 'videos'
      }
      this.showToast('Đã lọc theo cảnh báo được chọn', 'info')
    },
    
    // Channel management
    addChannel() {
      if (!this.newChannel.name.trim()) return
      
      const gradients = [
        'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)'
      ]
      
      const channel = {
        id: Date.now(),
        name: this.newChannel.name,
        channelId: this.newChannel.channelId || '',
        subscribers: this.newChannel.subscribers || '0',
        gradient: gradients[Math.floor(Math.random() * gradients.length)]
      }
      
      this.channels.push(channel)
      this.saveChannels()
      this.closeAddChannelModal()
      this.showToast('Kênh đã được thêm!', 'success')
    },

    async importChannelVideos(channel) {
      if (!channel.channelId) {
        this.showToast('Kênh này chưa có Channel ID', 'error')
        return
      }

      this.isUpdating = true
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const sampleVideos = [
          {
            id: Date.now() + Math.random(),
            title: `New Video from ${channel.name}`,
            channelId: channel.id,
            views: Math.floor(Math.random() * 10000) + 1000,
            viewGrowth: Math.floor(Math.random() * 20) - 5,
            duration: '10:30',
            link: `https://youtube.com/watch?v=example${Date.now()}`,
            thumbnail: null,
            isShort: Math.random() > 0.7,
            createdAt: new Date(),
            viewHistory: [{
              date: new Date().toISOString().split('T')[0],
              views: Math.floor(Math.random() * 10000) + 1000
            }]
          }
        ]
        
        this.videos.push(...sampleVideos)
        this.saveVideos()
        this.showToast(`Đã import ${sampleVideos.length} video mới!`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi import video: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },

    viewChannelAnalytics(channelId) {
      this.filterChannel = channelId.toString()
      this.youtubeActiveTab = 'videos'
      this.showToast('Đã lọc video theo kênh được chọn', 'info')
    },
    
    deleteChannel(channelId) {
      if (confirm('Bạn có chắc muốn xóa kênh này? Tất cả video của kênh cũng sẽ bị xóa.')) {
        this.channels = this.channels.filter(c => c.id !== channelId)
        this.videos = this.videos.filter(v => v.channelId !== channelId)
        this.saveChannels()
        this.saveVideos()
        this.showToast('Kênh đã được xóa!', 'success')
      }
    },
    
    closeAddChannelModal() {
      this.showAddChannelModal = false
      this.newChannel = { name: '', channelId: '', subscribers: '' }
    },
    
    // Video management
    async addVideoFromYouTube() {
      if (!this.newVideo.link.trim() || !this.newVideo.channelId) {
        this.showToast('Vui lòng nhập link YouTube và chọn kênh!', 'error')
        return
      }
      
      this.isUpdating = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const isShort = this.newVideo.link.includes('/shorts/')
        const video = {
          id: Date.now(),
          title: `${isShort ? 'Short: ' : 'Video: '}New Content`,
          link: this.newVideo.link,
          thumbnail: null,
          views: Math.floor(Math.random() * 50000) + 1000,
          duration: isShort ? '0:30' : '10:00',
          channelId: this.newVideo.channelId,
          viewGrowth: Math.floor(Math.random() * 20) - 5,
          isShort: isShort,
          createdAt: new Date(),
          viewHistory: [{
            date: new Date().toISOString().split('T')[0],
            views: Math.floor(Math.random() * 50000) + 1000
          }]
        }
        
        this.videos.push(video)
        this.saveVideos()
        this.closeAddVideoModal()
        this.showToast(`${isShort ? 'YouTube Short' : 'Video'} đã được thêm!`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi thêm video: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateVideoViews(video) {
      this.isUpdating = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const currentViews = Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
        const oldViews = video.views
        const growth = oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0
        
        const updatedVideo = {
          ...video,
          views: currentViews,
          viewGrowth: parseFloat(growth.toFixed(1)),
          viewHistory: [
            ...video.viewHistory,
            {
              date: new Date().toISOString().split('T')[0],
              views: currentViews
            }
          ]
        }
        
        const index = this.videos.findIndex(v => v.id === video.id)
        if (index !== -1) {
          this.videos[index] = updatedVideo
        }
        
        this.saveVideos()
        this.showToast(`Views đã cập nhật: ${this.formatViews(currentViews)}`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi cập nhật views: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateAllViews() {
      if (!confirm('Bạn có muốn cập nhật tất cả views?')) return
      
      this.isUpdating = true
      let successCount = 0
      
      for (const video of this.videos) {
        try {
          const currentViews = Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
          const oldViews = video.views
          const growth = oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0
          
          const updatedVideo = {
            ...video,
            views: currentViews,
            viewGrowth: parseFloat(growth.toFixed(1)),
            viewHistory: [
              ...video.viewHistory,
              {
                date: new Date().toISOString().split('T')[0],
                views: currentViews
              }
            ]
          }
          
          const index = this.videos.findIndex(v => v.id === video.id)
          if (index !== -1) {
            this.videos[index] = updatedVideo
          }
          successCount++
        } catch (error) {
          console.error(`Error updating video ${video.id}:`, error)
        }
      }
      
      this.saveVideos()
      this.isUpdating = false
      this.showToast(`Đã cập nhật ${successCount}/${this.videos.length} video!`, 'success')
    },

    viewVideoAnalytics(video) {
      this.selectedVideo = video
      this.showVideoAnalyticsModal = true
    },

    closeVideoAnalyticsModal() {
      this.showVideoAnalyticsModal = false
      this.selectedVideo = null
    },
    
    deleteVideo(videoId) {
      if (confirm('Bạn có chắc muốn xóa video này?')) {
        this.videos = this.videos.filter(v => v.id !== videoId)
        this.saveVideos()
        this.showToast('Video đã được xóa!', 'success')
      }
    },
    
    closeAddVideoModal() {
      this.showAddVideoModal = false
      this.newVideo = { link: '', channelId: '' }
    },

    exportToCSV() {
      const csvData = []
      csvData.push(['Tên Video', 'Kênh', 'Loại', 'Views', 'Tăng Trưởng (%)', 'Thời Lượng', 'Ngày Tạo', 'Link'])
      
      this.videos.forEach(video => {
        csvData.push([
          video.title,
          this.getChannelName(video.channelId),
          video.isShort ? 'Shorts' : 'Video',
          video.views,
          video.viewGrowth,
          video.duration,
          this.formatDate(video.createdAt),
          video.link
        ])
      })
      
      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `youtube_analytics_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      this.showToast('Đã export dữ liệu ra file CSV!', 'success')
    },
    
    // Utility methods
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
    
    getChannelVideoCount(channelId) {
      return this.videos.filter(v => v.channelId === channelId).length
    },
    
    getChannelTotalViewsNumber(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      return channelVideos.reduce((sum, video) => sum + video.views, 0)
    },
    
    getChannelAverageViews(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      if (channelVideos.length === 0) return 0
      return Math.round(this.getChannelTotalViewsNumber(channelId) / channelVideos.length)
    },
    
    getChannelGrowthRate(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      if (channelVideos.length === 0) return 0
      
      const totalGrowth = channelVideos.reduce((sum, video) => sum + video.viewGrowth, 0)
      return Math.round(totalGrowth / channelVideos.length)
    },
    
    calculateChannelScore(channelId) {
      const videoCount = this.getChannelVideoCount(channelId)
      const avgViews = this.getChannelAverageViews(channelId)
      const growthRate = this.getChannelGrowthRate(channelId)
      
      let score = 0
      
      if (videoCount >= 10) score += 3
      else if (videoCount >= 5) score += 2
      else if (videoCount >= 1) score += 1
      
      if (avgViews >= 10000) score += 4
      else if (avgViews >= 5000) score += 3
      else if (avgViews >= 1000) score += 2
      else if (avgViews >= 100) score += 1
      
      if (growthRate >= 20) score += 3
      else if (growthRate >= 10) score += 2
      else if (growthRate >= 0) score += 1
      
      return score / 10
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
    
    getTimeAgo(date) {
      const now = new Date()
      const diffTime = Math.abs(now - new Date(date))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Hôm qua'
      if (diffDays < 7) return `${diffDays} ngày trước`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
      return `${Math.floor(diffDays / 30)} tháng trước`
    },

    getViewChange(viewHistory, index) {
      if (index === 0) return ''
      const current = viewHistory[index].views
      const previous = viewHistory[index - 1].views
      const change = current - previous
      return `${change > 0 ? '+' : ''}${this.formatViews(change)}`
    },
    
    // Storage methods
    loadData() {
      const savedTasks = localStorage.getItem('tasks')
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks)
      }
      
      const savedChannels = localStorage.getItem('youtube-channels')
      if (savedChannels) {
        this.channels = JSON.parse(savedChannels)
      }
      
      const savedVideos = localStorage.getItem('youtube-videos')
      if (savedVideos) {
        this.videos = JSON.parse(savedVideos)
      }

      const savedExpandedTasks = localStorage.getItem('expanded-tasks')
      if (savedExpandedTasks) {
        this.expandedTasks = JSON.parse(savedExpandedTasks)
      }
    },
    
    saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    },
    
    saveChannels() {
      localStorage.setItem('youtube-channels', JSON.stringify(this.channels))
    },
    
    saveVideos() {
      localStorage.setItem('youtube-videos', JSON.stringify(this.videos))
    },

    saveExpandedTasks() {
      localStorage.setItem('expanded-tasks', JSON.stringify(this.expandedTasks))
    },
    
    setupAutoUpdate() {
      this.$watch('expandedTasks', () => {
        this.saveExpandedTasks()
      }, { deep: true })
    },
    
    showToast(message, type = 'info') {
      const toast = document.createElement('div')
      toast.className = `toast toast-${type}`
      toast.textContent = message
      
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.classList.add('toast-show')
      }, 100)
      
      setTimeout(() => {
        toast.classList.remove('toast-show')
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast)
          }
        }, 300)
      }, 3000)
    }
  }
}
</script>

<style>
/* Clean Light Theme - White & Black Focus */
.desktop-app {
  background: #ffffff;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #000000;
}

/* Header Bar */
.header-bar {
  background: #ffffff;
  border-bottom: 2px solid #e5e5e5;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.control-btn.red { background: #ff5f57; }
.control-btn.yellow { background: #ffbd2e; }
.control-btn.green { background: #28ca42; }

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0;
}

.current-date {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

/* Main Content */
.main-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: calc(100vh - 80px);
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 4px;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #000000;
  color: #ffffff;
}

.tab-btn:hover:not(.active) {
  background: #f5f5f5;
  color: #000000;
}

/* Task Management Styles */
.date-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  justify-content: center;
}

.nav-btn {
  padding: 12px 24px;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000000;
}

.nav-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.nav-btn:hover:not(.active) {
  border-color: #cccccc;
}

.task-actions-bar {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.task-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #000000;
}

.filter-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.filter-btn:hover:not(.active) {
  border-color: #cccccc;
}

.task-search {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  padding: 10px 16px;
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

.add-task-btn {
  padding: 10px 20px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-task-btn:hover {
  background: #333333;
}

.tasks-section {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
}

.no-tasks {
  text-align: center;
  padding: 40px;
  color: #666666;
  font-style: italic;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* YouTube Dashboard Styles */
.youtube-header {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.youtube-title h2 {
  margin: 0 0 8px 0;
  color: #000000;
  font-weight: 700;
}

.youtube-title p {
  color: #666666;
  margin: 0;
  font-size: 0.9rem;
}

.youtube-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  color: #000000;
}

.btn-outline:hover {
  border-color: #cccccc;
}

.btn-primary {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
}

.btn-primary:hover {
  background: #333333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.youtube-tabs {
  display: flex;
  gap: 4px;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.youtube-tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #666666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.youtube-tab-btn.active {
  background: #000000;
  color: #ffffff;
}

.youtube-tab-btn:hover:not(.active) {
  background: #f5f5f5;
  color: #000000;
}

.youtube-content {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h3 {
  margin: 0;
  color: #000000;
  font-weight: 700;
}

.content-actions {
  display: flex;
  gap: 12px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #ffffff;
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.analytics-modal {
  max-width: 600px;
  min-width: 500px;
}

.modal h3 {
  margin: 0 0 20px 0;
  color: #000000;
  font-size: 1.2rem;
  font-weight: 700;
}

.modal p {
  color: #666666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #ffffff;
  color: #000000;
}

.modal-input:focus {
  outline: none;
  border-color: #000000;
}

.copy-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.copy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.copy-option:hover {
  background: #f5f5f5;
}

.copy-option input[type="radio"] {
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.cancel {
  background: #ffffff;
  color: #000000;
  border: 2px solid #e5e5e5;
}

.modal-btn.cancel:hover {
  border-color: #cccccc;
}

.modal-btn.primary {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
}

.modal-btn.primary:hover {
  background: #333333;
}

.modal-note {
  background: #f8f9fa;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #000000;
}

/* Video Analytics Modal */
.video-analytics-content {
  margin-top: 20px;
}

.analytics-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  padding: 16px;
  background: #f8f9fa;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
}

.summary-label {
  font-size: 0.8rem;
  color: #666666;
  margin-bottom: 4px;
  font-weight: 500;
}

.summary-value {
  font-weight: 700;
  color: #000000;
}

.summary-value.positive {
  color: #28a745;
}

.summary-value.negative {
  color: #dc3545;
}

.view-history h4 {
  margin: 0 0 12px 0;
  color: #000000;
  font-weight: 700;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border: 2px solid #e5e5e5;
  border-radius: 6px;
  font-size: 0.9rem;
}

.history-date {
  color: #666666;
  font-weight: 500;
}

.history-views {
  font-weight: 700;
  color: #000000;
}

.history-change {
  color: #28a745;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Toast Notifications */
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  color: #ffffff;
  font-weight: 600;
  z-index: 2000;
  transform: translateX(100%);
  transition: all 0.3s ease;
  max-width: 400px;
}

.toast-show {
  transform: translateX(0);
}

.toast-success {
  background: #28a745;
}

.toast-error {
  background: #dc3545;
}

.toast-info {
  background: #000000;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .task-actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .task-search {
    justify-content: stretch;
  }
  
  .search-input {
    min-width: auto;
    flex: 1;
  }
  
  .modal {
    min-width: 300px;
    margin: 20px;
  }
  
  .youtube-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .analytics-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .tab-navigation {
    flex-direction: column;
  }
  
  .youtube-tabs {
    flex-direction: column;
  }
  
  .date-navigation {
    flex-direction: column;
  }
}
</style>