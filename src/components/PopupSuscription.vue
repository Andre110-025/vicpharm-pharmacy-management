<script setup>
import { VueFinalModal } from 'vue-final-modal'
import { ref, computed } from 'vue'
import PaystackPop from '@paystack/inline-js'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'
import IconLoading from './IconLoading.vue'
// import IconLoading from './IconLoading.vue'

const { user } = useUserStore()
const selectedDuration = ref('1')
const loading = ref(false)
const emit = defineEmits(['confirm'])

const amountMap = {
  1: 3000,
  3: 9000,
  6: 18000,
  12: 36000,
  24: 72000,
  60: 180000,
}

const price = computed(() => amountMap[selectedDuration.value])

function calculateExpiry(months) {
  const now = new Date()
  const expiry = new Date(now)

  expiry.setMonth(expiry.getMonth() + Number(months))

  return expiry
}

function subscriptionPayment() {
  loading.value = true
  const paystack = new PaystackPop()

  const amountMap = {
    1: 3000,
    3: 9000,
    6: 18000,
    12: 36000,
    24: 72000,
    60: 180000,
  }
  const selectedAmount = amountMap[selectedDuration.value]

  const durationTime = Number(selectedDuration.value)

  const expiryDate = calculateExpiry(durationTime)

  paystack.newTransaction({
    key: 'pk_test_68bed5e7669b41901990224f081528282093f60f',
    email: user.userInfo.email,
    amount: selectedAmount * 100,
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
    metadata: {
      paymentFor: 'Subscription Renewal',
      amount: selectedAmount,
      user_id: user.userInfo.id,
      duration: expiryDate.toISOString(),
    },
    onSuccess: (transaction) => {
      console.log(transaction)
      loading.value = true

      toast.success('Payment is Successful', {
        position: toast.POSITION.TOP_CENTER,
      })
      toast.success('Subscription renewed successfully', {
        position: toast.POSITION.TOP_CENTER,
      })

      setTimeout(() => {
        emit('confirm')
        window.location.reload()
      }, 15000)
    },
    onCancel: () => {
      loading.value = false
      toast.error('Payment is Cancelled', {
        position: toast.POSITION.TOP_CENTER,
      })
    },
  })
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[520px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="false"
    :escToClose="false"
  >
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Subscription Expired</h2>
      <p class="mb-4">Please renew to continue accessing the dashboard.</p>

      <select
        v-model="selectedDuration"
        class="mb-4 p-2 border rounded-xl w-full focus:outline-none focus:ring-1 focus:ring-mainColor focus:border-mainColor transition"
      >
        <option value="1">1 Month</option>
        <option value="3">3 Months</option>
        <option value="6">6 Months</option>
        <option value="12">1 year</option>
        <option value="24">2 year</option>
        <option value="60">5 year</option>
      </select>

      <p class="mb-4 font-bold">
        Subscription Price: <span class="text-mainColor">₦{{ price }}</span>
      </p>

      <button
        @click="subscriptionPayment"
        class="bg-mainColor text-white px-4 py-2 rounded w-full"
        :disabled="loading"
      >
        <IconLoading v-if="loading" />
        <span v-if="!loading">Renew Subscription</span>
      </button>
    </div>
  </VueFinalModal>
</template>
