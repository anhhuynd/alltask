<template>
  <div class="optimizer-container">
    <!-- Find & Replace Tool -->
    <div class="card optimizer-card">
      <div class="card-header primary">
        <div class="card-icon">🔍</div>
        <h3 class="card-title">Find & Replace</h3>
      </div>
      <div class="card-content">
        <div class="find-replace-grid">
          <div class="form-group">
            <label class="form-label">Find:</label>
            <input 
              v-model="findText" 
              type="text" 
              placeholder="Enter text to find..."
              class="form-input"
              @keydown.enter="findNext"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Replace with:</label>
            <input 
              v-model="replaceText" 
              type="text" 
              placeholder="Enter replacement text..."
              class="form-input"
              @keydown.enter="replaceNext"
            />
          </div>
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="caseSensitive" />
              <span>Case sensitive</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" v-model="wholeWord" />
              <span>Whole word only</span>
            </label>
          </div>
          <div class="find-replace-buttons">
            <button @click="findNext" :disabled="!findText" class="btn btn-sm btn-primary">
              Find Next
            </button>
            <button @click="replaceNext" :disabled="!findText" class="btn btn-sm btn-secondary">
              Replace
            </button>
            <button @click="replaceAll" :disabled="!findText" class="btn btn-sm btn-success">
              Replace All
            </button>
          </div>
        </div>
        <div v-if="findResults.length > 0" class="find-results">
          <div class="results-info">
            Found {{ findResults.length }} matches
            <span v-if="currentFindIndex >= 0">
              ({{ currentFindIndex + 1 }}/{{ findResults.length }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quality Control Tools -->
    <div class="card optimizer-card">
      <div class="card-header warning">
        <div class="card-icon">✅</div>
        <h3 class="card-title">Quality Control</h3>
      </div>
      <div class="card-content">
        <div class="quality-buttons">
          <button @click="runSpellCheck" :disabled="isChecking" class="btn btn-primary">
            <div v-if="!isChecking" class="btn-content">
              <span class="btn-icon">📝</span>
              <span>Spell Check</span>
            </div>
            <div v-else class="btn-content">
              <div class="loading-spinner small"></div>
              <span>Checking...</span>
            </div>
          </button>
          <button @click="checkConsistency" class="btn btn-secondary">
            <span class="btn-icon">🔄</span>
            <span>Consistency Check</span>
          </button>
          <button @click="calculateWPM" class="btn btn-info">
            <span class="btn-icon">⏱️</span>
            <span>Calculate WPM</span>
          </button>
        </div>

        <!-- Spell Check Results -->
        <div v-if="spellErrors.length > 0" class="spell-results">
          <h4 class="results-title">Spell Check Results ({{ spellErrors.length }} issues):</h4>
          <div class="error-list">
            <div 
              v-for="error in spellErrors" 
              :key="`${error.subtitleIndex}-${error.wordIndex}`"
              class="error-item"
            >
              <div class="error-info">
                <span class="error-word">{{ error.word }}</span>
                <span class="error-location">in subtitle #{{ error.subtitleIndex }}</span>
              </div>
              <div class="error-suggestions">
                <button 
                  v-for="suggestion in error.suggestions.slice(0, 3)"
                  :key="suggestion"
                  @click="applySuggestion(error, suggestion)"
                  class="btn btn-xs btn-suggestion"
                >
                  {{ suggestion }}
                </button>
                <button @click="ignoreError(error)" class="btn btn-xs btn-ignore">
                  Ignore
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Consistency Check Results -->
        <div v-if="consistencyIssues.length > 0" class="consistency-results">
          <h4 class="results-title">Consistency Issues ({{ consistencyIssues.length }} found):</h4>
          <div class="issue-list">
            <div 
              v-for="issue in consistencyIssues" 
              :key="issue.term"
              class="issue-item"
            >
              <div class="issue-term">{{ issue.term }}</div>
              <div class="issue-variants">
                <span class="variant-label">Found variants:</span>
                <span 
                  v-for="variant in issue.variants" 
                  :key="variant.text"
                  class="variant-item"
                >
                  "{{ variant.text }}" ({{ variant.count }}x)
                </span>
              </div>
              <div class="issue-actions">
                <button 
                  v-for="variant in issue.variants"
                  :key="variant.text"
                  @click="standardizeVariant(issue.term, variant.text)"
                  class="btn btn-xs btn-primary"
                >
                  Use "{{ variant.text }}"
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- WPM Results -->
        <div v-if="wpmResults.length > 0" class="wpm-results">
          <h4 class="results-title">Reading Speed Analysis:</h4>
          <div class="wpm-stats">
            <div class="stat-item">
              <span class="stat-label">Average WPM:</span>
              <span class="stat-value">{{ averageWPM }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Fast subtitles (>200 WPM):</span>
              <span class="stat-value warning">{{ fastSubtitles.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Slow subtitles (<120 WPM):</span>
              <span class="stat-value info">{{ slowSubtitles.length }}</span>
            </div>
          </div>
          <div class="wpm-list">
            <div 
              v-for="result in wpmResults.filter(r => r.wpm > 200 || r.wpm < 120)" 
              :key="result.index"
              class="wpm-item"
              :class="{ 'fast': result.wpm > 200, 'slow': result.wpm < 120 }"
            >
              <div class="wpm-info">
                <span class="subtitle-index">#{{ result.index }}</span>
                <span class="wpm-value">{{ result.wpm }} WPM</span>
                <span class="wpm-label">{{ result.wpm > 200 ? 'Too Fast' : 'Too Slow' }}</span>
              </div>
              <div class="subtitle-preview">{{ result.text.substring(0, 60) }}...</div>
              <button @click="jumpToSubtitle(result.index)" class="btn btn-xs btn-primary">
                Jump to
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubtitleOptimizer',
  props: {
    subtitles: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      // Find & Replace
      findText: '',
      replaceText: '',
      caseSensitive: false,
      wholeWord: false,
      findResults: [],
      currentFindIndex: -1,
      
      // Quality Control
      isChecking: false,
      spellErrors: [],
      consistencyIssues: [],
      wpmResults: [],
      
      // Common Vietnamese words for spell checking
      vietnameseWords: new Set([
        'tôi', 'bạn', 'anh', 'chị', 'em', 'ông', 'bà', 'cô', 'chú', 'cậu',
        'là', 'có', 'không', 'được', 'sẽ', 'đã', 'đang', 'sẽ', 'phải', 'nên',
        'và', 'hoặc', 'nhưng', 'mà', 'nếu', 'khi', 'để', 'với', 'của', 'trong',
        'trên', 'dưới', 'ngoài', 'giữa', 'sau', 'trước', 'bên', 'cạnh', 'gần',
        'xa', 'lớn', 'nhỏ', 'cao', 'thấp', 'dài', 'ngắn', 'rộng', 'hẹp',
        'đẹp', 'xấu', 'tốt', 'xấu', 'nhanh', 'chậm', 'mạnh', 'yếu', 'khỏe'
      ]),
      
      // Common English words for spell checking
      englishWords: new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'
      ])
    }
  },
  
  computed: {
    averageWPM() {
      if (this.wpmResults.length === 0) return 0;
      const total = this.wpmResults.reduce((sum, result) => sum + result.wpm, 0);
      return Math.round(total / this.wpmResults.length);
    },
    
    fastSubtitles() {
      return this.wpmResults.filter(result => result.wpm > 200);
    },
    
    slowSubtitles() {
      return this.wpmResults.filter(result => result.wpm < 120);
    }
  },
  
  methods: {
    // Find & Replace Methods
    findNext() {
      if (!this.findText) return;
      
      this.findResults = [];
      const searchText = this.caseSensitive ? this.findText : this.findText.toLowerCase();
      
      this.subtitles.forEach((subtitle, index) => {
        const text = this.caseSensitive ? subtitle.translatedText || subtitle.text : 
                   (subtitle.translatedText || subtitle.text).toLowerCase();
        
        if (this.wholeWord) {
          const regex = new RegExp(`\\b${this.escapeRegex(searchText)}\\b`, 'g');
          let match;
          while ((match = regex.exec(text)) !== null) {
            this.findResults.push({ subtitleIndex: index, position: match.index });
          }
        } else {
          let pos = text.indexOf(searchText);
          while (pos !== -1) {
            this.findResults.push({ subtitleIndex: index, position: pos });
            pos = text.indexOf(searchText, pos + 1);
          }
        }
      });
      
      if (this.findResults.length > 0) {
        this.currentFindIndex = 0;
        this.highlightResult(this.findResults[0]);
      }
    },
    
    replaceNext() {
      if (this.currentFindIndex >= 0 && this.currentFindIndex < this.findResults.length) {
        const result = this.findResults[this.currentFindIndex];
        const subtitle = this.subtitles[result.subtitleIndex];
        const text = subtitle.translatedText || subtitle.text;
        
        const beforeText = text.substring(0, result.position);
        const afterText = text.substring(result.position + this.findText.length);
        const newText = beforeText + this.replaceText + afterText;
        
        this.$emit('updateSubtitle', subtitle.index, newText);
        
        // Remove this result and find next
        this.findResults.splice(this.currentFindIndex, 1);
        if (this.currentFindIndex >= this.findResults.length) {
          this.currentFindIndex = this.findResults.length - 1;
        }
        
        if (this.findResults.length > 0 && this.currentFindIndex >= 0) {
          this.highlightResult(this.findResults[this.currentFindIndex]);
        }
      }
    },
    
    replaceAll() {
      let replacedCount = 0;
      this.findResults.forEach(result => {
        const subtitle = this.subtitles[result.subtitleIndex];
        const text = subtitle.translatedText || subtitle.text;
        const newText = text.replace(
          new RegExp(this.escapeRegex(this.findText), this.caseSensitive ? 'g' : 'gi'),
          this.replaceText
        );
        
        if (newText !== text) {
          this.$emit('updateSubtitle', subtitle.index, newText);
          replacedCount++;
        }
      });
      
      this.findResults = [];
      this.currentFindIndex = -1;
      alert(`Replaced ${replacedCount} occurrences.`);
    },
    
    highlightResult(result) {
      this.$emit('jumpToSubtitle', result.subtitleIndex);
    },
    
    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    // Spell Check Methods
    async runSpellCheck() {
      this.isChecking = true;
      this.spellErrors = [];
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        this.subtitles.forEach((subtitle, subtitleIndex) => {
          const text = subtitle.translatedText || subtitle.text;
          const words = text.split(/\s+/);
          
          words.forEach((word, wordIndex) => {
            const cleanWord = word.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, '').toLowerCase();
            
            if (cleanWord.length > 2 && !this.isValidWord(cleanWord)) {
              this.spellErrors.push({
                subtitleIndex: subtitle.index,
                wordIndex,
                word: word,
                suggestions: this.getSuggestions(cleanWord)
              });
            }
          });
        });
        
      } finally {
        this.isChecking = false;
      }
    },
    
    isValidWord(word) {
      return this.vietnameseWords.has(word) || this.englishWords.has(word);
    },
    
    getSuggestions(word) {
      // Simple suggestion algorithm - in real app, use proper spell check API
      const suggestions = [];
      const allWords = [...this.vietnameseWords, ...this.englishWords];
      
      // Find words with similar length and starting letter
      allWords.forEach(dictWord => {
        if (Math.abs(dictWord.length - word.length) <= 2 && 
            dictWord[0] === word[0]) {
          suggestions.push(dictWord);
        }
      });
      
      return suggestions.slice(0, 3);
    },
    
    applySuggestion(error, suggestion) {
      const subtitle = this.subtitles.find(s => s.index === error.subtitleIndex);
      if (subtitle) {
        const text = subtitle.translatedText || subtitle.text;
        const newText = text.replace(error.word, suggestion);
        this.$emit('updateSubtitle', subtitle.index, newText);
        
        // Remove this error from the list
        this.spellErrors = this.spellErrors.filter(e => 
          !(e.subtitleIndex === error.subtitleIndex && e.wordIndex === error.wordIndex)
        );
      }
    },
    
    ignoreError(error) {
      this.spellErrors = this.spellErrors.filter(e => 
        !(e.subtitleIndex === error.subtitleIndex && e.wordIndex === error.wordIndex)
      );
    },
    
    // Consistency Check Methods
    checkConsistency() {
      this.consistencyIssues = [];
      const termVariants = {};
      
      this.subtitles.forEach(subtitle => {
        const text = subtitle.translatedText || subtitle.text;
        const words = text.split(/\s+/);
        
        words.forEach(word => {
          const cleanWord = word.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF]/g, '');
          if (cleanWord.length > 3) {
            const lowerWord = cleanWord.toLowerCase();
            
            if (!termVariants[lowerWord]) {
              termVariants[lowerWord] = {};
            }
            
            if (!termVariants[lowerWord][cleanWord]) {
              termVariants[lowerWord][cleanWord] = 0;
            }
            termVariants[lowerWord][cleanWord]++;
          }
        });
      });
      
      // Find terms with multiple variants
      Object.keys(termVariants).forEach(term => {
        const variants = Object.keys(termVariants[term]);
        if (variants.length > 1) {
          this.consistencyIssues.push({
            term,
            variants: variants.map(variant => ({
              text: variant,
              count: termVariants[term][variant]
            })).sort((a, b) => b.count - a.count)
          });
        }
      });
    },
    
    standardizeVariant(term, standardVariant) {
      const issue = this.consistencyIssues.find(i => i.term === term);
      if (!issue) return;
      
      let replacedCount = 0;
      issue.variants.forEach(variant => {
        if (variant.text !== standardVariant) {
          this.subtitles.forEach(subtitle => {
            const text = subtitle.translatedText || subtitle.text;
            const regex = new RegExp(`\\b${this.escapeRegex(variant.text)}\\b`, 'g');
            const newText = text.replace(regex, standardVariant);
            
            if (newText !== text) {
              this.$emit('updateSubtitle', subtitle.index, newText);
              replacedCount++;
            }
          });
        }
      });
      
      // Remove this issue from the list
      this.consistencyIssues = this.consistencyIssues.filter(i => i.term !== term);
      alert(`Standardized ${replacedCount} occurrences to "${standardVariant}".`);
    },
    
    // WPM Calculation Methods
    calculateWPM() {
      this.wpmResults = [];
      
      this.subtitles.forEach(subtitle => {
        const text = subtitle.translatedText || subtitle.text;
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
        const duration = subtitle.endSeconds - subtitle.startSeconds;
        const wpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
        
        this.wpmResults.push({
          index: subtitle.index,
          text: text,
          wordCount: wordCount,
          duration: duration,
          wpm: wpm
        });
      });
    },
    
    jumpToSubtitle(index) {
      this.$emit('jumpToSubtitle', index);
    }
  }
}
</script>

