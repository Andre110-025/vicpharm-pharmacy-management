<script setup>
import { ref } from "vue";
import { VueFinalModal } from "vue-final-modal";

const isMakeSaleModalOpen = ref(false);
const isCompleteSaleModalOpen = ref(false);

const completeSaleModalPopup = () => {
    isMakeSaleModalOpen.value = false;
    isCompleteSaleModalOpen.value = true;
}
</script>

<template>
    <VueFinalModal
        v-if="isCompleteSaleModalOpen"
        v-model="isCompleteSaleModalOpen"
        class="flex h-full w-full items-center justify-center"
        content-class="relative bg-white border w-full h-[600px] max-w-[940px] rounded-2xl shadow-lg"
        overlay-class="bg-black/50 backdrop-blur-sm"
        :overlayTransition="'vfm-fade'"
        :contentTransition="'vfm-fade'"
        :clickToClose="true"
    >
    <h1>Hiiii</h1>
    </VueFinalModal>
</template>