// LocalStorage Management with Unique Keys
// Prevents key conflicts between different components

const STORAGE_KEYS = {
  // App-level settings
  APP_THEME: 'huy_media_suite_theme',
  APP_ACTIVE_TAB: 'huy_media_suite_active_tab',
  
  // TTS Subtitle component
  TTS_API_KEY: 'huy_tts_elevenlabs_api_key',
  TTS_VOICE_ID: 'huy_tts_selected_voice_id',
  TTS_SPEED: 'huy_tts_speed',
  TTS_MODEL: 'huy_tts_model',
  TTS_FOLDER_PATH: 'huy_tts_folder_path',
  TTS_SETTINGS: 'huy_tts_settings',
  
  // Prompt Image component
  PROMPT_API_KEY: 'huy_prompt_chatgpt_api_key',
  PROMPT_SETTINGS: 'huy_prompt_settings',
  PROMPT_HISTORY: 'huy_prompt_history',
  PROMPT_FOLDER_PATH: 'huy_prompt_folder_path',
  
  // Subtitle Translator component
  TRANSLATOR_API_KEY: 'huy_translator_chatgpt_api_key',
  TRANSLATOR_SOURCE_LANG: 'huy_translator_source_language',
  TRANSLATOR_TARGET_LANG: 'huy_translator_target_language',
  TRANSLATOR_ITEMS_PER_PAGE: 'huy_translator_items_per_page',
  TRANSLATOR_FOLDER_PATH: 'huy_translator_folder_path',
  TRANSLATOR_SETTINGS: 'huy_translator_settings',
  
  // Task & YouTube Manager component
  TASK_MANAGER_TASKS: 'huy_task_manager_tasks',
  TASK_MANAGER_EXPANDED: 'huy_task_manager_expanded_tasks',
  YOUTUBE_API_KEY: 'huy_youtube_api_key',
  YOUTUBE_CHANNELS: 'huy_youtube_channels',
  YOUTUBE_VIDEOS: 'huy_youtube_videos',
  YOUTUBE_PENDING_VIDEOS: 'huy_youtube_pending_videos',
  YOUTUBE_SETTINGS: 'huy_youtube_settings',
}

class StorageManager {
  constructor() {
    this.keys = STORAGE_KEYS
  }

