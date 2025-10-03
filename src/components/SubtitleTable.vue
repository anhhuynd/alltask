<template>
  <div class="subtitle-table-container">
    <div class="table-header">
      <div class="table-icon">📝</div>
      <h3 class="table-title">Subtitle Content</h3>
      <div class="table-actions">
        <button @click="toggleEditMode" class="btn btn-sm" :class="{ 'active': editMode }">
          <span class="btn-icon">{{ editMode ? '👁️' : '✏️' }}</span>
          <span>{{ editMode ? 'View Mode' : 'Edit Mode' }}</span>
        </button>
      </div>
    </div>
    
    <!-- Pagination Controls -->
    <div class="pagination-section">
      <div class="pagination-controls">
        <div class="pagination-info">
          <label class="form-label">Items per page:</label>
          <select v-model="itemsPerPage" @change="handleItemsPerPageChange" class="form-select compact">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">All</option>
          </select>
          <span v-if="itemsPerPage !== 'all'" class="pagination-text">
            Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ subtitles.length }} items
          </span>
        </div>
        
        <div v-if="itemsPerPage !== 'all'" class="pagination-buttons">
          <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn btn-sm">
            ⏮️ First
          </button>
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn btn-sm">
            ⏪ Previous
          </button>
          <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn btn-sm">
            Next ⏩
          </button>
          <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn btn-sm">
            Last ⏭️
          </button>
        </div>
      </div>
    </div>
    
    <!-- Subtitle Table -->
    <div class="table-wrapper" ref="tableWrapper">
      <table class="subtitle-table">
        <thead>
          <tr>
            <th class="col-index">Index</th>
            <th class="col-time">Time</th>
            <th class="col-original">Original Content</th>
            <th class="col-translated">Translated Content</th>
            <th class="col-status">Status</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="subtitle in paginatedSubtitles" 
            :key="subtitle.index" 
            :ref="`subtitle-row-${subtitle.index}`"
            class="subtitle-row"
            :class="{ 
              'current-subtitle': isCurrentSubtitle(subtitle),
              'has-translation': subtitle.translatedText,
              'edit-mode': editMode,
              'inline-editing': inlineEditingId === subtitle.index
            }"
          >
            <td class="index-cell">
              <div class="index-number">{{ subtitle.index }}</div>
            </td>
            
            <td class="time-cell">
              <div class="timestamp" @click="seekToSubtitle(subtitle)">
                {{ subtitle.startTime }} → {{ subtitle.endTime }}
              </div>
            </td>
            
            <td class="content-cell">
              <div class="subtitle-text original">{{ subtitle.text }}</div>
            </td>
            
            <td class="content-cell translated-cell">
              <!-- View Mode or Global Edit Mode -->
              <div v-if="!editMode && inlineEditingId !== subtitle.index" class="subtitle-text translated">
                <span v-if="subtitle.translatedText">{{ subtitle.translatedText }}</span>
                <span v-else class="placeholder">Not translated yet</span>
              </div>
              
              <!-- Global Edit Mode -->
              <div v-else-if="editMode && inlineEditingId !== subtitle.index" class="edit-container">
                <textarea
                  :value="subtitle.translatedText || ''"
                  @input="updateSubtitleText(subtitle, $event.target.value)"
                  @keydown.enter.ctrl="saveSubtitle(subtitle)"
                  @keydown.escape="cancelEdit(subtitle)"
                  class="edit-textarea"
                  rows="2"
                  placeholder="Enter translation... (Ctrl+Enter to save, Esc to cancel)"
                ></textarea>
                <div class="edit-actions">
                  <button @click="saveSubtitle(subtitle)" class="btn btn-xs btn-success">
                    ✓ Save
                  </button>
                  <button @click="clearTranslation(subtitle)" class="btn btn-xs btn-danger">
                    🗑️ Clear
                  </button>
                </div>
              </div>
              
              <!-- Inline Edit Mode -->
              <div v-else class="edit-container inline-edit">
                <textarea
                  :value="subtitle.translatedText || ''"
                  @input="updateSubtitleText(subtitle, $event.target.value)"
                  @keydown.enter.ctrl="saveInlineEdit(subtitle)"
                  @keydown.escape="cancelInlineEdit(subtitle)"
                  class="edit-textarea inline-textarea"
                  rows="3"
                  placeholder="Enter translation... (Ctrl+Enter to save, Esc to cancel)"
                  ref="inlineTextarea"
                ></textarea>
                <div class="edit-actions inline-actions">
                  <button @click="saveInlineEdit(subtitle)" class="btn btn-xs btn-success">
                    ✓ Save
                  </button>
                  <button @click="cancelInlineEdit(subtitle)" class="btn btn-xs btn-secondary">
                    ✕ Cancel
                  </button>
                </div>
              </div>
            </td>
            
            <td class="status-cell">
              <div class="status-wrapper">
                <div v-if="subtitle.status === 'processing'" class="loading-spinner small"></div>
                <span class="status-badge" :class="getStatusBadgeClass(subtitle.status)">
                  {{ getStatusText(subtitle.status) }}
                </span>
              </div>
            </td>
            
            <td class="actions-cell">
              <div class="action-buttons">
                <button 
                  @click="seekToSubtitle(subtitle)" 
                  class="btn btn-xs btn-primary"
                  title="Jump to this subtitle"
                >
                  ⏯️
                </button>
                <button 
                  v-if="!editMode && inlineEditingId !== subtitle.index"
                  @click="startInlineEdit(subtitle)" 
                  class="btn btn-xs btn-secondary"
                  title="Edit this subtitle"
                >
                  ✏️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubtitleTable',
  props: {
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
      editMode: false,
      currentPage: 1,
      itemsPerPage: 25,
      editingSubtitles: new Map(),
      inlineEditingId: null,
      lastCurrentSubtitleIndex: null,
      autoScrollEnabled: true
    }
  },
  
  computed: {
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
    
    currentSubtitle() {
      return this.subtitles.find(subtitle => {
        const startSeconds = subtitle.startSeconds || this.timeToSeconds(subtitle.startTime);
        const endSeconds = subtitle.endSeconds || this.timeToSeconds(subtitle.endTime);
        return this.currentTime >= startSeconds && this.currentTime <= endSeconds;
      });
    }
  },
  
  watch: {
    itemsPerPage() {
      localStorage.setItem("items_per_page", this.itemsPerPage);
    },
    
    editMode(newValue) {
      if (!newValue) {
        this.editingSubtitles.clear();
      }
      // Cancel inline editing when switching to global edit mode
      if (newValue && this.inlineEditingId) {
        this.cancelInlineEdit(this.subtitles.find(s => s.index === this.inlineEditingId));
      }
    },
    
    currentTime(newTime) {
      if (this.autoScrollEnabled) {
        this.scrollToCurrentSubtitle();
      }
    },
    
    currentSubtitle(newSubtitle, oldSubtitle) {
      if (newSubtitle && newSubtitle.index !== this.lastCurrentSubtitleIndex) {
        this.lastCurrentSubtitleIndex = newSubtitle.index;
        if (this.autoScrollEnabled) {
          this.$nextTick(() => {
            this.scrollToCurrentSubtitle();
          });
        }
      }
    }
  },
  
  mounted() {
    const savedItemsPerPage = localStorage.getItem("items_per_page");
    if (savedItemsPerPage) {
      this.itemsPerPage = savedItemsPerPage;
    }
  },
  
  methods: {
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    
    handleItemsPerPageChange() {
      this.currentPage = 1;
      // Re-scroll to current subtitle after pagination change
      this.$nextTick(() => {
        if (this.currentSubtitle) {
          this.scrollToCurrentSubtitle();
        }
      });
    },
    
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    
    // Auto-scroll and pagination to current subtitle
    scrollToCurrentSubtitle() {
      if (!this.currentSubtitle || this.itemsPerPage === 'all') return;
      
      const currentIndex = this.currentSubtitle.index;
      const itemsPerPageNum = parseInt(this.itemsPerPage);
      
      // Calculate which page the current subtitle should be on
      const subtitlePosition = this.subtitles.findIndex(s => s.index === currentIndex);
      if (subtitlePosition === -1) return;
      
      const targetPage = Math.floor(subtitlePosition / itemsPerPageNum) + 1;
      
      // Auto-paginate if needed
      if (targetPage !== this.currentPage) {
        this.currentPage = targetPage;
        this.$nextTick(() => {
          this.scrollToSubtitleRow(currentIndex);
        });
      } else {
        this.scrollToSubtitleRow(currentIndex);
      }
    },
    
    // Scroll to specific subtitle row
    scrollToSubtitleRow(subtitleIndex) {
      this.$nextTick(() => {
        const rowRefs = this.$refs[`subtitle-row-${subtitleIndex}`];
        const rowElement = Array.isArray(rowRefs) ? rowRefs[0] : rowRefs;
        
        if (rowElement && this.$refs.tableWrapper) {
          const tableWrapper = this.$refs.tableWrapper;
          const rowTop = rowElement.offsetTop;
          const rowHeight = rowElement.offsetHeight;
          const wrapperHeight = tableWrapper.clientHeight;
          const currentScroll = tableWrapper.scrollTop;
          
          // Calculate optimal scroll position (center the row if possible)
          const optimalScroll = rowTop - (wrapperHeight / 2) + (rowHeight / 2);
          
          // Smooth scroll to the row
          tableWrapper.scrollTo({
            top: Math.max(0, optimalScroll),
            behavior: 'smooth'
          });
        }
      });
    },
    
    isCurrentSubtitle(subtitle) {
      const startSeconds = subtitle.startSeconds || this.timeToSeconds(subtitle.startTime);
      const endSeconds = subtitle.endSeconds || this.timeToSeconds(subtitle.endTime);
      return this.currentTime >= startSeconds && this.currentTime <= endSeconds;
    },
    
    seekToSubtitle(subtitle) {
      const startSeconds = subtitle.startSeconds || this.timeToSeconds(subtitle.startTime);
      this.$emit('seekTo', startSeconds);
      
      // Auto-scroll to this subtitle after seeking
      this.$nextTick(() => {
        this.scrollToSubtitleRow(subtitle.index);
      });
    },
    
    // Inline editing methods
    startInlineEdit(subtitle) {
      // Store original value for cancel functionality
      this.editingSubtitles.set(subtitle.index, subtitle.translatedText || '');
      this.inlineEditingId = subtitle.index;
      
      // Focus on textarea after Vue updates DOM
      this.$nextTick(() => {
        const textarea = this.$refs.inlineTextarea;
        if (textarea && textarea[0]) {
          textarea[0].focus();
          textarea[0].select();
        }
      });
      
      // Scroll to this subtitle
      this.scrollToSubtitleRow(subtitle.index);
    },
    
    saveInlineEdit(subtitle) {
      // Remove from editing map since we're saving
      this.editingSubtitles.delete(subtitle.index);
      
      // Mark as edited if it has content
      if (subtitle.translatedText && subtitle.translatedText.trim() !== '') {
        subtitle.status = 'edited';
      }
      
      // Emit save event
      this.$emit('updateSubtitle', subtitle.index, subtitle.translatedText);
      
      // Exit inline editing mode
      this.inlineEditingId = null;
      
      console.log(`Saved subtitle ${subtitle.index}:`, subtitle.translatedText);
    },
    
    cancelInlineEdit(subtitle) {
      // Restore original value if it was being edited
      if (this.editingSubtitles.has(subtitle.index)) {
        const originalValue = this.editingSubtitles.get(subtitle.index);
        subtitle.translatedText = originalValue;
        this.editingSubtitles.delete(subtitle.index);
        this.$emit('updateSubtitle', subtitle.index, originalValue);
      }
      
      // Exit inline editing mode
      this.inlineEditingId = null;
    },
    
    updateSubtitleText(subtitle, newText) {
      // Store original value if not already stored
      if (!this.editingSubtitles.has(subtitle.index)) {
        this.editingSubtitles.set(subtitle.index, subtitle.translatedText || '');
      }
      
      // Update the subtitle text immediately for reactive updates
      subtitle.translatedText = newText;
      this.$emit('updateSubtitle', subtitle.index, newText);
    },
    
    saveSubtitle(subtitle) {
      // Remove from editing map since we're saving
      this.editingSubtitles.delete(subtitle.index);
      
      // Mark as edited if it has content
      if (subtitle.translatedText && subtitle.translatedText.trim() !== '') {
        subtitle.status = 'edited';
      }
      
      // Emit final save event
      this.$emit('updateSubtitle', subtitle.index, subtitle.translatedText);
      
      console.log(`Saved subtitle ${subtitle.index}:`, subtitle.translatedText);
    },
    
    cancelEdit(subtitle) {
      // Restore original value if it was being edited
      if (this.editingSubtitles.has(subtitle.index)) {
        const originalValue = this.editingSubtitles.get(subtitle.index);
        subtitle.translatedText = originalValue;
        this.editingSubtitles.delete(subtitle.index);
        this.$emit('updateSubtitle', subtitle.index, originalValue);
      }
    },
    
    clearTranslation(subtitle) {
      if (confirm('Are you sure you want to clear this translation?')) {
        subtitle.translatedText = '';
        subtitle.status = 'pending';
        this.editingSubtitles.delete(subtitle.index);
        this.$emit('updateSubtitle', subtitle.index, '');
      }
    },
    
    timeToSeconds(timeStr) {
      if (!timeStr) return 0;
      const parts = timeStr.split(":");
      const seconds = parseFloat(parts[2].replace(",", "."));
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds;
    },
    
    getStatusBadgeClass(status) {
      switch (status) {
        case "success": return "badge-success";
        case "pending": return "badge-warning";
        case "error": return "badge-danger";
        case "processing": return "badge-primary";
        case "edited": return "badge-info";
        default: return "badge-warning";
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case "success": return "Completed";
        case "pending": return "Pending";
        case "error": return "Error";
        case "processing": return "Processing";
        case "edited": return "Edited";
        default: return "Pending";
      }
    }
  }
}
</script>

