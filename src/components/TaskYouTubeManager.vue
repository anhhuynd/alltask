<template>
  <div class="desktop-app" :class="timeBasedTheme">
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
        <div class="time-info">
          <span class="current-time">{{ currentTime }}</span>
          <span class="time-period">{{ timePeriodText }}</span>
        </div>
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
            <div class="no-tasks-icon">📝</div>
            <p>{{ searchQuery ? 'Không tìm thấy công việc nào.' : 'Chưa có công việc nào cho ngày này' }}</p>
            <button v-if="!searchQuery" class="add-first-task-btn" @click="showAddTaskModal = true">
              Thêm công việc đầu tiên
            </button>
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
            <button @click="showApiKeyModal = true" class="btn btn-outline">
              🔑 {{ apiKey ? 'Cập nhật' : 'Cấu hình' }} API Key
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
            :total-videos="videos.length"
            :total-views="totalViews"
            :shorts-count="shortsCount"
            :alerts-count="lowPerformanceVideos.length"
            :average-growth-rate="averageGrowthRate"
          />

          <!-- Channels Table -->
          <ChannelsTable
            :channels="channels"
            :videos="videos"
            :is-updating="isUpdating"
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

          <!-- Videos Table -->
          <VideosTable
            :videos="videos"
            :channels="channels"
            :search-query="videoSearchQuery"
            :filter-channel="filterChannel"
            :filter-video-type="filterVideoType"
            :filter-performance="filterPerformance"
            :current-page="currentVideoPage"
            :per-page="videosPerPage"
            @search-change="videoSearchQuery = $event"
            @filter-change="handleVideoFilters"
            @sort-change="handleVideoSort"
            @page-change="currentVideoPage = $event"
            @per-page-change="videosPerPage = $event; currentVideoPage = 1"
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
            :total-views="totalViews"
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

    <!-- Modals -->
    <TaskModal
      v-if="showAddTaskModal || editingTask"
      :editing-task="editingTask"
      :task-form="taskForm"
      @close="closeModal"
      @save="saveTask"
      @update-form="taskForm = $event"
    />

    <CopyTaskModal
      v-if="showCopyModal"
      :task-to-copy="taskToCopy"
      :copy-target="copyTarget"
      :custom-copy-date="customCopyDate"
      :sub-tasks-count="getSubTasks(taskToCopy?.id).length"
      @close="closeCopyModal"
      @confirm="copyIndividualTaskConfirm"
      @update-target="copyTarget = $event"
      @update-date="customCopyDate = $event"
    />

    <ApiKeyModal
      v-if="showApiKeyModal"
      :api-key="apiKey"
      @close="showApiKeyModal = false"
      @save="saveApiKey"
      @update-key="apiKey = $event"
    />

    <ChannelModal
      v-if="showAddChannelModal"
      :new-channel="newChannel"
      @close="closeAddChannelModal"
      @save="addChannel"
      @update-channel="newChannel = { ...newChannel, ...$event }"
    />

    <VideoModal
      v-if="showAddVideoModal"
      :new-video="newVideo"
      :channels="channels"
      @close="closeAddVideoModal"
      @save="addVideoFromYouTube"
      @update-video="newVideo = { ...newVideo, ...$event }"
    />

    <VideoAnalyticsModal
      v-if="showVideoAnalyticsModal"
      :selected-video="selectedVideo"
      @close="closeVideoAnalyticsModal"
    />
  </div>
</template>

<script>
import axios from 'axios'
import TaskProgress from './TaskManager/TaskProgress.vue'
import TaskItem from './TaskManager/TaskItem.vue'
import ChannelPerformanceGrid from './YouTube/ChannelPerformanceGrid.vue'
import ChannelsTable from './YouTube/ChannelsTable.vue'
import VideosTable from './YouTube/VideosTable.vue'
import AnalyticsGrid from './YouTube/AnalyticsGrid.vue'
import TaskModal from './Modals/TaskModal.vue'
import CopyTaskModal from './Modals/CopyTaskModal.vue'
import ApiKeyModal from './Modals/ApiKeyModal.vue'
import ChannelModal from './Modals/ChannelModal.vue'
import VideoModal from './Modals/VideoModal.vue'
import VideoAnalyticsModal from './Modals/VideoAnalyticsModal.vue'

