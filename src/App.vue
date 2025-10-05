<template>
  <div id="app">
    <!-- Navigation Header -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="brand-icon">🎯</div>
          <h1 class="brand-title">HUY Media Suite</h1>
        </div>
        
        <div class="nav-menu">
          <button 
            v-for="item in navItems"
            :key="item.id"
            @click="currentComponent = item.component"
            :class="['nav-item', { active: currentComponent === item.component }]"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </button>
        </div>
        
        <div class="nav-actions">
          <button @click="toggleTheme" class="theme-btn" :title="isDark ? 'Light Mode' : 'Dark Mode'">
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <div class="user-info">
            <span class="user-name">Admin</span>
            <div class="user-avatar">👤</div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="app-main" :class="{ 'dark-theme': isDark }">
      <div class="content-wrapper">
        <!-- Component Display -->
        <component :is="currentComponent" @navigate="navigate"/>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-left">
          <span class="footer-text">© 2024 HUY Media Suite - All rights reserved</span>
        </div>
        <div class="footer-right">
          <span class="footer-version">v1.0.0</span>
          <span class="footer-status" :class="{ online: isOnline }">
            {{ isOnline ? '🟢 Online' : '🔴 Offline' }}
          </span>
        </div>
      </div>
    </footer>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner-large"></div>
      <p class="loading-text">Loading...</p>
    </div>

    <!-- Notification Toast -->
    <div v-if="notification.show" class="notification-toast" :class="notification.type">
      <div class="notification-icon">
        {{ notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️' }}
      </div>
      <div class="notification-content">
        <div class="notification-title">{{ notification.title }}</div>
        <div class="notification-message">{{ notification.message }}</div>
      </div>
      <button @click="closeNotification" class="notification-close">×</button>
    </div>
  </div>
</template>

<script>
// Import all components
import Dashboard from './components/Dashboard.vue'
import Settings from './components/Settings.vue'
import TTSSubtitleNew from './components/TTSSubtitleNew.vue'
import SubtitleTranslatorClassic from './components/sub/SubtitleTranslator.vue'
import PromptImageClassic from './components/PromptImageClassic.vue'
import TaskManagerClassic from './components/TaskYouTubeManager.vue'
import VoiceClonerVue from './components/voice/voice-cloner.vue'

export default {
  name: 'App',
  components: {
    Dashboard,
    Settings,
    TTSSubtitleNew,
    SubtitleTranslatorClassic,
    PromptImageClassic,
    TaskManagerClassic,
    VoiceClonerVue
  },
  data() {
    return {
      currentComponent: 'Dashboard',
      isDark: false,
      isLoading: false,
      isOnline: navigator.onLine,
      notification: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      },
      navItems: [
        {
          id: 'dashboard',
          component: 'Dashboard',
          icon: '📊',
          label: 'Dashboard'
        },
        {
          id: 'tts',
          component: 'TTSSubtitleNew',
          icon: '🎵',
          label: 'TTS Subtitle'
        },
        {
          id: 'translator',
          component: 'SubtitleTranslatorClassic',
          icon: '🌐',
          label: 'Subtitle Translator'
        },
        {
          id: 'prompt',
          component: 'PromptImageClassic',
          icon: '🎨',
          label: 'Prompt Generator'
        },
        {
          id: 'tasks',
          component: 'TaskManagerClassic',
          icon: '📅',
          label: 'Task Manager'
        },
        //  {
        //   id: 'voice',
        //   component: 'VoiceClonerVue',
        //   icon: '📅',
        //   label: 'Voice Cloner'
        // },
        {
          id: 'settings',
          component: 'Settings',
          icon: '⚙️',
          label: 'Settings'
        }
      ]
    }
  },
  methods: {
    navigate(data) {
      this.currentComponent = data
      localStorage.setItem('currentComponent', data)
    },
    toggleTheme() {
      this.isDark = !this.isDark
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light')
      document.body.classList.toggle('dark-theme', this.isDark)
    },
    
    showNotification(type, title, message) {
      this.notification = {
        show: true,
        type,
        title,
        message
      }
      
      // Auto close after 5 seconds
      setTimeout(() => {
        this.closeNotification()
      }, 5000)
    },
    
    closeNotification() {
      this.notification.show = false
    },
    
    handleOnlineStatus() {
      this.isOnline = navigator.onLine
      if (this.isOnline) {
        this.showNotification('success', 'Connection Restored', 'You are back online')
      } else {
        this.showNotification('error', 'Connection Lost', 'You are currently offline')
      }
    },
    
    loadTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDark = savedTheme === 'dark'
        document.body.classList.toggle('dark-theme', this.isDark)
      }
    },
    
    loadLastComponent() {
      const savedComponent = localStorage.getItem('currentComponent')
      if (savedComponent && this.navItems.some(item => item.component === savedComponent)) {
        this.currentComponent = savedComponent
      }
    }
  },
  
  watch: {
    currentComponent(newComponent) {
      localStorage.setItem('currentComponent', newComponent)
    }
  },
  
  mounted() {
    // Load saved preferences
    this.loadTheme()
    this.loadLastComponent()
    
    // Setup online/offline listeners
    window.addEventListener('online', this.handleOnlineStatus)
    window.addEventListener('offline', this.handleOnlineStatus)
    
    // Welcome notification
    setTimeout(() => {
      this.showNotification('success', 'Welcome!', 'HUY Media Suite is ready to use')
    }, 1000)
  },
  
  beforeUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus)
    window.removeEventListener('offline', this.handleOnlineStatus)
  }
}
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.app-nav {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #666;
}

