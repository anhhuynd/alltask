<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>🔑 Cấu hình YouTube API Key</h3>
      <p>Nhập YouTube Data API v3 key để sử dụng tính năng cập nhật tự động từ YouTube:</p>
      <input 
        :value="apiKey"
        @input="updateKey"
        type="password"
        placeholder="Nhập YouTube API Key..."
        class="modal-input"
      >
      <div class="modal-note">
        <p><strong>Hướng dẫn lấy API Key:</strong></p>
        <ol>
          <li>Truy cập <a href="https://console.developers.google.com/" target="_blank">Google Cloud Console</a></li>
          <li>Tạo project mới hoặc chọn project có sẵn</li>
          <li>Bật YouTube Data API v3</li>
          <li>Tạo API Key trong phần Credentials</li>
          <li>Copy và paste vào đây</li>
        </ol>
      </div>
      <div class="modal-actions">
        <button @click="$emit('close')" class="modal-btn cancel">Hủy</button>
        <button @click="$emit('save')" class="modal-btn primary">Lưu API Key</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiKeyModal',
  props: {
    apiKey: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'save', 'update-key'],
  methods: {
    updateKey(event) {
      this.$emit('update-key', event.target.value)
    }
  }
}
</script>