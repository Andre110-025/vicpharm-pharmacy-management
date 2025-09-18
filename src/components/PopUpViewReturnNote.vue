<script setup>
import { VueFinalModal } from 'vue-final-modal'
import IconNote from './IconNote.vue'
import IconCancel from './IconCancel.vue'

const props = defineProps({
  note: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['confirm'])
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[450px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-row justify-between items-center p-5">
      <div class="flex flex-row items-center gap-3">
        <div
          class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
        >
          <IconNote />
        </div>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">Return Note</h2>
          <p class="text-gray-600">This is the note taken for this return</p>
        </div>
      </div>
      <button
        @click="emit('confirm')"
        type="button"
        class="border border-black rounded p-1 flex items-center justify-center"
      >
        <IconCancel color="black" class="w-5 h-5" />
      </button>
    </div>
    <div class="flex flex-col px-5 py-1.5 mb-5">
      <div class="mt-1.5 w-full h-full bg-gray-100 rounded-sm flex items-center justify-center">
        <p class="text-gray-600 text-sm">{{ props.note }}</p>
      </div>
    </div>
  </VueFinalModal>
</template>