// Enhanced YouTube API utility class with Shorts support
class YouTubeAPI {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://www.googleapis.com/youtube/v3'
  }

  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
      /m\.youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
      /music\.youtube\.com\/watch\?v=([^"&?\/\s]{11})/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  extractChannelId(input) {
    if (input.startsWith('@')) {
      return input
    } else if (input.startsWith('UC') && input.length === 24) {
      return input
    } else if (input.includes('youtube.com/channel/')) {
      return input.split('youtube.com/channel/')[1].split('/')[0]
    } else if (input.includes('youtube.com/c/')) {
      return input.split('youtube.com/c/')[1].split('/')[0]
    } else if (input.includes('youtube.com/@')) {
      return input.split('youtube.com/@')[1].split('/')[0]
    }
    return input
  }

  isYouTubeShort(url) {
    return url.includes('/shorts/') || url.includes('youtube.com/shorts')
  }

  async getVideoInfo(url) {
    if (!this.apiKey) {
      throw new Error('API Key chưa được cấu hình')
    }

    const videoId = this.extractVideoId(url)
    if (!videoId) {
      throw new Error('URL YouTube không hợp lệ. Hỗ trợ: youtube.com/watch?v=..., youtube.com/shorts/..., youtu.be/...')
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: this.apiKey
        }
      })

      if (response.data.items.length === 0) {
        throw new Error('Không tìm thấy video hoặc video bị ẩn/xóa')
      }

      const video = response.data.items[0]
      const isShort = this.isYouTubeShort(url) || this.isShortByDuration(video.contentDetails.duration)
      
      return {
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        duration: this.formatDuration(video.contentDetails.duration),
        isShort: isShort,
        publishedAt: video.snippet.publishedAt
      }
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('API Key không hợp lệ hoặc đã hết quota')
      } else if (error.response?.status === 404) {
        throw new Error('Video không tồn tại hoặc đã bị xóa')
      }
      throw new Error('Lỗi khi lấy thông tin video: ' + error.message)
    }
  }

  async getChannelVideos(channelId, maxResults = 50) {
    if (!this.apiKey) {
      throw new Error('API Key chưa được cấu hình')
    }

    try {
      const channelResponse = await axios.get(`${this.baseURL}/channels`, {
        params: {
          part: 'contentDetails',
          id: channelId.startsWith('@') ? undefined : channelId,
          forUsername: channelId.startsWith('@') ? channelId.substring(1) : undefined,
          key: this.apiKey
        }
      })

      if (channelResponse.data.items.length === 0) {
        throw new Error('Không tìm thấy kênh')
      }

      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads

      const playlistResponse = await axios.get(`${this.baseURL}/playlistItems`, {
        params: {
          part: 'snippet',
          playlistId: uploadsPlaylistId,
          maxResults: maxResults,
          key: this.apiKey
        }
      })

      const videoIds = playlistResponse.data.items.map(item => item.snippet.resourceId.videoId)
      
      const videosResponse = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoIds.join(','),
          key: this.apiKey
        }
      })

      return videosResponse.data.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        viewCount: parseInt(video.statistics.viewCount) || 0,
        duration: this.formatDuration(video.contentDetails.duration),
        isShort: this.isShortByDuration(video.contentDetails.duration),
        publishedAt: video.snippet.publishedAt,
        link: `https://youtube.com/watch?v=${video.id}`
      }))
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('API Key không hợp lệ hoặc đã hết quota')
      }
      throw new Error('Lỗi khi lấy video từ kênh: ' + error.message)
    }
  }

  isShortByDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return false

    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0

    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    return totalSeconds <= 60 && hours === 0
  }

  async getCurrentViews(url) {
    const videoId = this.extractVideoId(url)
    if (!videoId || !this.apiKey) {
      return Math.floor(Math.random() * 50000) + 1000
    }

    try {
      const response = await axios.get(`${this.baseURL}/videos`, {
        params: {
          part: 'statistics',
          id: videoId,
          key: this.apiKey
        }
      })

      if (response.data.items.length === 0) {
        throw new Error('Video không tồn tại')
      }

      return parseInt(response.data.items[0].statistics.viewCount) || 0
    } catch (error) {
      console.warn('Lỗi khi lấy views:', error.message)
      return Math.floor(Math.random() * 50000) + 1000
    }
  }

  formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return '0:00'

    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    const seconds = parseInt(match[3]) || 0

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

