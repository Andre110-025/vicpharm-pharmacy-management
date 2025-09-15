<script setup>
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";

const isModalOpen = ref(false);
</script>

<template>
  <div class="">
    <!-- Button to Open Modal -->
    <button 
      @click="isModalOpen = true" 
      class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
    >
      Open Modal
    </button>

    <!-- Modal Component -->
    <VueFinalModal
      v-model="isModalOpen"
      class="flex h-full w-full items-center justify-center"
      content-class="relative bg-white border py-10 px-5 w-full sm:min-w-[400px] min-h-[300px] max-w-[340px] rounded-lg shadow-lg"
      overlay-class="bg-black/50 backdrop-blur-sm"
      :overlayTransition="'vfm-fade'"
      :contentTransition="'vfm-fade'"
      :clickToClose="true"
    >
      <div class="text-center">
        <h2 class="text-lg font-semibold">Hello, Vue Final Modal!</h2>
        <p class="text-gray-600 mt-2">This is a modal example.</p>
        
        <!-- Button to Close Modal -->
        <button 
          @click="isModalOpen = false" 
          class="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </VueFinalModal>
  </div>
</template>
