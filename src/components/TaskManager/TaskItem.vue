<template>
  <div 
    :class="['task-item', { 
      completed: task.completed, 
      overdue: isOverdue(task),
      expanded: expandedTasks.includes(task.id)
    }]"
  >
    <div class="task-header" @click="toggleTaskExpansion(task.id)">
      <div class="task-left">
        <input 
          type="checkbox" 
          :checked="task.completed"
          @click.stop="toggleTask(task.id)"
          class="task-checkbox"
        >
        <div class="task-info">
          <h4 class="task-title">{{ task.title }}</h4>
          <div class="task-meta">
            <span v-if="task.time" class="task-time">⏰ {{ task.time }}</span>
            <span v-if="task.priority" :class="['task-priority', `priority-${task.priority}`]">
              {{ getPriorityText(task.priority) }}
            </span>
            <span v-if="subTasks.length > 0" class="subtask-count">
              📋 {{ getCompletedSubTasksCount(task.id) }}/{{ subTasks.length }} subtasks
            </span>
          </div>
          <p v-if="task.description" class="task-description">{{ task.description }}</p>
        </div>
      </div>
      <div class="task-actions">
        <button @click.stop="$emit('copy-task', task)" class="action-btn copy-btn" title="Copy task">
          📋
        </button>
        <button @click.stop="$emit('edit-task', task)" class="action-btn edit-btn" title="Sửa">
          ✏️
        </button>
        <button @click.stop="$emit('add-subtask', task.id)" class="action-btn add-btn" title="Thêm subtask">
          ➕
        </button>
        <button @click.stop="$emit('delete-task', task.id)" class="action-btn delete-btn" title="Xóa">
          🗑️
        </button>
        <button class="expand-btn" title="Mở rộng">
          {{ expandedTasks.includes(task.id) ? '▼' : '▶' }}
        </button>
      </div>
    </div>
    
    <!-- Subtasks -->
    <div v-if="expandedTasks.includes(task.id) && subTasks.length > 0" class="subtasks">
      <div 
        v-for="subtask in subTasks" 
        :key="subtask.id"
        :class="['subtask-item', { completed: subtask.completed }]"
      >
        <input 
          type="checkbox" 
          :checked="subtask.completed"
          @change="$emit('toggle-task', subtask.id)"
          class="subtask-checkbox"
        >
        <div class="subtask-info">
          <h5 class="subtask-title">{{ subtask.title }}</h5>
          <p v-if="subtask.description" class="subtask-description">{{ subtask.description }}</p>
        </div>
        <div class="subtask-actions">
          <button @click="$emit('edit-task', subtask)" class="action-btn edit-btn" title="Sửa">
            ✏️
          </button>
          <button @click="$emit('delete-task', subtask.id)" class="action-btn delete-btn" title="Xóa">
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
  methods: {
    toggleTaskExpansion(taskId) {
      this.$emit('toggle-expansion', taskId)
    },
    
    toggleTask(taskId) {
      this.$emit('toggle-task', taskId)
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
    },
    
    getCompletedSubTasksCount(parentId) {
      return this.subTasks.filter(task => task.completed).length
    }
  }
}
</script>

<style scoped>
.task-item {
  border: 2px solid #e5e5e5;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.2s ease;
  overflow: hidden;
}

.task-item:hover {
  border-color: #cccccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  border-color: #28a745;
  background: #f8fff9;
}

.task-item.overdue {
  border-color: #dc3545;
  background: #fff5f5;
}

.task-header {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
}

.task-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.task-checkbox {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-info {
  flex: 1;
}

.task-title {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #000000;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #666666;
}

.task-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.task-time {
  font-size: 0.9rem;
  color: #666666;
}

.task-priority {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.task-priority.priority-high {
  background: #dc3545;
  color: #ffffff;
}

.task-priority.priority-medium {
  background: #ffc107;
  color: #000000;
}

.task-priority.priority-low {
  background: #28a745;
  color: #ffffff;
}

.subtask-count {
  font-size: 0.9rem;
  color: #666666;
}

.task-description {
  margin: 0;
  color: #666666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.task-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  padding: 6px 8px;
  border: none;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #e5e5e5;
}

.copy-btn:hover {
  background: #e3f2fd;
}

.edit-btn:hover {
  background: #fff3e0;
}

.add-btn:hover {
  background: #e8f5e8;
}

.delete-btn:hover {
  background: #ffebee;
}

.expand-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666666;
  font-size: 0.8rem;
}

/* Subtasks */
.subtasks {
  border-top: 1px solid #e5e5e5;
  padding: 16px;
  background: #f8f9fa;
}

.subtask-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e5e5;
}

.subtask-item:last-child {
  border-bottom: none;
}

.subtask-checkbox {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.subtask-info {
  flex: 1;
}

.subtask-title {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #000000;
}

.subtask-item.completed .subtask-title {
  text-decoration: line-through;
  color: #666666;
}

.subtask-description {
  margin: 0;
  color: #666666;
  font-size: 0.9rem;
}

.subtask-actions {
  display: flex;
  gap: 4px;
}
</style>