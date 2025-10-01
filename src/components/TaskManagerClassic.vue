<template>
  <div class="task-manager-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-left">
          <div class="window-controls">
            <div class="control-btn red"></div>
            <div class="control-btn yellow"></div>
            <div class="control-btn green"></div>
          </div>
          <h1 class="header-title">Task & YouTube Manager</h1>
        </div>
        <div class="header-right">
          <span class="current-date">{{ currentDate }}</span>
        </div>
      </div>
    </div>

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

      <!-- Task Progress Summary -->
      <div class="task-progress" :class="timeBasedTheme">
        <div class="progress-stats">
          <div class="stat-item">
            <div class="stat-number">{{ completedTasksCount }}</div>
            <div class="stat-label">Đã hoàn thành</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ remainingTasksCount }}</div>
            <div class="stat-label">Còn lại</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalTasksCount }}</div>
            <div class="stat-label">Tổng cộng</div>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-text">
          {{ progressPercentage }}% hoàn thành
        </div>
        <div class="time-indicator">
          <span class="current-time">{{ currentTime }}</span>
          <span class="time-period">{{ timePeriodText }}</span>
        </div>
      </div>

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
          <div 
            v-for="task in filteredTasks" 
            :key="task.id"
            class="task-card"
          >
            <div class="task-item" :class="{ overdue: isOverdue(task) }">
              <div 
                class="task-checkbox"
                :class="{ completed: task.completed }"
                @click="toggleTask(task.id)"
              ></div>
              
              <div class="task-content" @click="editTask(task)">
                <div 
                  class="task-title"
                  :class="{ completed: task.completed }"
                >
                  {{ task.title }}
                  <button 
                    v-if="getSubTasks(task.id).length > 0"
                    @click.stop="toggleTaskExpansion(task.id)"
                    class="expand-btn"
                    :class="{ expanded: expandedTasks.includes(task.id) }"
                  >
                    {{ expandedTasks.includes(task.id) ? '▼' : '▶' }}
                  </button>
                </div>
                <div class="task-description">{{ task.description }}</div>
                <div class="task-meta">
                  <span class="task-time">{{ task.time }}</span>
                  <span v-if="task.priority" :class="['task-priority', task.priority]">
                    {{ getPriorityText(task.priority) }}
                  </span>
                  <span v-if="getSubTasks(task.id).length > 0" class="subtask-count">
                    {{ getCompletedSubTasksCount(task.id) }}/{{ getSubTasks(task.id).length }} subtasks
                  </span>
                </div>
              </div>
              
              <div class="task-controls">
                <button class="control-btn" @click="addSubTask(task.id)" title="Thêm subtask">
                  ➕
                </button>
                <button class="control-btn" @click="copyTask(task)" title="Copy task">
                  📋
                </button>
                <button class="control-btn" @click="editTask(task)" title="Sửa">
                  ✏️
                </button>
                <button class="control-btn delete" @click="deleteTask(task.id)" title="Xóa">
                  🗑️
                </button>
              </div>
            </div>

            <!-- Sub Tasks -->
            <div v-if="expandedTasks.includes(task.id) && getSubTasks(task.id).length > 0" class="sub-tasks">
              <div 
                v-for="subTask in getSubTasks(task.id)" 
                :key="subTask.id"
                class="task-item sub-task"
              >
                <div 
                  class="task-checkbox"
                  :class="{ completed: subTask.completed }"
                  @click="toggleTask(subTask.id)"
                ></div>
                
                <div class="task-content">
                  <div 
                    class="task-title"
                    :class="{ completed: subTask.completed }"
                  >
                    {{ subTask.title }}
                  </div>
                  <div class="task-description">{{ subTask.description }}</div>
                  <div class="task-meta">
                    <span class="task-time">{{ subTask.time }}</span>
                  </div>
                </div>
                
                <div class="task-controls">
                  <button class="control-btn delete" @click="deleteTask(subTask.id)" title="Xóa">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- YouTube Dashboard Tab -->
    <div v-if="activeTab === 'youtube'" class="tab-content">
      <!-- YouTube Header -->
      <div class="youtube-header">
        <div class="youtube-title">
          <h2>📺 YouTube Dashboard</h2>
          <p>Quản lý kênh YouTube với cập nhật views thực tế</p>
        </div>
        <div class="youtube-actions">
          <button @click="showApiKeyModal = true" class="btn btn-outline">🔑 API Key</button>
          <button @click="updateAllViews" :disabled="isUpdating" class="btn btn-primary">
            {{ isUpdating ? "🔄 Đang cập nhật..." : "🔄 Cập nhật tất cả" }}
          </button>
        </div>
      </div>

      <!-- YouTube Stats -->
      <div class="youtube-stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-number">{{ channels.length }}</div>
          <div class="stat-label">Kênh</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🎥</div>
          <div class="stat-number">{{ videos.length }}</div>
          <div class="stat-label">Video</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-number">{{ formatViews(totalViews) }}</div>
          <div class="stat-label">Tổng Views</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📱</div>
          <div class="stat-number">{{ shortsCount }}</div>
          <div class="stat-label">Shorts</div>
        </div>
      </div>

      <!-- Channels List -->
      <div class="channels-section">
        <div class="section-header">
          <h3>Quản Lý Kênh</h3>
          <button @click="showAddChannelModal = true" class="btn btn-primary">
            ➕ Thêm Kênh
          </button>
        </div>
        
        <div class="channels-grid">
          <div v-for="channel in channels" :key="channel.id" class="channel-card">
            <div class="channel-header" :style="{ background: channel.gradient }">
              <div class="channel-icon">📺</div>
              <button @click="deleteChannel(channel.id)" class="delete-channel-btn" title="Xóa kênh">
                🗑️
              </button>
            </div>
            <div class="channel-content">
              <h4 class="channel-name">{{ channel.name }}</h4>
              <p class="channel-subscribers">{{ channel.subscribers }} subscribers</p>
              <div class="channel-stats">
                <span>{{ getChannelVideoCount(channel.id) }} videos</span>
                <span>{{ getChannelTotalViews(channel.id) }} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Videos List -->
      <div class="videos-section">
        <div class="section-header">
          <h3>Video Gần Đây</h3>
          <button @click="showAddVideoModal = true" class="btn btn-primary">
            ➕ Thêm Video
          </button>
        </div>
        
        <div class="videos-list">
          <div v-for="video in videos.slice(0, 5)" :key="video.id" 
               class="video-card" 
               :class="{ 'shorts': video.isShort }">
            <div class="video-thumbnail">
              <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" class="thumbnail-image">
              <div v-else class="thumbnail-placeholder">🎥</div>
              <div class="video-duration">{{ video.duration }}</div>
              <div v-if="video.isShort" class="short-badge">Shorts</div>
            </div>
            
            <div class="video-info">
              <h4 class="video-title">{{ video.title }}</h4>
              <p class="video-channel">{{ getChannelName(video.channelId) }}</p>
              <div class="video-stats">
                <span class="video-views">{{ formatViews(video.views) }} views</span>
                <span :class="['growth-badge', video.viewGrowth > 0 ? 'positive' : video.viewGrowth < 0 ? 'negative' : 'neutral']">
                  {{ video.viewGrowth > 0 ? "+" : "" }}{{ video.viewGrowth }}%
                </span>
              </div>
              <div class="video-date">{{ formatDate(video.createdAt) }}</div>
            </div>
            
            <div class="video-actions">
              <button @click="updateVideoViews(video)" class="action-btn" title="Cập nhật views">🔄</button>
              <button @click="deleteVideo(video.id)" class="action-btn delete" title="Xóa">🗑️</button>
            </div>
          </div>
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

    <!-- Add Channel Modal -->
    <div v-if="showAddChannelModal" class="modal-overlay" @click="closeAddChannelModal">
      <div class="modal" @click.stop>
        <h3>Thêm Kênh YouTube Mới</h3>
        <input v-model="newChannel.name" placeholder="Tên kênh" class="modal-input">
        <input v-model="newChannel.channelId" placeholder="Channel ID" class="modal-input">
        <input v-model="newChannel.subscribers" placeholder="Số subscribers" class="modal-input">
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
        <input v-model="newVideo.link" placeholder="Link YouTube" class="modal-input">
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

    <!-- API Key Modal -->
    <div v-if="showApiKeyModal" class="modal-overlay" @click="showApiKeyModal = false">
      <div class="modal" @click.stop>
        <h3>YouTube API Key</h3>
        <p>Nhập YouTube Data API v3 key:</p>
        <input v-model="apiKey" placeholder="YouTube API Key" class="modal-input" type="password">
        <div class="modal-actions">
          <button @click="showApiKeyModal = false" class="modal-btn cancel">Hủy</button>
          <button @click="saveApiKey" class="modal-btn primary">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskManagerClassic',
  data() {
    return {
      // UI State
      activeTab: 'tasks',
      selectedDateIndex: 1,
      selectedDate: new Date(),
      taskFilter: 'all',
      searchQuery: '',
      isUpdating: false,
      
      // Task expansion state
      expandedTasks: [],
      
      // Modals
      showAddTaskModal: false,
      showAddChannelModal: false,
      showAddVideoModal: false,
      showApiKeyModal: false,
      editingTask: null,
      
      // API
      apiKey: '',
      
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
          createdAt: new Date('2024-01-15')
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
          createdAt: new Date('2024-01-20')
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
    
    progressPercentage() {
      if (this.totalTasksCount === 0) return 0
      return Math.round((this.completedTasksCount / this.totalTasksCount) * 100)
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
    }
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

    getCompletedSubTasksCount(parentId) {
      return this.getSubTasks(parentId).filter(task => task.completed).length
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
      }
    },
    
    copyTask(task) {
      const newTask = {
        ...task,
        id: Date.now(),
        title: task.title + ' (Copy)',
        completed: false
      }
      this.tasks.push(newTask)
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
      
      this.closeModal()
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
    
    isOverdue(task) {
      if (!task.time || task.completed) return false
      
      const now = new Date()
      const taskDate = new Date(task.date)
      const [time, period] = task.time.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      
      let taskHours = hours
      if (period === 'PM' && hours !== 12) taskHours += 12
      if (period === 'AM' && hours === 12) taskHours = 0
      
      taskDate.setHours(taskHours, minutes || 0, 0, 0)
      
      return now > taskDate
    },
    
    getPriorityText(priority) {
      const priorities = {
        high: 'Cao',
        medium: 'Trung bình',
        low: 'Thấp'
      }
      return priorities[priority] || ''
    },
    
    // YouTube Management
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
    
    getChannelTotalViews(channelId) {
      const channelVideos = this.videos.filter(v => v.channelId === channelId)
      const totalViews = channelVideos.reduce((sum, video) => sum + video.views, 0)
      return this.formatViews(totalViews)
    },
    
    saveApiKey() {
      localStorage.setItem('youtube-api-key', this.apiKey)
      this.showApiKeyModal = false
    },
    
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
      this.closeAddChannelModal()
    },
    
    deleteChannel(channelId) {
      if (confirm('Bạn có chắc muốn xóa kênh này?')) {
        this.channels = this.channels.filter(c => c.id !== channelId)
        this.videos = this.videos.filter(v => v.channelId !== channelId)
      }
    },
    
    closeAddChannelModal() {
      this.showAddChannelModal = false
      this.newChannel = { name: '', channelId: '', subscribers: '' }
    },
    
    async addVideoFromYouTube() {
      if (!this.newVideo.link.trim() || !this.newVideo.channelId) return
      
      this.isUpdating = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const isShort = this.newVideo.link.includes('/shorts/')
        const video = {
          id: Date.now(),
          title: `${isShort ? 'Short: ' : 'Video: '}Sample Title`,
          link: this.newVideo.link,
          thumbnail: null,
          views: Math.floor(Math.random() * 50000) + 1000,
          duration: isShort ? '0:30' : '10:00',
          channelId: this.newVideo.channelId,
          viewGrowth: 0,
          isShort: isShort,
          createdAt: new Date()
        }
        
        this.videos.push(video)
        this.closeAddVideoModal()
      } catch (error) {
        console.error('Error adding video:', error)
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
        
        video.views = currentViews
        video.viewGrowth = parseFloat(growth.toFixed(1))
      } catch (error) {
        console.error('Error updating views:', error)
      } finally {
        this.isUpdating = false
      }
    },
    
    async updateAllViews() {
      if (!confirm('Bạn có muốn cập nhật tất cả views từ YouTube?')) return
      
      this.isUpdating = true
      
      for (const video of this.videos) {
        try {
          const currentViews = Math.floor(video.views * (1 + (Math.random() * 0.3 - 0.1)))
          const oldViews = video.views
          const growth = oldViews > 0 ? ((currentViews - oldViews) / oldViews) * 100 : 0
          
          video.views = currentViews
          video.viewGrowth = parseFloat(growth.toFixed(1))
        } catch (error) {
          console.error(`Error updating video ${video.id}:`, error)
        }
      }
      
      this.isUpdating = false
    },
    
    deleteVideo(videoId) {
      if (confirm('Bạn có chắc muốn xóa video này?')) {
        this.videos = this.videos.filter(v => v.id !== videoId)
      }
    },
    
    closeAddVideoModal() {
      this.showAddVideoModal = false
      this.newVideo = { link: '', channelId: '' }
    }
  }
}
</script>

