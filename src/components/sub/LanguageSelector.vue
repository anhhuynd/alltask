<template>
  <div class="language-selector">
    <div class="language-grid">
      <div class="form-group">
        <label class="form-label">Dịch từ:</label>
        <select :value="sourceLanguage" @change="$emit('update:sourceLanguage', $event.target.value)" class="form-select">
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
        <select :value="targetLanguage" @change="$emit('update:targetLanguage', $event.target.value)" class="form-select">
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
</template>

<script>
export default {
  name: 'LanguageSelector',
  props: {
    sourceLanguage: {
      type: String,
      default: 'chinese'
    },
    targetLanguage: {
      type: String,
      default: 'vietnamese'
    }
  },
  emits: ['update:sourceLanguage', 'update:targetLanguage']
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .language-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .arrow-container {
    order: 3;
  }
}
</style>