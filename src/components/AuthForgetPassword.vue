<script setup>
import { ref, reactive, computed } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const router = useRouter()

const loading = ref(false)
const authData = reactive({
  email: '',
})

const rules = computed(() => ({
  email: {
    email,
    required,
  },
}))

const v$ = useVuelidate(rules, authData)

const checkEmail = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    loading.value = true

    const response = await axios.post('checkemailandsendpasswordtoken', authData)

    console.log(response)
    // return
    if (response.status === 202) {
      toast.success("Token Sent, Kindly verify it's you", {
        position: toast.POSITION.TOP_CENTER,
      })
      userStore.resetData.userid = response.data.userId
      userStore.resetData.email = authData.email

      router.push({ name: 'authToken' })
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
    }
  } catch (error) {
    toast.error('An Error was encountered', {
      position: toast.POSITION.TOP_CENTER,
    })
  }

  loading.value = false
}
</script>

<template>
  <form @submit.prevent="checkEmail" class="max-w-lg w-full bg-white p-10 rounded-lg">
    <h2 class="mb-8">Forgot Password</h2>

    <div class="w-full">
      <DynamicInput
        v-model="authData.email"
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        :link="{
          label: 'Go back to login',
          route: 'login',
        }"
      />

      <button
        :disabled="loading || v$.$invalid"
        class="w-full mainBtn transition duration-300"
        type="submit"
      >
        Get Token
      </button>
    </div>
  </form>
</template>
