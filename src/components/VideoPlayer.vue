<template>
  <div class="video-player-container">
    <div class="video-header">
      <div class="video-icon">🎥</div>
      <h3 class="video-title">Video Preview</h3>
      <div class="video-controls" v-if="videoSrc">
        <label class="speed-label">Speed:</label>
        <select v-model="playbackRate" @change="changePlaybackRate" class="speed-select">
          <option value="0.5">0.5x</option>
          <option value="0.7">0.7x</option>
          <option value="0.8">0.8x</option>
          <option value="0.9">0.9x</option>
          <option value="1">1x</option>
          <option value="1.1">1.1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
          <option value="1.75">1.75x</option>
          <option value="2">2x</option>
        </select>
      </div>
    </div>
    
    <div class="video-wrapper" v-if="videoSrc">
      <video
        ref="videoElement"
        :src="videoSrc"
        @timeupdate="handleTimeUpdate"
        @seeked="handleSeeked"
        @loadedmetadata="handleLoadedMetadata"
        @play="handlePlay"
        @pause="handlePause"
        controls
        class="video-element"
      >
        Your browser does not support the video tag.
      </video>
      
      <!-- Subtitle Overlay -->
      <div class="subtitle-overlay" v-if="currentSubtitle">
        <div class="subtitle-text">
          {{ currentSubtitle.translatedText || currentSubtitle.text }}
        </div>
      </div>
    </div>
    
    <div class="video-placeholder" v-else>
      <div class="placeholder-content">
        <div class="placeholder-icon">🎬</div>
        <div class="placeholder-title">No Video Selected</div>
        <div class="placeholder-description">
          Upload a video file to preview with synchronized subtitles
        </div>
      </div>
    </div>
    
    <!-- Video Controls Info -->
    <div class="video-info" v-if="videoSrc">
      <div class="info-item">
        <span class="info-label">Current Time:</span>
        <span class="info-value">{{ formatTime(currentTime) }}</span>
      </div>
      <div class="info-item" v-if="duration">
        <span class="info-label">Duration:</span>
        <span class="info-value">{{ formatTime(duration) }}</span>
      </div>
      <div class="info-item" v-if="currentSubtitle">
        <span class="info-label">Current Subtitle:</span>
        <span class="info-value">#{{ currentSubtitle.index }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Speed:</span>
        <span class="info-value">{{ playbackRate }}x</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    videoSrc: {
      type: String,
      default: null
    },
    subtitles: {
      type: Array,
      default: () => []
    },
    currentTime: {
      type: Number,
      default: 0
    }
  },
  
  data() {
    return {
      duration: 0,
      isPlaying: false,
      playbackRate: 1
    }
  },
  
  computed: {
    currentSubtitle() {
      if (!this.subtitles.length) return null;
      
      return this.subtitles.find(subtitle => {
        const startSeconds = subtitle.startSeconds || this.timeToSeconds(subtitle.startTime);
        const endSeconds = subtitle.endSeconds || this.timeToSeconds(subtitle.endTime);
        return this.currentTime >= startSeconds && this.currentTime <= endSeconds;
      });
    }
  },
  
  watch: {
    currentTime(newTime) {
      if (this.$refs.videoElement && Math.abs(this.$refs.videoElement.currentTime - newTime) > 1) {
        this.$refs.videoElement.currentTime = newTime;
      }
    },
    
    videoSrc() {
      this.$nextTick(() => {
        if (this.$refs.videoElement) {
          this.$refs.videoElement.load();
          // Reset playback rate when new video is loaded
          this.playbackRate = 1;
        }
      });
    }
  },
  
  mounted() {
    // Load saved playback rate
    const savedRate = localStorage.getItem('video_playback_rate');
    if (savedRate) {
      this.playbackRate = parseFloat(savedRate);
    }
  },
  
  methods: {
    handleTimeUpdate(event) {
      const currentTime = event.target.currentTime;
      this.$emit('timeupdate', currentTime);
    },
    
    handleSeeked(event) {
      const currentTime = event.target.currentTime;
      this.$emit('seek', currentTime);
    },
    
    handleLoadedMetadata(event) {
      this.duration = event.target.duration;
      // Set initial playback rate
      if (this.$refs.videoElement) {
        this.$refs.videoElement.playbackRate = this.playbackRate;
      }
    },
    
    handlePlay() {
      this.isPlaying = true;
    },
    
    handlePause() {
      this.isPlaying = false;
    },
    
    changePlaybackRate() {
      if (this.$refs.videoElement) {
        this.$refs.videoElement.playbackRate = this.playbackRate;
        // Save playback rate preference
        localStorage.setItem('video_playback_rate', this.playbackRate.toString());
      }
    },
    
    timeToSeconds(timeStr) {
      if (!timeStr) return 0;
      const parts = timeStr.split(":");
      const seconds = parseFloat(parts[2].replace(",", "."));
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
    },
    
    formatTime(seconds) {
      if (!seconds) return '00:00:00';
      
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      
      return [hours, minutes, secs]
        .map(val => val.toString().padStart(2, '0'))
        .join(':');
    }
  }
}
</script>

<style scoped>
.video-player-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.video-icon {
  font-size: 20px;
}

.video-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.video-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speed-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.speed-select {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.speed-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.speed-select option {
  background: #667eea;
  color: white;
}

.video-wrapper {
  position: relative;
  flex: 1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.video-element {
  width: 100%;
  height: 100%;
  max-height: 500px;
  object-fit: contain;
}

.subtitle-overlay {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  max-width: 80%;
  text-align: center;
  z-index: 10;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.subtitle-text {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.video-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  min-height: 400px;
}

.placeholder-content {
  text-align: center;
  color: #718096;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.placeholder-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
}

.placeholder-description {
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
}

.video-info {
  padding: 16px 20px;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  font-family: 'Monaco', 'Menlo', monospace;
}

/* Responsive Design */
@media (max-width: 768px) {
  .video-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .video-controls {
    width: 100%;
    justify-content: flex-end;
  }
  
  .subtitle-overlay {
    bottom: 40px;
    max-width: 90%;
    padding: 6px 12px;
  }
  
  .subtitle-text {
    font-size: 14px;
  }
  
  .video-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .info-item {
    justify-content: space-between;
  }
}
</style>