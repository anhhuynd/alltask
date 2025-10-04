<template>
  <div class="translator-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">🌐</div>
        <div class="header-text">
          <h1 class="header-title">Enhanced Subtitle Translator</h1>
          <p class="header-subtitle">AI-powered subtitle translation with video preview and editing</p>
        </div>
      </div>
    </div>

    <!-- Language Settings Card -->
    <div class="card language-card">
      <div class="card-header info">
        <div class="card-icon">🌐</div>
        <h3 class="card-title">Language Settings</h3>
      </div>
      <div class="card-content">
        <div class="language-grid">
          <div class="form-group">
            <label class="form-label">Dịch từ:</label>
            <select v-model="sourceLanguage" class="form-select">
              <option value="chinese">🇨🇳 Tiếng Trung</option>
              <option value="english">🇺🇸 Tiếng Anh</option>
              <option value="japanese">🇯🇵 Tiếng Nhật</option>
              <option value="korean">🇰🇷 Tiếng Hàn</option>
              <option value="french">🇫🇷 Tiếng Pháp</option>
              <option value="german">🇩🇪 Tiếng Đức</option>
              <option value="spanish">🇪🇸 Tiếng Tây Ban Nha</option>
              <option value="thai">🇹🇭 Tiếng Thái</option>
            </select>
          </div>
          
          <div class="arrow-container">
            <div class="arrow-icon">→</div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Dịch sang:</label>
            <select v-model="targetLanguage" class="form-select">
              <option value="vietnamese">🇻🇳 Tiếng Việt</option>
              <option value="english">🇺🇸 Tiếng Anh</option>
              <option value="chinese">🇨🇳 Tiếng Trung</option>
              <option value="japanese">🇯🇵 Tiếng Nhật</option>
              <option value="korean">🇰🇷 Tiếng Hàn</option>
              <option value="french">🇫🇷 Tiếng Pháp</option>
              <option value="german">🇩🇪 Tiếng Đức</option>
              <option value="spanish">🇪🇸 Tiếng Tây Ban Nha</option>
              <option value="thai">🇹🇭 Tiếng Thái</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Translation Style Settings Card -->
    <div class="card style-card">
      <div class="card-header success">
        <div class="card-icon">🎭</div>
        <h3 class="card-title">Translation Style Settings</h3>
      </div>
      <div class="card-content">
        <div class="style-grid">
          <div class="form-group">
            <label class="form-label">Phong cách dịch:</label>
            <select v-model="styleWrite" class="form-select">
              <option value="">🎯 Phong cách mặc định</option>
              <option 
                v-for="style in translationStyles" 
                :key="style.value" 
                :value="style.value"
              >
                {{ style.icon }} {{ style.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Thêm phong cách mới:</label>
            <div class="add-style-wrapper">
              <input 
                v-model="newStyleName" 
                type="text" 
                placeholder="Nhập tên phong cách (VD: Sinh tồn, Trinh thám...)"
                class="form-input"
                @keyup.enter="addNewStyle"
              />
              <button 
                @click="addNewStyle" 
                :disabled="!newStyleName.trim()"
                class="btn btn-add-style"
              >
                <span class="btn-icon">➕</span>
                <span>Thêm</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Current Style Preview -->
        <div v-if="styleWrite" class="style-preview">
          <div class="preview-header">
            <span class="preview-icon">👁️</span>
            <span class="preview-title">Phong cách hiện tại:</span>
          </div>
          <div class="preview-content">
            <span class="style-badge">{{ getStyleLabel(styleWrite) }}</span>
            <div class="style-actions">
              <button 
                @click="removeStyle(styleWrite)" 
                v-if="isCustomStyle(styleWrite)"
                class="btn btn-xs btn-danger"
                title="Xóa phong cách này"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>

        <!-- Predefined Styles Info -->
        <div class="styles-info">
          <div class="info-header">
            <span class="info-icon">💡</span>
            <span class="info-title">Gợi ý phong cách:</span>
          </div>
          <div class="suggested-styles">
            <button 
              v-for="suggestion in styleSuggestions"
              :key="suggestion"
              @click="quickAddStyle(suggestion)"
              class="suggestion-btn"
              :disabled="hasStyle(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- API Settings Card -->
    <!-- <div class="card api-card">
      <div class="card-header primary">
        <div class="card-icon">🔑</div>
        <h3 class="card-title">API Settings</h3>
      </div>
      <div class="card-content">
        <div class="form-group">
          <label class="form-label">ChatGPT API Key:</label>
          <div class="input-wrapper">
            <input 
              v-model="apiKey" 
              type="password" 
              placeholder="Enter your ChatGPT API key..."
              class="form-input"
              :class="{ 'has-value': apiKey }"
            />
            <div class="api-status">
              <div class="status-dot" :class="{ 'active': apiKey }"></div>
              <span class="status-text">{{ apiKey ? 'API Key Set' : 'API Key Required' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- File Management Card -->
    <div class="card file-card">
      <div class="card-header warning">
        <div class="card-icon">📁</div>
        <h3 class="card-title">File Management</h3>
      </div>
      <div class="card-content">
        <div class="file-grid">
          <div class="file-upload-section">
            <label class="form-label">Import Subtitle File (*.txt, *.srt):</label>
            <div class="file-input-wrapper">
              <input 
                type="file" 
                @change="handleSubtitleFile" 
                accept=".txt,.srt"
                class="file-input"
                id="subtitle-upload"
                ref="subtitleInput"
              />
              <label for="subtitle-upload" class="file-input-label">
                <span class="upload-icon">📄</span>
                <span class="upload-text">Choose Subtitle File</span>
              </label>
              <div v-if="selectedSubtitleFileName" class="file-name">
                <span class="file-icon">📄</span>
                <span class="file-text">{{ selectedSubtitleFileName }}</span>
              </div>
            </div>
          </div>

          <div class="file-upload-section">
            <label class="form-label">Import Video File (*.mp4, *.webm, *.ogg):</label>
            <div class="file-input-wrapper">
              <input 
                type="file" 
                @change="handleVideoFile" 
                accept=".mp4,.webm,.ogg"
                class="file-input"
                id="video-upload"
                ref="videoInput"
              />
              <label for="video-upload" class="file-input-label">
                <span class="upload-icon">🎥</span>
                <span class="upload-text">Choose Video File</span>
              </label>
              <div v-if="selectedVideoFileName" class="file-name">
                <span class="file-icon">🎥</span>
                <span class="file-text">{{ selectedVideoFileName }}</span>
              </div>
            </div>
          </div>
          
          <div class="folder-section">
            <label class="form-label">Output Folder:</label>
            <button 
              @click="chooseFolder" 
              :disabled="isRunning || isExporting"
              class="btn btn-primary folder-btn"
            >
              <span class="btn-icon">📂</span>
              <span>{{ folderPath ? 'Folder Selected' : 'Choose Folder' }}</span>
            </button>
          </div>
        </div>

        <div v-if="folderPath" class="folder-display">
          <div class="folder-info">
            <span class="folder-icon">📁</span>
            <span class="folder-path">{{ folderPath }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Control -->
    <div v-if="subtitles && subtitles.length > 0" class="card control-card">
      <div class="card-content">
        <div class="control-buttons">
          <button 
            @click="start" 
            :disabled="isRunning || !apiKey || isExporting"
            class="btn btn-start"
            :class="{ 'processing': isRunning }"
          >
            <div v-if="!isRunning" class="btn-content">
              <span class="btn-icon">▶️</span>
              <span class="btn-text">Start Translation</span>
            </div>
            <div v-else class="btn-content processing">
              <div class="loading-spinner"></div>
              <span class="btn-text">Translating Subtitles...</span>
            </div>
          </button>

          <button 
            @click="exportEditedSubtitles" 
            :disabled="!hasTranslatedContent || isExporting"
            class="btn btn-export"
            :class="{ 
              'exporting': isExporting,
              'export-success': exportSuccess && !isExporting
            }"
          >
            <div v-if="!isExporting && !exportSuccess" class="btn-content">
              <span class="btn-icon">💾</span>
              <span class="btn-text">Export Edited SRT ({{ chunks.length }} files)</span>
            </div>
            <div v-else-if="isExporting" class="btn-content exporting">
              <div class="loading-spinner export-spinner"></div>
              <span class="btn-text">Exporting Files...</span>
            </div>
            <div v-else class="btn-content success">
              <span class="btn-icon">✅</span>
              <span class="btn-text">Export Completed!</span>
            </div>
          </button>
        </div>
        
        <div v-if="isRunning" class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-text">{{ Math.round(progressPercentage) }}% Complete</div>
        </div>

        <!-- Export Progress -->
        <div v-if="isExporting" class="export-progress-section">
          <div class="export-progress-bar">
            <div class="export-progress-fill" :style="{ width: exportProgressPercentage + '%' }"></div>
          </div>
          <div class="export-progress-text">
            Exporting {{ exportedFileCount }}/{{ totalExportFiles }} files...
          </div>
        </div>
      </div>
    </div>

    <!-- Translation Progress Status -->
    <div v-if="subtitles && subtitles.length > 0" class="card progress-status-card">
      <div class="card-header">
        <div class="card-icon">📊</div>
        <h3 class="card-title">Translation Progress</h3>
      </div>
      <div class="card-content">
        <!-- Summary Stats -->
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-icon">📝</div>
            <div class="stat-content">
              <div class="stat-number">{{ subtitles.length }}</div>
              <div class="stat-label">Tổng số phụ đề</div>
            </div>
          </div>
          <div class="stat-item success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ completedCount }}</div>
              <div class="stat-label">Đã xử lý</div>
            </div>
          </div>
          <div class="stat-item warning">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">Chờ xử lý</div>
            </div>
          </div>
          <div class="stat-item info">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <div class="stat-number">{{ chunks.length }}</div>
              <div class="stat-label">Đã chia {{ chunks.length }} đoạn</div>
            </div>
          </div>
        </div>

        <!-- Chunk Status Grid -->
        <div v-if="chunks && chunks.length > 1" class="chunk-status-section">
          <h4 class="section-title">Trạng thái các đoạn:</h4>
          <div class="chunk-status-grid">
            <div
              v-for="(chunk, index) in chunks"
              :key="index"
              class="chunk-status-card"
              :class="getChunkStatusClass(chunk.status)"
            >
              <div class="chunk-header">
                <div class="chunk-title">Đoạn {{ index + 1 }}</div>
                <div class="chunk-status-indicator">
                  <div v-if="chunk.status === 'processing'" class="loading-spinner small"></div>
                  <span class="status-icon" :class="chunk.status">
                    {{ getChunkStatusIcon(chunk.status) }}
                  </span>
                </div>
              </div>
              <div class="chunk-info">
                <div class="chunk-time">{{ chunk.startTime }} — {{ chunk.endTime }}</div>
                <div class="chunk-count">{{ chunk.subtitles.length }} phụ đề</div>
              </div>
              <div class="chunk-status-text">
                {{ getChunkStatusText(chunk.status) }}
              </div>
              <div v-if="chunk.status === 'success'" class="chunk-actions">
                <button 
                  @click="downloadChunkFile(chunk, index)" 
                  :disabled="isExporting"
                  class="btn btn-xs btn-success"
                >
                  💾 Tải về
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-if="subtitles && subtitles.length > 0" class="main-content">
      <!-- Video Player Section -->
      <div class="video-section">
        <VideoPlayer 
          :videoSrc="videoSrc"
          :subtitles="subtitles"
          :currentTime="currentTime"
          @timeupdate="handleTimeUpdate"
          @seek="handleSeek"
        />
      </div>

      <!-- Subtitle Table Section -->
      <div class="table-section">
        <SubtitleTable 
          :subtitles="subtitles"
          :currentTime="currentTime"
          @updateSubtitle="handleSubtitleUpdate"
          @seekTo="handleSeekTo"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!subtitles || subtitles.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📝</div>
        <div class="empty-title">No Subtitle Data Available</div>
        <div class="empty-description">
          Please upload a .txt or .srt file to start the translation process
        </div>
        <div class="empty-actions">
          <label for="subtitle-upload" class="btn btn-primary">
            <span class="btn-icon">📄</span>
            <span>Upload Subtitle File</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VideoPlayer from './VideoPlayer.vue'
import SubtitleTable from './SubtitleTable.vue'

export default {
  name: "SubtitleTranslator",
  components: {
    VideoPlayer,
    SubtitleTable
  },
  data() {
    return {
      apiKey: "",
      subtitles: [],
      fileContent: "",
      folderPath: null,
      folderHandle: null,
      isRunning: false,
      isExporting: false,
      exportSuccess: false,
      exportedFileCount: 0,
      totalExportFiles: 0,
      message: "",
      chunks: [],
      currentChunkIndex: 0,
      processedChunks: 0,
      downloadedFiles: [],
      sourceLanguage: "chinese",
      targetLanguage: "vietnamese",
      selectedSubtitleFileName: "",
      selectedVideoFileName: "",
      videoSrc: null,
      currentTime: 0,
      styleWrite: "",
      newStyleName: "",
      
      // Default translation styles
      defaultTranslationStyles: [
        { value: "sinh_ton", label: "Sinh tồn", icon: "🏕️" },
        { value: "trinh_tham", label: "Trinh thám", icon: "🔍" },
        { value: "hanh_dong", label: "Hành động", icon: "💥" },
        { value: "kinh_di", label: "Kinh dị", icon: "👻" },
        { value: "lang_man", label: "Lãng mạn", icon: "💕" },
        { value: "hai_huoc", label: "Hài hước", icon: "😂" },
        { value: "khoa_hoc", label: "Khoa học", icon: "🔬" },
        { value: "lich_su", label: "Lịch sử", icon: "📜" },
        { value: "the_thao", label: "Thể thao", icon: "⚽" },
        { value: "am_thuc", label: "Ẩm thực", icon: "🍽️" }
      ],

      // Style suggestions for quick add
      styleSuggestions: [
        "Phiêu lưu", "Tâm lý", "Tội phạm", "Chiến tranh", 
        "Tài liệu", "Giáo dục", "Công nghệ", "Du lịch"
      ],

      // Language mappings
      languageNames: {
        chinese: "tiếng Trung",
        english: "tiếng Anh",
        japanese: "tiếng Nhật",
        korean: "tiếng Hàn",
        french: "tiếng Pháp",
        german: "tiếng Đức",
        spanish: "tiếng Tây Ban Nha",
        thai: "tiếng Thái",
        vietnamese: "tiếng Việt",
      }
    };
  },

  computed: {
    translationStyles() {
      return [...this.defaultTranslationStyles, ...this.customStyles];
    },

    customStyles() {
      const saved = localStorage.getItem('custom_translation_styles');
      return saved ? JSON.parse(saved) : [];
    },

    completedCount() {
      return this.subtitles.filter((s) => s.status === "success" || s.status === "edited").length;
    },

    pendingCount() {
      return this.subtitles.filter(
        (s) => s.status === "pending" || s.status === "Prepare"
      ).length;
    },

    progressPercentage() {
      if (this.chunks.length === 0) return 0;
      return (this.processedChunks / this.chunks.length) * 100;
    },

    exportProgressPercentage() {
      if (this.totalExportFiles === 0) return 0;
      return (this.exportedFileCount / this.totalExportFiles) * 100;
    },

    hasTranslatedContent() {
      return this.subtitles.some(s => s.translatedText && s.translatedText.trim() !== '');
    }
  },

  mounted() {
    this.loadSettings();
  },

  watch: {
    apiKey() {
      this.saveApiKey();
    },
    sourceLanguage() {
      localStorage.setItem("source_language", this.sourceLanguage);
    },
    targetLanguage() {
      localStorage.setItem("target_language", this.targetLanguage);
    },
    styleWrite() {
      localStorage.setItem("translation_style", this.styleWrite);
    },
    folderPath() {
      if (this.folderPath) {
        localStorage.setItem("selected_folder_path", this.folderPath);
      }
    },
    exportSuccess(newValue) {
      if (newValue) {
        setTimeout(() => {
          this.exportSuccess = false;
        }, 3000);
      }
    }
  },

  methods: {
    // Load saved settings
    loadSettings() {
      const savedKey = localStorage.getItem("api-chatgpt-key");
      if (savedKey) {
        this.apiKey = savedKey;
      }

      const savedSourceLang = localStorage.getItem("source_language");
      if (savedSourceLang) {
        this.sourceLanguage = savedSourceLang;
      }

      const savedTargetLang = localStorage.getItem("target_language");
      if (savedTargetLang) {
        this.targetLanguage = savedTargetLang;
      }

      const savedStyle = localStorage.getItem("translation_style");
      if (savedStyle) {
        this.styleWrite = savedStyle;
      }

      const savedFolderPath = localStorage.getItem("selected_folder_path");
      if (savedFolderPath) {
        this.folderPath = savedFolderPath;
      }
    },

    // Translation Style Management
    addNewStyle() {
      const styleName = this.newStyleName.trim();
      if (!styleName) return;

      // Check if style already exists
      if (this.hasStyle(styleName)) {
        alert(`Phong cách "${styleName}" đã tồn tại!`);
        return;
      }

      // Create new style object
      const newStyle = {
        value: this.generateStyleValue(styleName),
        label: styleName,
        icon: this.getRandomIcon(),
        custom: true
      };

      // Save to localStorage
      const customStyles = this.customStyles;
      customStyles.push(newStyle);
      localStorage.setItem('custom_translation_styles', JSON.stringify(customStyles));

      // Set as current style
      this.styleWrite = newStyle.value;
      this.newStyleName = "";

      // Show success message
      this.showToast(`Đã thêm phong cách "${styleName}" thành công!`, 'success');
    },

    quickAddStyle(styleName) {
      this.newStyleName = styleName;
      this.addNewStyle();
    },

    removeStyle(styleValue) {
      if (!this.isCustomStyle(styleValue)) return;

      if (confirm('Bạn có chắc muốn xóa phong cách này?')) {
        const customStyles = this.customStyles.filter(s => s.value !== styleValue);
        localStorage.setItem('custom_translation_styles', JSON.stringify(customStyles));
        
        // Reset current style if it's the one being removed
        if (this.styleWrite === styleValue) {
          this.styleWrite = "";
        }

        this.showToast('Đã xóa phong cách thành công!', 'success');
      }
    },

    hasStyle(styleName) {
      const allStyles = this.translationStyles;
      return allStyles.some(style => 
        style.label.toLowerCase() === styleName.toLowerCase()
      );
    },

    isCustomStyle(styleValue) {
      return this.customStyles.some(s => s.value === styleValue);
    },

    getStyleLabel(styleValue) {
      const style = this.translationStyles.find(s => s.value === styleValue);
      return style ? `${style.icon} ${style.label}` : styleValue;
    },

    generateStyleValue(styleName) {
      return styleName.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .substring(0, 20);
    },

    getRandomIcon() {
      const icons = ['🎭', '🎪', '🎨', '🎬', '🎯', '🎲', '🎸', '🎺', '🎻', '🎤', '🎧', '🎮', '🎰', '🎳'];
      return icons[Math.floor(Math.random() * icons.length)];
    },

    // File handling methods
    handleSubtitleFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.selectedSubtitleFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result;
        this.parseSubtitles(this.fileContent);
        this.createChunks();
        this.downloadedFiles = [];
        this.exportSuccess = false;
      };
      reader.readAsText(file, "utf-8");
    },

    handleVideoFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.selectedVideoFileName = file.name;
      this.videoSrc = URL.createObjectURL(file);
    },

    // Video player event handlers
    handleTimeUpdate(time) {
      this.currentTime = time;
    },

    handleSeek(time) {
      this.currentTime = time;
    },

    handleSubtitleUpdate(index, newText) {
      const subtitle = this.subtitles.find(s => s.index === index);
      if (subtitle) {
        subtitle.translatedText = newText;
        if (newText.trim() !== '') {
          subtitle.status = 'edited';
        }
        this.exportSuccess = false;
      }
    },

    handleSeekTo(time) {
      this.currentTime = time;
    },

    // Export methods
    async exportEditedSubtitles() {
      if (!this.hasTranslatedContent) {
        alert("No translated content to export.");
        return;
      }

      this.isExporting = true;
      this.exportSuccess = false;
      this.exportedFileCount = 0;

      try {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const chunksWithTranslations = this.chunks.filter(chunk => 
          chunk.subtitles.some(s => s.translatedText && s.translatedText.trim() !== '')
        );
        
        this.totalExportFiles = chunksWithTranslations.length;

        for (let i = 0; i < chunksWithTranslations.length; i++) {
          const chunk = chunksWithTranslations[i];
          const chunkIndex = this.chunks.indexOf(chunk);
          
          const chunkSubtitlesWithTranslations = chunk.subtitles.filter(s => 
            s.translatedText && s.translatedText.trim() !== ''
          );

          if (chunkSubtitlesWithTranslations.length > 0) {
            const srtContent = this.createSrtFromSubtitles(chunkSubtitlesWithTranslations);
            
            let fileName;
            if (this.chunks.length === 1) {
              fileName = `edited_${timestamp}.srt`;
            } else {
              fileName = `edited_${(chunkIndex + 1).toString().padStart(2, '0')}.srt`;
            }

            await this.saveTranslatedFile(srtContent, fileName);
            this.exportedFileCount++;

            if (i < chunksWithTranslations.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        }

        this.exportSuccess = true;
        
        if (this.exportedFileCount > 0) {
          setTimeout(() => {
            alert(`Successfully exported ${this.exportedFileCount} subtitle files!`);
          }, 100);
        } else {
          alert("No translated content found to export.");
        }

      } catch (error) {
        console.error("Error exporting subtitles:", error);
        alert("Error exporting subtitles: " + error.message);
        this.exportSuccess = false;
      } finally {
        this.isExporting = false;
      }
    },

    async downloadChunkFile(chunk, chunkIndex) {
      try {
        const chunkSubtitlesWithTranslations = chunk.subtitles.filter(s => 
          s.translatedText && s.translatedText.trim() !== ''
        );

        if (chunkSubtitlesWithTranslations.length > 0) {
          const srtContent = this.createSrtFromSubtitles(chunkSubtitlesWithTranslations);
          const fileName = `chunk_${(chunkIndex + 1).toString().padStart(2, '0')}.srt`;
          
          await this.saveTranslatedFile(srtContent, fileName);
          alert(`Downloaded: ${fileName}`);
        } else {
          alert("This chunk has no translated content to download.");
        }
      } catch (error) {
        console.error("Error downloading chunk:", error);
        alert("Error downloading chunk: " + error.message);
      }
    },

    // Folder selection
    async chooseFolder() {
      this.folderLoading = true;
      try {
        if (window.require) {
          const { dialog } = window.require("electron").remote;
          const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
          });
          if (!result.canceled && result.filePaths.length > 0) {
            this.folderPath = result.filePaths[0];
            this.message = "Đã chọn: " + this.folderPath;
          } else {
            this.message = "Chưa chọn thư mục.";
          }
        } else if (window.electronAPI && window.electronAPI.chooseFolder) {
          this.folderPath = await window.electronAPI.chooseFolder();
          if (this.folderPath) {
            this.message = "Đã chọn: " + this.folderPath;
          } else {
            this.message = "Chưa chọn thư mục.";
          }
        } else if (window.showDirectoryPicker) {
          const dirHandle = await window.showDirectoryPicker();
          this.folderPath = dirHandle.name;
          this.message = "Đã chọn: " + this.folderPath;
        } else {
          this.folderPath = "Downloads (mặc định)";
          alert("Trình duyệt không hỗ trợ chọn thư mục. File sẽ được lưu vào thư mục Downloads.");
        }
      } catch (error) {
        console.error("Error selecting folder:", error);
        this.folderPath = "Downloads (mặc định)";
        alert("Không thể chọn thư mục. File sẽ được lưu vào thư mục Downloads.");
      } finally {
        this.folderLoading = false;
      }
    },

    // Subtitle parsing
    parseSubtitles(srtText) {
      const newSubtitles = [];
      const blocks = srtText.trim().split("\n\n");

      blocks.forEach((block) => {
        const lines = block.split("\n");
        if (lines.length >= 3) {
          const index = parseInt(lines[0]);
          const timeRange = lines[1];
          const text = lines.slice(2).join("\n");

          const timeRangeParts = timeRange.split(" --> ");
          const startTime = timeRangeParts[0] ? timeRangeParts[0].trim() : "";
          const endTime = timeRangeParts[1] ? timeRangeParts[1].trim() : "";

          newSubtitles.push({
            index: index,
            startTime: startTime,
            endTime: endTime,
            startSeconds: this.timeToSeconds(startTime),
            endSeconds: this.timeToSeconds(endTime),
            text: text,
            translatedText: "",
            status: "pending",
          });
        }
      });

      this.subtitles = newSubtitles;
      console.log("Parsed subtitles:", newSubtitles.length);
    },

    // Time conversion utilities
    timeToSeconds(timeStr) {
      if (!timeStr) return 0;
      const parts = timeStr.split(":");
      const seconds = parseFloat(parts[2].replace(",", "."));
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
    },

    secondsToTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);

      return (
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        secs.toString().padStart(2, "0") +
        "," +
        ms.toString().padStart(3, "0")
      );
    },

    // Chunk creation
    createChunks() {
      if (this.subtitles.length === 0) return;

      const newChunks = [];
      const maxChunkDuration = 180; // 3 minutes
      let currentChunk = [];
      let chunkStartTime = 0;

      for (let i = 0; i < this.subtitles.length; i++) {
        const subtitle = this.subtitles[i];
        const subtitleStartTime = this.timeToSeconds(subtitle.startTime);
        const subtitleEndTime = this.timeToSeconds(subtitle.endTime);

        if (currentChunk.length === 0) {
          chunkStartTime = subtitleStartTime;
        }

        const chunkDuration = subtitleEndTime - chunkStartTime;

        if (chunkDuration > maxChunkDuration && currentChunk.length > 0) {
          newChunks.push({
            subtitles: currentChunk.slice(),
            startTime: this.secondsToTime(chunkStartTime),
            endTime: currentChunk[currentChunk.length - 1].endTime,
            status: "pending",
            fileName: null,
          });

          currentChunk = [subtitle];
          chunkStartTime = subtitleStartTime;
        } else {
          currentChunk.push(subtitle);
        }
      }

      if (currentChunk.length > 0) {
        newChunks.push({
          subtitles: currentChunk.slice(),
          startTime: this.secondsToTime(chunkStartTime),
          endTime: currentChunk[currentChunk.length - 1].endTime,
          status: "pending",
          fileName: null,
        });
      }

      this.chunks = newChunks;
      console.log("Created chunks:", newChunks.length);
    },

    // Translation prompt generation
    generateTranslationPrompt(chunkSrtContent) {
      const sourceLangName = this.languageNames[this.sourceLanguage];
      const targetLangName = this.languageNames[this.targetLanguage];
      
      let styleInstruction = "";
      if (this.styleWrite) {
        const currentStyle = this.translationStyles.find(s => s.value === this.styleWrite);
        const styleName = currentStyle ? currentStyle.label : this.styleWrite;
        styleInstruction = ` theo phong cách ${styleName}`;
      }

      return `Bạn là một chuyên gia dịch thuật và làm phụ đề phim. 
Nhiệm vụ của bạn: 
1. Dịch tất cả các đoạn hội thoại dưới đây từ ${sourceLangName} sang ${targetLangName}, giữ nguyên nghĩa tự nhiên, dễ hiểu và sát ngữ cảnh${styleInstruction}. 
2. Xuất kết quả dưới định dạng phụ đề chuẩn .srt, có đánh số thứ tự, thời gian bắt đầu và kết thúc theo chuẩn phụ đề (giữ nguyên mốc thời gian từ dữ liệu gốc).
3. Chỉ xuất ra nội dung phụ đề .srt, không giải thích thêm gì khác.

Dưới đây là dữ liệu ${sourceLangName} kèm timestamp để bạn dịch và tạo phụ đề:
${chunkSrtContent}

Hãy bắt đầu ngay bây giờ.`;
    },

    // Main processing function
    async start() {
      if (this.isRunning) return;

      if (!this.apiKey) {
        alert("Vui lòng nhập API Key.");
        return;
      }

      if (!this.fileContent) {
        alert("Vui lòng chọn file để xử lý.");
        return;
      }

      this.isRunning = true;
      this.processedChunks = 0;
      this.downloadedFiles = [];
      this.exportSuccess = false;

      try {
        for (let i = 0; i < this.chunks.length; i++) {
          this.currentChunkIndex = i;
          const chunk = this.chunks[i];

          chunk.status = "processing";

          const chunkSrtContent = this.createSrtFromSubtitles(chunk.subtitles);
          const prompt = this.generateTranslationPrompt(chunkSrtContent);

          try {
            const translatedSrt = await this.generateSrt(prompt);
            const translatedSubtitles = this.parseTranslatedChunk(translatedSrt);
            const fileName = this.generateChunkFileName(i, this.chunks.length);
            chunk.fileName = fileName;

            this.downloadedFiles.push(fileName);
            chunk.status = "success";

            // Update subtitles with translations
            chunk.subtitles.forEach((subtitle) => {
              const originalIndex = this.subtitles.findIndex(
                (s) => s.index === subtitle.index
              );
              if (originalIndex !== -1) {
                this.subtitles[originalIndex].status = "success";
                const translatedSubtitle = translatedSubtitles.find(
                  (ts) => ts.index === subtitle.index
                );
                if (translatedSubtitle) {
                  this.subtitles[originalIndex].translatedText = translatedSubtitle.text;
                }
              }
            });

            console.log(`Chunk ${i + 1} completed and saved as ${fileName}`);

          } catch (error) {
            console.error(`Error processing chunk ${i + 1}:`, error);
            chunk.status = "error";

            chunk.subtitles.forEach((subtitle) => {
              const originalIndex = this.subtitles.findIndex(
                (s) => s.index === subtitle.index
              );
              if (originalIndex !== -1) {
                this.subtitles[originalIndex].status = "error";
              }
            });
          }

          this.processedChunks++;

          if (i < this.chunks.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        const successfulChunks = this.chunks.filter(chunk => chunk.status === "success").length;
        if (successfulChunks > 0) {
          alert(`Hoàn thành! Đã dịch và lưu ${successfulChunks} file thành công.`);
        } else {
          alert("Không có đoạn nào được dịch thành công.");
        }

      } catch (error) {
        console.error("Error during processing:", error);
        alert("Có lỗi xảy ra: " + (error.message || "Unknown error"));
      } finally {
        this.isRunning = false;
      }
    },

    // Utility methods
    generateChunkFileName(chunkIndex, totalChunks) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      if (totalChunks === 1) {
        return `sub_${timestamp}.srt`;
      }
      return `sub_${(chunkIndex + 1).toString().padStart(2, '0')}_${timestamp}.srt`;
    },

    createSrtFromSubtitles(subtitles) {
      return subtitles
        .map((subtitle) => {
          const text = subtitle.translatedText || subtitle.text;
          return (
            subtitle.index +
            "\n" +
            subtitle.startTime +
            " --> " +
            subtitle.endTime +
            "\n" +
            text
          );
        })
        .join("\n\n");
    },

    parseTranslatedChunk(srtText) {
      const newSubtitles = [];
      const blocks = srtText.trim().split("\n\n");

      blocks.forEach((block) => {
        const lines = block.split("\n");
        if (lines.length >= 3) {
          const index = parseInt(lines[0]);
          const timeRange = lines[1];
          const text = lines.slice(2).join("\n");

          const timeRangeParts = timeRange.split(" --> ");
          const startTime = timeRangeParts[0] ? timeRangeParts[0].trim() : "";
          const endTime = timeRangeParts[1] ? timeRangeParts[1].trim() : "";

          newSubtitles.push({
            index: index,
            startTime: startTime,
            endTime: endTime,
            text: text,
            status: "success",
          });
        }
      });

      return newSubtitles;
    },

    // API call
    async generateSrt(prompt) {
      const response = await fetch(
        "https://gpt1.shupremium.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    },

    // File saving
    async saveTranslatedFile(content, fileName) {
      try {
        if (window.require) {
          const fs = window.require("fs");
          const path = window.require("path");
          const filePath = path.join(this.folderPath, fileName);
          fs.writeFileSync(filePath, content, "utf8");
        } else if (window.electronAPI && window.electronAPI.saveToFolder) {
          const buffer = new TextEncoder().encode(content);
          await window.electronAPI.saveToFolder(
            this.folderPath,
            fileName,
            buffer
          );
        } else {
          const blob = new Blob([content], {
            type: "text/plain;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error("Error saving file:", error);
        throw error;
      }
    },

    // Status helper methods
    getChunkStatusClass(status) {
      return "chunk-" + status;
    },

    getChunkStatusIcon(status) {
      switch (status) {
        case "success": return "✅";
        case "pending": return "⏸️";
        case "error": return "❌";
        case "processing": return "⏳";
        default: return "⏸️";
      }
    },

    getChunkStatusText(status) {
      switch (status) {
        case "success": return "Đã xử lý";
        case "pending": return "Chờ xử lý";
        case "error": return "Lỗi";
        case "processing": return "Đang xử lý";
        default: return "Chờ xử lý";
      }
    },

    saveApiKey() {
      localStorage.setItem("api-chatgpt-key", this.apiKey);
    },

    // Toast notification helper
    showToast(message, type = 'info') {
      // Simple toast implementation
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4facfe'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  },
};
</script>

<style scoped>
.translator-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 32px;
  background: rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

/* Card Styles */
.card {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
}

.card-header.primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border-bottom: none;
}

.card-header.info {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #2d3748;
  border-bottom: none;
}

.card-header.warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #744210;
  border-bottom: none;
}

.card-header.success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border-bottom: none;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 18px;
  margin: 0;
}

.card-content {
  padding: 20px;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: #4facfe;
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.1);
}

/* Language Grid */
.language-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: end;
}

.arrow-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 8px;
}

.arrow-icon {
  font-size: 24px;
  font-weight: bold;
  color: #4facfe;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Style Grid */
.style-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.add-style-wrapper {
  display: flex;
  gap: 8px;
}

.add-style-wrapper .form-input {
  flex: 1;
}

.btn-add-style {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-add-style:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
}

.btn-add-style:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Style Preview */
.style-preview {
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border-left: 4px solid #48bb78;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.preview-icon {
  font-size: 16px;
}

.preview-title {
  font-weight: 600;
  color: #22543d;
  font-size: 14px;
}

.preview-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.style-badge {
  background: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.btn-danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
}

/* Styles Info */
.styles-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #0ea5e9;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 16px;
}

.info-title {
  font-weight: 600;
  color: #0c4a6e;
  font-size: 14px;
}

.suggested-styles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-btn {
  background: white;
  border: 1px solid #0ea5e9;
  color: #0c4a6e;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-btn:hover:not(:disabled) {
  background: #0ea5e9;
  color: white;
  transform: translateY(-1px);
}

.suggestion-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* File Management */
.file-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  color: #4a5568;
}

