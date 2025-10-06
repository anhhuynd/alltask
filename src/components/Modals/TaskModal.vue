<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>{{ editingTask ? 'Sửa Công Việc' : (taskForm.parentId ? 'Thêm Subtask' : 'Thêm Công Việc Mới') }}</h3>
      <input 
        v-model="localTaskForm.title" 
        placeholder="Tên công việc"
        class="modal-input"
        @input="updateForm"
      >
      <textarea 
        v-model="localTaskForm.description" 
        placeholder="Mô tả"
        class="modal-input"
        @input="updateForm"
      ></textarea>
      <input 
        v-model="localTaskForm.time" 
        placeholder="Thời gian (VD: 9:00 AM)"
        class="modal-input"
        @input="updateForm"
      >
      <select v-model="localTaskForm.priority" class="modal-input" v-if="!taskForm.parentId" @change="updateForm">
        <option value="">Chọn độ ưu tiên</option>
        <option value="high">Cao</option>
        <option value="medium">Trung bình</option>
        <option value="low">Thấp</option>
      </select>
      <div class="modal-actions">
        <button @click="$emit('close')" class="modal-btn cancel">Hủy</button>
        <button @click="$emit('save')" class="modal-btn primary">
          {{ editingTask ? 'Cập nhật' : 'Thêm' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskModal',
  props: {
    editingTask: {
      type: Object,
      default: null
    },
    taskForm: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'save', 'update-form'],
  data() {
    return {
      localTaskForm: { ...this.taskForm }
    }
  },
  watch: {
    taskForm: {
      handler(newVal) {
        this.localTaskForm = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    updateForm() {
      this.$emit('update-form', this.localTaskForm)
    }
  }
}
</script>