  // Generic methods
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
      return true
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return false
    }
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  }

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  // App-level methods
  setTheme(theme) {
    return this.set(this.keys.APP_THEME, theme)
  }

  getTheme(defaultTheme = 'light') {
    return this.get(this.keys.APP_THEME, defaultTheme)
  }

  setActiveTab(tab) {
    return this.set(this.keys.APP_ACTIVE_TAB, tab)
  }

  getActiveTab(defaultTab = 'tts') {
    return this.get(this.keys.APP_ACTIVE_TAB, defaultTab)
  }

  // TTS component methods
  setTTSApiKey(apiKey) {
    return this.set(this.keys.TTS_API_KEY, apiKey)
  }

  getTTSApiKey() {
    return this.get(this.keys.TTS_API_KEY, '')
  }
  

  setTTSSettings(settings) {
    return this.set(this.keys.TTS_SETTINGS, settings)
  }

  getTTSSettings() {
    return this.get(this.keys.TTS_SETTINGS, {
      voiceId: '',
      speed: 1.0,
      model: 'eleven_multilingual_v2',
      folderPath: null
    })
  }

  // Prompt Image component methods
  setPromptApiKey(apiKey) {
    return this.set(this.keys.PROMPT_API_KEY, apiKey)
  }

  getPromptApiKey() {
    return this.get(this.keys.PROMPT_API_KEY, '')
  }

  setPromptSettings(settings) {
    return this.set(this.keys.PROMPT_SETTINGS, settings)
  }

  getPromptSettings() {
    return this.get(this.keys.PROMPT_SETTINGS, {
      imageNumber: 1,
      folderPath: null
    })
  }

  setPromptHistory(history) {
    return this.set(this.keys.PROMPT_HISTORY, history)
  }

  getPromptHistory() {
    return this.get(this.keys.PROMPT_HISTORY, [])
  }

  // Subtitle Translator component methods
  setTranslatorApiKey(apiKey) {
    return this.set(this.keys.TRANSLATOR_API_KEY, apiKey)
  }

  getTranslatorApiKey() {
    return this.get(this.keys.TRANSLATOR_API_KEY, '')
  }

  setTranslatorSettings(settings) {
    return this.set(this.keys.TRANSLATOR_SETTINGS, settings)
  }

  getTranslatorSettings() {
    return this.get(this.keys.TRANSLATOR_SETTINGS, {
      sourceLanguage: 'chinese',
      targetLanguage: 'vietnamese',
      itemsPerPage: 25,
      folderPath: null
    })
  }

  // Task & YouTube Manager component methods
  setTasks(tasks) {
    return this.set(this.keys.TASK_MANAGER_TASKS, tasks)
  }

  getTasks() {
    return this.get(this.keys.TASK_MANAGER_TASKS, [])
  }

  setExpandedTasks(expandedTasks) {
    return this.set(this.keys.TASK_MANAGER_EXPANDED, expandedTasks)
  }

  getExpandedTasks() {
    return this.get(this.keys.TASK_MANAGER_EXPANDED, [])
  }

  setYouTubeApiKey(apiKey) {
    return this.set(this.keys.YOUTUBE_API_KEY, apiKey)
  }

  getYouTubeApiKey() {
    return this.get(this.keys.YOUTUBE_API_KEY, '')
  }

  setYouTubeChannels(channels) {
    return this.set(this.keys.YOUTUBE_CHANNELS, channels)
  }

  getYouTubeChannels() {
    return this.get(this.keys.YOUTUBE_CHANNELS, [])
  }

  setYouTubeVideos(videos) {
    return this.set(this.keys.YOUTUBE_VIDEOS, videos)
  }

  getYouTubeVideos() {
    return this.get(this.keys.YOUTUBE_VIDEOS, [])
  }

  setYouTubePendingVideos(pendingVideos) {
    return this.set(this.keys.YOUTUBE_PENDING_VIDEOS, pendingVideos)
  }

  getYouTubePendingVideos() {
    return this.get(this.keys.YOUTUBE_PENDING_VIDEOS, [])
  }

  setYouTubeSettings(settings) {
    return this.set(this.keys.YOUTUBE_SETTINGS, settings)
  }

  getYouTubeSettings() {
    return this.get(this.keys.YOUTUBE_SETTINGS, {
      activeTab: 'channels',
      searchQuery: '',
      filterChannel: '',
      sortBy: 'views',
      sortOrder: 'desc'
    })
  }

  // Utility methods
  exportAllData() {
    const allData = {}
    Object.values(this.keys).forEach(key => {
      const value = this.get(key)
      if (value !== null) {
        allData[key] = value
      }
    })
    return allData
  }

  importAllData(data) {
    let successCount = 0
    let errorCount = 0

    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(this.keys).includes(key)) {
        if (this.set(key, value)) {
          successCount++
        } else {
          errorCount++
        }
      }
    })

    return { successCount, errorCount }
  }

  // Clean up old keys (for migration)
  cleanupOldKeys() {
    const oldKeys = [
      'elevenlabs_api_key',
      'source_language',
      'target_language',
      'items_per_page',
      'youtube-api-key',
      'youtube-channels',
      'youtube-videos',
      'youtube-pending-videos',
      'tasks',
      'expanded-tasks',
      'activeTab',
      'theme'
    ]

    oldKeys.forEach(key => {
      if (localStorage.getItem(key) !== null) {
        console.log(`Removing old key: ${key}`)
        localStorage.removeItem(key)
      }
    })
  }

  // Get storage usage info
  getStorageInfo() {
    let totalSize = 0
    let itemCount = 0
    const items = {}

    Object.values(this.keys).forEach(key => {
      const value = localStorage.getItem(key)
      if (value !== null) {
        const size = new Blob([value]).size
        totalSize += size
        itemCount++
        items[key] = {
          size: size,
          sizeFormatted: this.formatBytes(size)
        }
      }
    })

    return {
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      itemCount,
      items
    }
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }
}

// Create and export singleton instance
const storage = new StorageManager()

export default storage
export { STORAGE_KEYS }