<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import IconDownload from '@/components/IconDownload.vue'
import IconSpinner from '@/components/IconSpinner.vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const { user } = useUserStore()

const props = defineProps({
  orderCode: {
    type: String,
    required: true,
  },
})

// const anchorLink = useTemplateRef('downloadLink')
const downloadLink = ref(null)
const isLoading = ref(false)

const getPdf = async () => {
  try {
    isLoading.value = true
    downloadLink.value = null
    const { data } = await axios.get(`downloadinvoice/${props.orderCode}/${user.userType}/print`, {
      responseType: 'blob',
    })

    // Create a blob from the Excel data
    const blob = new Blob([data], {
      type: 'application/pdf',
    })

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)

    // Set the download link
    downloadLink.value = url
  } catch (error) {
    console.error('Error getting file:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="">
    <button
      class="flex items-center justify-center px-1 gap-1 w-full border border-neutral-300 bg-neutral-200"
      @click="getPdf()"
      v-if="!downloadLink"
      :disabled="isLoading"
    >
      <IconSpinner v-if="isLoading" class="w-4 h-4" />
      <span>Prepare Receipt</span>
    </button>
    <a
      v-else
      :href="downloadLink"
      :download="`${props.orderCode}.pdf`"
      class="flex items-center justify-center px-1 rounded-md py-2.5 text-sm gap-1 w-full border border-neutral-300 bg-neutral-200"
    >
      <IconDownload class="w-4 h-4" />
      <span>Download Receipt</span>
    </a>
  </div>
</template>
