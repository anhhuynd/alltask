<template>
  <div class="task-card">
    <div class="task-item" :class="{ overdue: isOverdue(task) }">
      <div 
        class="task-checkbox"
        :class="{ completed: task.completed }"
        @click="$emit('toggle-task', task.id)"
      ></div>
      
      <div class="task-content" @click="$emit('edit-task', task)">
        <div 
          class="task-title"
          :class="{ completed: task.completed }"
        >
          {{ task.title }}
          <button 
            v-if="subTasks.length > 0"
            @click.stop="toggleExpansion"
            class="expand-btn"
            :class="{ expanded: isExpanded }"
          >
            {{ isExpanded ? '▼' : '▶' }}
          </button>
        </div>
        <div class="task-description">{{ task.description }}</div>
        <div class="task-meta">
          <span class="task-time">{{ task.time }}</span>
          <span v-if="task.priority" :class="['task-priority', task.priority]">
            {{ getPriorityText(task.priority) }}
          </span>
          <span v-if="subTasks.length > 0" class="subtask-count">
            {{ completedSubTasksCount }}/{{ subTasks.length }} subtasks
          </span>
        </div>
      </div>
      
      <div class="task-controls">
        <button class="control-btn" @click="$emit('add-subtask', task.id)" title="Thêm subtask">
          ➕
        </button>
        <button class="control-btn" @click="$emit('copy-task', task)" title="Copy task">
          📋
        </button>
        <button class="control-btn" @click="$emit('edit-task', task)" title="Sửa">
          ✏️
        </button>
        <button class="control-btn delete" @click="$emit('delete-task', task.id)" title="Xóa">
          🗑️
        </button>
      </div>
    </div>

    <!-- Sub Tasks -->
    <div v-if="isExpanded && subTasks.length > 0" class="sub-tasks">
      <div 
        v-for="subTask in subTasks" 
        :key="subTask.id"
        class="task-item sub-task"
      >
        <div 
          class="task-checkbox"
          :class="{ completed: subTask.completed }"
          @click="$emit('toggle-task', subTask.id)"
        ></div>
        
        <div class="task-content">
          <div 
            class="task-title"
            :class="{ completed: subTask.completed }"
          >
            {{ subTask.title }}
          </div>
          <div class="task-description">{{ subTask.description }}</div>
          <div class="task-meta">
            <span class="task-time">{{ subTask.time }}</span>
          </div>
        </div>
        
        <div class="task-controls">
          <button class="control-btn delete" @click="$emit('delete-task', subTask.id)" title="Xóa">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskItem',
  props: {
    task: {
      type: Object,
      required: true
    },
    subTasks: {
      type: Array,
      default: () => []
    },
    expandedTasks: {
      type: Array,
      default: () => []
    }
  },
  emits: ['toggle-task', 'edit-task', 'add-subtask', 'copy-task', 'delete-task', 'toggle-expansion'],
  computed: {
    isExpanded() {
      return this.expandedTasks.includes(this.task.id)
    },
    
    completedSubTasksCount() {
      return this.subTasks.filter(task => task.completed).length
    }
  },
  methods: {
    toggleExpansion() {
      this.$emit('toggle-expansion', this.task.id)
    },
    
    isOverdue(task) {
      if (!task.time || task.completed) return false
      
      const now = new Date()
      const taskDate = new Date(task.date)
      const [time, period] = task.time.split(' ')
      const [hours, minutes] = time.split(':').map(Number)
      
      let taskHours = hours
      if (period === 'PM' && hours !== 12) taskHours += 12
      if (period === 'AM' && hours === 12) taskHours = 0
      
      taskDate.setHours(taskHours, minutes || 0, 0, 0)
      
      return now > taskDate
    },
    
    getPriorityText(priority) {
      const priorities = {
        high: 'Cao',
        medium: 'Trung bình',
        low: 'Thấp'
      }
      return priorities[priority] || ''
    }
  }
}
</script>

<style scoped>
.task-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
}

.task-item.overdue {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.task-item.sub-task {
  background: #f9fafb;
  border-left: 3px solid #d1d5db;
  margin-left: 20px;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.task-checkbox.completed {
  background: #10b981;
  border-color: #10b981;
}

.task-checkbox.completed::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.expand-btn {
  background: none;
  border: none;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: #f3f4f6;
}

.expand-btn.expanded {
  transform: rotate(90deg);
}

.task-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: #9ca3af;
}

.task-time {
  font-weight: 500;
}

.task-priority {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.75rem;
}

.task-priority.high {
  background: #fee2e2;
  color: #dc2626;
}

.task-priority.medium {
  background: #fef3c7;
  color: #d97706;
}

.task-priority.low {
  background: #dcfce7;
  color: #16a34a;
}

.subtask-count {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.task-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.control-btn:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.control-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

.sub-tasks {
  border-top: 1px solid #e5e7eb;
}
</style>