<template>
  <div class="voice-cloner-container">
    <div class="header">
      <h1>🎙️ Voice Cloner với ElevenLabs</h1>
      <p>Upload file MP3 để clone giọng nói và đọc file SRT</p>
    </div>

    <!-- API Key Section -->
    <div class="section">
      <h3>🔑 Cấu hình ElevenLabs</h3>
      <div class="input-group">
        <label for="apiKey">API Key:</label>
        <input
          id="apiKey"
          v-model="apiKey"
          type="password"
          placeholder="Nhập ElevenLabs API Key của bạn"
          class="api-input"
        />
      </div>
      <button @click="loadVoices" :disabled="!apiKey" class="btn-secondary">
        Tải danh sách giọng nói
      </button>
    </div>

    <!-- Voice Upload Section -->
    <div class="section">
      <h3>🎤 Upload MP3 để Clone Giọng Nói</h3>
      <div class="input-group">
        <label for="voiceName">Tên giọng nói:</label>
        <input
          id="voiceName"
          v-model="newVoiceName"
          type="text"
          placeholder="Nhập tên cho giọng nói mới"
          class="voice-input"
        />
      </div>
      
      <div class="upload-area" @drop="handleVoiceDrop" @dragover.prevent @dragenter.prevent>
        <input
          ref="voiceFileInput"
          type="file"
          accept=".mp3,.wav,.m4a,.flac"
          @change="handleVoiceFileSelect"
          style="display: none"
        />
        <div class="upload-content" @click="$refs.voiceFileInput.click()">
          <div class="upload-icon">🎵</div>
          <p>Kéo thả file MP3 vào đây để clone giọng nói</p>
          <small>Hỗ trợ: MP3, WAV, M4A, FLAC (tối đa 10MB)</small>
          <div v-if="voiceFile" class="selected-file">
            ✅ Đã chọn: {{ voiceFile.name }}
          </div>
        </div>
      </div>
      
      <!-- Debug Info -->
      <div class="debug-info">
        <p><strong>Debug:</strong></p>
        <p>API Key: {{ apiKey ? 'Đã nhập' : 'Chưa nhập' }}</p>
        <p>Tên voice: {{ newVoiceName || 'Chưa nhập' }}</p>
        <p>File đã chọn: {{ voiceFile ? voiceFile.name : 'Chưa chọn' }}</p>
        <p>Có thể upload: {{ canUploadVoice ? 'Có' : 'Không' }}</p>
      </div>
      
      <button 
        @click="uploadVoiceClone" 
        :disabled="!canUploadVoice || isProcessing"
        class="btn-primary"
        :class="{ 'btn-disabled': !canUploadVoice || isProcessing }"
      >
        {{ isProcessing ? '🔄 Đang upload...' : '🚀 Tạo Voice Clone' }}
      </button>
    </div>

    <!-- Voice Selection -->
    <div class="section" v-if="voices.length > 0">
      <h3>🎵 Chọn giọng nói ({{ voices.length }} voice)</h3>
      <div class="voice-grid">
        <div
          v-for="voice in voices"
          :key="voice.voice_id"
          @click="selectVoice(voice)"
          :class="['voice-card', { active: selectedVoiceId === voice.voice_id }]"
        >
          <div class="voice-name">{{ voice.name }}</div>
          <div class="voice-category">{{ voice.category || 'Custom' }}</div>
          <div class="voice-labels" v-if="voice.labels">
            <span v-for="(value, key) in voice.labels" :key="key" class="label">
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- SRT Upload Section -->
    <div class="section">
      <h3>📁 Upload File SRT</h3>
      <div class="upload-area" @drop="handleSrtDrop" @dragover.prevent @dragenter.prevent>
        <input
          ref="srtFileInput"
          type="file"
          accept=".srt"
          @change="handleSrtFileSelect"
          style="display: none"
        />
        <div class="upload-content" @click="$refs.srtFileInput.click()">
          <div class="upload-icon">📄</div>
          <p>Kéo thả file SRT vào đây hoặc click để chọn</p>
          <small>Chỉ hỗ trợ file .srt</small>
        </div>
      </div>
    </div>

    <!-- SRT Content Display -->
    <div class="section" v-if="srtContent.length > 0">
      <h3>📝 Nội dung SRT ({{ srtContent.length }} subtitle)</h3>
      <div class="srt-preview">
        <div
          v-for="(subtitle, index) in srtContent"
          :key="index"
          class="subtitle-item"
        >
          <div class="subtitle-index">{{ subtitle.index }}</div>
          <div class="subtitle-time">{{ subtitle.startTime }} --> {{ subtitle.endTime }}</div>
          <div class="subtitle-text">{{ subtitle.text }}</div>
          <button
            @click="cloneSingleSubtitle(subtitle, index)"
            :disabled="!canClone || isProcessing"
            class="btn-clone"
          >
            {{ isProcessing && currentProcessing === index ? '🔄 Đang xử lý...' : '🎙️ Clone' }}
          </button>
        </div>
      </div>
      
      <div class="batch-controls">
        <button
          @click="cloneAllSubtitles"
          :disabled="!canClone || isProcessing"
          class="btn-primary"
        >
          {{ isProcessing ? '🔄 Đang xử lý tất cả...' : '🎙️ Clone tất cả (' + srtContent.length + ' subtitle)' }}
        </button>
        <button
          @click="downloadAllAudio"
          :disabled="audioFiles.length === 0"
          class="btn-secondary"
        >
          📥 Tải xuống tất cả ({{ audioFiles.length }} file)
        </button>
      </div>
    </div>

    <!-- Generated Audio Section -->
    <div class="section" v-if="audioFiles.length > 0">
      <h3>🔊 Audio đã tạo ({{ audioFiles.length }} file)</h3>
      <div class="audio-list">
        <div
          v-for="(audio, index) in audioFiles"
          :key="index"
          class="audio-item"
        >
          <div class="audio-info">
            <div class="audio-title">Subtitle {{ audio.subtitleIndex + 1 }}</div>
            <div class="audio-text">{{ audio.text }}</div>
          </div>
          <div class="audio-controls">
            <audio :src="audio.url" controls preload="metadata"></audio>
            <button @click="downloadAudio(audio)" class="btn-download">
              📥 Tải xuống
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isProcessing" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ loadingMessage }}</p>
      <div class="progress-info" v-if="currentProcessing !== null && srtContent.length > 0">
        Đang xử lý: {{ currentProcessing + 1 }}/{{ srtContent.length }}
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <strong>❌ Lỗi:</strong> {{ error }}
      <button @click="error = ''" class="btn-close">✕</button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="success-message">
      <strong>✅ Thành công:</strong> {{ successMessage }}
      <button @click="successMessage = ''" class="btn-close">✕</button>
    </div>

    <!-- Instructions -->
    <div class="section instructions">
      <h3>📋 Hướng dẫn sử dụng</h3>
      <ol>
        <li><strong>Nhập API Key:</strong> Lấy từ <a href="https://elevenlabs.io" target="_blank">ElevenLabs.io</a></li>
        <li><strong>Upload MP3:</strong> Chọn file audio để tạo voice clone mới</li>
        <li><strong>Đặt tên:</strong> Nhập tên cho giọng nói clone</li>
        <li><strong>Tạo Clone:</strong> Click "Tạo Voice Clone" để upload lên ElevenLabs</li>
        <li><strong>Upload SRT:</strong> Chọn file subtitle để convert thành audio</li>
        <li><strong>Clone Audio:</strong> Chọn giọng nói và clone từng câu hoặc tất cả</li>
      </ol>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceCloner',
  data() {
    return {
      apiKey: '',
      selectedVoiceId: '',
      newVoiceName: '',
      voiceFile: null,
      voices: [],
      srtContent: [],
      audioFiles: [],
      isProcessing: false,
      currentProcessing: null,
      error: '',
      successMessage: '',
      loadingMessage: ''
    }
  },
  computed: {
    canClone() {
      return this.apiKey && this.selectedVoiceId && this.srtContent.length > 0;
    },
    canUploadVoice() {
      const hasApiKey = this.apiKey && this.apiKey.trim().length > 0;
      const hasVoiceName = this.newVoiceName && this.newVoiceName.trim().length > 0;
      const hasVoiceFile = this.voiceFile !== null;
      
      console.log('canUploadVoice check:', {
        hasApiKey,
        hasVoiceName,
        hasVoiceFile,
        apiKey: this.apiKey,
        voiceName: this.newVoiceName,
        voiceFile: this.voiceFile
      });
      
      return hasApiKey && hasVoiceName && hasVoiceFile;
    }
  },
  methods: {
    async loadVoices() {
      if (!this.apiKey) {
        this.error = 'Vui lòng nhập API Key trước';
        return;
      }

      try {
        this.isProcessing = true;
        this.loadingMessage = 'Đang tải danh sách giọng nói...';

        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: {
            'xi-api-key': this.apiKey
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        this.voices = data.voices || [];
        this.successMessage = `Đã tải ${this.voices.length} giọng nói`;
      } catch (err) {
        this.error = `Không thể tải giọng nói: ${err.message}`;
      } finally {
        this.isProcessing = false;
      }
    },

    selectVoice(voice) {
      this.selectedVoiceId = voice.voice_id;
      this.successMessage = `Đã chọn giọng nói: ${voice.name}`;
    },

    handleVoiceFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processVoiceFile(file);
      }
    },

    handleVoiceDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file && this.isAudioFile(file)) {
        this.processVoiceFile(file);
      } else {
        this.error = 'Vui lòng chọn file audio (MP3, WAV, M4A, FLAC)';
      }
    },

    isAudioFile(file) {
      const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/flac', 'audio/x-m4a'];
      return audioTypes.includes(file.type) || 
             file.name.match(/\.(mp3|wav|m4a|flac)$/i);
    },

    processVoiceFile(file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.error = 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB';
        return;
      }
      
      this.voiceFile = file;
      this.successMessage = `Đã chọn file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      console.log('Voice file selected:', file);
    },

    async uploadVoiceClone() {
      console.log('uploadVoiceClone called');
      console.log('canUploadVoice:', this.canUploadVoice);
      console.log('isProcessing:', this.isProcessing);
      
      if (!this.canUploadVoice) {
        this.error = 'Vui lòng nhập đầy đủ API Key, tên giọng nói và chọn file audio';
        return;
      }

      if (this.isProcessing) {
        this.error = 'Đang xử lý, vui lòng đợi...';
        return;
      }

      try {
        this.isProcessing = true;
        this.loadingMessage = 'Đang upload và tạo voice clone...';
        this.error = '';
        this.successMessage = '';

        const formData = new FormData();
        formData.append('name', this.newVoiceName.trim());
        formData.append('files', this.voiceFile);
        
        // Add labels for better organization
        formData.append('labels', JSON.stringify({
          'type': 'custom_clone',
          'created': new Date().toISOString(),
          'source': 'voice_cloner_app'
        }));

        console.log('Sending request to ElevenLabs...');
        const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey
          },
          body: formData
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.log('Error response:', errorData);
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const result = await response.json();
        console.log('Success result:', result);
        
        this.successMessage = `Đã tạo thành công voice clone: ${this.newVoiceName}`;
        
        // Reset form
        this.newVoiceName = '';
        this.voiceFile = null;
        if (this.$refs.voiceFileInput) {
          this.$refs.voiceFileInput.value = '';
        }
        
        // Reload voices to include the new one
        await this.loadVoices();
        
        // Auto-select the new voice
        if (result.voice_id) {
          this.selectedVoiceId = result.voice_id;
        }

      } catch (err) {
        console.error('Upload error:', err);
        this.error = `Lỗi khi tạo voice clone: ${err.message}`;
      } finally {
        this.isProcessing = false;
      }
    },

    handleSrtFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processSRTFile(file);
      }
    },

    handleSrtDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file && file.name.endsWith('.srt')) {
        this.processSRTFile(file);
      } else {
        this.error = 'Vui lòng chọn file .srt';
      }
    },

    async processSRTFile(file) {
      try {
        const text = await this.readFileAsText(file);
        this.srtContent = this.parseSRT(text);
        this.successMessage = `Đã đọc ${this.srtContent.length} subtitle từ file SRT: ${file.name}`;
      } catch (err) {
        this.error = `Không thể đọc file SRT: ${err.message}`;
      }
    },

    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(new Error('Không thể đọc file'));
        reader.readAsText(file, 'UTF-8');
      });
    },

    parseSRT(srtText) {
      const subtitles = [];
      const blocks = srtText.trim().split(/\n\s*\n/);

      blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length >= 3) {
          const index = parseInt(lines[0]);
          const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
          
          if (timeMatch) {
            const text = lines.slice(2).join(' ').replace(/<[^>]*>/g, '').trim();
            if (text) {
              subtitles.push({
                index,
                startTime: timeMatch[1],
                endTime: timeMatch[2],
                text
              });
            }
          }
        }
      });

      return subtitles;
    },

    async cloneSingleSubtitle(subtitle, index) {
      if (!this.canClone) return;

      try {
        this.currentProcessing = index;
        this.isProcessing = true;
        this.loadingMessage = `Đang clone subtitle ${index + 1}...`;

        const audioBlob = await this.callElevenLabsAPI(subtitle.text);
        const audioUrl = URL.createObjectURL(audioBlob);

        this.audioFiles.push({
          subtitleIndex: index,
          text: subtitle.text,
          url: audioUrl,
          blob: audioBlob,
          filename: `subtitle_${index + 1}.mp3`
        });

        this.successMessage = `Đã clone thành công subtitle ${index + 1}`;
      } catch (err) {
        this.error = `Lỗi khi clone subtitle ${index + 1}: ${err.message}`;
      } finally {
        this.isProcessing = false;
        this.currentProcessing = null;
      }
    },

    async cloneAllSubtitles() {
      if (!this.canClone) return;

      try {
        this.isProcessing = true;
        this.audioFiles = []; // Reset audio files

        for (let i = 0; i < this.srtContent.length; i++) {
          this.loadingMessage = `Đang clone subtitle ${i + 1}/${this.srtContent.length}...`;
          this.currentProcessing = i;

          const subtitle = this.srtContent[i];
          const audioBlob = await this.callElevenLabsAPI(subtitle.text);
          const audioUrl = URL.createObjectURL(audioBlob);

          this.audioFiles.push({
            subtitleIndex: i,
            text: subtitle.text,
            url: audioUrl,
            blob: audioBlob,
            filename: `subtitle_${i + 1}.mp3`
          });

          // Delay giữa các request để tránh rate limit
          if (i < this.srtContent.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        this.successMessage = `Đã clone thành công tất cả ${this.srtContent.length} subtitle`;
      } catch (err) {
        this.error = `Lỗi khi clone tất cả: ${err.message}`;
      } finally {
        this.isProcessing = false;
        this.currentProcessing = null;
      }
    },

    async callElevenLabsAPI(text) {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      return await response.blob();
    },

    downloadAudio(audio) {
      const link = document.createElement('a');
      link.href = audio.url;
      link.download = audio.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    downloadAllAudio() {
      this.audioFiles.forEach((audio, index) => {
        setTimeout(() => this.downloadAudio(audio), index * 200);
      });
    }
  }
}
</script>

<style scoped>
/* Voice Cloner Component Styles */
.voice-cloner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #333;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

.section h3 {
  color: #4a5568;
  margin-bottom: 20px;
  font-size: 1.3rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 10px;
}

/* Debug Info */
.debug-info {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  font-size: 14px;
}

.debug-info p {
  margin: 5px 0;
}

/* Input Styles */
.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2d3748;
}

.api-input,
.voice-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.api-input:focus,
.voice-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Button Styles */
.btn-primary,
.btn-secondary,
.btn-clone,
.btn-download,
.btn-close {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 5px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary.btn-disabled {
  background: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.btn-clone {
  background: #48bb78;
  color: white;
  font-size: 12px;
  padding: 8px 16px;
}

.btn-clone:hover:not(:disabled) {
  background: #38a169;
}

.btn-download {
  background: #ed8936;
  color: white;
  font-size: 12px;
  padding: 8px 16px;
}

.btn-download:hover {
  background: #dd6b20;
}

.btn-close {
  background: #f56565;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  margin-left: 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Voice Grid */
.voice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.voice-card {
  padding: 15px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.voice-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.voice-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.voice-name {
  font-weight: 600;
  margin-bottom: 5px;
}

.voice-category {
  font-size: 12px;
  opacity: 0.7;
}

.voice-labels {
  margin-top: 8px;
}

.label {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin: 2px;
}

/* Upload Area */
.upload-area {
  border: 3px dashed #cbd5e0;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f7fafc;
}

.upload-area:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.upload-area p {
  margin: 10px 0 5px 0;
  font-size: 1.1rem;
  color: #4a5568;
}

.upload-area small {
  color: #718096;
}

.selected-file {
  margin-top: 10px;
  padding: 8px 12px;
  background: #c6f6d5;
  color: #22543d;
  border-radius: 6px;
  font-weight: 600;
}

/* SRT Preview */
.srt-preview {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
  background: #f7fafc;
}

.subtitle-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.subtitle-index {
  font-weight: 700;
  color: #667eea;
  font-size: 14px;
}

.subtitle-time {
  color: #718096;
  font-size: 12px;
  margin: 5px 0;
  font-family: 'Courier New', monospace;
}

.subtitle-text {
  margin: 10px 0;
  line-height: 1.5;
  color: #2d3748;
}

/* Batch Controls */
.batch-controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

/* Audio List */
.audio-list {
  max-height: 500px;
  overflow-y: auto;
}

.audio-item {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #e2e8f0;
}

.audio-info {
  flex: 1;
  margin-right: 15px;
}

.audio-title {
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 5px;
}

.audio-text {
  color: #718096;
  font-size: 14px;
  line-height: 1.4;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.audio-controls audio {
  width: 200px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-info {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.8;
}

/* Message Styles */
.error-message,
.success-message {
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #feb2b2;
}

.success-message {
  background: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

/* Instructions */
.instructions {
  background: #edf2f7;
  border-left: 4px solid #667eea;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.instructions a {
  color: #667eea;
  text-decoration: none;
}

.instructions a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 768px) {
  .voice-cloner-container {
    padding: 15px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .section {
    padding: 20px;
  }
  
  .voice-grid {
    grid-template-columns: 1fr;
  }
  
  .audio-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .audio-info {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .audio-controls {
    justify-content: center;
  }
  
  .audio-controls audio {
    width: 100%;
    max-width: 300px;
  }
  
  .batch-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .batch-controls button {
    width: 100%;
    max-width: 300px;
  }
}

/* Scrollbar Styling */
.srt-preview::-webkit-scrollbar,
.audio-list::-webkit-scrollbar {
  width: 8px;
}

.srt-preview::-webkit-scrollbar-track,
.audio-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.srt-preview::-webkit-scrollbar-thumb,
.audio-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.srt-preview::-webkit-scrollbar-thumb:hover,
.audio-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Animation for new items */
.audio-item,
.subtitle-item {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>