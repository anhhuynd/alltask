<template>
  <div class="prompt-container">
    <!-- Header Section with Gradient -->
    <div class="header-section">
      <div class="header-icon">🎨</div>
      <h1 class="header-title">Prompt Image History Generator</h1>
    </div>

    <!-- Content Title Section -->
    <div class="content-section">
      <div class="section-header">
        <div class="section-icon">📝</div>
        <h2 class="section-title">Content Title</h2>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label class="form-label">Tiêu đề content:</label>
          <input 
            v-model="contentTitle" 
            placeholder="Nhập tiêu đề content của bạn"
            class="form-input"
          />
        </div>
        <button 
          @click="generatePromptFromTitle" 
          :disabled="!contentTitle.trim() || !apiKey"
          class="btn btn-primary full-width"
        >
          <span v-if="!isGenerating">🎯 Tạo Prompt Tự Động</span>
          <span v-else class="loading-content">
            <div class="loading-spinner"></div>
            Đang tạo prompt...
          </span>
        </button>
      </div>
    </div>

    <!-- Image Prompt Section -->
    <div class="prompt-section">
      <div class="section-header">
        <div class="section-icon">🖼️</div>
        <h2 class="section-title">Image Prompt</h2>
      </div>
      <div class="section-content">
        <div class="form-group">
          <label class="form-label">Prompt X (Mô tả ảnh):</label>
          <textarea 
            v-model="imagePrompt" 
            placeholder="Nhập prompt mô tả ảnh hoặc tạo tự động từ tiêu đề"
            class="form-textarea"
            rows="6"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Generation Settings Section -->
    <div class="settings-section">
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
              max="10" 
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
    <div class="file-section">
      <div class="section-header">
        <div class="section-icon">📁</div>
        <h2 class="section-title">File Management</h2>
      </div>
      <div class="section-content">
        <div class="file-management">
          <div class="form-group">
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
                Choose File
              </label>
              <span class="file-status">{{ fileName || 'No file chosen' }}</span>
            </div>
          </div>

          <button 
            @click="processFile" 
            :disabled="!apiKey || isProcessing || !fileContent"
            class="btn btn-success"
          >
            <span v-if="!isProcessing">🚀 Xử lý File</span>
            <span v-else class="loading-content">
              <div class="loading-spinner"></div>
              Đang xử lý...
            </span>
          </button>
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
    <div v-if="chunks.length > 0" class="status-section">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <h2 class="section-title">Processing Status</h2>
      </div>
      <div class="section-content">
        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-number">{{ chunks.length }}</div>
            <div class="stat-label">Tổng chunks</div>
          </div>
          <div class="stat-card success">
            <div class="stat-number">{{ getStatusCount('success') }}</div>
            <div class="stat-label">Hoàn thành</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-number">{{ getStatusCount('processing') }}</div>
            <div class="stat-label">Đang xử lý</div>
          </div>
          <div class="stat-card info">
            <div class="stat-number">{{ Math.round((getStatusCount('success') / chunks.length) * 100) }}%</div>
            <div class="stat-label">Tiến độ</div>
          </div>
        </div>

        <!-- Chunks Grid -->
        <div class="chunks-grid">
          <div 
            v-for="(chunk, index) in chunks" 
            :key="index"
            class="chunk-card"
            :class="getChunkCardClass(chunk.status)"
          >
            <div class="chunk-header">
              <span class="chunk-title">Chunk {{ index + 1 }}</span>
              <div class="chunk-status">
                <span class="status-badge" :class="getStatusBadgeClass(chunk.status)">{{ getStatusText(chunk.status) }}</span>
                <div v-if="chunk.status === 'processing'" class="loading-spinner small"></div>
              </div>
            </div>
            <div class="chunk-content">
              <p class="chunk-text">{{ chunk.content.substring(0, 100) }}{{ chunk.content.length > 100 ? '...' : '' }}</p>
              <div v-if="chunk.prompt" class="chunk-prompt">
                <div class="prompt-label">Generated Prompt:</div>
                <p class="prompt-text">{{ chunk.prompt.substring(0, 150) }}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div v-if="history.length > 0" class="history-section">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'

// Reactive data
const apiKey = ref('')
const imageNumber = ref(1)
const contentTitle = ref('')
const imagePrompt = ref('')
const fileContent = ref('')
const fileName = ref('')
const folderPath = ref('')
const message = ref('')
const isGenerating = ref(false)
const isProcessing = ref(false)
const currentProcessingIndex = ref(-1)

const chunks = reactive<Array<{
  index: number
  content: string
  status: string
  prompt?: string
}>>([])

const history = reactive<Array<{
  title: string
  prompt: string
  timestamp: Date
}>>([])

