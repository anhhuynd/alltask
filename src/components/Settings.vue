<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="settings-header">
      <h1 class="settings-title">
        <span class="title-icon">⚙️</span>
        Cài đặt ứng dụng
      </h1>
      <p class="settings-subtitle">Quản lý cấu hình và tùy chỉnh ứng dụng của bạn</p>
    </div>

    <!-- API Configuration -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🔑</span>
          API Configuration
        </h2>
        <button @click="testAllAPIs" class="test-btn" :disabled="testingAPIs">
          <span v-if="!testingAPIs">🧪 Test All APIs</span>
          <span v-else>
            <div class="loading-spinner"></div>
            Testing...
          </span>
        </button>
      </div>
      <div class="section-content">
        <div class="api-grid">
          <div v-for="api in apiConfigs" :key="api.id" class="api-card">
            <div class="api-header">
              <div class="api-info">
                <div class="api-name">{{ api.name }}</div>
                <div class="api-description">{{ api.description }}</div>
              </div>
              <div class="api-status" :class="api.status">
                <div class="status-dot"></div>
                {{ getStatusText(api.status) }}
              </div>
            </div>
            <div class="api-form">
              <div class="form-group">
                <label>API Key:</label>
                <div class="input-with-action">
                  <input 
                    :type="api.showKey ? 'text' : 'password'"
                    v-model="api.key"
                    :placeholder="`Nhập ${api.name} API Key`"
                    class="form-input"
                  />
                  <button 
                    @click="api.showKey = !api.showKey"
                    class="toggle-btn"
                  >
                    {{ api.showKey ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>
              <div v-if="api.endpoint" class="form-group">
                <label>Endpoint:</label>
                <input 
                  v-model="api.endpoint"
                  placeholder="API Endpoint URL"
                  class="form-input"
                />
              </div>
              <div class="api-actions">
                <button @click="testAPI(api)" class="btn btn-outline" :disabled="!api.key">
                  Test Connection
                </button>
                <button @click="saveAPI(api)" class="btn btn-primary" :disabled="!api.key">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Preferences -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🎨</span>
          Giao diện & Trải nghiệm
        </h2>
      </div>
      <div class="section-content">
        <div class="preferences-grid">
          <div class="preference-group">
            <h3 class="group-title">Theme & Display</h3>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Theme</div>
                <div class="preference-description">Chọn giao diện sáng hoặc tối</div>
              </div>
              <div class="theme-selector">
                <button 
                  v-for="theme in themes"
                  :key="theme.id"
                  @click="selectedTheme = theme.id"
                  class="theme-btn"
                  :class="{ active: selectedTheme === theme.id }"
                >
                  <span class="theme-icon">{{ theme.icon }}</span>
                  <span class="theme-name">{{ theme.name }}</span>
                </button>
              </div>
            </div>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Language</div>
                <div class="preference-description">Ngôn ngữ hiển thị</div>
              </div>
              <select v-model="selectedLanguage" class="form-select">
                <option value="vi">🇻🇳 Tiếng Việt</option>
                <option value="en">🇺🇸 English</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ja">🇯🇵 日本語</option>
              </select>
            </div>
          </div>

          <div class="preference-group">
            <h3 class="group-title">Notifications</h3>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Desktop Notifications</div>
                <div class="preference-description">Hiển thị thông báo trên desktop</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notifications.desktop">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Sound Notifications</div>
                <div class="preference-description">Phát âm thanh khi có thông báo</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notifications.sound">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Task Reminders</div>
                <div class="preference-description">Nhắc nhở về tasks sắp đến hạn</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="notifications.taskReminders">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="preference-group">
            <h3 class="group-title">Performance</h3>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Auto-save Interval</div>
                <div class="preference-description">Tự động lưu dữ liệu (giây)</div>
              </div>
              <input 
                type="number" 
                v-model="performance.autoSaveInterval"
                min="10"
                max="300"
                class="form-input"
                style="width: 100px;"
              />
            </div>
            <div class="preference-item">
              <div class="preference-info">
                <div class="preference-label">Animation Effects</div>
                <div class="preference-description">Hiệu ứng chuyển động</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="performance.animations">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Storage & Data -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">💾</span>
          Lưu trữ & Dữ liệu
        </h2>
      </div>
      <div class="section-content">
        <div class="storage-grid">
          <div class="storage-item">
            <div class="storage-info">
              <div class="storage-icon">📁</div>
              <div class="storage-details">
                <div class="storage-label">Default Download Folder</div>
                <div class="storage-path">{{ defaultFolder || 'Chưa chọn' }}</div>
              </div>
            </div>
            <button @click="chooseDefaultFolder" class="btn btn-outline">
              📂 Chọn thư mục
            </button>
          </div>

          <div class="storage-item">
            <div class="storage-info">
              <div class="storage-icon">🗄️</div>
              <div class="storage-details">
                <div class="storage-label">Local Storage Usage</div>
                <div class="storage-usage">
                  <div class="usage-bar">
                    <div class="usage-fill" :style="{ width: storageUsage + '%' }"></div>
                  </div>
                  <div class="usage-text">{{ storageUsage }}% ({{ formatBytes(usedStorage) }} / {{ formatBytes(totalStorage) }})</div>
                </div>
              </div>
            </div>
            <button @click="clearStorage" class="btn btn-danger">
              🗑️ Clear Data
            </button>
          </div>
        </div>

        <div class="data-management">
          <h3 class="group-title">Data Management</h3>
          <div class="data-actions">
            <button @click="exportData" class="btn btn-success">
              📤 Export All Data
            </button>
            <button @click="importData" class="btn btn-primary">
              📥 Import Data
            </button>
            <button @click="resetSettings" class="btn btn-warning">
              🔄 Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- About & Info -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">ℹ️</span>
          Thông tin ứng dụng
        </h2>
      </div>
      <div class="section-content">
        <div class="about-grid">
          <div class="app-info">
            <div class="app-logo">
              <div class="logo-icon">🎯</div>
              <div class="logo-text">
                <div class="app-name">HUY Media Suite</div>
                <div class="app-version">Version {{ appVersion }}</div>
              </div>
            </div>
            <div class="app-description">
              Bộ công cụ đa năng cho content creator, hỗ trợ TTS, dịch thuật, quản lý task và tạo prompt AI.
            </div>
          </div>

          <div class="system-info">
            <h4>System Information</h4>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Platform:</span>
                <span class="info-value">{{ systemInfo.platform }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Node.js:</span>
                <span class="info-value">{{ systemInfo.nodeVersion }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Memory:</span>
                <span class="info-value">{{ formatBytes(systemInfo.memory) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated:</span>
                <span class="info-value">{{ lastUpdated }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="support-links">
          <h4>Support & Resources</h4>
          <div class="links-grid">
            <a href="#" class="support-link">
              <span class="link-icon">📖</span>
              <span class="link-text">Documentation</span>
            </a>
            <a href="#" class="support-link">
              <span class="link-icon">🐛</span>
              <span class="link-text">Report Bug</span>
            </a>
            <a href="#" class="support-link">
              <span class="link-icon">💡</span>
              <span class="link-text">Feature Request</span>
            </a>
            <a href="#" class="support-link">
              <span class="link-icon">📧</span>
              <span class="link-text">Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Actions -->
    <div class="save-actions">
      <button @click="resetAllSettings" class="btn btn-outline">
        🔄 Reset All
      </button>
      <button @click="saveAllSettings" class="btn btn-primary btn-large">
        💾 Save All Settings
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      testingAPIs: false,
      selectedTheme: 'light',
      selectedLanguage: 'vi',
      defaultFolder: null,
      appVersion: '1.0.0',
      
      apiConfigs: [
        {
          id: 'chatgpt',
          name: 'ChatGPT',
          description: 'OpenAI GPT API for text generation and translation',
          key: '',
          endpoint: 'https://api.openai.com/v1',
          status: 'disconnected',
          showKey: false
        },
        {
          id: 'elevenlabs',
          name: 'ElevenLabs',
          description: 'Text-to-Speech API for voice synthesis',
          key: '',
          endpoint: 'https://api.elevenlabs.io/v1',
          status: 'disconnected',
          showKey: false
        },
         {
          id: 'youtube',
          name: 'Youtube',
          description: 'Youtube API for vsiew',
          key: '',
          endpoint: 'https://www.googleapis.com/youtube/v3',
          status: 'disconnected',
          showKey: false
        },
      ],
      
      themes: [
        { id: 'light', name: 'Light', icon: '☀️' },
        { id: 'dark', name: 'Dark', icon: '🌙' },
        { id: 'auto', name: 'Auto', icon: '🌓' }
      ],
      
      notifications: {
        desktop: true,
        sound: true,
        taskReminders: true
      },
      
      performance: {
        autoSaveInterval: 30,
        animations: true
      },
      
      storageUsage: 45,
      usedStorage: 2.3 * 1024 * 1024 * 1024, // 2.3GB
      totalStorage: 5 * 1024 * 1024 * 1024, // 5GB
      
      systemInfo: {
        platform: 'Windows 11',
        nodeVersion: 'v18.17.0',
        memory: 16 * 1024 * 1024 * 1024 // 16GB
      },
      
      lastUpdated: '2024-01-15'
    }
  },
  
  methods: {
    async testAPI(api) {
      if (!api.key) return
      
      api.status = 'testing'
      
      try {
        // Simulate API test
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mock test result
        const success = Math.random() > 0.3
        api.status = success ? 'connected' : 'error'
        
        if (success) {
          this.showToast(`${api.name} API connection successful!`, 'success')
        } else {
          this.showToast(`${api.name} API connection failed!`, 'error')
        }
      } catch (error) {
        api.status = 'error'
        this.showToast(`Error testing ${api.name} API: ${error.message}`, 'error')
      }
    },
    
    async testAllAPIs() {
      this.testingAPIs = true
      
      for (const api of this.apiConfigs) {
        if (api.key) {
          await this.testAPI(api)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
      
      this.testingAPIs = false
    },
    
    saveAPI(api) {
      localStorage.setItem(`api-${api.id}-key`, api.key)
      if (api.endpoint) {
        localStorage.setItem(`api-${api.id}-endpoint`, api.endpoint)
      }
      this.showToast(`${api.name} API settings saved!`, 'success')
    },
    
    async chooseDefaultFolder() {
      try {
        this.defaultFolder = await window.electronAPI?.chooseFolder?.() || "Downloads"
        localStorage.setItem('default-download-folder', this.defaultFolder)
      } catch (error) {
        console.error("Error choosing folder:", error)
      }
    },
    
    clearStorage() {
      if (confirm('Are you sure you want to clear all local data? This action cannot be undone.')) {
        localStorage.clear()
        this.showToast('Local storage cleared successfully!', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    },
    
    exportData() {
      const data = {
        settings: {
          theme: this.selectedTheme,
          language: this.selectedLanguage,
          notifications: this.notifications,
          performance: this.performance
        },
        apis: this.apiConfigs.map(api => ({
          id: api.id,
          key: api.key,
          endpoint: api.endpoint
        })),
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `huy-media-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.showToast('Settings exported successfully!', 'success')
    },
    
    importData() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result)
              
              // Apply settings
              if (data.settings) {
                this.selectedTheme = data.settings.theme || 'light'
                this.selectedLanguage = data.settings.language || 'vi'
                this.notifications = { ...this.notifications, ...data.settings.notifications }
                this.performance = { ...this.performance, ...data.settings.performance }
              }
              
              // Apply API settings
              if (data.apis) {
                data.apis.forEach(apiData => {
                  const api = this.apiConfigs.find(a => a.id === apiData.id)
                  if (api) {
                    api.key = apiData.key || ''
                    api.endpoint = apiData.endpoint || api.endpoint
                  }
                })
              }
              
              this.showToast('Settings imported successfully!', 'success')
            } catch (error) {
              this.showToast('Error importing settings: Invalid file format', 'error')
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
    },
    
    resetSettings() {
      if (confirm('Reset all settings to default values?')) {
        this.selectedTheme = 'light'
        this.selectedLanguage = 'vi'
        this.notifications = {
          desktop: true,
          sound: true,
          taskReminders: true
        }
        this.performance = {
          autoSaveInterval: 30,
          animations: true
        }
        this.showToast('Settings reset to default!', 'success')
      }
    },
    
    resetAllSettings() {
      if (confirm('Reset ALL settings including API keys? This cannot be undone.')) {
        localStorage.clear()
        window.location.reload()
      }
    },
    
    saveAllSettings() {
      // Save theme and language
      localStorage.setItem('app-theme', this.selectedTheme)
      localStorage.setItem('app-language', this.selectedLanguage)
      
      // Save preferences
      localStorage.setItem('app-notifications', JSON.stringify(this.notifications))
      localStorage.setItem('app-performance', JSON.stringify(this.performance))
      
      // Save API configs
      this.apiConfigs.forEach(api => {
        this.saveAPI(api)
      })
      
      this.showToast('All settings saved successfully!', 'success')
    },
    
    getStatusText(status) {
      const texts = {
        connected: 'Connected',
        disconnected: 'Disconnected',
        testing: 'Testing...',
        error: 'Error'
      }
      return texts[status] || 'Unknown'
    },
    
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    showToast(message, type = 'info') {
      // Toast implementation
      console.log(`${type.toUpperCase()}: ${message}`)
    },
    
    loadSettings() {
      // Load saved settings
      this.selectedTheme = localStorage.getItem('app-theme') || 'light'
      this.selectedLanguage = localStorage.getItem('app-language') || 'vi'
      this.defaultFolder = localStorage.getItem('default-download-folder')
      
      const savedNotifications = localStorage.getItem('app-notifications')
      if (savedNotifications) {
        this.notifications = { ...this.notifications, ...JSON.parse(savedNotifications) }
      }
      
      const savedPerformance = localStorage.getItem('app-performance')
      if (savedPerformance) {
        this.performance = { ...this.performance, ...JSON.parse(savedPerformance) }
      }
      
      // Load API keys
      this.apiConfigs.forEach(api => {
        const savedKey = localStorage.getItem(`api-${api.id}-key`)
        const savedEndpoint = localStorage.getItem(`api-${api.id}-endpoint`)
        if (savedKey) {
          api.key = savedKey
          api.status = 'connected'
        }
        if (savedEndpoint) {
          api.endpoint = savedEndpoint
        }
      })
    }
  },
  
  mounted() {
    this.loadSettings()
  }
}
</script>

<style scoped>
.settings-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-header {
  text-align: center;
  margin-bottom: 16px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
}

.settings-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Section Card */
.section-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.section-header {
  background: #f8f9fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 20px;
}

.section-content {
  padding: 24px;
}

/* API Configuration */
.api-grid {
  display: grid;
  gap: 20px;
}

.api-card {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.api-description {
  font-size: 14px;
  color: #6b7280;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 16px;
}

.api-status.connected {
  background: #d1fae5;
  color: #065f46;
}

.api-status.disconnected {
  background: #f3f4f6;
  color: #374151;
}

.api-status.testing {
  background: #fef3c7;
  color: #92400e;
}

.api-status.error {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.api-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.form-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.input-with-action {
  display: flex;
  gap: 8px;
}

.input-with-action .form-input {
  flex: 1;
}

.toggle-btn {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.api-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-outline {
  background: transparent;
  color: #374151;
  border-color: #d1d5db;
}

.btn-success {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-warning {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
}

.test-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Preferences */
.preferences-grid {
  display: grid;
  gap: 32px;
}

.preference-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #374151;
  border-bottom: 1px solid #e1e5e9;
  padding-bottom: 8px;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.preference-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.preference-description {
  font-size: 12px;
  color: #6b7280;
}

/* Theme Selector */
.theme-selector {
  display: flex;
  gap: 8px;
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn.active {
  border-color: #3b82f6;
  background: #dbeafe;
}

.theme-icon {
  font-size: 20px;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #3b82f6;
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* Storage */
.storage-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.storage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.storage-icon {
  font-size: 32px;
}

.storage-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.storage-path {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

.storage-usage {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usage-bar {
  width: 200px;
  height: 6px;
  background: #e1e5e9;
  border-radius: 3px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  transition: width 0.3s;
}

.usage-text {
  font-size: 12px;
  color: #6b7280;
}

.data-management {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e1e5e9;
}

.data-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* About */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.app-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-logo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.app-name {
  font-size: 20px;
  font-weight: 700;
}

.app-version {
  font-size: 14px;
  color: #6b7280;
}

.app-description {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.system-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-label {
  color: #6b7280;
}

.info-value {
  font-weight: 500;
}

.support-links h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.support-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  text-decoration: none;
  color: #374151;
  transition: all 0.2s;
}

.support-link:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.link-icon {
  font-size: 16px;
}

.link-text {
  font-size: 14px;
  font-weight: 500;
}

/* Save Actions */
.save-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
}

/* Loading Spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
    gap: 16px;
  }

  .about-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }

  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .storage-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .data-actions {
    flex-direction: column;
  }

  .save-actions {
    flex-direction: column;
    gap: 12px;
  }
}
</style>