.nav-item:hover {
  background: #f8f9fa;
  color: #333;
}

.nav-item.active {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.nav-icon {
  font-size: 16px;
}

.nav-label {
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: #f8f9fa;
  border-color: #d1d5db;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #e1e5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
}

/* Main Content */
.app-main {
  flex: 1;
  background: #f5f5f5;
  min-height: calc(100vh - 64px - 60px);
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* Footer */
.app-footer {
  background: white;
  border-top: 1px solid #e1e5e9;
  padding: 16px 0;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-text {
  font-size: 12px;
  color: #666;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer-version {
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.footer-status {
  font-size: 12px;
  color: #dc3545;
}

.footer-status.online {
  color: #28a745;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  color: #666;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 400px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-toast.success {
  border-left: 4px solid #28a745;
}

.notification-toast.error {
  border-left: 4px solid #dc3545;
}

.notification-toast.info {
  border-left: 4px solid #007bff;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.notification-close:hover {
  background: #f8f9fa;
  color: #666;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Dark Theme */
.dark-theme {
  background-color: #1a1a1a;
  color: #e1e1e1;
}

.dark-theme .app-nav {
  background: #2d2d2d;
  border-bottom-color: #404040;
}

.dark-theme .brand-title {
  color: #e1e1e1;
}

.dark-theme .nav-item {
  color: #b1b1b1;
}

.dark-theme .nav-item:hover {
  background: #404040;
  color: #e1e1e1;
}

.dark-theme .nav-item.active {
  background: #1e3a8a;
  color: #93c5fd;
}

.dark-theme .theme-btn {
  background: #404040;
  border-color: #555;
  color: #e1e1e1;
}

.dark-theme .theme-btn:hover {
  background: #4a4a4a;
}

.dark-theme .user-name {
  color: #e1e1e1;
}

.dark-theme .user-avatar {
  background: #404040;
  color: #b1b1b1;
}

.dark-theme .app-main {
  background: #1a1a1a;
}

.dark-theme .app-footer {
  background: #2d2d2d;
  border-top-color: #404040;
}

.dark-theme .footer-text,
.dark-theme .footer-version {
  color: #b1b1b1;
}

.dark-theme .notification-toast {
  background: #2d2d2d;
  color: #e1e1e1;
}

.dark-theme .notification-title {
  color: #e1e1e1;
}

.dark-theme .notification-message {
  color: #b1b1b1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-label {
    display: none;
  }
  
  .nav-item {
    padding: 8px 12px;
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 768px) {
  .nav-container {
    height: 56px;
  }
  
  .brand-title {
    display: none;
  }
  
  .nav-menu {
    flex: 1;
    justify-content: center;
    overflow-x: auto;
    padding: 0 8px;
  }
  
  .nav-item {
    padding: 6px 8px;
    min-width: 44px;
  }
  
  .nav-actions {
    gap: 8px;
  }
  
  .theme-btn {
    width: 36px;
    height: 36px;
  }
  
  .user-avatar {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
  
  .notification-toast {
    right: 16px;
    left: 16px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 12px;
  }
  
  .footer-container {
    padding: 0 12px;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .footer-right {
    gap: 12px;
  }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.dark-theme ::-webkit-scrollbar-track {
  background: #404040;
}

.dark-theme ::-webkit-scrollbar-thumb {
  background: #666;
}

.dark-theme ::-webkit-scrollbar-thumb:hover {
  background: #777;
}
</style>