.file-input-label:hover {
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  border-color: #4facfe;
}

.upload-icon {
  font-size: 18px;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 13px;
  color: #4a5568;
}

.file-icon {
  font-size: 14px;
}

.folder-btn {
  white-space: nowrap;
}

.folder-display {
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
  border-radius: 12px;
  border-left: 4px solid #48bb78;
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.folder-icon {
  font-size: 16px;
}

.folder-path {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #22543d;
  font-weight: 500;
}

/* Input Wrapper */
.input-wrapper {
  position: relative;
}

.api-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
}

.status-dot.active {
  background: #48bb78;
  box-shadow: 0 0 8px rgba(72, 187, 120, 0.4);
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #48bb78;
}

/* Control Buttons */
.control-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.btn-start {
  flex: 1;
  padding: 16px 24px;
  font-size: 16px;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
}

.btn-start.processing {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
}

.btn-export {
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(159, 122, 234, 0.3);
  transition: all 0.3s ease;
}

.btn-export:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(159, 122, 234, 0.4);
}

.btn-export.exporting {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
  box-shadow: 0 4px 15px rgba(237, 137, 54, 0.3);
}

.btn-export.export-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-content.success {
  animation: successPulse 0.6s ease-in-out;
}

.btn-icon {
  font-size: 16px;
}