export default {
  name: 'TaskYouTubeManager',
  components: {
    TaskProgress,
    TaskItem,
    ChannelPerformanceGrid,
    ChannelsTable,
    VideosTable,
    AnalyticsGrid,
    TaskModal,
    CopyTaskModal,
    ApiKeyModal,
    ChannelModal,
    VideoModal,
    VideoAnalyticsModal
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
      showApiKeyModal: false,
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
      videosPerPage: 20,
      
      // Sorting
      videoSortBy: 'createdAt',
      videoSortOrder: 'desc',
      
      // API
      apiKey: '',
      youtubeAPI: null,
      
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
    
    currentTime() {
      return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    timePeriodText() {
      const hour = new Date().getHours()
      if (hour < 12) return 'Buổi sáng'
      if (hour < 18) return 'Buổi chiều'
      return 'Buổi tối'
    },
    
    timeBasedTheme() {
      const hour = new Date().getHours()
      if (hour < 6) return 'night'
      if (hour < 12) return 'morning'
      if (hour < 18) return 'afternoon'
      return 'evening'
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
    
    totalViews() {
      return this.videos.reduce((total, video) => total + video.views, 0)
    },
    
    shortsCount() {
      return this.videos.filter(video => video.isShort).length
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
    handleVideoFilters({ channel, type, performance }) {
      this.filterChannel = channel
      this.filterVideoType = type
      this.filterPerformance = performance
    },
    
    handleVideoSort({ sortBy, sortOrder }) {
      this.videoSortBy = sortBy
      this.videoSortOrder = sortOrder
    },
    
    viewAlertDetails(alert) {
      if (alert.id === 'low-performance') {
        this.filterPerformance = 'low'
        this.youtubeActiveTab = 'videos'
      }
      this.showToast('Đã lọc theo cảnh báo được chọn', 'info')
    },
    
    // API Key management
    saveApiKey() {
      localStorage.setItem('api-youtube-key', this.apiKey)
      this.youtubeAPI = new YouTubeAPI(this.apiKey)
      this.showApiKeyModal = false
      this.showToast('API Key đã được lưu! Giờ bạn có thể thêm video và Shorts từ YouTube.', 'success')
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
        this.showToast('Kênh này chưa có Channel ID. Vui lòng cập nhật thông tin kênh.', 'error')
        return
      }

      if (!this.youtubeAPI) {
        this.showToast('Vui lòng cấu hình YouTube API Key trước!', 'error')
        return
      }

      this.isUpdating = true
      try {
        const channelVideos = await this.youtubeAPI.getChannelVideos(channel.channelId, 20)
        
        let importedCount = 0
        for (const videoData of channelVideos) {
          const existingVideo = this.videos.find(v => v.link.includes(videoData.id))
          if (!existingVideo) {
            const video = {
              id: Date.now() + Math.random(),
              title: videoData.title,
              link: videoData.link,
              thumbnail: videoData.thumbnail,
              views: videoData.viewCount,
              duration: videoData.duration,
              channelId: channel.id,
              viewGrowth: 0,
              isShort: videoData.isShort,
              createdAt: new Date(videoData.publishedAt),
              viewHistory: [{
                date: new Date().toISOString().split('T')[0],
                views: videoData.viewCount
              }]
            }
            this.videos.push(video)
            importedCount++
          }
        }
        
        this.saveVideos()
        this.showToast(`Đã import ${importedCount} video mới từ kênh ${channel.name}!`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi import video từ kênh: ' + error.message, 'error')
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
        const videoInfo = await this.youtubeAPI?.getVideoInfo(this.newVideo.link)
        
        if (!videoInfo) {
          const videoId = this.youtubeAPI?.extractVideoId(this.newVideo.link) || 'unknown'
          const isShort = this.youtubeAPI?.isYouTubeShort(this.newVideo.link) || false
          
          const video = {
            id: Date.now(),
            title: `${isShort ? 'Short: ' : 'Video: '}${videoId}`,
            link: this.newVideo.link,
            thumbnail: null,
            views: Math.floor(Math.random() * 50000) + 1000,
            duration: isShort ? '0:30' : '10:00',
            channelId: this.newVideo.channelId,
            viewGrowth: 0,
            isShort: isShort,
            createdAt: new Date(),
            viewHistory: [{
              date: new Date().toISOString().split('T')[0],
              views: Math.floor(Math.random() * 50000) + 1000
            }]
          }
          this.videos.push(video)
        } else {
          const video = {
            id: Date.now(),
            title: videoInfo.title,
            link: this.newVideo.link,
            thumbnail: videoInfo.thumbnail,
            views: videoInfo.viewCount,
            duration: videoInfo.duration,
            channelId: this.newVideo.channelId,
            viewGrowth: 0,
            isShort: videoInfo.isShort,
            createdAt: new Date(videoInfo.publishedAt),
            viewHistory: [{
              date: new Date().toISOString().split('T')[0],
              views: videoInfo.viewCount
            }]
          }
          this.videos.push(video)
        }
        
        this.saveVideos()
        this.closeAddVideoModal()
        this.showToast(`${videoInfo?.isShort ? 'YouTube Short' : 'Video'} đã được thêm thành công!`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi lấy thông tin video: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateVideoViews(video) {
      this.isUpdating = true
      try {
        const currentViews = await this.youtubeAPI?.getCurrentViews(video.link) || 
                            Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
        
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
        this.showToast(`Views đã được cập nhật: ${this.formatViews(currentViews)} (${growth > 0 ? '+' : ''}${growth.toFixed(1)}%)`, 'success')
      } catch (error) {
        this.showToast('Lỗi khi cập nhật views: ' + error.message, 'error')
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateAllViews() {
      if(!this.apiKey) {
        this.showToast('Vui lòng cấu hình YouTube API Key trước ở phần setting!', 'error')
        return
      }
      if (!confirm('Bạn có muốn cập nhật tất cả views từ YouTube?')) return
      
      this.isUpdating = true
      let successCount = 0
      
      for (const video of this.videos) {
        try {
          const currentViews = await this.youtubeAPI?.getCurrentViews(video.link) || 
                              Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
          
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
      this.showToast(`Đã cập nhật ${successCount}/${this.videos.length} video thành công!`, 'success')
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
    
    getTimeAgo(date) {
      const now = new Date()
      const diffTime = Math.abs(now - new Date(date))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return 'Hôm qua'
      if (diffDays < 7) return `${diffDays} ngày trước`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
      return `${Math.floor(diffDays / 30)} tháng trước`
    },
    
    // Storage methods
    loadData() {
      const savedApiKey = localStorage.getItem('api-youtube-key')
      if (savedApiKey) {
        this.apiKey = savedApiKey
        this.youtubeAPI = new YouTubeAPI(savedApiKey)
      }
      
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
    
    // Auto-update setup
    setupAutoUpdate() {
      // Auto-update views every 30 minutes
      setInterval(() => {
        if (this.youtubeAPI && this.videos.length > 0) {
          this.updateAllViews()
        }
      }, 30 * 60 * 1000)

      // Save expanded tasks state when changed
      this.$watch('expandedTasks', () => {
        this.saveExpandedTasks()
      }, { deep: true })
    },
    
    // Toast notification
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

<style src="../styles/TaskYouTubeManager.css"></style>