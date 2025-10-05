<template>
  <div class="translator-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon">🌐</div>
        <div class="header-text">
          <h1 class="header-title">Enhanced Subtitle Translator</h1>
          <p class="header-subtitle">AI-powered subtitle translation with project management</p>
        </div>
      </div>
    </div>

    <!-- Project Management Card -->
    <div class="card project-card">
      <div class="card-header primary">
        <div class="card-icon">📁</div>
        <h3 class="card-title">Project Management</h3>
      </div>
      <div class="card-content">
        <div class="project-grid">
          <div class="form-group">
            <label class="form-label">Chọn dự án:</label>
            <select v-model="currentProject" @change="loadProject" class="form-select">
              <option value="">-- Chọn dự án --</option>
              <option 
                v-for="project in projects" 
                :key="project.id" 
                :value="project.id"
              >
                {{ project.name }} ({{ project.subtitleCount }} phụ đề)
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Tạo dự án mới:</label>
            <div class="project-input-wrapper">
              <input 
                v-model="newProjectName" 
                type="text" 
                placeholder="Nhập tên dự án..."
                class="form-input"
                @keyup.enter="createProject"
              />
              <button 
                @click="createProject" 
                :disabled="!newProjectName.trim()"
                class="btn btn-success btn-sm"
              >
                <span class="btn-icon">➕</span>
                <span>Tạo</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Thời gian chia đoạn (phút):</label>
            <input 
              v-model.number="chunkDurationMinutes" 
              type="number" 
              min="1" 
              max="10" 
              class="form-input"
              @change="updateChunkSettings"
            />
          </div>
        </div>

        <!-- Current Project Info -->
        <div v-if="currentProjectData" class="project-info">
          <div class="project-header">
            <h4 class="project-name">📂 {{ currentProjectData.name }}</h4>
            <div class="project-actions">
              <button 
                @click="showProjectSettings = true" 
                class="btn btn-outline btn-xs"
              >
                ⚙️ Cài đặt
              </button>
              <button 
                @click="deleteProject" 
                class="btn btn-danger btn-xs"
                :disabled="!currentProject"
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
          
          <div class="project-stats">
            <div class="stat-item-mini">
              <span class="stat-icon-mini">📝</span>
              <span class="stat-text">{{ currentProjectData.subtitleCount || 0 }} phụ đề</span>
            </div>
            <div class="stat-item-mini">
              <span class="stat-icon-mini">👥</span>
              <span class="stat-text">{{ currentProjectData.characterNames?.length || 0 }} nhân vật</span>
            </div>
            <div class="stat-item-mini">
              <span class="stat-icon-mini">⏱️</span>
              <span class="stat-text">{{ chunkDurationMinutes }} phút/đoạn</span>
            </div>
          </div>
        </div>

        <!-- Project Settings Modal -->
        <div v-if="showProjectSettings" class="modal-overlay" @click.self="closeProjectSettings">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3 class="modal-title">Cài đặt dự án</h3>
              <button @click="closeProjectSettings" class="btn btn-xs btn-outline">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Tên dự án:</label>
                <input 
                  v-model="currentProjectData.name" 
                  type="text" 
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Mô tả:</label>
                <textarea 
                  v-model="currentProjectData.description" 
                  class="form-textarea"
                  rows="3"
                  placeholder="Mô tả về dự án..."
                ></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Tên nhân vật đã lưu:</label>
                <div class="character-list">
                  <div 
                    v-for="(name, index) in currentProjectData.characterNames || []" 
                    :key="index"
                    class="character-item"
                  >
                    <span class="character-name">{{ name }}</span>
                    <button 
                      @click="removeCharacterName(index)" 
                      class="btn btn-xs btn-danger"
                    >
                      ✕
                    </button>
                  </div>
                  <div v-if="!currentProjectData.characterNames?.length" class="no-characters">
                    Chưa có tên nhân vật nào được lưu
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="saveProjectSettings" class="btn btn-primary">
                <span class="btn-icon">💾</span>
                <span>Lưu thay đổi</span>
              </button>
              <button @click="closeProjectSettings" class="btn btn-outline">
                <span class="btn-icon">❌</span>
                <span>Hủy bỏ</span>
              </button>
            </div>
          </div>
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
    <div class="card api-card">
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
    </div>

    <!-- Batch Text Editor Card -->
    <div v-if="subtitles && subtitles.length > 0" class="card batch-editor-card">
      <div class="card-header warning">
        <div class="card-icon">✏️</div>
        <h3 class="card-title">Batch Text Editor</h3>
      </div>
      <div class="card-content">
        <!-- Saved Character Names from Project (Priority Display) -->
        <div v-if="currentProjectData?.characterNames?.length" class="saved-characters-section">
          <div class="saved-characters-header">
            <span class="saved-characters-title">👥 Tên nhân vật đã lưu trong dự án:</span>
            <span class="saved-characters-count">({{ currentProjectData.characterNames.length }} tên)</span>
          </div>
          <div class="saved-character-buttons">
            <button 
              v-for="name in currentProjectData.characterNames" 
              :key="name"
              @click="selectSavedCharacterForEdit(name)"
              class="saved-character-btn"
              :class="{ 'active': findText === name, 'highlighted': isCharacterHighlighted(name) }"
              :title="`Click để chọn '${name}' cho tìm kiếm/thay thế`"
            >
              <span class="character-icon">👤</span>
              <span class="character-name">{{ name }}</span>
              <span 
                @click.stop="copyCharacterName(name)"
                class="copy-btn"
                title="Copy tên nhân vật"
              >
                📋
              </span>
            </button>
          </div>
        </div>

        <div class="editor-grid">
          <div class="form-group">
            <label class="form-label">Tìm kiếm:</label>
            <input 
              v-model="findText" 
              type="text" 
              placeholder="Nhập text cần tìm..."
              class="form-input"
              @input="highlightMatches"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Thay thế:</label>
            <input 
              v-model="replaceText" 
              type="text" 
              placeholder="Nhập text thay thế..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Tùy chọn:</label>
            <div class="editor-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="caseSensitive" class="checkbox-input">
                <span class="checkbox-text">Phân biệt hoa thường</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="useRegex" class="checkbox-input">
                <span class="checkbox-text">Sử dụng Regex</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="wholeWord" class="checkbox-input">
                <span class="checkbox-text">Toàn bộ từ</span>
              </label>
            </div>
          </div>
        </div>

        <div class="editor-actions">
          <button 
            @click="findAndReplace" 
            :disabled="!findText.trim() || isBatchEditing"
            class="btn btn-primary"
          >
            <span class="btn-icon">🔄</span>
            <span>Thay thế tất cả ({{ matchCount }} kết quả)</span>
          </button>
          
          <button 
            @click="previewChanges" 
            :disabled="!findText.trim()"
            class="btn btn-secondary"
          >
            <span class="btn-icon">👁️</span>
            <span>Xem trước</span>
          </button>

          <button 
            @click="undoLastChange" 
            :disabled="changeHistory.length === 0"
            class="btn btn-outline"
          >
            <span class="btn-icon">↶</span>
            <span>Hoàn tác</span>
          </button>
        </div>

        <!-- Proper Names Detection -->
        <div class="proper-names-section">
          <div class="section-header">
            <h4 class="section-title">🏷️ Tên riêng được phát hiện</h4>
            <button 
              @click="detectProperNames" 
              :disabled="isDetectingNames"
              class="btn btn-sm btn-outline"
            >
              <span v-if="!isDetectingNames" class="btn-icon">🔍</span>
              <div v-else class="loading-spinner small"></div>
              <span>{{ isDetectingNames ? 'Đang phát hiện...' : 'Phát hiện tên riêng' }}</span>
            </button>
          </div>

          <div v-if="detectedNames.length > 0" class="names-list">
            <div class="names-grid">
              <div 
                v-for="(name, index) in detectedNames" 
                :key="index"
                class="name-item"
                :class="{ 
                  'selected': selectedNames.includes(name.text),
                  'already-saved': isNameAlreadySaved(name.text),
                  'highlighted': isCharacterHighlighted(name.text)
                }"
                @click="toggleNameSelection(name.text)"
              >
                <div class="name-info">
                  <div class="name-text">
                    {{ name.text }}
                    <span v-if="isNameAlreadySaved(name.text)" class="saved-indicator" title="Đã lưu trong dự án">✅</span>
                  </div>
                  <div class="name-count">{{ name.count }} lần</div>
                  <button 
                    @click.stop="copyCharacterName(name.text)"
                    class="copy-btn-small"
                    title="Copy tên nhân vật"
                  >
                    📋
                  </button>
                </div>
                <div class="name-type">{{ getNameType(name.type) }}</div>
              </div>
            </div>
            
            <div class="names-actions">
              <button 
                @click="highlightSelectedNames" 
                :disabled="selectedNames.length === 0"
                class="btn btn-sm btn-primary"
              >
                <span class="btn-icon">🎯</span>
                <span>Highlight đã chọn ({{ selectedNames.length }})</span>
              </button>
              
              <button 
                @click="confirmSaveCharacterNames" 
                :disabled="selectedNames.length === 0 || !currentProject"
                class="btn btn-sm btn-success"
              >
                <span class="btn-icon">💾</span>
                <span>Lưu vào dự án ({{ selectedNames.length }})</span>
              </button>

              <button 
                @click="autoAddNewNames" 
                :disabled="newDetectedNames.length === 0 || !currentProject"
                class="btn btn-sm btn-info"
              >
                <span class="btn-icon">⚡</span>
                <span>Tự động thêm mới ({{ newDetectedNames.length }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Character Names Save Confirmation -->
        <div v-if="showSaveNamesConfirm" class="save-names-modal">
          <div class="modal-overlay" @click.self="closeSaveNamesConfirm"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Lưu tên nhân vật</h3>
              <button @click="closeSaveNamesConfirm" class="btn btn-xs btn-outline">✕</button>
            </div>
            <div class="modal-body">
              <p class="confirm-text">
                Bạn có muốn lưu {{ selectedNames.length }} tên nhân vật sau vào dự án 
                <strong>"{{ currentProjectData?.name }}"</strong> không?
              </p>
              <div class="names-to-save">
                <div 
                  v-for="name in selectedNames" 
                  :key="name"
                  class="name-to-save"
                >
                  👤 {{ name }}
                </div>
              </div>
              <div class="save-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="replaceExistingNames" class="checkbox-input">
                  <span class="checkbox-text">Thay thế danh sách tên hiện có</span>
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="saveCharacterNamesToProject" class="btn btn-success">
                <span class="btn-icon">💾</span>
                <span>Lưu tên nhân vật</span>
              </button>
              <button @click="closeSaveNamesConfirm" class="btn btn-outline">
                <span class="btn-icon">❌</span>
                <span>Hủy bỏ</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Preview Modal -->
        <div v-if="showPreview" class="preview-modal">
          <div class="preview-overlay" @click.self="closePreview"></div>
          <div class="preview-content">
            <div class="preview-header">
              <h3 class="preview-title">Xem trước thay đổi</h3>
              <button @click="closePreview" class="btn btn-xs btn-outline">✕</button>
            </div>
            <div class="preview-body">
              <div class="preview-stats">
                Sẽ thay đổi {{ previewChanges.length }} subtitle(s)
              </div>
              <div class="preview-list">
                <div 
                  v-for="(change, index) in previewChanges.slice(0, 10)" 
                  :key="index"
                  class="preview-item"
                >
                  <div class="change-index">#{{ change.index }}</div>
                  <div class="change-content">
                    <div class="change-before">Trước: {{ change.before }}</div>
                    <div class="change-after">Sau: {{ change.after }}</div>
                  </div>
                </div>
                <div v-if="previewChanges.length > 10" class="preview-more">
                  và {{ previewChanges.length - 10 }} thay đổi khác...
                </div>
              </div>
            </div>
            <div class="preview-actions">
              <button @click="applyPreviewChanges" class="btn btn-primary">
                <span class="btn-icon">✅</span>
                <span>Áp dụng thay đổi</span>
              </button>
              <button @click="closePreview" class="btn btn-outline">
                <span class="btn-icon">❌</span>
                <span>Hủy bỏ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch File Management Card -->
    <div class="card batch-file-card">
      <div class="card-header warning">
        <div class="card-icon">📁</div>
        <h3 class="card-title">Batch File Management</h3>
      </div>
      <div class="card-content">
        <!-- Multiple SRT Files Section -->
        <div class="batch-section">
          <div class="batch-header">
            <h4 class="batch-title">📄 Multiple Subtitle Files (SRT)</h4>
            <div class="batch-actions">
              <input 
                type="file" 
                @change="handleMultipleSrtFiles" 
                accept=".srt,.txt"
                multiple
                class="file-input"
                id="multiple-srt-upload"
                ref="multipleSrtInput"
              />
              <label for="multiple-srt-upload" class="btn btn-outline btn-sm">
                <span class="btn-icon">📄</span>
                <span>Choose SRT Files</span>
              </label>
              <button 
                @click="clearSrtFiles" 
                :disabled="srtFiles.length === 0"
                class="btn btn-danger btn-sm"
              >
                <span class="btn-icon">🗑️</span>
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <!-- SRT Files List -->
          <div v-if="srtFiles.length > 0" class="files-list">
            <div class="files-header">
              <span class="files-count">{{ srtFiles.length }} files selected</span>
              <span class="files-size">{{ formatTotalSize(srtFiles) }}</span>
            </div>
            <div class="files-grid">
              <div 
                v-for="(file, index) in srtFiles" 
                :key="index"
                class="file-item"
              >
                <div class="file-info">
                  <div class="file-icon">📄</div>
                  <div class="file-details">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">{{ formatFileSize(file.size) }}</div>
                  </div>
                </div>
                <button 
                  @click="removeSrtFile(index)" 
                  class="btn btn-xs btn-danger"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Output Folder Selection -->
        <div class="batch-section">
          <div class="batch-header">
            <h4 class="batch-title">📂 Output Folder</h4>
            <div class="batch-actions">
              <button 
                @click="chooseOutputFolder" 
                :disabled="isBatchProcessing"
                class="btn btn-primary btn-sm"
              >
                <span class="btn-icon">📂</span>
                <span>{{ outputFolderPath ? 'Change Folder' : 'Choose Folder' }}</span>
              </button>
            </div>
          </div>

          <div v-if="outputFolderPath" class="folder-display">
            <div class="folder-info">
              <span class="folder-icon">📁</span>
              <span class="folder-path">{{ outputFolderPath }}</span>
            </div>
          </div>
        </div>

        <!-- Batch Processing Controls -->
        <div v-if="srtFiles.length > 0" class="batch-controls">
          <div class="control-buttons">
            <button 
              @click="mergeSrtFiles" 
              :disabled="srtFiles.length === 0 || isBatchProcessing || !outputFolderPath"
              class="btn btn-merge-srt"
              :class="{ 'processing': isMergingSrt }"
            >
              <div v-if="!isMergingSrt" class="btn-content">
                <span class="btn-icon">🔗</span>
                <span class="btn-text">Merge SRT Files ({{ srtFiles.length }})</span>
              </div>
              <div v-else class="btn-content processing">
                <div class="loading-spinner"></div>
                <span class="btn-text">Merging SRT Files...</span>
              </div>
            </button>
          </div>

          <!-- Batch Progress -->
          <div v-if="isBatchProcessing" class="batch-progress-section">
            <div class="batch-progress-bar">
              <div class="batch-progress-fill" :style="{ width: batchProgressPercentage + '%' }"></div>
            </div>
            <div class="batch-progress-text">
              {{ batchProgressText }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Single File Management Card -->
    <div class="card file-card">
      <div class="card-header warning">
        <div class="card-icon">📄</div>
        <h3 class="card-title">Single File Management</h3>
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
      <!-- Video Player Section (1/3 width) -->
      <div class="video-section">
        <VideoPlayer 
          :videoSrc="videoSrc"
          :subtitles="subtitles"
          :currentTime="currentTime"
          @timeupdate="handleTimeUpdate"
          @seek="handleSeek"
        />
      </div>

      <!-- Subtitle Table Section (2/3 width) -->
      <div class="table-section">
        <SubtitleTable 
          :subtitles="subtitles"
          :currentTime="currentTime"
          :highlightedText="findText"
          :detectedNames="detectedNames"
          :selectedNames="selectedNames"
          :characterNames="currentProjectData?.characterNames || []"
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
          Please upload subtitle files using single file upload or batch processing to start the translation process
        </div>
        <div class="empty-actions">
          <label for="subtitle-upload" class="btn btn-primary">
            <span class="btn-icon">📄</span>
            <span>Upload Single File</span>
          </label>
          <label for="multiple-srt-upload" class="btn btn-secondary">
            <span class="btn-icon">📁</span>
            <span>Upload Multiple Files</span>
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
      
      // Project Management
      projects: [],
      currentProject: "",
      currentProjectData: null,
      newProjectName: "",
      showProjectSettings: false,
      chunkDurationMinutes: 3,
      
      // Batch Processing
      srtFiles: [],
      outputFolderPath: null,
      outputFolderHandle: null,
      isBatchProcessing: false,
      isMergingSrt: false,
      batchProgressPercentage: 0,
      batchProgressText: "",
      
      // Batch Text Editor
      findText: "",
      replaceText: "",
      caseSensitive: false,
      useRegex: false,
      wholeWord: false,
      matchCount: 0,
      isBatchEditing: false,
      changeHistory: [],
      showPreview: false,
      previewChanges: [],
      
      // Proper Names Detection
      detectedNames: [],
      selectedNames: [],
      isDetectingNames: false,
      customNames: [],
      showSaveNamesConfirm: false,
      replaceExistingNames: false,
      highlightedCharacters: [], // New: Track highlighted characters
      
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
    },

    // New: Get newly detected names that aren't saved yet
    newDetectedNames() {
      if (!this.currentProjectData?.characterNames) return this.detectedNames;
      
      return this.detectedNames.filter(name => 
        !this.currentProjectData.characterNames.includes(name.text)
      );
    }
  },

  mounted() {
    this.loadSettings();
    this.loadProjects();
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
    outputFolderPath() {
      if (this.outputFolderPath) {
        localStorage.setItem("output_folder_path", this.outputFolderPath);
      }
    },
    exportSuccess(newValue) {
      if (newValue) {
        setTimeout(() => {
          this.exportSuccess = false;
        }, 3000);
      }
    },
    findText() {
      this.highlightMatches();
    },
    currentProject() {
      if (this.currentProject) {
        this.saveCurrentProject();
      }
    },
    chunkDurationMinutes() {
      if (this.subtitles.length > 0) {
        this.createChunks();
      }
      this.saveProjectSettings();
    },
    subtitles: {
      handler() {
        if (this.currentProject && this.subtitles.length > 0) {
          this.updateProjectSubtitleCount();
        }
      },
      deep: true
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

      const savedOutputFolderPath = localStorage.getItem("output_folder_path");
      if (savedOutputFolderPath) {
        this.outputFolderPath = savedOutputFolderPath;
      }

      const savedCustomNames = localStorage.getItem("custom_proper_names");
      if (savedCustomNames) {
        this.customNames = JSON.parse(savedCustomNames);
      }

      const savedCurrentProject = localStorage.getItem("current_project");
      if (savedCurrentProject) {
        this.currentProject = savedCurrentProject;
      }
    },

    // Project Management Methods
    loadProjects() {
      const saved = localStorage.getItem('subtitle_projects');
      if (saved) {
        this.projects = JSON.parse(saved);
      }
      
      if (this.currentProject) {
        this.loadProject();
      }
    },

    saveProjects() {
      localStorage.setItem('subtitle_projects', JSON.stringify(this.projects));
    },

    saveCurrentProject() {
      localStorage.setItem('current_project', this.currentProject);
    },

    createProject() {
      if (!this.newProjectName.trim()) return;

      const projectId = Date.now().toString();
      const newProject = {
        id: projectId,
        name: this.newProjectName.trim(),
        description: "",
        characterNames: [],
        chunkDurationMinutes: 3,
        subtitleCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.projects.push(newProject);
      this.saveProjects();
      
      this.currentProject = projectId;
      this.currentProjectData = { ...newProject };
      this.chunkDurationMinutes = newProject.chunkDurationMinutes;
      this.newProjectName = "";

      this.showToast(`Đã tạo dự án "${newProject.name}" thành công!`, 'success');
    },

    loadProject() {
      if (!this.currentProject) {
        this.currentProjectData = null;
        return;
      }

      const project = this.projects.find(p => p.id === this.currentProject);
      if (project) {
        this.currentProjectData = { ...project };
        this.chunkDurationMinutes = project.chunkDurationMinutes || 3;
      }
    },

    updateProjectSubtitleCount() {
      if (!this.currentProject || !this.currentProjectData) return;

      this.currentProjectData.subtitleCount = this.subtitles.length;
      
      const projectIndex = this.projects.findIndex(p => p.id === this.currentProject);
      if (projectIndex !== -1) {
        this.projects[projectIndex].subtitleCount = this.subtitles.length;
        this.projects[projectIndex].updatedAt = new Date().toISOString();
        this.saveProjects();
      }
    },

    updateChunkSettings() {
      if (this.subtitles.length > 0) {
        this.createChunks();
      }
    },

    saveProjectSettings() {
      if (!this.currentProject || !this.currentProjectData) return;

      this.currentProjectData.updatedAt = new Date().toISOString();
      
      const projectIndex = this.projects.findIndex(p => p.id === this.currentProject);
      if (projectIndex !== -1) {
        this.projects[projectIndex] = { ...this.currentProjectData };
        this.projects[projectIndex].chunkDurationMinutes = this.chunkDurationMinutes;
        this.saveProjects();
      }
    },

    closeProjectSettings() {
      this.showProjectSettings = false;
    },

    removeCharacterName(index) {
      if (this.currentProjectData?.characterNames) {
        this.currentProjectData.characterNames.splice(index, 1);
      }
    },

    deleteProject() {
      if (!this.currentProject) return;

      const project = this.projects.find(p => p.id === this.currentProject);
      if (!project) return;

      if (confirm(`Bạn có chắc muốn xóa dự án "${project.name}"?`)) {
        this.projects = this.projects.filter(p => p.id !== this.currentProject);
        this.saveProjects();
        
        this.currentProject = "";
        this.currentProjectData = null;
        
        this.showToast('Đã xóa dự án thành công!', 'success');
      }
    },

    // Enhanced Character Names Management
    selectSavedCharacterForEdit(name) {
      this.findText = name;
      this.highlightMatches();
      this.addToHighlightedCharacters(name);
    },

    // New: Copy character name to clipboard
    async copyCharacterName(name) {
      try {
        await navigator.clipboard.writeText(name);
        this.showToast(`Đã copy "${name}" vào clipboard!`, 'success');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = name;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToast(`Đã copy "${name}" vào clipboard!`, 'success');
      }
    },

    // New: Check if character name is already saved in project
    isNameAlreadySaved(name) {
      return this.currentProjectData?.characterNames?.includes(name) || false;
    },

    // New: Check if character is highlighted
    isCharacterHighlighted(name) {
      return this.highlightedCharacters.includes(name);
    },

    // New: Add character to highlighted list
    addToHighlightedCharacters(name) {
      if (!this.highlightedCharacters.includes(name)) {
        this.highlightedCharacters.push(name);
      }
    },

    // New: Auto-add new detected names to project
    autoAddNewNames() {
      if (!this.currentProject || !this.currentProjectData || this.newDetectedNames.length === 0) return;

      const namesToAdd = this.newDetectedNames.map(name => name.text);
      const existingNames = this.currentProjectData.characterNames || [];
      
      this.currentProjectData.characterNames = [...existingNames, ...namesToAdd];
      this.saveProjectSettings();

      // Highlight all newly added names
      namesToAdd.forEach(name => this.addToHighlightedCharacters(name));

      this.showToast(`Đã tự động thêm ${namesToAdd.length} tên nhân vật mới!`, 'success');
    },

    confirmSaveCharacterNames() {
      if (!this.currentProject || this.selectedNames.length === 0) return;
      this.showSaveNamesConfirm = true;
    },

    closeSaveNamesConfirm() {
      this.showSaveNamesConfirm = false;
      this.replaceExistingNames = false;
    },

    saveCharacterNamesToProject() {
      if (!this.currentProject || !this.currentProjectData) return;

      if (this.replaceExistingNames) {
        this.currentProjectData.characterNames = [...this.selectedNames];
      } else {
        // Merge with existing names, avoid duplicates
        const existingNames = this.currentProjectData.characterNames || [];
        const newNames = this.selectedNames.filter(name => !existingNames.includes(name));
        this.currentProjectData.characterNames = [...existingNames, ...newNames];
      }

      this.saveProjectSettings();
      this.closeSaveNamesConfirm();
      
      // Highlight all saved names
      this.selectedNames.forEach(name => this.addToHighlightedCharacters(name));
      
      const savedCount = this.selectedNames.length;
      this.selectedNames = [];

      this.showToast(`Đã lưu ${savedCount} tên nhân vật vào dự án!`, 'success');
    },

    // Batch Text Editor Methods
    highlightMatches() {
      if (!this.findText.trim()) {
        this.matchCount = 0;
        return;
      }

      let count = 0;
      const searchText = this.caseSensitive ? this.findText : this.findText.toLowerCase();
      
      this.subtitles.forEach(subtitle => {
        const text = this.caseSensitive ? subtitle.translatedText || subtitle.text : (subtitle.translatedText || subtitle.text).toLowerCase();
        
        if (this.useRegex) {
          try {
            const regex = new RegExp(this.findText, this.caseSensitive ? 'g' : 'gi');
            const matches = text.match(regex);
            if (matches) count += matches.length;
          } catch (e) {
            // Invalid regex
          }
        } else if (this.wholeWord) {
          const regex = new RegExp(`\\b${this.escapeRegex(searchText)}\\b`, this.caseSensitive ? 'g' : 'gi');
          const matches = text.match(regex);
          if (matches) count += matches.length;
        } else {
          const matches = text.split(searchText).length - 1;
          count += matches;
        }
      });

      this.matchCount = count;
    },

    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    findAndReplace() {
      if (!this.findText.trim()) return;

      this.isBatchEditing = true;
      const changes = [];
      
      this.subtitles.forEach((subtitle, index) => {
        const originalText = subtitle.translatedText || subtitle.text;
        let newText = originalText;
        
        if (this.useRegex) {
          try {
            const regex = new RegExp(this.findText, this.caseSensitive ? 'g' : 'gi');
            newText = originalText.replace(regex, this.replaceText);
          } catch (e) {
            // Invalid regex
            return;
          }
        } else if (this.wholeWord) {
          const regex = new RegExp(`\\b${this.escapeRegex(this.findText)}\\b`, this.caseSensitive ? 'g' : 'gi');
          newText = originalText.replace(regex, this.replaceText);
        } else {
          const searchText = this.caseSensitive ? this.findText : this.findText.toLowerCase();
          const targetText = this.caseSensitive ? originalText : originalText.toLowerCase();
          
          if (targetText.includes(searchText)) {
            newText = originalText.replace(new RegExp(this.escapeRegex(this.findText), this.caseSensitive ? 'g' : 'gi'), this.replaceText);
          }
        }
        
        if (newText !== originalText) {
          changes.push({
            index: index,
            before: originalText,
            after: newText
          });
          
          if (subtitle.translatedText) {
            subtitle.translatedText = newText;
          } else {
            subtitle.text = newText;
          }
          subtitle.status = 'edited';
        }
      });

      if (changes.length > 0) {
        this.changeHistory.push({
          type: 'batch_replace',
          changes: changes,
          timestamp: Date.now()
        });
        
        this.showToast(`Đã thay thế ${changes.length} subtitle(s)`, 'success');
        this.highlightMatches();
      } else {
        this.showToast('Không tìm thấy text để thay thế', 'info');
      }
      
      this.isBatchEditing = false;
    },

    previewChanges() {
      if (!this.findText.trim()) return;

      const changes = [];
      
      this.subtitles.forEach((subtitle, index) => {
        const originalText = subtitle.translatedText || subtitle.text;
        let newText = originalText;
        
        if (this.useRegex) {
          try {
            const regex = new RegExp(this.findText, this.caseSensitive ? 'g' : 'gi');
            newText = originalText.replace(regex, this.replaceText);
          } catch (e) {
            return;
          }
        } else if (this.wholeWord) {
          const regex = new RegExp(`\\b${this.escapeRegex(this.findText)}\\b`, this.caseSensitive ? 'g' : 'gi');
          newText = originalText.replace(regex, this.replaceText);
        } else {
          const searchText = this.caseSensitive ? this.findText : this.findText.toLowerCase();
          const targetText = this.caseSensitive ? originalText : originalText.toLowerCase();
          
          if (targetText.includes(searchText)) {
            newText = originalText.replace(new RegExp(this.escapeRegex(this.findText), this.caseSensitive ? 'g' : 'gi'), this.replaceText);
          }
        }
        
        if (newText !== originalText) {
          changes.push({
            index: subtitle.index,
            before: originalText,
            after: newText,
            subtitleIndex: index
          });
        }
      });

      this.previewChanges = changes;
      this.showPreview = true;
    },

    applyPreviewChanges() {
      const changes = [];
      
      this.previewChanges.forEach(change => {
        const subtitle = this.subtitles[change.subtitleIndex];
        if (subtitle.translatedText) {
          subtitle.translatedText = change.after;
        } else {
          subtitle.text = change.after;
        }
        subtitle.status = 'edited';
        
        changes.push({
          index: change.subtitleIndex,
          before: change.before,
          after: change.after
        });
      });

      if (changes.length > 0) {
        this.changeHistory.push({
          type: 'batch_replace',
          changes: changes,
          timestamp: Date.now()
        });
        
        this.showToast(`Đã áp dụng ${changes.length} thay đổi`, 'success');
        this.highlightMatches();
      }

      this.closePreview();
    },

    closePreview() {
      this.showPreview = false;
      this.previewChanges = [];
    },

    undoLastChange() {
      if (this.changeHistory.length === 0) return;

      const lastChange = this.changeHistory.pop();
      
      lastChange.changes.forEach(change => {
        const subtitle = this.subtitles[change.index];
        if (subtitle.translatedText) {
          subtitle.translatedText = change.before;
        } else {
          subtitle.text = change.before;
        }
        // Reset status if needed
        if (change.before === subtitle.text && !subtitle.translatedText) {
          subtitle.status = 'pending';
        }
      });

      this.showToast(`Đã hoàn tác ${lastChange.changes.length} thay đổi`, 'success');
      this.highlightMatches();
    },

    // Proper Names Detection
    async detectProperNames() {
      if (this.subtitles.length === 0) return;

      this.isDetectingNames = true;
      const nameMap = new Map();
      
      // Common proper name patterns
      const namePatterns = [
        // Names starting with capital letters (2+ chars)
        /\b[A-Z][a-z]{1,}\b/g,
        // All caps words (likely acronyms or names)
        /\b[A-Z]{2,}\b/g,
        // Mixed case words
        /\b[A-Z][a-z]*[A-Z][a-z]*\b/g
      ];

      // Common words to exclude (not proper names)
      const excludeWords = new Set([
        'I', 'OK', 'TV', 'DVD', 'CD', 'USB', 'GPS', 'FBI', 'CIA', 'USA', 'UK',
        'The', 'This', 'That', 'What', 'When', 'Where', 'Why', 'How', 'Who',
        'Yes', 'No', 'Maybe', 'Please', 'Thank', 'Thanks', 'Sorry', 'Excuse'
      ]);

      try {
        this.subtitles.forEach(subtitle => {
          const text = subtitle.translatedText || subtitle.text;
          
          namePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
              matches.forEach(match => {
                if (!excludeWords.has(match) && match.length > 1) {
                  if (nameMap.has(match)) {
                    nameMap.set(match, nameMap.get(match) + 1);
                  } else {
                    nameMap.set(match, 1);
                  }
                }
              });
            }
          });
        });

        // Convert to array and sort by frequency
        const detectedNames = Array.from(nameMap.entries())
          .map(([text, count]) => ({
            text,
            count,
            type: this.classifyNameType(text)
          }))
          .filter(name => name.count >= 2) // Only show names that appear at least twice
          .sort((a, b) => b.count - a.count)
          .slice(0, 50); // Limit to top 50

        this.detectedNames = detectedNames;
        
        if (detectedNames.length > 0) {
          this.showToast(`Phát hiện ${detectedNames.length} tên riêng tiềm năng`, 'success');
        } else {
          this.showToast('Không phát hiện tên riêng nào', 'info');
        }

      } catch (error) {
        console.error('Error detecting proper names:', error);
        this.showToast('Lỗi khi phát hiện tên riêng', 'error');
      } finally {
        this.isDetectingNames = false;
      }
    },

    classifyNameType(name) {
      // Simple classification based on patterns
      if (/^[A-Z]{2,}$/.test(name)) return 'acronym';
      if (/^[A-Z][a-z]+$/.test(name)) return 'person';
      if (/[A-Z][a-z]*[A-Z]/.test(name)) return 'place';
      return 'other';
    },

    getNameType(type) {
      const types = {
        'person': '👤 Tên người',
        'place': '📍 Địa danh',
        'acronym': '🔤 Từ viết tắt',
        'other': '❓ Khác'
      };
      return types[type] || types.other;
    },

    toggleNameSelection(name) {
      const index = this.selectedNames.indexOf(name);
      if (index > -1) {
        this.selectedNames.splice(index, 1);
      } else {
        this.selectedNames.push(name);
      }
    },

    highlightSelectedNames() {
      // Add selected names to highlighted characters
      this.selectedNames.forEach(name => this.addToHighlightedCharacters(name));
      this.showToast(`Đã highlight ${this.selectedNames.length} tên riêng`, 'success');
    },

    addToCustomNames() {
      this.selectedNames.forEach(name => {
        if (!this.customNames.includes(name)) {
          this.customNames.push(name);
        }
      });
      
      localStorage.setItem('custom_proper_names', JSON.stringify(this.customNames));
      this.showToast(`Đã thêm ${this.selectedNames.length} tên vào danh sách`, 'success');
      this.selectedNames = [];
    },

    // Batch File Handling
    handleMultipleSrtFiles(event) {
      const files = Array.from(event.target.files);
      this.srtFiles = [...this.srtFiles, ...files];
      console.log(`Added ${files.length} SRT files. Total: ${this.srtFiles.length}`);
    },

    removeSrtFile(index) {
      this.srtFiles.splice(index, 1);
    },

    clearSrtFiles() {
      this.srtFiles = [];
      if (this.$refs.multipleSrtInput) {
        this.$refs.multipleSrtInput.value = '';
      }
    },

    // File Size Formatting
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    formatTotalSize(files) {
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      return this.formatFileSize(totalBytes);
    },

    // Output Folder Selection
    async chooseOutputFolder() {
      try {
        if (window.require) {
          const { dialog } = window.require("electron").remote;
          const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
          });
          if (!result.canceled && result.filePaths.length > 0) {
            this.outputFolderPath = result.filePaths[0];
          }
        } else if (window.electronAPI && window.electronAPI.chooseFolder) {
          this.outputFolderPath = await window.electronAPI.chooseFolder();
        } else if (window.showDirectoryPicker) {
          const dirHandle = await window.showDirectoryPicker();
          this.outputFolderPath = dirHandle.name;
          this.outputFolderHandle = dirHandle;
        } else {
          this.outputFolderPath = "Downloads (default)";
          alert("Browser doesn't support folder selection. Files will be saved to Downloads.");
        }
      } catch (error) {
        console.error("Error selecting output folder:", error);
        this.outputFolderPath = "Downloads (default)";
        alert("Could not select folder. Files will be saved to Downloads.");
      }
    },

    // Batch Processing Methods
    async mergeSrtFiles() {
      if (this.srtFiles.length === 0) {
        alert("No SRT files selected.");
        return;
      }

      this.isMergingSrt = true;
      this.isBatchProcessing = true;
      this.batchProgressPercentage = 0;
      this.batchProgressText = "Reading SRT files...";

      try {
        let allSubtitles = [];
        let currentIndex = 1;

        // Process each SRT file
        for (let i = 0; i < this.srtFiles.length; i++) {
          const file = this.srtFiles[i];
          this.batchProgressText = `Processing ${file.name}...`;
          this.batchProgressPercentage = (i / this.srtFiles.length) * 80;

          const content = await this.readFileAsText(file);
          const subtitles = this.parseSrtContent(content);
          
          // Re-index subtitles to avoid conflicts
          subtitles.forEach(subtitle => {
            subtitle.index = currentIndex++;
          });

          allSubtitles = [...allSubtitles, ...subtitles];
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Sort by start time
        allSubtitles.sort((a, b) => a.startSeconds - b.startSeconds);

        // Create merged SRT content
        this.batchProgressText = "Creating merged SRT file...";
        this.batchProgressPercentage = 90;
        
        const mergedContent = this.createSrtFromSubtitles(allSubtitles);
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const fileName = `merged_subtitles_${timestamp}.srt`;

        // Save merged file
        await this.saveBatchFile(mergedContent, fileName);

        this.batchProgressPercentage = 100;
        this.batchProgressText = "SRT merge completed!";

        setTimeout(() => {
          alert(`Successfully merged ${this.srtFiles.length} SRT files into ${fileName}!`);
        }, 100);

      } catch (error) {
        console.error("Error merging SRT files:", error);
        alert("Error merging SRT files: " + error.message);
      } finally {
        this.isMergingSrt = false;
        this.isBatchProcessing = false;
        setTimeout(() => {
          this.batchProgressPercentage = 0;
          this.batchProgressText = "";
        }, 2000);
      }
    },

    // File Reading Utilities
    readFileAsText(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file, "utf-8");
      });
    },

    parseSrtContent(content) {
      const subtitles = [];
      const blocks = content.trim().split("\n\n");

      blocks.forEach((block) => {
        const lines = block.split("\n");
        if (lines.length >= 3) {
          const index = parseInt(lines[0]);
          const timeRange = lines[1];
          const text = lines.slice(2).join("\n");

          const timeRangeParts = timeRange.split(" --> ");
          const startTime = timeRangeParts[0] ? timeRangeParts[0].trim() : "";
          const endTime = timeRangeParts[1] ? timeRangeParts[1].trim() : "";

          subtitles.push({
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

      return subtitles;
    },

    // Batch File Saving
    async saveBatchFile(content, fileName) {
      try {
        if (window.require) {
          const fs = window.require("fs");
          const path = window.require("path");
          const filePath = path.join(this.outputFolderPath, fileName);
          fs.writeFileSync(filePath, content, "utf8");
        } else if (window.electronAPI && window.electronAPI.saveToFolder) {
          const buffer = new TextEncoder().encode(content);
          await window.electronAPI.saveToFolder(
            this.outputFolderPath,
            fileName,
            buffer
          );
        } else {
          // Browser download
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
        console.error("Error saving batch file:", error);
        throw error;
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
      const icons = ['🎭', '🎪', '🎨', '🎬', '🎯', '🎸', '🎹', '🎻', '🎺', '🎧', '🎮', '🎰', '🎳'];
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
      try {
        if (window.require) {
          const { dialog } = window.require("electron").remote;
          const result = await dialog.showOpenDialog({
            properties: ["openDirectory"],
          });
          if (!result.canceled && result.filePaths.length > 0) {
            this.folderPath = result.filePaths[0];
          }
        } else if (window.electronAPI && window.electronAPI.chooseFolder) {
          this.folderPath = await window.electronAPI.chooseFolder();
        } else if (window.showDirectoryPicker) {
          const dirHandle = await window.showDirectoryPicker();
          this.folderPath = dirHandle.name;
        } else {
          this.folderPath = "Downloads (mặc định)";
          alert("Trình duyệt không hỗ trợ chọn thư mục. File sẽ được lưu vào thư mục Downloads.");
        }
      } catch (error) {
        console.error("Error selecting folder:", error);
        this.folderPath = "Downloads (mặc định)";
        alert("Không thể chọn thư mục. File sẽ được lưu vào thư mục Downloads.");
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

    // Chunk creation with custom duration
    createChunks() {
      if (this.subtitles.length === 0) return;

      const newChunks = [];
      const maxChunkDuration = this.chunkDurationMinutes * 60; // Convert to seconds
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
      console.log("Created chunks:", newChunks.length, "with duration:", this.chunkDurationMinutes, "minutes");
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

<style src="./SubtitleTranslator.css" scoped></style>