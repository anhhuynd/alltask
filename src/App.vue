<template>
  <div id="app" :data-theme="theme">
    <AppHeader 
      :activeTab="activeTab" 
      :theme="theme"
      @tab-change="handleTabChange" 
      @theme-toggle="toggleTheme"
    />
    <main class="main-container">
      <Transition name="tab-fade" mode="out-in">
        <component :is="currentComponent" :key="activeTab" />
      </Transition>
    </main>
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'
import TTSSubtitle from './components/TTSSubtitle.vue'
import PromptImage from './components/PromptImage.vue'
import SubtitleTranslator from './components/SubtitleTranslator.vue'
import TaskYouTubeManager from './components/TaskYouTubeManager.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    TTSSubtitle,
    PromptImage,
    SubtitleTranslator,
    TaskYouTubeManager
  },
  data() {
    return {
      activeTab: 'tts',
      theme: 'light'
    }
  },
  computed: {
    currentComponent() {
      const components = {
        tts: 'TTSSubtitle',
        prompt: 'PromptImage', 
        subtitle: 'SubtitleTranslator',
        task: 'TaskYouTubeManager'
      }
      return components[this.activeTab] || 'TTSSubtitle'
    }
  },
  methods: {
    handleTabChange(tab) {
      this.activeTab = tab
    },
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('huy-media-theme', this.theme)
    }
  },
  mounted() {
    // Load saved tab and theme
    const savedTab = localStorage.getItem('huy-media-active-tab')
    if (savedTab) {
      this.activeTab = savedTab
    }

    const savedTheme = localStorage.getItem('huy-media-theme')
    if (savedTheme) {
      this.theme = savedTheme
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme = 'dark'
    }
  },
  watch: {
    activeTab(newTab) {
      localStorage.setItem('huy-media-active-tab', newTab)
    }
  }
}
</script>

<style>
@import './styles/main.css';
</style>