<script setup>
import { VueFinalModal } from 'vue-final-modal'

const props = defineProps({
  expenseId: Number,
})

const emit = defineEmits(['confirm', 'close'])
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[520px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
    @close="$emit('close')"
  >
    <div class="w-full h-fit flex flex-col items-center justify-center p-5 space-y-4">
      <h1 class="text-lg font-semibold text-gray-800">Are you sure?</h1>
      <p class="text-sm text-gray-500">This action cannot be undone.</p>
      <div class="flex space-x-2">
        <button
          @click="emit('confirm', expenseId)"
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
        >
          Confirm
        </button>
        <button
          @click="$emit('close')"
          class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>
