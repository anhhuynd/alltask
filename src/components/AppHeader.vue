<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <div class="app-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1 class="app-title">HUY Media Suite</h1>
            <p class="app-subtitle">Bộ công cụ đa năng cho content creator</p>
          </div>
        </div>
      </div>
      
      <nav class="tab-navigation">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="$emit('tab-change', tab.id)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
          <div v-if="activeTab === tab.id" class="tab-indicator"></div>
        </button>
      </nav>

      <div class="header-right">
        <button 
          @click="$emit('theme-toggle')"
          class="theme-toggle"
          :title="theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'"
        >
          <svg v-if="theme === 'light'" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <div class="time-display">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    activeTab: {
      type: String,
      default: 'tts'
    },
    theme: {
      type: String,
      default: 'light'
    }
  },
  emits: ['tab-change', 'theme-toggle'],
  data() {
    return {
      currentTime: '',
      currentDate: '',
      tabs: [
        {
          id: 'tts',
          icon: '🎵',
          label: 'TTS Subtitle'
        },
        {
          id: 'prompt',
          icon: '🎨',
          label: 'Prompt Image'
        },
        {
          id: 'subtitle',
          icon: '📝',
          label: 'Sub Translator'
        },
        {
          id: 'task',
          icon: '📅',
          label: 'Task Manager'
        }
      ]
    }
  },
  mounted() {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      this.currentDate = now.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.app-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(20px);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.app-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.app-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.tab-navigation {
  display: flex;
  gap: var(--space-1);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-1);
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.tab-btn.active {
  background: var(--bg-primary);
  color: var(--primary-600);
  box-shadow: var(--shadow-sm);
}

.tab-icon {
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.tab-label {
  font-size: var(--text-sm);
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-full);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.theme-toggle {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-medium);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
}

.time-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.current-time {
  font-size: var(--text-base);
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--text-primary);
}

.current-date {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-4);
  }
  
  .tab-label {
    display: none;
  }
  
  .tab-btn {
    padding: var(--space-3);
  }
  
  .app-subtitle {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3);
  }
  
  .tab-navigation {
    width: 100%;
    justify-content: center;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .app-title {
    font-size: var(--text-lg);
  }
  
  .time-display {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .tab-navigation {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-1);
  }
  
  .tab-btn {
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-2);
  }
  
  .tab-label {
    display: block;
    font-size: var(--text-xs);
  }
  
  .tab-icon {
    font-size: var(--text-base);
  }
}

/* Dark Mode Adjustments */
[data-theme="dark"] .app-header {
  background: rgba(17, 24, 39, 0.95);
}

[data-theme="dark"] .tab-btn.active {
  background: var(--gray-800);
  color: var(--primary-400);
}

[data-theme="dark"] .theme-toggle:hover {
  background: var(--gray-700);
}

/* Animation for tab switching */
@keyframes tabSwitch {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.tab-btn.active {
  animation: tabSwitch 0.2s ease-out;
}
</style>