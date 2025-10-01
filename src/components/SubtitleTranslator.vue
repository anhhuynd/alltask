<template>
  <div class="app-container">
    <div class="main-content">
      <!-- Header -->
      <div class="section-card header-gradient-success">
        <div class="section-header" style="background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2);">
          <span class="section-icon">📝</span>
          <span class="section-title" style="color: white;">HUY Media Auto Sub Viet - Chunked Processing</span>
        </div>
      </div>

      <!-- API Settings -->
      <div class="section-card header-gradient-warning">
        <div class="section-header" style="background: rgba(245, 158, 11, 0.1);">
          <span class="section-icon">🔑</span>
          <span class="section-title">API Settings</span>
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
            <div v-if="apiKey" style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-1);">
              <div class="status-dot active"></div>
              <span style="font-size: var(--text-xs); color: #92400e; font-weight: 500;">Valid</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Language Settings -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">🌐</span>
          <span class="section-title">Language Settings</span>
        </div>
        <div class="section-content">
          <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-6); align-items: center;">
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
            
            <div style="font-size: var(--text-2xl); color: var(--primary-600); font-weight: bold;">→</div>
            
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

      <!-- File Management -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-icon">📁</span>
          <span class="section-title">File Management</span>
        </div>
        <div class="section-content">
          <div style="display: grid; grid-template-columns: 1fr auto; gap: var(--space-4); align-items: end;">
            <div class="form-group">
              <label class="form-label">Import File (*.txt, *.srt):</label>
              <input 
                type="file" 
                @change="handleFile" 
                accept=".txt,.srt" 
                class="form-input"
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

          <div v-if="folderPath" class="file-path">
            <span style="font-size: var(--text-lg);">📁</span>
            <span>{{ folderPath }}</span>
          </div>
        </div>
      </div>

      <!-- Processing Control -->
      <div v-if="subtitles && subtitles.length > 0" class="section-card">
        <div class="section-header">
          <span class="section-icon">🎮</span>
          <span class="section-title">Processing Control</span>
        </div>
        <div class="section-content">
          <div class="flex-wrap">
            <button 
              @click="start" 
              :disabled="isRunning || !apiKey || !folderPath"
              class="btn btn-success"
            >
              <span v-if="!isRunning">▶️ Bắt đầu dịch</span>
              <span v-else class="flex-center" style="gap: var(--space-2);">
                <div class="loading-spinner loading-spinner-sm"></div>
                Đang dịch...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Processing Status -->
      <div v-if="isRunning && chunks.length > 0" class="section-card header-gradient-info">
        <div class="section-header" style="background: rgba(37, 99, 235, 0.1);">
          <span class="section-icon">⏳</span>
          <span class="section-title">Processing Status</span>
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="section-content">
          <div style="text-align: center; font-size: var(--text-lg); font-weight: 600; color: var(--primary-700); margin-bottom: var(--space-4);">
            Đang xử lý đoạn {{ currentChunkIndex + 1 }} / {{ chunks.length }}
          </div>
          
          <div class="progress" style="margin-bottom: var(--space-3);">
            <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          
          <div style="text-align: center; font-weight: 600; color: var(--primary-600);">
            {{ Math.round(progressPercentage) }}% hoàn thành
          </div>
        </div>
      </div>

      <!-- Statistics Summary -->
      <div v-if="subtitles && subtitles.length > 0" class="section-card">
        <div class="section-header">
          <span class="section-icon">📊</span>
          <span class="section-title">Statistics Summary</span>
        </div>
        <div class="section-content">
          <div class="grid-auto-fit">
            <div class="stats-card stats-card-primary">
              <div class="stats-number" style="color: var(--primary-600);">{{ subtitles.length }}</div>
              <div class="stats-label" style="color: var(--primary-700);">Tổng phụ đề</div>
            </div>
            <div class="stats-card stats-card-success">
              <div class="stats-number" style="color: var(--success-600);">{{ completedCount }}</div>
              <div class="stats-label" style="color: var(--success-700);">Đã dịch</div>
            </div>
            <div class="stats-card stats-card-warning">
              <div class="stats-number" style="color: var(--warning-600);">{{ pendingCount }}</div>
              <div class="stats-label" style="color: var(--warning-700);">Chờ dịch</div>
            </div>
            <div class="stats-card stats-card-secondary">
              <div class="stats-number" style="color: var(--text-primary);">{{ processedChunks }}</div>
              <div class="stats-label" style="color: var(--text-secondary);">Đoạn xong</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Downloaded Files -->
      <div v-if="downloadedFiles.length > 0" class="section-card" style="background: linear-gradient(135deg, var(--success-50) 0%, #d1fae5 100%); border-color: var(--success-500);">
        <div class="section-header" style="background: rgba(16, 185, 129, 0.1);">
          <span class="section-icon">📥</span>
          <span class="section-title">Downloaded Files ({{ downloadedFiles.length }})</span>
        </div>
        <div class="section-content">
          <div class="grid-auto-fill" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
            <div v-for="file in downloadedFiles" :key="file" class="flex-center" style="gap: var(--space-2); padding: var(--space-2); background: rgba(255, 255, 255, 0.7); border-radius: var(--radius-md);">
              <span style="font-size: var(--text-base);">📄</span>
              <span style="font-size: var(--text-sm); font-family: monospace; color: var(--success-700);">{{ file }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chunk Status -->
      <div v-if="chunks && chunks.length > 1" class="section-card">
        <div class="section-header">
          <span class="section-icon">🧩</span>
          <span class="section-title">Chunk Status</span>
        </div>
        <div class="section-content">
          <div class="grid-auto-fill" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            <div
              v-for="(chunk, index) in chunks"
              :key="index"
              class="card"
              :class="getChunkCardClass(chunk.status)"
            >
              <div class="card-header flex-between">
                <span style="font-weight: 600;">Đoạn {{ index + 1 }}</span>
                <div class="flex-center" style="gap: var(--space-2);">
                  <div v-if="chunk.status === 'processing'" class="loading-spinner loading-spinner-sm"></div>
                  <span class="badge" :class="getChunkBadgeClass(chunk.status)">{{ getChunkStatusText(chunk.status) }}</span>
                </div>
              </div>
              <div class="card-content">
                <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--space-2);">{{ chunk.startTime }} → {{ chunk.endTime }}</div>
                <div style="font-size: var(--text-sm); color: var(--text-secondary);">{{ chunk.subtitles.length }} phụ đề</div>
                <div v-if="chunk.fileName" style="font-size: var(--text-xs); color: var(--text-muted); font-family: monospace; margin-top: var(--space-1);">📁 {{ chunk.fileName }}</div>
              </div>
              <div v-if="chunk.status === 'processing'" style="padding: 0 var(--space-6) var(--space-4);">
                <div class="progress">
                  <div class="progress-bar" style="width: 100%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="subtitles && subtitles.length > 0" class="section-card">
        <div class="section-header">
          <span class="section-icon">📄</span>
          <span class="section-title">Display Options</span>
        </div>
        <div class="section-content">
          <div class="flex-between flex-wrap">
            <div class="flex-center" style="gap: var(--space-2);">
              <label class="form-label">Items per page:</label>
              <select v-model="itemsPerPage" @change="currentPage = 1" class="form-select" style="width: auto;">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>
              <span v-if="itemsPerPage !== 'all'" style="font-size: var(--text-sm); color: var(--text-secondary);">
                ({{ startIndex + 1 }}-{{ endIndex }} of {{ subtitles.length }})
              </span>
            </div>
            
            <div v-if="itemsPerPage !== 'all'" class="flex-center" style="gap: var(--space-2);">
              <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn btn-sm btn-secondary">
                ⏮️ First
              </button>
              <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-sm btn-secondary">
                ⏪ Prev
              </button>
              <span style="font-size: var(--text-sm); font-weight: 600; padding: 0 var(--space-2);">Page {{ currentPage }} / {{ totalPages }}</span>
              <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-sm btn-secondary">
                Next ⏩
              </button>
              <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn btn-sm btn-secondary">
                Last ⏭️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Subtitle Table -->
      <div v-if="subtitles && subtitles.length > 0" class="section-card">
        <div class="section-content" style="padding: 0; overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 80px;">STT</th>
                <th style="width: 35%;">Original Content</th>
                <th style="width: 35%;">Translated Content</th>
                <th style="width: 120px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(subtitle, index) in paginatedSubtitles" :key="subtitle.index">
                <td style="text-align: center;">{{ subtitle.index }}</td>
                <td>
                  <div v-if="subtitle.startTime" style="font-size: var(--text-xs); color: var(--text-muted); font-family: monospace; margin-bottom: var(--space-1);">
                    {{ subtitle.startTime }} → {{ subtitle.endTime }}
                  </div>
                  <div style="line-height: 1.4;">{{ subtitle.text }}</div>
                </td>
                <td>
                  <div v-if="subtitle.startTime" style="font-size: var(--text-xs); color: var(--text-muted); font-family: monospace; margin-bottom: var(--space-1);">
                    {{ subtitle.startTime }} → {{ subtitle.endTime }}
                  </div>
                  <div v-if="subtitle.translatedText" style="line-height: 1.4; color: var(--primary-600); font-weight: 500;">
                    {{ subtitle.translatedText }}
                  </div>
                  <div v-else style="line-height: 1.4; color: var(--text-muted); font-style: italic;">
                    Chưa dịch
                  </div>
                </td>
                <td style="text-align: center;">
                  <div class="flex-center" style="gap: var(--space-1);">
                    <div v-if="subtitle.status === 'processing'" class="loading-spinner loading-spinner-sm"></div>
                    <span class="badge" :class="getStatusBadgeClass(subtitle.status)">{{ getStatusText(subtitle.status) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Pagination -->
      <div v-if="subtitles && subtitles.length > 0 && itemsPerPage !== 'all'" class="section-card" style="background: var(--bg-secondary);">
        <div class="section-content flex-center">
          <div class="flex-center" style="gap: var(--space-2);">
            <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn btn-sm btn-secondary">
              ⏮️ First
            </button>
            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-sm btn-secondary">
              ⏪ Prev
            </button>
            <span style="font-size: var(--text-sm); font-weight: 600; padding: 0 var(--space-2);">Page {{ currentPage }} / {{ totalPages }}</span>
            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-sm btn-secondary">
              Next ⏩
            </button>
            <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn btn-sm btn-secondary">
              Last ⏭️
            </button>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div v-if="subtitles && subtitles.length === 0" class="section-card empty-state">
        <div class="section-content">
          <div class="empty-state-icon">📝</div>
          <div class="empty-state-title">No subtitle data available</div>
          <div class="empty-state-description">Please upload a .txt or .srt file to get started</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import storage from '../utils/storage.js'

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

  methods: {
    // Pagination methods
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Choose folder for saving files
    async chooseFolder() {
      try {
        this.folderPath = await window.electronAPI?.chooseFolder?.() || "Downloads (default)";
        if (this.folderPath) {
          this.message = "Đã chọn: " + this.folderPath;
          storage.set(storage.keys.TRANSLATOR_FOLDER_PATH, this.folderPath);
        } else {
          this.message = "Chưa chọn thư mục.";
        }
      } catch (error) {
        console.error("Error selecting folder:", error);
      }
    },

    // Handle file upload
    handleFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result;
        console.log("File content loaded:", this.fileContent.substring(0, 200) + "...");
        
        this.parseSubtitles(this.fileContent);
        this.createChunks();
        this.downloadedFiles = [];
        this.currentPage = 1;
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
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    },

    // Save translated file
    async saveTranslatedFile(content, fileName) {
      try {
        if (window.electronAPI?.saveToFolder) {
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
    getStatusBadgeClass(status) {
      switch (status) {
        case "success": return "badge-success";
        case "pending": return "badge-primary";
        case "error": return "badge-error";
        case "processing": return "badge-warning";
        default: return "badge-primary";
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

    getChunkCardClass(status) {
      switch(status) {
        case 'success': return 'status-card-success';
        case 'processing': return 'status-card-processing';
        case 'error': return 'status-card-error';
        default: return '';
      }
    },

    getChunkBadgeClass(status) {
      switch(status) {
        case 'success': return 'badge-success';
        case 'processing': return 'badge-warning';
        case 'error': return 'badge-error';
        default: return 'badge-primary';
      }
    },

    getChunkStatusText(status) {
      switch(status) {
        case 'success': return '✅ Hoàn thành';
        case 'processing': return '⏳ Đang xử lý';
        case 'error': return '❌ Lỗi';
        default: return '⏸️ Chờ xử lý';
      }
    },

    saveSettings() {
      const settings = {
        sourceLanguage: this.sourceLanguage,
        targetLanguage: this.targetLanguage,
        itemsPerPage: this.itemsPerPage,
        folderPath: this.folderPath
      };
      storage.setTranslatorSettings(settings);
      storage.setTranslatorApiKey(this.apiKey);
    },

    loadSettings() {
      const settings = storage.getTranslatorSettings();
      this.apiKey = storage.getTranslatorApiKey();
      this.sourceLanguage = settings.sourceLanguage;
      this.targetLanguage = settings.targetLanguage;
      this.itemsPerPage = settings.itemsPerPage;
      this.folderPath = settings.folderPath;
    }
  },

  mounted() {
    this.loadSettings();
  },

  watch: {
    apiKey() {
      this.saveSettings();
    },
    sourceLanguage() {
      this.saveSettings();
    },
    targetLanguage() {
      this.saveSettings();
    },
    itemsPerPage() {
      this.saveSettings();
    }
  },
};
</script>