<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-left">
        <div class="header-icon">🎨</div>
        <h1 class="header-title">Prompt Image History Generator</h1>
      </div>
      <div class="header-tabs">
        <button 
          v-for="tab in mainTabs" 
          :key="tab.key"
          @click="activeTab = tab.key"
          class="tab-button"
          :class="{ active: activeTab === tab.key }"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- API Configuration Section -->
    <!-- <div class="section-card">
      <div class="section-header">
        <div class="section-icon">🔑</div>
        <h2 class="section-title">API Configuration</h2>
        <div class="api-status">
          <div class="status-dot" :class="{ active: apiKey }"></div>
          <span class="status-text">{{ apiKey ? 'Connected' : 'Not Connected' }}</span>
        </div>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label class="form-label">API Key ChatGPT:</label>
          <input 
            type="password" 
            v-model="apiKey" 
            placeholder="Nhập API key ChatGPT"
            class="form-input"
          />
        </div>
      </div>
    </div> -->

    <!-- Settings Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon">⚙️</div>
        <h2 class="section-title">Generation Settings</h2>
      </div>
      <div class="section-content">
        <div class="settings-grid">
          <div class="form-group">
            <label class="form-label">Số lượng ảnh mỗi đoạn:</label>
            <input 
              type="number" 
              v-model="imageNumber" 
              min="1" 
              max="20" 
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Thư mục lưu:</label>
            <button 
              @click="chooseFolder" 
              class="btn btn-secondary full-width"
            >
              📂 {{ folderPath ? 'Đã chọn thư mục' : 'Chọn thư mục lưu' }}
            </button>
          </div>
        </div>

        <div v-if="folderPath" class="folder-display">
          <span class="folder-icon">📁</span>
          <span class="folder-path">{{ folderPath }}</span>
        </div>
      </div>
    </div>

    <!-- File Management Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon">📁</div>
        <h2 class="section-title">File Management</h2>
      </div>
      <div class="section-content">
        <div class="file-management-grid">
          <div class="file-upload-section">
            <label class="form-label">Import File (*.txt):</label>
            <div class="file-input-wrapper">
              <input 
                type="file" 
                @change="handleFileUpload" 
                accept=".txt" 
                class="file-input"
                id="file-upload"
                ref="fileInput"
              />
              <label for="file-upload" class="file-input-label">
                📄 Choose File
              </label>
              <span class="file-status">{{ fileName || 'No file chosen' }}</span>
            </div>
          </div>

          <div class="process-section">
            <button 
              @click="processFile" 
              :disabled="!apiKey || isProcessing || !fileContent"
              class="btn btn-primary process-btn"
            >
              <span v-if="!isProcessing">🚀 Xử lý File</span>
              <span v-else class="loading-content">
                <div class="loading-spinner"></div>
                Đang xử lý...
              </span>
            </button>
          </div>
        </div>

        <div v-if="fileContent" class="file-preview">
          <div class="file-preview-header">
            <span class="file-name-display">File đã tải: {{ fileName }}</span>
          </div>
          <div class="file-content-preview">
            <pre>{{ fileContent.substring(0, 500) }}{{ fileContent.length > 500 ? '...' : '' }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Status Section -->
    <div v-if="chunks.length > 0" class="section-card">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <h2 class="section-title">Processing Status</h2>
        <div class="progress-summary">
          <span class="progress-text">{{ getStatusCount('success') }}/{{ chunks.length }}</span>
          <div class="mini-progress-bar">
            <div class="mini-progress-fill" :style="{ width: getProgressPercentage() + '%' }"></div>
          </div>
        </div>
      </div>
      <div class="section-content">
        <!-- Overall Progress -->
        <div class="overall-progress">
          <div class="progress-header">
            <span class="progress-label">Tiến độ tổng thể</span>
            <span class="progress-percentage">{{ Math.round(getProgressPercentage()) }}%</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getProgressPercentage() + '%' }"
              ></div>
            </div>
          </div>
          <div class="progress-stats">
            <span class="stat-item success">✅ Hoàn thành: {{ getStatusCount('success') }}</span>
            <span class="stat-item processing">⏳ Đang xử lý: {{ getStatusCount('processing') }}</span>
            <span class="stat-item pending">⏸️ Chờ xử lý: {{ getStatusCount('pending') }}</span>
            <span class="stat-item error" v-if="getStatusCount('error') > 0">❌ Lỗi: {{ getStatusCount('error') }}</span>
          </div>
        </div>

        <!-- Time Estimation -->
        <div v-if="isProcessing" class="time-estimation">
          <div class="time-info">
            <span class="time-label">⏱️ Thời gian ước tính:</span>
            <span class="time-value">{{ getEstimatedTime() }}</span>
          </div>
          <div class="time-info">
            <span class="time-label">🕐 Thời gian đã trôi qua:</span>
            <span class="time-value">{{ getElapsedTime() }}</span>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">📋</div>
            <div class="stat-number">{{ chunks.length }}</div>
            <div class="stat-label">Tổng chunks</div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon">✅</div>
            <div class="stat-number">{{ getStatusCount('success') }}</div>
            <div class="stat-label">Hoàn thành</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">⏳</div>
            <div class="stat-number">{{ getStatusCount('processing') }}</div>
            <div class="stat-label">Đang xử lý</div>
          </div>
          <div class="stat-card error" v-if="getStatusCount('error') > 0">
            <div class="stat-icon">❌</div>
            <div class="stat-number">{{ getStatusCount('error') }}</div>
            <div class="stat-label">Lỗi</div>
          </div>
        </div>

        <!-- Chunks Grid -->
        <div class="chunks-container">
          <div class="chunks-grid">
            <div 
              v-for="(chunk, index) in chunks" 
              :key="index"
              :ref="`chunk-${index}`"
              class="chunk-card"
              :class="getChunkCardClass(chunk.status)"
            >
              <div class="chunk-header">
                <span class="chunk-title">Chunk {{ index + 1 }}</span>
                <div class="chunk-status">
                  <span class="status-badge" :class="getStatusBadgeClass(chunk.status)">
                    {{ getStatusText(chunk.status) }}
                  </span>
                  <div v-if="chunk.status === 'processing'" class="loading-spinner small"></div>
                </div>
              </div>
              <div class="chunk-content">
                <p class="chunk-text">{{ chunk.content.substring(0, 100) }}{{ chunk.content.length > 100 ? '...' : '' }}</p>
                
                <!-- Processing Animation -->
                <div v-if="chunk.status === 'processing'" class="processing-animation">
                  <div class="processing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="processing-text">Đang tạo prompt...</span>
                </div>

                <!-- Generated Prompt -->
                <div v-if="chunk.prompt" class="chunk-prompt">
                  <div class="prompt-label">Generated Prompt:</div>
                  <div class="prompt-text">{{ chunk.prompt.substring(0, 200) }}{{ chunk.prompt.length > 200 ? '...' : '' }}</div>
                  <button 
                    @click="toggleFullPrompt(index)" 
                    class="btn btn-ghost btn-sm"
                  >
                    {{ chunk.showFullPrompt ? 'Thu gọn' : 'Xem đầy đủ' }}
                  </button>
                  <div v-if="chunk.showFullPrompt" class="full-prompt">
                    <pre>{{ chunk.prompt }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <!-- <div v-if="history.length > 0" class="section-card">
      <div class="section-header">
        <div class="section-icon">📚</div>
        <h2 class="section-title">Generation History</h2>
        <button @click="clearHistory" class="btn btn-ghost btn-sm">
          🗑️ Clear History
        </button>
      </div>
      <div class="section-content">
        <div class="history-list">
          <div 
            v-for="(item, index) in history.slice().reverse()" 
            :key="index"
            class="history-item"
          >
            <div class="history-header">
              <span class="history-title">{{ item.title || 'Untitled' }}</span>
              <span class="history-date">{{ formatDate(item.timestamp) }}</span>
            </div>
            <p class="history-prompt">{{ item.prompt.substring(0, 200) }}{{ item.prompt.length > 200 ? '...' : '' }}</p>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="success-message">
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <div class="success-text">
          <h3>Xử lý hoàn thành!</h3>
          <p>Đã tạo thành công {{ getStatusCount('success') }} prompts và lưu vào file text_final.txt</p>
        </div>
        <button @click="showSuccessMessage = false" class="btn btn-ghost btn-sm">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PromptImageClassic',
  data() {
    return {
      activeTab: 'tasks',
      apiKey: '',
      imageNumber: 10,
      fileContent: '',
      fileName: '',
      folderPath: '',
      message: '',
      isProcessing: false,
      currentProcessingIndex: -1,
      startTime: null,
      showSuccessMessage: false,
      chunks: [],
      history: [],
      mainTabs: [
        { key: 'tasks', label: 'Tasks' },
        { key: 'tts', label: 'TTS' },
        { key: 'translate', label: 'Dịch thuật' },
        { key: 'prompts', label: 'Prompts' }
      ]
    }
  },
  computed: {
    overallProgress() {
      if (this.chunks.length === 0) return 0
      return (this.getStatusCount('success') / this.chunks.length) * 100
    }
  },
  mounted() {
    const savedKey = localStorage.getItem("api-chatgpt-key")
    if (savedKey) {
      this.apiKey = savedKey
    }
    this.loadHistory()
  },
  methods: {
    async chooseFolder() {
      try {
        this.folderPath = await window.electronAPI?.chooseFolder?.() || "Downloads"
        this.message = "Đã chọn: " + this.folderPath
      } catch (error) {
        console.error('Error choosing folder:', error)
        this.folderPath = "Downloads"
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      this.fileName = file.name
      const reader = new FileReader()
      reader.onload = () => {
        this.fileContent = reader.result
        this.parseSubtitles()
      }
      reader.readAsText(file)
    },

    parseSubtitles() {
      const blocks = this.fileContent
        .split(/\[\d+\]/)
        .map(b => b.trim())
        .filter(b => b)
      const matches = [...this.fileContent.matchAll(/\[(\d+)\]/g)]

      this.chunks = []
      blocks.forEach((text, i) => {
        this.chunks.push({
          index: parseInt(matches[i][1]),
          content: text,
          status: 'pending',
          showFullPrompt: false
        })
      })
    },

    getStatusCount(status) {
      return this.chunks.filter(chunk => chunk.status === status).length
    },

    getProgressPercentage() {
      if (this.chunks.length === 0) return 0
      return (this.getStatusCount('success') / this.chunks.length) * 100
    },

    getEstimatedTime() {
      if (!this.startTime || this.chunks.length === 0) return '---'
      
      const elapsed = Date.now() - this.startTime.getTime()
      const completed = this.getStatusCount('success')
      const remaining = this.chunks.length - completed
      
      if (completed === 0) return '---'
      
      const avgTimePerChunk = elapsed / completed
      const estimatedRemaining = (avgTimePerChunk * remaining) / 1000
      
      const minutes = Math.floor(estimatedRemaining / 60)
      const seconds = Math.floor(estimatedRemaining % 60)
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },

    getElapsedTime() {
      if (!this.startTime) return '00:00'
      
      const elapsed = (Date.now() - this.startTime.getTime()) / 1000
      const minutes = Math.floor(elapsed / 60)
      const seconds = Math.floor(elapsed % 60)
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    },

    getChunkCardClass(status) {
      return `status-${status}`
    },

    getStatusBadgeClass(status) {
      const classMap = {
        'success': 'success',
        'processing': 'warning',
        'error': 'danger',
        'pending': 'primary'
      }
      return classMap[status] || 'primary'
    },

    getStatusText(status) {
      const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'success': 'Hoàn thành',
        'error': 'Lỗi'
      }
      return statusMap[status] || status
    },

    async scrollToCurrentChunk(index) {
      await this.$nextTick()
      const chunkElement = this.$refs[`chunk-${index}`]?.[0]
      if (chunkElement) {
        chunkElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    },

    async processFile() {
      if (!this.apiKey) {
        alert("Vui lòng nhập API Key.")
        return
      }

      this.isProcessing = true
      this.startTime = new Date()
      let finalText = ""

      for (let i = 0; i < this.chunks.length; i++) {
        const chunk = this.chunks[i]
        if (chunk.status === "success") continue

        chunk.status = "processing"
        this.currentProcessingIndex = i

        await this.scrollToCurrentChunk(i)

        try {
          const text = `You are a professional cinematic scene-to-image prompt writer, trained in Midjourney and Stable Diffusion advanced composition.

Task:
Analyze the narrative text below and generate **${this.imageNumber} sequential, richly detailed image prompts**, each capturing a visually distinct moment in chronological order.

Each prompt must read like a complete, camera-ready description for hyper-realistic image generation, including:
- Scene composition and focal action
- Character(s) and emotion or posture
- Setting and environment details
- Lighting (natural, torchlight, moonlight, etc.)
- Mood and atmosphere (tone, temperature, feeling)
- Color palette and accent tones
- Texture details (fabric, skin, stone, foliage, metal, etc.)
- Style, depth, and rendering quality (cinematic realism, ultra-high-resolution, soft natural lighting, realistic depth of field, fine texture fidelity)
- Aspect ratio and output clarity (16:9, ultra-HD, 8K, etc.)

Each output must be **a single paragraph**, fluid and vivid, like:
"Ancient Greek outdoor banquet scene set beneath gnarled olive trees on a gentle hillside near Athens at dusk, rustic stone tables and bronze goblets awaiting guests, faint haze of grilled lamb and honeyed wine drifting on the warm summer breeze, textured earth with scattered wildflowers, cicadas hidden in dark foliage, distant marble columns silhouetted against a twilight sky, stars beginning to emerge sharp and clear above the Aegean, tranquil and expectant mood, authentic Mediterranean colors and subtle interplay of shadow and soft natural lighting — hyper-realistic nature photography, 8k ultra-sharp details, true-to-life perspective, soft natural lighting, realistic depth of field, authentic colors, fine textures of bark, stone, foliage, and night sky, 16:9 aspect ratio, ultra-high-resolution (4K)."

Format output as:
[1] 
[2] 
…
[${this.imageNumber}]
Do not add commentary or explanation. Only return the ${this.imageNumber} prompts.

Narrative to visualize: 
${chunk.content}`
          
          const audioBlob = await this.generateAudio(text)
          finalText += audioBlob + "\n"
          chunk.prompt = audioBlob
          chunk.status = "success"
          
          console.log(`✅ Thành công chunk ${chunk.index}`)
        } catch (err) {
          chunk.status = "error"
          console.error(`❌ Lỗi chunk ${chunk.index}:`, err)
          alert(err.message || "Lỗi khi gọi API")
          break
        }

        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      this.isProcessing = false
      this.currentProcessingIndex = -1
      
      try {
        const buffer = new TextEncoder().encode(finalText)
        await window.electronAPI?.saveToFolder?.(
          this.folderPath,
          `text_final.txt`,
          buffer
        )
        
        this.showSuccessMessage = true
        setTimeout(() => {
          this.showSuccessMessage = false
        }, 5000)
      } catch (error) {
        console.error('Error saving file:', error)
      }
      
      this.message = "Đã xử lý xong và lưu file text_final.txt"
    },

    async generateAudio(fullText) {
      const res = await fetch(
        `https://gpt1.shupremium.com/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1",
            messages: [{ role: "user", content: fullText }],
            temperature: 0.7,
          }),
        }
      )
      
      if (!res.ok) throw new Error("Lỗi khi gọi API")
      
      const resData = await res.json()
      return resData.choices[0].message.content
    },

    toggleFullPrompt(index) {
      this.chunks[index].showFullPrompt = !this.chunks[index].showFullPrompt
    },

    clearHistory() {
      this.history = []
      localStorage.removeItem('prompt_history')
    },

    formatDate(date) {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    },

    loadHistory() {
      const saved = localStorage.getItem('prompt_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.history = parsed.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }
    }
  },
  watch: {
    apiKey() {
      localStorage.setItem("api-chatgpt-key", this.apiKey)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-tabs {
  display: flex;
  gap: 4px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #64748b;
}

.tab-button.active {
  background: #1e293b;
  color: white;
}

.tab-button:hover:not(.active) {
  background: #e2e8f0;
  color: #334155;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.section-icon {
  font-size: 20px;
  margin-right: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
}

.section-content {
  padding: 24px;
}

/* API Status */
.api-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: background-color 0.3s ease;
}

.status-dot.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.status-text {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

/* Form Elements */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* Folder Display */
.folder-display {
  margin-top: 16px;
  padding: 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.folder-icon {
  font-size: 18px;
  color: #166534;
}

.folder-path {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 13px;
  color: #166534;
  font-weight: 500;
}

/* File Management - Fixed Layout */
.file-management-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: end;
  margin-bottom: 20px;
}

.file-upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.file-input {
  display: none;
}

.file-input-label {
  padding: 12px 20px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
  white-space: nowrap;
}

.file-input-label:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.file-status {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
  flex: 1;
  min-width: 120px;
}

.process-section {
  display: flex;
  align-items: end;
}

/* Buttons */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #64748b;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #475569;
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-ghost:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-sm {
  padding: 8px 12px;
  font-size: 12px;
}

.full-width {
  width: 100%;
}

.process-btn {
  min-width: 150px;
}

/* Loading */
.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 14px;
  height: 14px;
  border-width: 1px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Progress Summary */
.progress-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.mini-progress-bar {
  width: 80px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.5s ease;
}

/* Overall Progress */
.overall-progress {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.progress-percentage {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.progress-bar-container {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.8s ease;
}

.progress-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 13px;
  font-weight: 500;
}

.stat-item.success { color: #059669; }
.stat-item.processing { color: #f59e0b; }
.stat-item.pending { color: #64748b; }
.stat-item.error { color: #ef4444; }

/* Time Estimation */
.time-estimation {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-label {
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
}

.time-value {
  font-size: 16px;
  font-weight: 700;
  color: #b45309;
  font-family: 'SF Mono', Monaco, monospace;
}

/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.primary {
  border-left: 4px solid #3b82f6;
}

.stat-card.success {
  border-left: 4px solid #10b981;
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-card.error {
  border-left: 4px solid #ef4444;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Chunks Container */
.chunks-container {
  max-height: 800px;
  overflow-y: auto;
  padding-right: 8px;
}

.chunks-container::-webkit-scrollbar {
  width: 6px;
}

.chunks-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.chunks-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chunks-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Chunks Grid */
.chunks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.chunk-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.chunk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chunk-card.status-success {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
}

.chunk-card.status-processing {
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
  animation: pulse 2s infinite;
}

.chunk-card.status-error {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.chunk-card.status-pending {
  border-left: 4px solid #64748b;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.chunk-header {
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chunk-title {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
}

.chunk-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.success {
  background: #dcfce7;
  color: #166534;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.primary {
  background: #dbeafe;
  color: #1e40af;
}

.chunk-content {
  padding: 20px;
}

.chunk-text {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

/* Processing Animation */
.processing-animation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin-bottom: 16px;
}

.processing-dots {
  display: flex;
  gap: 4px;
}

.processing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  animation: bounce 1.4s infinite ease-in-out both;
}

.processing-dots span:nth-child(1) { animation-delay: -0.32s; }
.processing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1);
  }
}

.processing-text {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
}

/* Chunk Prompt */
.chunk-prompt {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.prompt-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.prompt-text {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 12px;
}

.full-prompt {
  margin-top: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.full-prompt pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  color: #374151;
  line-height: 1.4;
}

/* File Preview */
.file-preview {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.file-preview-header {
  background: #f8fafc;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.file-name-display {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.file-content-preview {
  padding: 16px;
  background: #f8fafc;
  max-height: 200px;
  overflow-y: auto;
}

.file-content-preview pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  color: #475569;
  line-height: 1.4;
}

/* History */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  transition: transform 0.2s;
}

.history-item:hover {
  transform: translateX(4px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-title {
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
}

.history-date {
  font-size: 12px;
  color: #64748b;
}

.history-prompt {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}

/* Success Message */
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.success-content {
  background: #10b981;
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 400px;
}

.success-icon {
  font-size: 24px;
}

.success-text h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.success-text p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .file-management-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .file-input-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .file-status {
    text-align: center;
  }

  .process-section {
    justify-content: center;
  }

  .chunks-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .time-estimation {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-tabs {
    flex-wrap: wrap;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .file-input-wrapper {
    align-items: center;
  }
}
</style>