<template>
  <div class="container">
    <!-- Header Section -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-icon">🎵</span>
        <span class="section-title">HUY Media Auto TTS Subtitle</span>
        <div v-if="isRunning" class="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <!-- Control Panel -->
    <div v-if="fileContent && fileContent.length > 0" class="section-card">
      <div class="section-header">
        <span class="section-icon">🎮</span>
        <span class="section-title">Control Panel</span>
      </div>
      <div class="section-content">
        <div style="display: flex; gap: var(--space-4); align-items: center; flex-wrap: wrap;">
          <button 
            @click="start" 
            :disabled="isRunning"
            class="btn btn-primary"
          >
            <span v-if="!isRunning">▶️ Start</span>
            <span v-else>
              <div class="loading-spinner"></div>
              Đang xử lý...
            </span>
          </button>
          
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <label>Tiếp tục từ file:</label>
            <input 
              v-model="fileResum" 
              type="number" 
              min="1" 
              placeholder="Số file"
              style="width: 100px;"
              class="input"
            />
            <button @click="continueFIle" :disabled="isRunning" class="btn btn-secondary">
              ⏯️ Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Search -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-icon">🎤</span>
        <span class="section-title">Voice Search</span>
      </div>
      <div class="section-content">
        <div style="display: flex; gap: var(--space-4); align-items: end; flex-wrap: wrap;">
          <div class="input-group">
            <label>Tên voice:</label>
            <input 
              v-model="voiceName" 
              placeholder="Nhập tên voice"
              class="input"
              @keyup.enter="searchVoiceByName"
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
        
        <div v-if="filteredVoices.length > 0" style="margin-top: var(--space-4);">
          <div class="input-group">
            <label>Chọn voice:</label>
            <select v-model="selectedVoiceId" class="select">
              <option value="">Chọn voice</option>
              <option v-for="voice in filteredVoices" :key="voice.voice_id" :value="voice.voice_id">
                {{ voice.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Settings -->
    <div class="section-card">
      <div class="section-header">
        <span class="section-icon">⚙️</span>
        <span class="section-title">Voice Settings</span>
      </div>
      <div class="section-content">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-6);">
          <div class="input-group">
            <label>Speed:</label>
            <input type="number" v-model="speed" step="0.1" min="0.5" max="2.0" class="input" />
            <span style="font-size: var(--text-sm); color: var(--text-secondary);">{{ speed }}x</span>
          </div>

          <div class="input-group">
            <label>Model:</label>
            <select v-model="model" class="select">
              <option>eleven_multilingual_v2</option>
              <option>eleven_monolith</option>
            </select>
          </div>

          <div class="input-group">
            <label>API Key ElevenLabs:</label>
            <input
              type="password"
              v-model="apiKey"
              placeholder="Nhập API key ElevenLabs"
              class="input"
            />
            <div v-if="apiKey" style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-1);">
              <div class="status-dot" :class="{ 'active': characterLimit > 0 }"></div>
              <span style="font-size: var(--text-xs); color: var(--text-secondary);">
                {{ characterLimit > 0 ? 'Connected' : 'Checking...' }}
              </span>
            </div>
          </div>
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
        <div style="display: grid; grid-template-columns: 1fr auto; gap: var(--space-4); align-items: end;">
          <div class="input-group">
            <label>Import File (*.txt):</label>
            <input 
              type="file" 
              @change="handleFile" 
              accept=".txt" 
              class="input"
            />
          </div>
          
          <button 
            @click="chooseFolder" 
            :disabled="isRunning"
            class="btn btn-secondary"
          >
            📂 Thư mục lưu
          </button>
        </div>

        <div v-if="folderPath" style="margin-top: var(--space-4); padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-lg); display: flex; align-items: center; gap: var(--space-2);">
          <span style="font-size: var(--text-lg);">📁</span>
          <span style="font-size: var(--text-xs); font-family: var(--font-mono); color: var(--text-secondary);">{{ folderPath }}</span>
        </div>
      </div>
    </div>
    
    <!-- Usage Info -->
    <div class="section-card" style="background: linear-gradient(135deg, var(--warning-50) 0%, #fef3c7 100%); border-color: var(--warning-500);">
      <div class="section-header" style="background: rgba(245, 158, 11, 0.1);">
        <span class="section-icon">🧠</span>
        <span class="section-title">API Usage</span>
      </div>
      <div class="section-content">
        <div class="progress" style="margin-bottom: var(--space-3);">
          <div class="progress-bar" :style="{ width: usagePercentage + '%' }"></div>
        </div>
        <div style="text-align: center; font-weight: 500; color: #92400e;">
          {{ characterLimit - characterUsed }} / {{ characterLimit }} characters
          <span style="font-size: var(--text-xs); opacity: 0.8;">({{ Math.round(usagePercentage) }}% used)</span>
        </div>
      </div>
    </div>

    <!-- Statistics Summary -->
    <div v-if="subtitles && subtitles.length > 0" class="section-card">
      <div class="section-header">
        <span class="section-icon">📊</span>
        <span class="section-title">Processing Statistics</span>
      </div>
      <div class="section-content">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-4);">
          <div style="text-align: center; padding: var(--space-4); background: var(--primary-50); border-radius: var(--radius-lg); border: 1px solid var(--primary-200);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--primary-600); margin-bottom: var(--space-1);">{{ subtitles.length }}</div>
            <div style="font-size: var(--text-xs); color: var(--primary-700); font-weight: 500;">Tổng phụ đề</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: var(--success-50); border-radius: var(--radius-lg); border: 1px solid var(--success-500);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--success-600); margin-bottom: var(--space-1);">{{ getStatusCount('success') }}</div>
            <div style="font-size: var(--text-xs); color: var(--success-700); font-weight: 500;">Đã xử lý</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: var(--warning-50); border-radius: var(--radius-lg); border: 1px solid var(--warning-500);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--warning-600); margin-bottom: var(--space-1);">{{ getStatusCount('Prepare') + getStatusCount('pending') }}</div>
            <div style="font-size: var(--text-xs); color: var(--warning-700); font-weight: 500;">Chờ xử lý</div>
          </div>
          <div style="text-align: center; padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary); margin-bottom: var(--space-1);">{{ Math.round((getStatusCount('success') / subtitles.length) * 100) }}%</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Tiến độ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtitle Cards -->
    <div v-if="subtitles && subtitles.length > 0" class="section-card">
      <div class="section-header">
        <span class="section-icon">📝</span>
        <span class="section-title">Trạng thái các đoạn</span>
      </div>
      <div class="section-content">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: var(--space-6);">
          <div 
            v-for="(item, index) in subtitles"
            :key="index"
            class="card"
            :style="getCardStyle(item.status)"
          >
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; font-size: var(--text-base); color: var(--text-primary);">Đoạn {{ item.index }}</span>
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span style="font-size: var(--text-base);">{{ getStatusIcon(item.status) }}</span>
                <span class="badge" :class="getStatusBadgeClass(item.status)">{{ getStatusText(item.status) }}</span>
                <div v-if="item.status === 'pending'" class="loading-spinner loading-spinner-sm"></div>
              </div>
            </div>
            <div class="card-content">
              <p style="margin: 0; font-size: var(--text-sm); line-height: 1.6; color: var(--text-primary); word-wrap: break-word;">{{ item.text }}</p>
            </div>
            <div v-if="item.status === 'pending'" style="padding: 0 var(--space-6) var(--space-4);">
              <div class="progress">
                <div class="progress-bar"></div>
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
  name: 'TTSSubtitle',
  data() {
    return {
      apiKey: "",
      selectedVoiceId: "",
      speed: 1.0,
      model: "eleven_multilingual_v2",
      subtitles: [],
      fileContent: "",
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
    getCardStyle(status) {
      switch(status) {
        case 'success': 
          return {
            'border-left': '4px solid var(--success-500)',
            'background': 'linear-gradient(135deg, var(--success-50) 0%, white 100%)'
          };
        case 'pending': 
          return {
            'border-left': '4px solid var(--warning-500)',
            'background': 'linear-gradient(135deg, var(--warning-50) 0%, white 100%)',
            'box-shadow': '0 4px 20px rgba(245, 158, 11, 0.3)'
          };
        case 'error': 
          return {
            'border-left': '4px solid var(--error-500)',
            'background': 'linear-gradient(135deg, var(--error-50) 0%, white 100%)'
          };
        default: 
          return {
            'border-left': '4px solid var(--border-medium)'
          };
      }
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