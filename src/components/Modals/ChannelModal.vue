<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <h3>Thêm Kênh YouTube Mới</h3>
      <input 
        :value="newChannel.name" 
        @input="updateChannel('name', $event.target.value)"
        placeholder="Tên kênh" 
        class="modal-input"
      >
      <input 
        :value="newChannel.channelId" 
        @input="updateChannel('channelId', $event.target.value)"
        placeholder="Channel ID hoặc Handle (@username)" 
        class="modal-input"
      >
      <input 
        :value="newChannel.subscribers" 
        @input="updateChannel('subscribers', $event.target.value)"
        placeholder="Số subscribers (VD: 10.5K)" 
        class="modal-input"
      >
      <div class="modal-actions">
        <button @click="$emit('close')" class="modal-btn cancel">Hủy</button>
        <button @click="$emit('save')" class="modal-btn primary">Thêm Kênh</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChannelModal',
  props: {
    newChannel: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'save', 'update-channel'],
  methods: {
    updateChannel(field, value) {
      this.$emit('update-channel', { [field]: value })
    }
  }
}
</script>