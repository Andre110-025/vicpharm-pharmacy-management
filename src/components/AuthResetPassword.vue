<script setup>
import { ref, reactive, computed } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, sameAs } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const authData = reactive({
  password: '',
  cPassword: '',
  userid: userStore.resetData.userid,
})

const rules = computed(() => ({
  password: {
    required,
  },
  cPassword: {
    required,
    sameAs: sameAs(authData.password),
  },
}))

const v$ = useVuelidate(rules, authData)

const checkPassword = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    loading.value = true

    const response = await axios.patch('changepassword', authData)

    console.log(response)
    // return
    if (response.status === 202) {
      toast.success(response.data.message, {
        position: toast.POSITION.TOP_CENTER,
      })
      userStore.resetData.userid = null
      userStore.resetData.email = null

      router.push({ name: 'login' })
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
  }

  loading.value = false
}
</script>

<template>
  <form @submit.prevent="checkPassword" class="max-w-lg w-full bg-white p-10 rounded-lg">
    <h2 class="mb-8">Change Password</h2>

    <div class="w-full">
      <DynamicInput
        v-model="authData.password"
        label="Password"
        type="password"
        placeholder="Create a password"
      />

      <DynamicInput
        v-model="authData.cPassword"
        label="Confirm Password"
        type="password"
        placeholder="Enter your password"
      />

      <button
        :disabled="loading || v$.$invalid"
        class="w-full mainBtn transition duration-300"
        type="submit"
      >
        Proceed
      </button>
    </div>
  </form>
</template>