// Methods
const chooseFolder = async () => {
  // Mock folder selection for web version
  folderPath.value =await window.electronAPI.chooseFolder?.() || "Downloads"
  message.value = "Đã chọn: " + folderPath.value
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = () => {
    fileContent.value = reader.result as string
    parseSubtitles()
  }
  reader.readAsText(file)
}

const parseSubtitles = () => {
  const blocks = fileContent.value
    .split(/\[\d+\]/)
    .map((b) => b.trim())
    .filter((b) => b)
  const matches = [...fileContent.value.matchAll(/\[(\d+)\]/g)]

  chunks.splice(0, chunks.length) // Clear existing chunks
  blocks.forEach((text, i) => {
    chunks.push({
      index: parseInt(matches[i][1]),
      content: text,
      status: 'pending'
    })
  })
}

const getStatusCount = (status: string) => {
  return chunks.filter(chunk => chunk.status === status).length
}

const getChunkCardClass = (status: string) => {
  return `status-${status}`
}

const getStatusBadgeClass = (status: string) => {
  const classMap: Record<string, string> = {
    'success': 'success',
    'processing': 'warning',
    'error': 'danger',
    'pending': 'primary'
  }
  return classMap[status] || 'primary'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'success': 'Hoàn thành',
    'error': 'Lỗi'
  }
  return statusMap[status] || status
}

const generatePromptFromTitle = async () => {
  if (!contentTitle.value.trim()) {
    alert("Vui lòng nhập tiêu đề content.")
    return
  }

  isGenerating.value = true
  
  try {
    const title = `phân tích chủ đề là "${contentTitle.value}" hãy đưa cho tôi prompt ảnh phù hợp theo dạng "Core scene description, natural landscape elements, light and atmosphere, textures, mood, color accents — hyper-realistic nature photography, 8k ultra-sharp detail, true-to-life perspective, soft natural lighting, realistic depth of field, authentic colors, fine textures of rock, bark, water, and foliage, 16:9 aspect ratio, ultra-high-resolution (4K)", dữ liệu trả về chỉ có phần prompt ảnh, không kèm mô tả hay chú thích nào khác`
    
    const res = await fetch(
      `https://gpt1.shupremium.com/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [{ role: "user", content: title }],
          temperature: 0.7,
        }),
      }
    )
    
    if (!res.ok) throw new Error("Lỗi khi gọi API")
    
    const resData = await res.json()
    imagePrompt.value = resData.choices[0].message.content
    
    // Add to history
    history.push({
      title: contentTitle.value,
      prompt: imagePrompt.value,
      timestamp: new Date()
    })
    
  } catch (err: any) {
    console.error("Lỗi khi tạo prompt:", err)
    alert(err.message || "Lỗi khi tạo prompt")
  } finally {
    isGenerating.value = false
  }
}

const processFile = async () => {
  if (!apiKey.value) {
    alert("Vui lòng nhập API Key vào ô API Key.")
    return
  }

  if (!folderPath.value) {
    alert("Vui lòng chọn thư mục lưu.")
    return
  }

  if (!imagePrompt.value.trim()) {
    alert("Vui lòng nhập Prompt X hoặc tạo tự động từ tiêu đề.")
    return
  }

  isProcessing.value = true
  let finalText = ""

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    if (chunk.status === "success") continue

    // Update status to processing
    chunk.status = "processing"
    currentProcessingIndex.value = i

    try {
      const text = `You are a scene-selector and natural-photography prompt-writer.
Goal
Generate exactly ${imageNumber.value} highly-detailed MidJourney/Stable-Diffusion-ready prompts.
Each prompt must depict a different, visually distinct landscape or setting from the script extract supplied below.

All prompts must share the same art-direction:
hyper-realistic nature photography, 8k ultra-sharp details, natural colors, realistic perspective, soft natural lighting, authentic depth of field.

Method
Read the script section.

Identify the most picturable beats (places, actions, or moods) that occur in chronological order.

Write one prompt per beat. Keep them varied—dense forest, open meadow, rocky mountain pass, flowing river, misty valley, golden harvest field—so the final sequence feels like a real photographic journey through nature.

Structure each prompt like this:

 Prompt X: "${imagePrompt.value}"

Tips:
- Focus on natural details (bark texture, moss, wet leaves, rippling water, drifting clouds, layered mountains).
- Mention time of day and weather (morning mist, golden sunset, rain-soaked earth, winter snow, summer haze).
- Avoid fantasy or man-made props unless in the script.
- Use tone words like tranquil, dramatic, vast, intimate to set mood.
- One sentence per prompt; keep it vivid but realistic."

Output Format
List each prompt on its own line starting with "${(chunk.index-1) * imageNumber.value + 1} :

 …", 

 "${(chunk.index-1) * imageNumber.value + 2} :

 …", 

 "${(chunk.index-1) * imageNumber.value + 3} :

 …", 

 "${(chunk.index-1) * imageNumber.value + 4} :

 …"

 ...
 , up to  "${(chunk.index-1) * imageNumber.value + imageNumber.value } :

 …"


Do not add commentary, explanations, scene titles, or blank lines—only the prompts.
BEGIN once the placeholders are filled.

Script Section
${chunk.content}`
      
      const audioBlob = await generateAudio(text)
      finalText += audioBlob + "\n"
      chunk.prompt = audioBlob
      chunk.status = "success"
      
      console.log(`✅ Thành công chunk ${chunk.index}`)
    } catch (err: any) {
      chunk.status = "error"
      console.error(`❌ Lỗi chunk ${chunk.index}:`, err)
      alert(err.message || "Lỗi khi gọi API")
      break
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  isProcessing.value = false
  currentProcessingIndex.value = -1
  const buffer = new TextEncoder().encode(finalText); 


  await window.electronAPI.saveToFolder(
          folderPath.value,
          `text_final.txt`,
          buffer
        );
  
  // Mock file save
  console.log("Final text would be saved:", finalText)
  message.value = "Đã xử lý xong và lưu file text_final.txt"
}

const generateAudio = async (fullText: string) => {
  const res = await fetch(
    `https://gpt1.shupremium.com/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.value}`,
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
}

const clearHistory = () => {
  history.splice(0, history.length)
  localStorage.removeItem('prompt_history')
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const saveApiKey = () => {
  localStorage.setItem("api-chatgpt-key", apiKey.value)
}

const loadHistory = () => {
  const saved = localStorage.getItem('prompt_history')
  if (saved) {
    const parsed = JSON.parse(saved)
    history.splice(0, history.length, ...parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    })))
  }
}

