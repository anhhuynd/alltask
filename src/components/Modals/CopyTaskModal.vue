<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Copy Task: "{{ taskToCopy?.title }}"</h3>
      <p v-if="subTasksCount > 0">
        Task này có {{ subTasksCount }} subtask(s) sẽ được copy cùng.
      </p>
      <p>Copy task sang:</p>
      <div class="copy-options">
        <label class="copy-option">
          <input type="radio" :value="'yesterday'" :checked="copyTarget === 'yesterday'" @change="updateTarget">
          <span>Hôm qua ({{ getDateLabel(-1) }})</span>
        </label>
        <label class="copy-option">
          <input type="radio" :value="'today'" :checked="copyTarget === 'today'" @change="updateTarget">
          <span>Hôm nay ({{ getDateLabel(0) }})</span>
        </label>
        <label class="copy-option">
          <input type="radio" :value="'tomorrow'" :checked="copyTarget === 'tomorrow'" @change="updateTarget">
          <span>Ngày mai ({{ getDateLabel(1) }})</span>
        </label>
        <label class="copy-option">
          <input type="radio" :value="'custom'" :checked="copyTarget === 'custom'" @change="updateTarget">
          <span>Ngày khác</span>
        </label>
      </div>
      <input 
        v-if="copyTarget === 'custom'" 
        type="date" 
        :value="customCopyDate"
        @input="updateDate"
        class="modal-input"
      >
      <div class="modal-actions">
        <button @click="$emit('close')" class="modal-btn cancel">Hủy</button>
        <button @click="$emit('confirm')" class="modal-btn primary">Copy Task</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CopyTaskModal',
  props: {
    taskToCopy: {
      type: Object,
      default: null
    },
    copyTarget: {
      type: String,
      required: true
    },
    customCopyDate: {
      type: String,
      required: true
    },
    subTasksCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'confirm', 'update-target', 'update-date'],
  methods: {
    updateTarget(event) {
      this.$emit('update-target', event.target.value)
    },
    
    updateDate(event) {
      this.$emit('update-date', event.target.value)
    },
    
    getDateLabel(dayOffset) {
      const date = new Date()
      date.setDate(date.getDate() + dayOffset)
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }
}
</script>