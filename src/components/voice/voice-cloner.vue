<template>
  <div class="voice-cloner-container">
    <div class="header">
      <h1>🎙️ Voice Cloner với ElevenLabs</h1>
      <p>Upload file SRT và clone giọng nói bằng ElevenLabs API</p>
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
      <div class="input-group">
        <label for="voiceId">Voice ID:</label>
        <input
          id="voiceId"
          v-model="selectedVoiceId"
          type="text"
          placeholder="Nhập Voice ID hoặc chọn từ danh sách"
          class="voice-input"
        />
      </div>
      <button @click="loadVoices" :disabled="!apiKey" class="btn-secondary">
        Tải danh sách giọng nói
      </button>
    </div>

    <!-- Voice Selection -->
    <div class="section" v-if="voices.length > 0">
      <h3>🎵 Chọn giọng nói</h3>
      <div class="voice-grid">
        <div
          v-for="voice in voices"
          :key="voice.voice_id"
          @click="selectVoice(voice)"
          :class="['voice-card', { active: selectedVoiceId === voice.voice_id }]"
        >
          <div class="voice-name">{{ voice.name }}</div>
          <div class="voice-category">{{ voice.category || 'Unknown' }}</div>
        </div>
      </div>
    </div>

    <!-- SRT Upload Section -->
    <div class="section">
      <h3>📁 Upload File SRT</h3>
      <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
        <input
          ref="fileInput"
          type="file"
          accept=".srt"
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content" @click="$refs.fileInput.click()">
          <div class="upload-icon">📄</div>
          <p>Kéo thả file SRT vào đây hoặc click để chọn</p>
          <small>Chỉ hỗ trợ file .srt</small>
        </div>
      </div>
    </div>

    <!-- SRT Content Display -->
    <div class="section" v-if="srtContent.length > 0">
      <h3>📝 Nội dung SRT</h3>
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
          {{ isProcessing ? '🔄 Đang xử lý tất cả...' : '🎙️ Clone tất cả' }}
        </button>
        <button
          @click="downloadAllAudio"
          :disabled="audioFiles.length === 0"
          class="btn-secondary"
        >
          📥 Tải xuống tất cả
        </button>
      </div>
    </div>

    <!-- Generated Audio Section -->
    <div class="section" v-if="audioFiles.length > 0">
      <h3>🔊 Audio đã tạo</h3>
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
  </div>
</template>

<script>
export default {
  name: 'VoiceCloner',
  data() {
    return {
      apiKey: '',
      selectedVoiceId: '',
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

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.processSRTFile(file);
      }
    },

    handleDrop(event) {
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
        this.successMessage = `Đã đọc ${this.srtContent.length} subtitle từ file SRT`;
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
      this.audioFiles.forEach(audio => {
        setTimeout(() => this.downloadAudio(audio), 100);
      });
    }
  }
}
</script>
<style src="./voice-cloner.css" scoped></style>