<style scoped>
.optimizer-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.optimizer-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.card-header.primary {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.card-header.warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #744210;
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

/* Find & Replace Styles */
.find-replace-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.form-input {
  padding: 8px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #4facfe;
}

.form-options {
  grid-column: 1 / -1;
  display: flex;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.find-replace-buttons {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
}

.find-results {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
}

.results-info {
  font-size: 14px;
  font-weight: 500;
  color: #0c4a6e;
}

/* Quality Control Styles */
.quality-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
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

.btn-secondary {
  background: linear-gradient(135deg, #a0aec0 0%, #718096 100%);
  color: white;
}

.btn-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-info {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
}

.btn-suggestion {
  background: #e6fffa;
  color: #234e52;
  border: 1px solid #81e6d9;
}

.btn-ignore {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #fc8181;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-size: 16px;
}

/* Results Styles */
.results-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
}

.error-list, .issue-list, .wmp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-item, .issue-item, .wmp-item {
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #e2e8f0;
}

.error-item {
  border-left-color: #f56565;
}

.issue-item {
  border-left-color: #ed8936;
}

.error-info, .issue-term {
  font-weight: 600;
  margin-bottom: 8px;
}

.error-word {
  color: #e53e3e;
  background: #fed7d7;
  padding: 2px 6px;
  border-radius: 4px;
}

.error-location {
  color: #718096;
  font-size: 12px;
  margin-left: 8px;
}

.error-suggestions, .issue-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.issue-variants {
  margin-bottom: 8px;
  font-size: 14px;
}

.variant-label {
  color: #718096;
  margin-right: 8px;
}

.variant-item {
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 8px;
  font-family: monospace;
}

/* WPM Results Styles */
.wpm-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
}

.stat-label {
  font-weight: 500;
  color: #4a5568;
}

.stat-value {
  font-weight: 600;
  font-size: 18px;
  color: #2d3748;
}

.stat-value.warning {
  color: #d69e2e;
}

.stat-value.info {
  color: #3182ce;
}

.wmp-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wmp-item.fast {
  border-left-color: #f56565;
  background: #fef5e7;
}

.wmp-item.slow {
  border-left-color: #4299e1;
  background: #f0f9ff;
}

.wmp-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.subtitle-index {
  font-weight: 600;
  color: #4a5568;
}

.wmp-value {
  font-weight: 600;
  font-family: monospace;
}

.wmp-label {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: 600;
}

.wmp-item.fast .wmp-label {
  background: #fed7d7;
  color: #742a2a;
}

.wmp-item.slow .wmp-label {
  background: #bee3f8;
  color: #2c5282;
}

.subtitle-preview {
  flex: 1;
  color: #718096;
  font-size: 14px;
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
  width: 14px;
  height: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .find-replace-grid {
    grid-template-columns: 1fr;
  }
  
  .quality-buttons {
    flex-direction: column;
  }
  
  .wmp-stats {
    grid-template-columns: 1fr;
  }
  
  .wmp-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .wmp-info {
    min-width: auto;
  }
}
</style>