<template>
  <div class="tts-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-icon">🎵</div>
      <h1 class="header-title">HUY Media Auto TTS Subtitle</h1>
    </div>

    <!-- Voice Search Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon">🎤</div>
        <h2 class="section-title">Voice Search</h2>
      </div>
      <div class="section-content">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tên voice:</label>
            <input 
              v-model="voiceName" 
              placeholder="Nhập tên voice"
              class="form-input"
            />
          </div>
          <button 
            @click="searchVoiceByName" 
            :disabled="!apiKey || !voiceName"
            class="btn btn-primary"
          >
            🔍 Tìm Voice
          </button>
        </div>
        
        <div v-if="filteredVoices.length > 0" class="voice-select-section">
          <div class="form-group">
            <label class="form-label">Chọn voice:</label>
            <select v-model="selectedVoiceId" class="form-select">
              <option value="">Chọn voice</option>
              <option v-for="voice in filteredVoices" :key="voice.voice_id" :value="voice.voice_id">
                {{ voice.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Settings Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-icon">⚙️</div>
        <h2 class="section-title">Voice Settings</h2>
      </div>
      <div class="section-content">
        <div class="settings-grid">
          <div class="form-group">
            <label class="form-label">Speed:</label>
            <input 
              type="number" 
              v-model="speed" 
              step="0.1" 
              min="0.5" 
              max="2.0" 
              class="form-input"
            />
            <span class="speed-indicator">{{ speed }}x</span>
          </div>

          <div class="form-group">
            <label class="form-label">Model:</label>
            <select v-model="model" class="form-select">
              <option>eleven_multilingual_v2</option>
              <option>eleven_monolith</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">API Key ElevenLabs:</label>
            <input
              type="password"
              v-model="apiKey"
              placeholder="Nhập API key ElevenLabs"
              class="form-input"
            />
            <div v-if="apiKey" class="api-status">
              <div class="status-dot" :class="{ 'active': characterLimit > 0 }"></div>
              <span class="status-text">
                {{ characterLimit > 0 ? 'Connected' : 'Checking...' }}
              </span>
            </div>
          </div>
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
        <div class="file-management-content">
          <div class="form-group">
            <label class="form-label">Import File (*.txt):</label>
            <div class="file-input-wrapper">
              <input 
                type="file" 
                @change="handleFile" 
                accept=".txt" 
                class="file-input"
                id="file-upload"
              />
              <label for="file-upload" class="file-input-label">
                Choose File
                <span class="file-status">{{ fileName || 'No file chosen' }}</span>
              </label>
            </div>
          </div>
          
          <button 
            @click="chooseFolder" 
            :disabled="isRunning"
            class="btn btn-secondary"
          >
            📁 Thư mục lưu
          </button>
        </div>

        <div v-if="folderPath" class="folder-display">
          <span class="folder-icon">📁</span>
          <span class="folder-path">{{ folderPath }}</span>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div v-if="fileContent && fileContent.length > 0" class="section-card">
      <div class="section-header">
        <div class="section-icon">🎮</div>
        <h2 class="section-title">Control Panel</h2>
      </div>
      <div class="section-content">
        <div class="control-actions">
          <button 
            @click="start" 
            :disabled="isRunning"
            class="btn btn-primary btn-large"
          >
            <span v-if="!isRunning">▶️ Start</span>
            <span v-else class="loading-content">
              <div class="loading-spinner"></div>
              Đang xử lý...
            </span>
          </button>
          
          <div class="resume-section">
            <label class="form-label">Tiếp tục từ file:</label>
            <input 
              v-model="fileResum" 
              type="number" 
              min="1" 
              placeholder="Số file"
              class="form-input small"
            />
            <button @click="continueFIle" :disabled="isRunning" class="btn btn-secondary">
              ⏯️ Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Usage Info -->
    <div class="usage-section">
      <div class="section-header">
        <div class="section-icon">🧠</div>
        <h2 class="section-title">API Usage</h2>
      </div>
      <div class="section-content">
        <div class="usage-bar">
          <div class="usage-fill" :style="{ width: usagePercentage + '%' }"></div>
        </div>
        <div class="usage-text">
          {{ characterLimit - characterUsed }} / {{ characterLimit }} characters
          <span class="usage-percent">({{ Math.round(usagePercentage) }}% used)</span>
        </div>
      </div>
    </div>

    <!-- Statistics Summary -->
    <div v-if="subtitles && subtitles.length > 0" class="section-card">
      <div class="section-header">
        <div class="section-icon">📊</div>
        <h2 class="section-title">Processing Statistics</h2>
      </div>
      <div class="section-content">
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-number">{{ subtitles.length }}</div>
            <div class="stat-label">Tổng phụ đề</div>
          </div>
          <div class="stat-card success">
            <div class="stat-number">{{ getStatusCount('success') }}</div>
            <div class="stat-label">Đã xử lý</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-number">{{ getStatusCount('Prepare') + getStatusCount('pending') }}</div>
            <div class="stat-label">Chờ xử lý</div>
          </div>
          <div class="stat-card info">
            <div class="stat-number">{{ Math.round((getStatusCount('success') / subtitles.length) * 100) }}%</div>
            <div class="stat-label">Tiến độ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtitle Cards -->
    <div v-if="subtitles && subtitles.length > 0" class="section-card">
      <div class="section-header">
        <div class="section-icon">📝</div>
        <h2 class="section-title">Trạng thái các đoạn</h2>
      </div>
      <div class="section-content">
        <div class="subtitle-grid">
          <div 
            v-for="(item, index) in subtitles"
            :key="index"
            class="subtitle-card"
            :class="getCardStatusClass(item.status)"
          >
            <div class="card-header">
              <span class="card-title">Đoạn {{ item.index }}</span>
              <div class="card-status">
                <span class="status-icon">{{ getStatusIcon(item.status) }}</span>
                <span class="status-badge" :class="getStatusBadgeClass(item.status)">
                  {{ getStatusText(item.status) }}
                </span>
                <div v-if="item.status === 'pending'" class="loading-spinner small"></div>
              </div>
            </div>
            <div class="card-content">
              <p class="subtitle-text">{{ item.text }}</p>
            </div>
            <div v-if="item.status === 'pending'" class="card-progress">
              <div class="progress-bar">
                <div class="progress-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storage from '../utils/storage.js'

export default {
  name: 'TTSSubtitleNew',
  data() {
    return {
      apiKey: "",
      selectedVoiceId: "",
      speed: 1.0,
      model: "eleven_multilingual_v2",
      subtitles: [],
      fileContent: "",
      fileName: "",
      characterLimit: 0,
      characterUsed: 0,
      voiceName: "",
      voices: [],
      filteredVoices: [],
      isPaused: false,
      isStopped: false,
      isRunning: false,
      outputFolder: "",
      folderPath: null,
      message: "",
      fileResum: 0,
    };
  },
  computed: {
    usagePercentage() {
      if (this.characterLimit === 0) return 0;
      return (this.characterUsed / this.characterLimit) * 100;
    }
  },
  methods: {
    getStatusCount(status) {
      return this.subtitles.filter(item => item.status === status).length;
    },
    getStatusIcon(status) {
      switch(status) {
        case 'success': return '✅';
        case 'pending': return '⏳';
        case 'error': return '❌';
        default: return '⏸️';
      }
    },
    getStatusText(status) {
      switch(status) {
        case 'success': return 'Hoàn thành';
        case 'pending': return 'Đang xử lý';
        case 'error': return 'Lỗi';
        default: return 'Chờ xử lý';
      }
    },
    getCardStatusClass(status) {
      return `status-${status}`;
    },
    getStatusBadgeClass(status) {
      switch(status) {
        case 'success': return 'badge-success';
        case 'pending': return 'badge-warning';
        case 'error': return 'badge-error';
        default: return 'badge-primary';
      }
    },
    async chooseFolder() {
      try {
        this.folderPath = await window.electronAPI?.chooseFolder?.() || "Downloads (default)";
        if (this.folderPath) {
          this.message = "Đã chọn: " + this.folderPath;
        } else {
          this.message = "Chưa chọn thư mục.";
        }
      } catch (error) {
        console.error("Error choosing folder:", error);
      }
    },
    
    async searchVoiceByName() {
      if (!this.apiKey || !this.voiceName) {
        alert("Vui lòng nhập API Key và tên voice.");
        return;
      }

      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v2/voices`,
          {
            headers: { "xi-api-key": this.apiKey },
            credentials: "omit" 
          }
        );
        const data = await res.json();
        this.filteredVoices = data.voices;

        if (this.filteredVoices.length > 0) {
          this.selectedVoiceId = this.filteredVoices[0].voice_id;
        }
      } catch (err) {
        console.error("Lỗi khi gọi API search voice:", err);
        alert("Không thể tìm voice. Kiểm tra API key hoặc tên voice.");
      }
    },
    
    async checkUsage() {
      try {
        const res = await fetch(
          "https://api.elevenlabs.io/v1/user/subscription",
          {
            headers: { "xi-api-key": this.apiKey },
            credentials: "omit"
          }
        );
        const data = await res.json();
        this.characterLimit = data.character_limit;
        this.characterUsed = data.character_count;
      } catch (err) {
        alert("Không thể kiểm tra usage. Kiểm tra API key.");
      }
    },
    
    handleFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result;
        this.parseSubtitles();
      };
      reader.readAsText(file);
    },
    
    parseSubtitles() {
      const blocks = this.fileContent
        .split(/\[\d+\]/)
        .map((b) => b.trim())
        .filter((b) => b);
      const matches = [...this.fileContent.matchAll(/\[(\d+)\]/g)];

      this.subtitles = blocks.map((text, i) => ({
        index: parseInt(matches[i][1]),
        text,
        status: "Prepare",
      }));
    },
    
    async start() {
      if (this.isRunning) return;
      if (!this.apiKey || !this.selectedVoiceId) {
        alert("Vui lòng nhập API Key và chọn voice.");
        return;
      }

      if (!this.folderPath) {
        alert("Vui lòng chọn thư mục lưu.");
        return;
      }

      this.isRunning = true;
      this.isStopped = false;
      
      let dataSubs = this.subtitles.filter(
        (item) => item.status !== "success"
      );

      for (let i = 0; i < dataSubs.length; i++) {
        const item = this.subtitles[i];
        if (this.isStopped) break;
        if (item.status === "success") continue;

        item.status = "pending";
        try {
          const audioBlob = await this.generateAudio(item.text);
          const buffer = await this.blobToBuffer(audioBlob);

          await window.electronAPI?.saveToFolder?.(
            this.folderPath,
            `${item.index}.mp3`,
            buffer
          );

          item.status = "success";
          this.checkUsage();
          console.log(`✅ Thành công dòng ${item.index}`);
        } catch (err) {
          item.status = "error";
          console.error(`❌ Lỗi dòng ${item.index}:`, err);
          alert(err.message || "Lỗi khi gọi API TTS");
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 4000));
      }

      this.isRunning = false;
    },
    
    async generateAudio(fullText) {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.selectedVoiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": this.apiKey,
            "Content-Type": "application/json",
            "Cookie": ""
          },
          credentials: "omit",
          body: JSON.stringify({
            text: fullText,
            model_id: this.model,
          }),
        }
      );

      if (!res.ok) throw new Error(res?.message || "Lỗi khi gọi API TTS");

      const blob = await res.blob();
      return blob;
    },
    
    async blobToBuffer(blob) {
      const arrayBuffer = await blob.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    },
    
    continueFIle() {
      if(this.fileResum && this.fileResum > 0){
        this.subtitles = this.subtitles.filter(item => item.index >= this.fileResum);
        this.start();
      } else {
        alert("Vui lòng nhập số file bạn muốn chạy lại");
      }
    },
    
    saveSettings() {
      const settings = {
        voiceId: this.selectedVoiceId,
        speed: this.speed,
        model: this.model,
        folderPath: this.folderPath
      };
      storage.setTTSSettings(settings);
    },
    
    loadSettings() {
      const settings = storage.getTTSSettings();
      this.selectedVoiceId = settings.voiceId || '';
      this.speed = settings.speed || 1.0;
      this.model = settings.model || 'eleven_multilingual_v2';
      this.folderPath = settings.folderPath || null;
    }
  },
  
  mounted() {
    // Load saved API key and settings
    this.apiKey = storage.getTTSApiKey();
    this.loadSettings();
    
    if (this.apiKey) {
      this.checkUsage();
    }
  },
  
  watch: {
    apiKey() {
      storage.setTTSApiKey(this.apiKey);
      if (this.apiKey) {
        this.checkUsage();
      }
    },
    selectedVoiceId() {
      this.saveSettings();
    },
    speed() {
      this.saveSettings();
    },
    model() {
      this.saveSettings();
    },
    folderPath() {
      this.saveSettings();
    }
  },
}
</script>

<style scoped>
.tts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.header-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.section-content {
  padding: 20px;
}

/* Form Elements */
.form-row {
  display: flex;
  gap: 16px;
  align-items: end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 200px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.form-input.small {
  width: 100px;
}

.form-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.speed-indicator {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* Voice Search */
.voice-select-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
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
  background: #ddd;
}

.status-dot.active {
  background: #28a745;
}

.status-text {
  font-size: 12px;
  color: #666;
}

/* File Management */
.file-management-content {
  display: flex;
  gap: 16px;
  align-items: end;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-input-label {
  display: inline-block;
  padding: 10px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: background-color 0.2s;
}

.file-input-label:hover {
  background: #e9ecef;
}

.file-status {
  margin-left: 8px;
  color: #666;
  font-style: italic;
}

.folder-display {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.folder-icon {
  font-size: 16px;
}

.folder-path {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #666;
}

/* Control Panel */
.control-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.resume-section {
  display: flex;
  align-items: center;
  gap: 8px;
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
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-large {
  padding: 12px 24px;
  font-size: 16px;
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
  border-top: 2px solid #007bff;
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

/* Usage Section */
.usage-section {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.usage-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #007bff);
  transition: width 0.3s;
}

.usage-text {
  text-align: center;
  font-weight: 500;
  color: #856404;
}

.usage-percent {
  font-size: 12px;
  opacity: 0.8;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-card {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-card.primary {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #2196f3;
}

.stat-card.success {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #4caf50;
}

.stat-card.warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  border-color: #ff9800;
}

.stat-card.info {
  background: linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%);
  border-color: #9c27b0;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

/* Subtitle Cards */
.subtitle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.subtitle-card {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  background: white;
}

.subtitle-card.status-success {
  border-left: 4px solid #28a745;
  background: linear-gradient(135deg, #d4edda 0%, white 100%);
}

.subtitle-card.status-pending {
  border-left: 4px solid #ffc107;
  background: linear-gradient(135deg, #fff3cd 0%, white 100%);
  box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
}

.subtitle-card.status-error {
  border-left: 4px solid #dc3545;
  background: linear-gradient(135deg, #f8d7da 0%, white 100%);
}

.card-header {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  font-size: 14px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.badge-success {
  background: #d4edda;
  color: #155724;
}

.status-badge.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.status-badge.badge-error {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.badge-primary {
  background: #d1ecf1;
  color: #0c5460;
}

.card-content {
  padding: 16px;
}

.subtitle-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  word-wrap: break-word;
}

.card-progress {
  padding: 0 16px 16px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  animation: progress 2s ease-in-out infinite;
}

@keyframes progress {
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 100%; }
}

/* Responsive */
@media (max-width: 768px) {
  .tts-container {
    padding: 16px;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .file-management-content {
    flex-direction: column;
    align-items: stretch;
  }

  .control-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .resume-section {
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .subtitle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>