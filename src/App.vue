<template>
  <div class="container">
    <div class="header-section">
      <h2>
        <span class="header-icon">🎬</span>
        HUY Media Auto Sub Viet - Chunked Processing
        <div class="header-status" v-if="isRunning">
          <div class="loading-spinner"></div>
          <span>Đang xử lý...</span>
        </div>
      </h2>
    </div>

    <!-- Control Panel -->
    <div class="section-card controls" v-if="fileContent && fileContent.length > 0">
      <div class="section-header">
        <span class="section-icon">🎮</span>
        <span class="section-title">Control Panel</span>
        <div class="loading-indicator" v-if="isRunning">
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
      <div class="section-content">
        <button 
          @click="start" 
          :disabled="isRunning"
          :class="{ 'btn-loading': isRunning }"
          class="btn-primary"
        >
          <span v-if="!isRunning">▶️ Start</span>
          <span v-else class="btn-loading-content">
            <div class="btn-spinner"></div>
            Đang xử lý...
          </span>
        </button>
      </div>
    </div>

    <!-- API Settings -->
    <div class="section-card voice-settings">
      <div class="section-header">
        <span class="section-icon">🔑</span>
        <span class="section-title">API Settings</span>
        <div class="loading-indicator" v-if="apiLoading">
          <div class="loading-pulse"></div>
        </div>
      </div>
      <div class="section-content">
        <div class="input-group">
          <label>API Key ChatGPT:</label>
          <input 
            type="password" 
            v-model="apiKey" 
            placeholder="Nhập API key ChatGPT"
            class="input-text"
          />
          <div class="api-status" v-if="apiKey">
            <span class="status-dot" :class="{ 'active': apiKey.length > 20 }"></span>
            <span class="status-text">{{ apiKey.length > 20 ? 'Valid' : 'Invalid' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Language Settings -->
    <div class="section-card language-settings">
      <div class="section-header">
        <span class="section-icon">🌐</span>
        <span class="section-title">Language Settings</span>
      </div>
      <div class="section-content">
        <div class="language-grid">
          <div class="language-group">
            <label>Dịch từ:</label>
            <select v-model="sourceLanguage" class="select-dropdown">
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
          <div class="language-arrow">→</div>
          <div class="language-group">
            <label>Dịch sang:</label>
            <select v-model="targetLanguage" class="select-dropdown">
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

    <!-- File Management -->
    <div class="section-card file-actions">
      <div class="section-header">
        <span class="section-icon">📁</span>
        <span class="section-title">File Management</span>
        <div class="loading-indicator" v-if="fileLoading">
          <div class="loading-bars">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
      <div class="section-content">
        <div class="file-grid">
          <div class="input-group">
            <label>Import File (*.txt, *.srt):</label>
            <input 
              type="file" 
              @change="handleFile" 
              accept=".txt,.srt"
              class="input-file"
              :disabled="fileLoading"
            />
          </div>
          <button 
            @click="chooseFolder" 
            :disabled="folderLoading"
            :class="{ 'btn-loading': folderLoading }"
            class="btn-secondary"
          >
            <span v-if="!folderLoading">📂 Thư mục lưu</span>
            <span v-else class="btn-loading-content">
              <div class="btn-spinner"></div>
              Selecting...
            </span>
          </button>
        </div>

        <div v-if="folderPath" class="folder-display">
          <span class="folder-icon">📁</span>
          <span class="folder-path">{{ folderPath }}</span>
        </div>
      </div>
    </div>

    <!-- Chunking Info -->
    <div v-if="chunks && chunks.length > 1" class="info-card chunking-info">
      <div class="info-header">
        <span class="info-icon">📦</span>
        <span class="info-title">Chunking Information</span>
      </div>
      <div class="info-content">
        <div class="info-item">
          <span class="info-label">Số đoạn:</span>
          <span class="info-value">{{ chunks.length }} đoạn</span>
        </div>
        <div class="info-item">
          <span class="info-label">Thời lượng:</span>
          <span class="info-value">{{ totalDuration }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Lưu trữ:</span>
          <span class="info-value">Mỗi đoạn → 1 file riêng</span>
        </div>
      </div>
    </div>

    <!-- Processing Status -->
    <div v-if="isRunning" class="status-card processing-status">
      <div class="status-header">
        <span class="status-icon">⏳</span>
        <span class="status-title">Processing Status</span>
        <div class="processing-indicator">
          <div class="loading-wave">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
      </div>
      <div class="status-content">
        <div class="current-chunk">
          Đang xử lý đoạn {{ currentChunkIndex + 1 }}/{{ chunks.length }}
        </div>
        <div class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-text">{{ progressPercentage.toFixed(1) }}% hoàn thành</div>
        </div>
      </div>
    </div>

    <!-- Statistics Summary -->
    <div v-if="subtitles && subtitles.length > 0" class="stats-card">
      <div class="stats-header">
        <span class="stats-icon">📊</span>
        <span class="stats-title">Statistics</span>
      </div>
      <div class="stats-grid">
        <div class="stat-item total">
          <div class="stat-number">{{ subtitles.length }}</div>
          <div class="stat-label">Tổng phụ đề</div>
        </div>
        <div class="stat-item success">
          <div class="stat-number">{{ completedCount }}</div>
          <div class="stat-label">Đã xử lý</div>
        </div>
        <div class="stat-item pending">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">Chờ xử lý</div>
        </div>
        <div class="stat-item chunks" v-if="chunks.length > 1">
          <div class="stat-number">{{ processedChunks }}</div>
          <div class="stat-label">Đoạn xong</div>
        </div>
      </div>
    </div>

    <!-- Downloaded Files -->
    <div v-if="downloadedFiles.length > 0" class="files-card">
      <div class="files-header">
        <span class="files-icon">📥</span>
        <span class="files-title">Downloaded Files ({{ downloadedFiles.length }})</span>
      </div>
      <div class="files-list">
        <div v-for="file in downloadedFiles" :key="file" class="file-item">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ file }}</span>
        </div>
      </div>
    </div>

    <!-- Chunk Status -->
    <div v-if="chunks && chunks.length > 1" class="chunks-section">
      <div class="section-header">
        <span class="section-icon">🧩</span>
        <span class="section-title">Chunk Status</span>
      </div>
      <div class="chunks-grid">
        <div
          v-for="(chunk, index) in chunks"
          :key="index"
          class="chunk-card"
          :class="getChunkStatusClass(chunk.status)"
        >
          <div class="chunk-header">
            <span class="chunk-title">Đoạn {{ index + 1 }}</span>
            <div class="chunk-status">
              <div v-if="chunk.status === 'processing'" class="chunk-spinner"></div>
              <span class="status-text">{{ getChunkStatusText(chunk.status) }}</span>
            </div>
          </div>
          <div class="chunk-content">
            <div class="chunk-time">{{ chunk.startTime }} → {{ chunk.endTime }}</div>
            <div class="chunk-count">{{ chunk.subtitles.length }} phụ đề</div>
            <div v-if="chunk.fileName" class="chunk-filename">📁 {{ chunk.fileName }}</div>
          </div>
          <div v-if="chunk.status === 'processing'" class="chunk-progress">
            <div class="chunk-progress-bar">
              <div class="chunk-progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div v-if="subtitles && subtitles.length > 0" class="pagination-card">
      <div class="pagination-header">
        <span class="pagination-icon">📄</span>
        <span class="pagination-title">Display Options</span>
      </div>
      <div class="pagination-content">
        <div class="pagination-info">
          <label>Items per page:</label>
          <select v-model="itemsPerPage" @change="currentPage = 1" class="select-small">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
          <span v-if="itemsPerPage !== 'all'" class="pagination-summary">
            ({{ startIndex + 1 }}-{{ endIndex }} of {{ subtitles.length }})
          </span>
        </div>
        
        <div v-if="itemsPerPage !== 'all'" class="pagination-buttons">
          <button @click="goToPage(1)" :disabled="currentPage === 1" class="pagination-btn">
            ⏮️ First
          </button>
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
            ⏪ Prev
          </button>
          <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="pagination-btn">
            Next ⏩
          </button>
          <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="pagination-btn">
            Last ⏭️
          </button>
        </div>
      </div>
    </div>

    <!-- Subtitle Table -->
    <div v-if="subtitles && subtitles.length > 0" class="table-section">
      <div class="table-container">
        <table class="subtitle-table">
          <thead>
            <tr>
              <th class="col-index">STT</th>
              <th class="col-original">Original Content</th>
              <th class="col-translated">Translated Content</th>
              <th class="col-status">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(subtitle, index) in paginatedSubtitles" :key="subtitle.index" class="subtitle-row">
              <td class="col-index">{{ subtitle.index }}</td>
              <td class="col-original">
                <div class="subtitle-content">
                  <div class="time-range" v-if="subtitle.startTime">
                    {{ subtitle.startTime }} → {{ subtitle.endTime }}
                  </div>
                  <div class="text-content">{{ subtitle.text }}</div>
                </div>
              </td>
              <td class="col-translated">
                <div class="subtitle-content">
                  <div class="time-range" v-if="subtitle.startTime">
                    {{ subtitle.startTime }} → {{ subtitle.endTime }}
                  </div>
                  <div v-if="subtitle.translatedText" class="translated-content">
                    {{ subtitle.translatedText }}
                  </div>
                  <div v-else class="untranslated-content">
                    Chưa dịch
                  </div>
                </div>
              </td>
              <td class="col-status">
                <div class="status-badge" :class="getStatusClass(subtitle.status)">
                  <div v-if="subtitle.status === 'processing'" class="status-spinner"></div>
                  <span class="status-text">{{ getStatusText(subtitle.status) }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom Pagination -->
    <div v-if="subtitles && subtitles.length > 0 && itemsPerPage !== 'all'" class="bottom-pagination">
      <div class="pagination-buttons">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="pagination-btn">
          ⏮️ First
        </button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="pagination-btn">
          ⏪ Prev
        </button>
        <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="pagination-btn">
          Next ⏩
        </button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="pagination-btn">
          Last ⏭️
        </button>
      </div>
    </div>

    <!-- No Data Message -->
    <div v-if="subtitles && subtitles.length === 0" class="no-data-card">
      <div class="no-data-icon">📝</div>
      <div class="no-data-text">No subtitle data available</div>
      <div class="no-data-hint">Please upload a .txt or .srt file to get started</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SubtitleTranslator",
  data() {
    return {
      apiKey: "",
      subtitles: [],
      fileContent: "",
      folderPath: null,
      isRunning: false,
      message: "",
      chunks: [],
      currentChunkIndex: 0,
      processedChunks: 0,
      downloadedFiles: [],
      sourceLanguage: "chinese",
      targetLanguage: "vietnamese",
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 25,

      // Loading states
      apiLoading: false,
      fileLoading: false,
      folderLoading: false,

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
      },
    };
  },

  computed: {
    completedCount() {
      return this.subtitles.filter((s) => s.status === "success").length;
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
    totalDuration() {
      if (this.subtitles.length === 0) return "00:00:00";
      const lastSubtitle = this.subtitles[this.subtitles.length - 1];
      return lastSubtitle.endTime || "00:00:00";
    },
    totalPages() {
      if (this.itemsPerPage === 'all') return 1;
      return Math.ceil(this.subtitles.length / parseInt(this.itemsPerPage));
    },
    startIndex() {
      if (this.itemsPerPage === 'all') return 0;
      return (this.currentPage - 1) * parseInt(this.itemsPerPage);
    },
    endIndex() {
      if (this.itemsPerPage === 'all') return this.subtitles.length;
      const end = this.startIndex + parseInt(this.itemsPerPage);
      return Math.min(end, this.subtitles.length);
    },
    paginatedSubtitles() {
      if (this.itemsPerPage === 'all') {
        return this.subtitles;
      }
      return this.subtitles.slice(this.startIndex, this.endIndex);
    },
  },

  mounted() {
    // Load saved settings
    const savedKey = localStorage.getItem("elevenlabs_api_key");
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

    const savedItemsPerPage = localStorage.getItem("items_per_page");
    if (savedItemsPerPage) {
      this.itemsPerPage = savedItemsPerPage;
    }
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
    itemsPerPage() {
      localStorage.setItem("items_per_page", this.itemsPerPage);
    },
  },

  methods: {
    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Choose folder for saving files
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
      } finally {
        this.folderLoading = false;
      }
    },

    // Handle file upload
    handleFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.fileLoading = true;
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result;
        console.log("File content loaded:", this.fileContent.substring(0, 200) + "...");
        
        this.parseSubtitles(this.fileContent);
        this.createChunks();
        this.downloadedFiles = [];
        this.currentPage = 1;
        this.fileLoading = false;
      };
      reader.readAsText(file, "utf-8");
    },

    // Parse SRT content into subtitles array
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
            text: text,
            translatedText: "",
            status: "pending",
          });
        }
      });

      this.subtitles = newSubtitles;
      console.log("Parsed subtitles:", newSubtitles.length);
    },

    // Convert time string to seconds
    timeToSeconds(timeStr) {
      if (!timeStr) return 0;
      const parts = timeStr.split(":");
      const seconds = parseFloat(parts[2].replace(",", "."));
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
    },

    // Convert seconds to time string
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

    // Create chunks of subtitles
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

    // Generate translation prompt
    generateTranslationPrompt(chunkSrtContent) {
      const sourceLangName = this.languageNames[this.sourceLanguage];
      const targetLangName = this.languageNames[this.targetLanguage];

      return `Bạn là một chuyên gia dịch thuật và làm phụ đề phim. 
Nhiệm vụ của bạn: 
1. Dịch tất cả các đoạn hội thoại dưới đây từ ${sourceLangName} sang ${targetLangName}, giữ nguyên nghĩa tự nhiên, dễ hiểu và sát ngữ cảnh. 
2. Xuất kết quả dưới định dạng phụ đề chuẩn .srt, có đánh số thứ tự, thời gian bắt đầu và kết thúc theo chuẩn phụ đề (giữ nguyên mốc thời gian từ dữ liệu gốc).
3. Chỉ xuất ra nội dung phụ đề .srt, không giải thích thêm gì khác.

Dưới đây là dữ liệu ${sourceLangName} kèm timestamp để bạn dịch và tạo phụ đề:
${chunkSrtContent}

Hãy bắt đầu ngay bây giờ.`;
    },

    // Generate filename for chunk
    generateChunkFileName(chunkIndex, totalChunks) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      if (totalChunks === 1) {
        return `sub_${timestamp}.srt`;
      }
      return `sub_${(chunkIndex + 1).toString().padStart(2, '0')}.srt`;
    },

    // Main processing function
    async start() {
      if (this.isRunning) return;

      if (!this.apiKey) {
        alert("Vui lòng nhập API Key.");
        return;
      }

      if (!this.folderPath) {
        alert("Vui lòng chọn thư mục lưu.");
        return;
      }

      if (!this.fileContent) {
        alert("Vui lòng chọn file để xử lý.");
        return;
      }

      this.isRunning = true;
      this.processedChunks = 0;
      this.downloadedFiles = [];

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

            await this.saveTranslatedFile(translatedSrt, fileName);
            this.downloadedFiles.push(fileName);

            chunk.status = "success";

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

    // Create SRT content from subtitles array
    createSrtFromSubtitles(subtitles) {
      return subtitles
        .map((subtitle) => {
          return (
            subtitle.index +
            "\n" +
            subtitle.startTime +
            " --> " +
            subtitle.endTime +
            "\n" +
            subtitle.text
          );
        })
        .join("\n\n");
    },

    // Parse translated chunk response
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

    // Call ChatGPT API for translation
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

    // Save translated file
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
    getStatusClass(status) {
      switch (status) {
        case "success": return "status-success";
        case "pending": return "status-pending";
        case "error": return "status-error";
        case "processing": return "status-processing";
        default: return "status-pending";
      }
    },

    getStatusText(status) {
      switch (status) {
        case "success": return "Hoàn thành";
        case "pending": return "Chờ xử lý";
        case "error": return "Lỗi";
        case "processing": return "Đang xử lý";
        default: return "Chờ xử lý";
      }
    },

    getChunkStatusClass(status) {
      return "chunk-" + status;
    },

    getChunkStatusText(status) {
      switch (status) {
        case "success": return "✅ Hoàn thành";
        case "pending": return "⏸️ Chờ xử lý";
        case "error": return "❌ Lỗi";
        case "processing": return "⏳ Đang xử lý";
        default: return "⏸️ Chờ xử lý";
      }
    },

    saveApiKey() {
      localStorage.setItem("elevenlabs_api_key", this.apiKey);
    },
  },
};
</script>