<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
const pdfBlob = ref(null)

const getPdf = async () => {
  try {
    isLoading.value = true
    downloadLink.value = null
    pdfBlob.value = null

    const { data } = await axios.get(`downloadinvoice/${props.orderCode}/${user.userType}/print`, {
      responseType: 'blob',
      timeout: 30000,
    })

    pdfBlob.value = new Blob([data], { type: 'application/pdf' })
    downloadLink.value = window.URL.createObjectURL(pdfBlob.value)
  } catch (err) {
    console.error('Error preparing PDF:', err)
    alert('Failed to prepare PDF.')
  } finally {
    isLoading.value = false
  }
}

// const getPdf = async () => {
//   try {
//     isLoading.value = true
//     downloadLink.value = null
//     const { data } = await axios.get(`downloadinvoice/${props.orderCode}/${user.userType}/print`, {
//       responseType: 'blob',
//     })

//     // Create a blob from the Excel data
//     const blob = new Blob([data], {
//       type: 'application/pdf',
//     })

//     // Create a URL for the blob
//     const url = window.URL.createObjectURL(blob)

//     // Set the download link
//     downloadLink.value = url
//   } catch (error) {
//     console.error('Error getting file:', error)
//   } finally {
//     isLoading.value = false
//   }
// }

const sharePdf = async () => {
  if (!pdfBlob.value) return

  const file = new File([pdfBlob.value], `Receipt_${props.orderCode}.pdf`, {
    type: 'application/pdf',
  })

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Receipt',
        text: `Receipt for ${props.orderCode}`,
        files: [file],
      })
    } else {
      // Fallback if browser doesn't support file sharing
      window.open(downloadLink.value, '_blank')
    }
  } catch (error) {
    if (error.name !== 'AbortError') console.error('Share failed:', error)
  }
}

const printPdf = () => {
  if (!downloadLink.value) return

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = downloadLink.value
  document.body.appendChild(iframe)

  iframe.onload = () => {
    const printWindow = iframe.contentWindow
    if (printWindow) {
      printWindow.focus()
      printWindow.print()

      // Wait longer before cleanup to avoid browser killing the print
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.URL.revokeObjectURL(downloadLink.value)
        downloadLink.value = null
      }, 5000) // 5 seconds instead of 2
    }
  }
}

const isMobile = ref(false)

const handleResize = () => {
  // More robust check: Screen width OR User Agent
  isMobile.value = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (downloadLink.value) window.URL.revokeObjectURL(downloadLink.value)
})
</script>

<template>
  <div class="w-full">
    <button
      v-if="!downloadLink"
      class="flex items-center justify-center px-1 py-2.5 rounded-md gap-1 w-full border border-neutral-300 bg-neutral-200 transition active:scale-95"
      @click="getPdf"
      :disabled="isLoading"
    >
      <IconSpinner v-if="isLoading" class="w-4 h-4 animate-spin" />
      <span>{{ isLoading ? 'Generating...' : 'Prepare Receipt' }}</span>
    </button>

    <button
      v-else-if="!isMobile"
      @click="printPdf"
      class="flex items-center justify-center px-1 rounded-md py-2.5 text-sm gap-1 w-full border border-neutral-300 bg-neutral-200 hover:bg-neutral-300"
    >
      <IconDownload class="w-4 h-4" />
      <span>Print Receipt</span>
    </button>

    <button
      v-else
      @click="sharePdf"
      class="flex items-center justify-center px-1 rounded-md py-2.5 text-sm gap-1 w-full border border-neutral-300 bg-neutral-200 active:bg-neutral-300"
      type="button"
    >
      <span>Share Receipt</span>
    </button>
  </div>
  <!-- <div class="">
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
  </div> -->
</template>