<style scoped>
.subtitle-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-icon {
  font-size: 20px;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  padding: 16px 20px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  margin: 0;
}

.form-select.compact {
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  min-width: 80px;
}

.pagination-text {
  font-size: 12px;
  color: #718096;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-info {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
  margin: 0 8px;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
  max-height: 600px;
  scroll-behavior: smooth;
}

.subtitle-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.subtitle-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 5;
}

.subtitle-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

.col-index {
  width: 60px;
  text-align: center;
}

.col-time {
  width: 140px;
}

.col-original,
.col-translated {
  width: 30%;
}

.col-status {
  width: 100px;
  text-align: center;
}

.col-actions {
  width: 80px;
  text-align: center;
}

.subtitle-row {
  transition: all 0.3s ease;
}

.subtitle-row:hover {
  background: #f7fafc;
}

.subtitle-row.current-subtitle {
  background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
  border-left: 4px solid #38b2ac;
  box-shadow: 0 2px 8px rgba(56, 178, 172, 0.2);
}

.subtitle-row.has-translation {
  border-left: 2px solid #48bb78;
}

.subtitle-row.edit-mode {
  background: linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%);
}

.subtitle-row.inline-editing {
  background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%);
  border-left: 4px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.index-cell {
  text-align: center;
}

.index-number {
  font-weight: 600;
  color: #4a5568;
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  font-size: 11px;
}