const saveHistory = () => {
  localStorage.setItem('prompt_history', JSON.stringify(history))
}

// Lifecycle
onMounted(() => {
  const savedKey = localStorage.getItem("api-chatgpt-key")
  console.log('savedKey: ', savedKey);
  if (savedKey) {
    apiKey.value = savedKey
  }
  loadHistory()
})

// Watchers
watch(apiKey, () => {
  saveApiKey()
})

watch(history, () => {
  saveHistory()
}, { deep: true })
</script>

<style scoped>
.prompt-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section with Gradient */
.header-section {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-icon {
  font-size: 28px;
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

/* Content Section - Blue Theme */
.content-section {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

/* Prompt Section - Purple Theme */
.prompt-section {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border: 1px solid #c084fc;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

/* Settings Section - Gray Theme */
.settings-section {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

/* File Section - Gray Theme */
.file-section {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

/* Status Section - White Theme */
.status-section {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

/* History Section - White Theme */
.history-section {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

/* Section Headers */
.section-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.content-section .section-header,
.prompt-section .section-header {
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.settings-section .section-header,
.file-section .section-header,
.status-section .section-header,
.history-section .section-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #374151;
}

.content-section .section-title,
.prompt-section .section-title {
  color: #1e40af;
}

.section-content {
  padding: 20px;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.content-section .form-label,
.prompt-section .form-label {
  color: #1e40af;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  resize: vertical;
  transition: border-color 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #6b7280;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-ghost:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.full-width {
  width: 100%;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 12px;
  height: 12px;
  border-width: 1px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d1d5db;
}

.status-dot.active {
  background: #10b981;
}

.status-text {
  font-size: 12px;
  color: #6b7280;
}

.folder-display {
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.folder-icon {
  font-size: 16px;
}

.folder-path {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
}

/* File Management */
.file-management {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 16px;
}

.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-input {
  display: none;
}

.file-input-label {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s;
}

.file-input-label:hover {
  background: #e5e7eb;
}

.file-status {
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
}

.file-preview {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.file-preview-header {
  background: #f9fafb;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}

.file-name-display {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.file-content-preview {
  padding: 12px;
  background: #f9fafb;
  max-height: 200px;
  overflow-y: auto;
}

.file-content-preview pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  color: #374151;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-card.primary {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.stat-card.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-color: #10b981;
}

.stat-card.warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
}

.stat-card.info {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border-color: #8b5cf6;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #374151;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

/* Chunks Grid */
.chunks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.chunk-card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: white;
}

.chunk-card.status-success {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, white 100%);
}

.chunk-card.status-processing {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, white 100%);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
}

.chunk-card.status-error {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, #fee2e2 0%, white 100%);
}

.chunk-header {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chunk-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.chunk-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
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
  padding: 16px;
}

.chunk-text {
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  word-wrap: break-word;
}

.chunk-prompt {
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
}

.prompt-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.prompt-text {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
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
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-title {
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.history-date {
  font-size: 12px;
  color: #6b7280;
}

.history-prompt {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .prompt-container {
    padding: 15px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .file-management {
    flex-direction: column;
    align-items: stretch;
  }

  .file-input-wrapper {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chunks-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>