/* Progress Section */
.progress-section {
  margin-top: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #edf2f7;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s;
  border-radius: 4px;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

/* Export Progress Section */
.export-progress-section {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
}

.export-progress-bar {
  width: 100%;
  height: 6px;
  background: #e0f2fe;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.export-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #0284c7);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.export-progress-text {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #0c4a6e;
}

/* Progress Status Card */
.progress-status-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border-left: 4px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item.success {
  border-left-color: #48bb78;
  background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
}

.stat-item.warning {
  border-left-color: #ed8936;
  background: linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
}

.stat-item.info {
  border-left-color: #4facfe;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
  text-transform: uppercase;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
}

/* Chunk Status Grid */
.chunk-status-section {
  margin-top: 24px;
}

.chunk-status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.chunk-status-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #e2e8f0;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chunk-status-card.chunk-pending {
  border-left-color: #cbd5e0;
  background: linear-gradient(135deg, #ffffff 0%, #f7fafc 100%);
}

.chunk-status-card.chunk-processing {
  border-left-color: #ed8936;
  background: linear-gradient(135deg, #ffffff 0%, #fffaf0 100%);
  box-shadow: 0 4px 20px rgba(237, 137, 54, 0.2);
}

.chunk-status-card.chunk-success {
  border-left-color: #48bb78;
  background: linear-gradient(135deg, #ffffff 0%, #f0fff4 100%);
}

.chunk-status-card.chunk-error {
  border-left-color: #f56565;
  background: linear-gradient(135deg, #ffffff 0%, #fef5e7 100%);
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chunk-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.chunk-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  font-size: 16px;
}

.chunk-info {
  margin-bottom: 8px;
}

.chunk-time {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  color: #718096;
  margin-bottom: 4px;
}

.chunk-count {
  font-size: 12px;
  color: #4a5568;
}

.chunk-status-text {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.chunk-actions {
  display: flex;
  justify-content: center;
}

/* Main Content Area */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.video-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.table-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.loading-spinner.export-spinner {
  border-top-color: #ed8936;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 16px;
  color: #718096;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .style-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .translator-container {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .language-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .arrow-container {
    order: 3;
  }

  .file-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .control-buttons {
    flex-direction: column;
  }

  .chunk-status-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .style-grid {
    grid-template-columns: 1fr;
  }

  .add-style-wrapper {
    flex-direction: column;
  }

  .suggested-styles {
    justify-content: center;
  }
}
</style>