.time-cell {
  cursor: pointer;
}

.timestamp {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 11px;
  color: #718096;
  background: #f7fafc;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  transition: all 0.2s;
}

.timestamp:hover {
  background: #4facfe;
  color: white;
  transform: scale(1.05);
}

.content-cell {
  line-height: 1.5;
}

.subtitle-text {
  line-height: 1.6;
  word-wrap: break-word;
}

.subtitle-text.original {
  color: #2d3748;
  font-size: 13px;
}

.subtitle-text.translated {
  color: #4facfe;
  font-weight: 500;
  font-size: 13px;
}

.subtitle-text.placeholder {
  color: #a0aec0;
  font-style: italic;
  font-size: 12px;
}

.translated-cell {
  position: relative;
}

.edit-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-container.inline-edit {
  background: rgba(59, 130, 246, 0.05);
  padding: 12px;
  border-radius: 8px;
  border: 2px solid #3b82f6;
}

.edit-textarea {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  border: 2px solid #4facfe;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  background: #f0f9ff;
  line-height: 1.4;
}

.edit-textarea.inline-textarea {
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  min-height: 80px;
}

.edit-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.edit-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.edit-actions.inline-actions {
  justify-content: center;
  gap: 8px;
}

.status-cell {
  text-align: center;
}

.status-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.badge-success {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.badge-warning {
  background: #fbd38d;
  color: #744210;
}

.status-badge.badge-danger {
  background: #fed7d7;
  color: #742a2a;
}

.status-badge.badge-primary {
  background: #bee3f8;
  color: #2c5282;
}

.status-badge.badge-info {
  background: #c3dafe;
  color: #2a4365;
}

.actions-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 11px;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.btn-primary.active {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
}

.btn-secondary {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(160, 174, 192, 0.3);
}

.btn-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4facfe;
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

/* Responsive Design */
@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .pagination-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .subtitle-table {
    font-size: 11px;
  }
  
  .subtitle-table th,
  .subtitle-table td {
    padding: 8px 4px;
  }
  
  .col-original,
  .col-translated {
    width: 35%;
  }
  
  .edit-textarea {
    font-size: 11px;
  }
  
  .edit-actions {
    flex-direction: column;
  }
  
  .edit-actions.inline-actions {
    flex-direction: row;
  }
}
</style>