<style scoped>
.task-manager-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section */
.header-section {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.header-content {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-controls {
  display: flex;
  gap: 6px;
}

.control-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #999;
}

.control-btn.red {
  background: #ff5f56;
}

.control-btn.yellow {
  background: #ffbd2e;
}

.control-btn.green {
  background: #27ca3f;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.current-date {
  font-size: 14px;
  color: #666;
}

/* Tab Navigation */
.tab-navigation {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: #f8f9fa;
  border: none;
  border-right: 1px solid #ccc;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.tab-btn:last-child {
  border-right: none;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.tab-btn:hover:not(.active) {
  background: #e9ecef;
}

/* Tab Content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Date Navigation */
.date-navigation {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.nav-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
}

.nav-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.nav-btn:hover:not(.active) {
  background: #e9ecef;
}

/* Task Progress */
.task-progress {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s;
}

.progress-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.time-indicator {
  display: flex;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

/* Task Actions */
.task-actions-bar {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.task-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.filter-btn:hover:not(.active) {
  background: #e9ecef;
}

.task-search {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.add-task-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.add-task-btn:hover {
  background: #218838;
}

/* Tasks Section */
.tasks-section {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
}

.no-tasks {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  transition: background-color 0.2s;
}

.task-item:hover {
  background: #e9ecef;
}

.task-item.overdue {
  background: #fff5f5;
  border-left: 4px solid #dc3545;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.task-checkbox.completed {
  background: #28a745;
  border-color: #28a745;
}

.task-checkbox.completed::after {
  content: '✓';
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title.completed {
  text-decoration: line-through;
  color: #666;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.expand-btn:hover {
  background: #e9ecef;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #888;
}

.task-time {
  font-weight: 500;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  text-transform: uppercase;
}

.task-priority.high {
  background: #fee2e2;
  color: #991b1b;
}

.task-priority.medium {
  background: #fef3c7;
  color: #92400e;
}

.task-priority.low {
  background: #d1fae5;
  color: #065f46;
}

.subtask-count {
  font-weight: 500;
  color: #007bff;
}

.task-controls {
  display: flex;
  gap: 4px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f8f9fa;
}

.control-btn.delete:hover {
  background: #fee2e2;
  border-color: #dc3545;
}

.sub-tasks {
  border-top: 1px solid #e9ecef;
}

.sub-task {
  background: #f1f3f4;
  margin-left: 32px;
}

/* YouTube Dashboard */
.youtube-header {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.youtube-title h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #333;
}

.youtube-title p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.youtube-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-outline {
  background: white;
  color: #333;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* YouTube Stats */
.youtube-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* Sections */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.channels-section,
.videos-section {
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
}

/* Channels Grid */
.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.channel-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.channel-header {
  padding: 16px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-icon {
  font-size: 24px;
}

.delete-channel-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
}

.delete-channel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.channel-content {
  padding: 16px;
  background: white;
}

.channel-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.channel-subscribers {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.channel-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #888;
}

/* Videos List */
.videos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #f8f9fa;
}

.video-card.shorts {
  border-left: 4px solid #ff6b6b;
}

.video-thumbnail {
  position: relative;
  width: 120px;
  height: 68px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
}

.short-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.video-info {
  flex: 1;
}

.video-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.video-channel {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.video-stats {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.video-views {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.growth-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.growth-badge.positive {
  background: #d1fae5;
  color: #065f46;
}

.growth-badge.negative {
  background: #fee2e2;
  color: #991b1b;
}

.growth-badge.neutral {
  background: #f3f4f6;
  color: #374151;
}

.video-date {
  font-size: 11px;
  color: #888;
}

.video-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8f9fa;
}

.action-btn.delete:hover {
  background: #fee2e2;
  border-color: #dc3545;
}

/* Modals */
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
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
}

.modal-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #007bff;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.modal-btn.cancel {
  background: white;
  color: #333;
}

.modal-btn.cancel:hover {
  background: #f8f9fa;
}

.modal-btn.primary {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.modal-btn.primary:hover {
  background: #0056b3;
}

/* Responsive Design */
@media (max-width: 768px) {
  .task-manager-container {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 8px;
    text-align: center;
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

  .youtube-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .youtube-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .channels-grid {
    grid-template-columns: 1fr;
  }

  .video-card {
    flex-direction: column;
  }

  .video-thumbnail {
    width: 100%;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .tab-navigation {
    flex-direction: column;
  }

  .tab-btn {
    border-right: none;
    border-bottom: 1px solid #ccc;
  }

  .tab-btn:last-child {
    border-bottom: none;
  }

  .date-navigation {
    flex-direction: column;
  }

  .progress-stats {
    flex-direction: column;
    gap: 12px;
  }

  .task-filters {
    flex-wrap: wrap;
  }

  .youtube-stats {
    grid-template-columns: 1fr;
  }

  .task-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .task-controls {
    justify-content: center;
  }
}
</style>