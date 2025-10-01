<template>
  <div class="container">
    <!-- Header Section -->
    <div class="section-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%); color: white; border: none;">
      <div class="section-header" style="background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2);">
        <span class="section-icon">🎨</span>
        <span class="section-title" style="color: white; font-size: var(--text-xl); font-weight: 700;">Prompt Image History Generator</span>
      </div>
    </div>

    <!-- Content Title Section -->
    <div class="section-card" style="background: linear-gradient(135deg, var(--primary-50) 0%, #dbeafe 100%); border-color: var(--primary-200);">
      <div class="section-header" style="background: rgba(59, 130, 246, 0.1);">
        <span class="section-icon">📝</span>
        <span class="section-title">Content Title</span>
      </div>
      <div class="section-content">
        <div class="input-group">
          <label style="color: var(--primary-700);">Tiêu đề content:</label>
          <input 
            v-model="contentTitle" 
            placeholder="Nhập tiêu đề content của bạn"
            class="input"
          />
        </div>
        <button 
          @click="generatePromptFromTitle" 
          :disabled="!contentTitle.trim() || !apiKey"
          class="btn btn-primary"
          style="width: 100%;"
        >
          <span v-if="!isGenerating">🎯 Tạo Prompt Tự Động</span>
          <span v-else>
            <div class="loading-spinner"></div>
            Đang tạo prompt...
          </span>
        </button>
      </div>
    </div>

    <!-- Image Prompt Section -->
    <div class="section-card" style="background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); border-color: #a855f7;">
      <div class="section-header" style="background: rgba(168, 85, 247, 0.1);">
        <span class="section-icon">🖼️</span>
        <span class="section-title">Image Prompt</span>
      </div>
      <div class="section-content">
        <div class="input-group">
          <label style="color: #7c3aed;">Prompt X (Mô tả ảnh):</label>
          <textarea 
            v-model="imagePrompt" 
            placeholder="Nhập prompt mô tả ảnh hoặc tạo tự động từ tiêu đề"
            class="textarea"
            rows="6"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Generation Settings -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-icon">⚙️</span>
        <span class="section-title">Generation Settings</span>
      </div>
      <div class="section-content">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
          <div class="input-group">
            <label>Số lượng ảnh mỗi đoạn:</label>
            <input 
              type="number" 
              v-model="imageNumber" 
              min="1" 
              max="10" 
              class="input"
            />
          </div>

          <div class="input-group">
            <label>API Key ChatGPT:</label>
            <input
              type="password"
              v-model="apiKey"
              placeholder="Nhập API key ChatGPT"
              class="input"
            />
            <div v-if="apiKey" style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-1);">
              <div class="status-dot active"></div>
              <span style="font-size: var(--text-xs); color: var(--text-secondary);">API Key đã lưu</span>
            </div>
          </div>

          <div class="input-group">
            <label>Thư mục lưu:</label>
            <button 
              @click="chooseFolder" 
              class="btn btn-secondary"
              style="width: 100%;"
            >
              📂 {{ folderPath ? 'Đã chọn thư mục' : 'Chọn thư mục lưu' }}
            </button>
          </div>
        </div>

        <div v-if="folderPath" style="margin-top: var(--space-4); padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-lg); display: flex; align-items: center; gap: var(--space-2);">
          <span style="font-size: var(--text-lg);">📁</span>
          <span style="font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-secondary);">{{ folderPath }}</span>
        </div>
      </div>
    </div>

    <!-- File Management -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-icon">📁</span>
        <span class="section-title">File Management</span>
      </div>
      <div class="section-content">
        <div class="input-group">
          <label>Import File (*.txt):</label>
          <input 
            type="file" 
            @change="handleFileUpload" 
            accept=".txt" 
            class="input"
          />
        </div>

        <div v-if="fileContent" style="margin-top: var(--space-4);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
            <span style="font-weight: 600;">File đã tải: {{ fileName }}</span>
            <button 
              @click="processFile" 
              :disabled="!apiKey || isProcessing"
              class="btn btn-success"
            >
              <span v-if="!isProcessing">🚀 Xử lý File</span>
              <span v-else>
                <div class="loading-spinner"></div>
                Đang xử lý...
              </span>
            </button>
          </div>
          
          <div style="background: var(--bg-secondary); padding: var(--space-3); border-radius: var(--radius-lg); max-height: 200px; overflow-y: auto;">
            <pre style="margin: 0; font-size: var(--text-sm); white-space: pre-wrap;">{{ fileContent.substring(0, 500) }}{{ fileContent.length > 500 ? '...' : '' }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Status -->
    <div v-if="chunks.length > 0" class="section-card">
      <div class="section-header">
        <span class="section-icon">📊</span>
        <span class="section-title">Processing Status</span>
      </div>
      <div class="section-content">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
          <div style="text-align: center; padding: var(--space-4); background: var(--primary-50); border-radius: var(--radius-lg); border: 1px solid var(--primary-200);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--primary-600); margin-bottom: var(--space-1);">{{ chunks.length }}</div>
            <div style="font-size: var(--text-xs); color: var(--primary-700); font-weight: 500;">Tổng chunks</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: var(--success-50); border-radius: var(--radius-lg); border: 1px solid var(--success-500);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--success-600); margin-bottom: var(--space-1);">{{ getStatusCount('success') }}</div>
            <div style="font-size: var(--text-xs); color: var(--success-700); font-weight: 500;">Hoàn thành</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: var(--warning-50); border-radius: var(--radius-lg); border: 1px solid var(--warning-500);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--warning-600); margin-bottom: var(--space-1);">{{ getStatusCount('processing') }}</div>
            <div style="font-size: var(--text-xs); color: var(--warning-700); font-weight: 500;">Đang xử lý</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-1);">{{ Math.round((getStatusCount('success') / chunks.length) * 100) }}%</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Tiến độ</div>
          </div>
        </div>

        <!-- Chunks Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-4);">
          <div 
            v-for="(chunk, index) in chunks" 
            :key="index"
            class="card"
            :style="getChunkCardStyle(chunk.status)"
          >
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600;">Chunk {{ index + 1 }}</span>
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span class="badge" :class="getStatusBadgeClass(chunk.status)">{{ getStatusText(chunk.status) }}</span>
                <div v-if="chunk.status === 'processing'" class="loading-spinner loading-spinner-sm"></div>
              </div>
            </div>
            <div class="card-content">
              <p style="margin: 0; font-size: var(--text-sm); line-height: 1.5; color: var(--text-primary);">
                {{ chunk.content.substring(0, 100) }}{{ chunk.content.length > 100 ? '...' : '' }}
              </p>
              <div v-if="chunk.prompt" style="margin-top: var(--space-3); padding: var(--space-2); background: var(--bg-secondary); border-radius: var(--radius-md);">
                <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-1);">Generated Prompt:</div>
                <p style="margin: 0; font-size: var(--text-xs); color: var(--text-secondary);">{{ chunk.prompt.substring(0, 150) }}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History -->
    <div v-if="history.length > 0" class="section-card">
      <div class="section-header">
        <span class="section-icon">📚</span>
        <span class="section-title">Generation History</span>
        <button @click="clearHistory" class="btn btn-ghost btn-sm" style="margin-left: auto;">
          🗑️ Clear History
        </button>
      </div>
      <div class="section-content">
        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          <div 
            v-for="(item, index) in history.slice().reverse()" 
            :key="index"
            style="padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-lg); border-left: 4px solid var(--primary-500);"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
              <span style="font-weight: 600; font-size: var(--text-sm);">{{ item.title || 'Untitled' }}</span>
              <span style="font-size: var(--text-xs); color: var(--text-secondary);">{{ formatDate(item.timestamp) }}</span>
            </div>
            <p style="margin: 0; font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.4;">
              {{ item.prompt.substring(0, 200) }}{{ item.prompt.length > 200 ? '...' : '' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storage from '../utils/storage.js'

export default {
  name: 'PromptImage',
  data() {
    return {
      contentTitle: '',
      imagePrompt: '',
      imageNumber: 1,
      apiKey: '',
      folderPath: null,
      fileContent: '',
      fileName: '',
      chunks: [],
      history: [],
      isGenerating: false,
      isProcessing: false
    }
  },
  methods: {
    getStatusCount(status) {
      return this.chunks.filter(chunk => chunk.status === status).length
    },
    
    getStatusText(status) {
      switch(status) {
        case 'success': return 'Hoàn thành'
        case 'processing': return 'Đang xử lý'
        case 'error': return 'Lỗi'
        default: return 'Chờ xử lý'
      }
    },
    
    getStatusBadgeClass(status) {
      switch(status) {
        case 'success': return 'badge-success'
        case 'processing': return 'badge-warning'
        case 'error': return 'badge-error'
        default: return 'badge-primary'
      }
    },
    
    getChunkCardStyle(status) {
      switch(status) {
        case 'success': 
          return {
            'border-left': '4px solid var(--success-500)',
            'background': 'linear-gradient(135deg, var(--success-50) 0%, white 100%)'
          }
        case 'processing': 
          return {
            'border-left': '4px solid var(--warning-500)',
            'background': 'linear-gradient(135deg, var(--warning-50) 0%, white 100%)',
            'box-shadow': '0 4px 20px rgba(245, 158, 11, 0.3)'
          }
        case 'error': 
          return {
            'border-left': '4px solid var(--error-500)',
            'background': 'linear-gradient(135deg, var(--error-50) 0%, white 100%)'
          }
        default: 
          return {
            'border-left': '4px solid var(--border-medium)'
          }
      }
    },
    
    async generatePromptFromTitle() {
      if (!this.contentTitle.trim() || !this.apiKey) return
      
      this.isGenerating = true
      try {
        const prompt = await this.callChatGPTAPI(
          `Tạo một prompt mô tả hình ảnh chi tiết cho nội dung: "${this.contentTitle}". Prompt phải bằng tiếng Anh, mô tả cụ thể về hình ảnh, màu sắc, bối cảnh, phong cách. Chỉ trả về prompt, không giải thích thêm.`
        )
        
        this.imagePrompt = prompt
        
        // Save to history
        this.history.push({
          title: this.contentTitle,
          prompt: prompt,
          timestamp: new Date()
        })
        this.saveHistory()
        
      } catch (error) {
        console.error('Error generating prompt:', error)
        alert('Lỗi khi tạo prompt: ' + error.message)
      } finally {
        this.isGenerating = false
      }
    },
    
    async chooseFolder() {
      try {
        this.folderPath = await window.electronAPI?.chooseFolder?.() || "Downloads (default)"
        this.saveSettings()
      } catch (error) {
        console.error("Error choosing folder:", error)
      }
    },
    
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      this.fileName = file.name
      const reader = new FileReader()
      reader.onload = (e) => {
        this.fileContent = e.target.result
      }
      reader.readAsText(file)
    },
    
    async processFile() {
      if (!this.fileContent || !this.apiKey) return
      
      this.isProcessing = true
      this.chunks = []
      
      try {
        // Split content into chunks
        const chunkSize = 1000
        const contentChunks = this.splitIntoChunks(this.fileContent, chunkSize)
        
        // Initialize chunks
        this.chunks = contentChunks.map((content, index) => ({
          id: index + 1,
          content: content,
          prompt: '',
          status: 'pending'
        }))
        
        // Process each chunk
        for (let i = 0; i < this.chunks.length; i++) {
          const chunk = this.chunks[i]
          chunk.status = 'processing'
          
          try {
            const prompt = await this.callChatGPTAPI(
              `Tạo ${this.imageNumber} prompt mô tả hình ảnh chi tiết cho nội dung sau: "${chunk.content}". Mỗi prompt phải bằng tiếng Anh, mô tả cụ thể về hình ảnh, màu sắc, bối cảnh, phong cách. Trả về danh sách các prompt, mỗi prompt trên một dòng.`
            )
            
            chunk.prompt = prompt
            chunk.status = 'success'
            
            // Save to file if folder is selected
            if (this.folderPath) {
              await this.savePromptToFile(chunk.id, prompt)
            }
            
          } catch (error) {
            chunk.status = 'error'
            console.error(`Error processing chunk ${chunk.id}:`, error)
          }
          
          // Delay between requests
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        
      } catch (error) {
        console.error('Error processing file:', error)
        alert('Lỗi khi xử lý file: ' + error.message)
      } finally {
        this.isProcessing = false
      }
    },
    
    splitIntoChunks(text, chunkSize) {
      const chunks = []
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize))
      }
      return chunks
    },
    
    async callChatGPTAPI(prompt) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.choices[0].message.content.trim()
    },
    
    async savePromptToFile(chunkId, prompt) {
      try {
        await window.electronAPI?.saveToFolder?.(
          this.folderPath,
          `prompt_chunk_${chunkId}.txt`,
          new TextEncoder().encode(prompt)
        )
      } catch (error) {
        console.error('Error saving prompt to file:', error)
      }
    },
    
    formatDate(date) {
      return new Date(date).toLocaleString('vi-VN')
    },
    
    clearHistory() {
      if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử?')) {
        this.history = []
        this.saveHistory()
      }
    },
    
    saveSettings() {
      const settings = {
        imageNumber: this.imageNumber,
        folderPath: this.folderPath
      }
      storage.setPromptSettings(settings)
    },
    
    loadSettings() {
      const settings = storage.getPromptSettings()
      this.imageNumber = settings.imageNumber || 1
      this.folderPath = settings.folderPath || null
    },
    
    saveHistory() {
      storage.setPromptHistory(this.history)
    },
    
    loadHistory() {
      this.history = storage.getPromptHistory()
    }
  },
  
  mounted() {
    // Load saved data
    this.apiKey = storage.getPromptApiKey()
    this.loadSettings()
    this.loadHistory()
  },
  
  watch: {
    apiKey() {
      storage.setPromptApiKey(this.apiKey)
    },
    imageNumber() {
      this.saveSettings()
    },
    folderPath() {
      this.saveSettings()
    }
  }
}
</script>