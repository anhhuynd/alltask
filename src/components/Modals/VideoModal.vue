<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Thêm Video từ YouTube</h3>
      <p class="modal-note">Hỗ trợ cả video dài và YouTube Shorts</p>
      <input 
        :value="newVideo.link" 
        @input="updateVideo('link', $event.target.value)"
        placeholder="Link YouTube (youtube.com/watch?v=... hoặc youtube.com/shorts/... hoặc youtu.be/...)" 
        class="modal-input"
      >
      <select 
        :value="newVideo.channelId" 
        @change="updateVideo('channelId', $event.target.value)"
        class="modal-input"
      >
        <option value="">Chọn kênh</option>
        <option v-for="channel in channels" :key="channel.id" :value="channel.id">
          {{ channel.name }}
        </option>
      </select>
      <div class="modal-actions">
        <button @click="$emit('close')" class="modal-btn cancel">Hủy</button>
        <button @click="$emit('save')" class="modal-btn primary">Thêm Video</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoModal',
  props: {
    newVideo: {
      type: Object,
      required: true
    },
    channels: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'save', 'update-video'],
  methods: {
    updateVideo(field, value) {
      this.$emit('update-video', { [field]: value })
    }
  }
}
</script>