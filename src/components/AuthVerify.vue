<script setup>
import { ref, onMounted, computed } from 'vue'
import PinCode from './PinCode.vue'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const token = ref(null)
const email = ref(userStore.resetData.email)

const countdown = ref(30)
const showResend = ref(false)
let interval = null

const startCountdown = () => {
  showResend.value = false
  countdown.value = 30
  interval = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(interval)
      showResend.value = true
    }
  }, 1000)
}

const resendOtp = () => {
  alert('✅ OTP Resent!')
  startCountdown()
}

// const handleInput = (index, event) => {
//   if (event.target.value && index < otp.value.length - 1) {
//     otpInputs.value[index + 1].focus()
//   }
// }

// const handleBackspace = (index, event) => {
//   if (!otp.value[index] && index > 0) {
//     otpInputs.value[index - 1].focus()
//   }
// }

const verifyOtp = async () => {
  if (token.value.length !== 6) return

  try {
    loading.value = true
    const response = await axios.post('checkpasswordtoken', {
      userid: userStore.resetData.userid,
      token: token.value,
    })

    console.log(response)

    if (response.status === 202) {
      toast.success('Token Correct', {
        position: toast.POSITION.TOP_CENTER,
      })

      router.push({ name: 'ChangePassword' })
      loading.value = false
    } else {
      if (response.data.errors) {
        toast.warning(response.data.errors, {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.error('An Error was encountered', {
          position: toast.POSITION.TOP_CENTER,
        })
      }

      loading.value = false
    }
  } catch (error) {
    toast.error('An Error was encountered', {
      position: toast.POSITION.TOP_CENTER,
    })
    loading.value = false
  }
}

const isOtpComplete = computed(() => {
  return token.value && token.value.length === 6
})

// onMounted(() => {
//   if (otpInputs.value[0]) otpInputs.value[0].focus()
//   startCountdown()
// })
</script>

<template>
  <form @submit.prevent="verifyOtp" class="max-w-md w-full bg-white p-10 rounded-lg">
    <h2 class="mb-8">Email Verification</h2>

    <div class="w-full space-y-5">
      <p>
        Enter the OTP sent to <strong>{{ email }}</strong>
      </p>

      <PinCode v-model="token" :digits="6" />

      <p class="text-sm text-gray-600 text-center">
        Note: Check your spam or promotions folder if you don't see the OTP in your inbox.
      </p>

      <!-- <div class="text-center">
        <p v-if="showResend" class="text-gray-500">Didn't receive the code?</p>
        <button v-if="showResend" @click="resendOtp" class="text-mainColor hover:underline">
          Resend OTP
        </button>
        <p v-else class="text-gray-400">Resend in {{ countdown }}s</p>
      </div> -->

      <button
        :disabled="!isOtpComplete || loading"
        class="w-full mainBtn transition duration-300"
        type="submit"
      >
        Verify
      </button>
    </div>
  </form>
</template>
