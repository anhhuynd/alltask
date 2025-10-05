<template>
  <div class="project-manager">
    <div class="project-grid">
      <div class="form-group">
        <label class="form-label">Chọn dự án:</label>
        <select :value="currentProject" @change="$emit('update:currentProject', $event.target.value)" class="form-select">
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
          :value="chunkDurationMinutes" 
          @input="$emit('update:chunkDurationMinutes', parseInt($event.target.value))"
          type="number" 
          min="1" 
          max="10" 
          class="form-input"
        />
      </div>
    </div>

    <!-- Current Project Info -->
    <div v-if="currentProjectData" class="project-info">
      <div class="project-header">
        <h4 class="project-name">📂 {{ currentProjectData.name }}</h4>
        <div class="project-actions">
          <button 
            @click="$emit('showSettings')" 
            class="btn btn-outline btn-xs"
          >
            ⚙️ Cài đặt
          </button>
          <button 
            @click="$emit('deleteProject')" 
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
  </div>
</template>

<script>
export default {
  name: 'ProjectManager',
  props: {
    projects: {
      type: Array,
      default: () => []
    },
    currentProject: {
      type: String,
      default: ''
    },
    currentProjectData: {
      type: Object,
      default: null
    },
    chunkDurationMinutes: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      newProjectName: ''
    }
  },
  emits: ['update:currentProject', 'update:chunkDurationMinutes', 'createProject', 'showSettings', 'deleteProject'],
  methods: {
    createProject() {
      if (!this.newProjectName.trim()) return;
      
      this.$emit('createProject', this.newProjectName.trim());
      this.newProjectName = '';
    }
  }
}
</script>

<style scoped>
.project-grid {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
  margin-bottom: 20px;
  align-items: end;
}

.project-input-wrapper {
  display: flex;
  gap: 8px;
}

.project-input-wrapper .form-input {
  flex: 1;
}

.project-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #0ea5e9;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0;
}

.project-actions {
  display: flex;
  gap: 8px;
}

.project-stats {
  display: flex;
  gap: 16px;
}

.stat-item-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.stat-icon-mini {
  font-size: 14px;
}

.stat-text {
  font-size: 12px;
  font-weight: 500;
  color: #0c4a6e;
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

.btn-sm {
  padding: 8px 12px;
  font-size: 12px;
}

.btn-success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(72, 187, 120, 0.3);
}

.btn-outline {
  background: white;
  border: 2px solid #e2e8f0;
  color: #4a5568;
}

.btn-outline:hover:not(:disabled) {
  border-color: #cbd5e0;
  background: #f7fafc;
}

.btn-danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 101, 101, 0.3);
}

.btn-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .project-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .project-actions {
    flex-direction: column;
    width: 100%;
  }

  .project-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>