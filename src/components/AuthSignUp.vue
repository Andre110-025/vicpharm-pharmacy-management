<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers, minLength } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useHelpers } from '@/helper'

const touched = ref(false)
const loading = ref(false)
const { containsUppercase, containsLowercase, containsNumber, containsSpecial } = useHelpers()
const router = useRouter()
const authData = reactive({
  fullname: '',
  email: '',
  phone: '',
  password: '',
})

const rules = computed(() => ({
  fullname: {
    required: helpers.withMessage('Name is required', required),
    minLength: helpers.withMessage('Name must be at least 8 characters', minLength(8)),
  },
  email: {
    email,
    required,
  },
  phone: {
    required,
  },
  password: {
    required,
    minLength: helpers.withMessage('Password must be at least 6 characters long', minLength(6)),
    containsUpperCase: helpers.withMessage('Password must include an uppercase', containsUppercase),
    containsLowerCase: helpers.withMessage('Password must include lowercase', containsLowercase),
    containsNumber: helpers.withMessage('Password must include numbers', containsNumber),
    containsSpecial: helpers.withMessage(
      'Password must include any of (#?!@$()`~%^&*-+=)',
      containsSpecial,
    ),
  },
}))

const v$ = useVuelidate(rules, authData)

const handleSignUp = async () => {
  const isFormValid = await v$.value.$validate()
  if (!isFormValid) return

  try {
    loading.value = true
    const response = await axios.post('/register', authData)
    console.log(response)

    data.value = response.data

    if (response.status === 201) {
      toast.success('Registration successful!', {
        position: toast.POSITION.TOP_CENTER,
      })
      router.push({ name: 'overview' })
    } else {
      if (response.data.errors) {
        toast.warning(response.data.errors, {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.error('An error occurred', {
          position: toast.POSITION.TOP_CENTER,
        })
      }
    }
  } catch (error) {
    toast.error('An error occurred', {
      position: toast.POSITION.TOP_CENTER,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="max-w-lg w-full bg-white p-10 rounded-lg" @submit.prevent="handleSignUp">
    <h2 class="mb-8">Sign Up</h2>

    <div class="w-full">
      <DynamicInput
        v-model="authData.fullname"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        @input="v$.fullname.$touch()"
        @blur="v$.fullname.$touch()"
      />
      <p v-if="v$.fullname.$error" class="text-xs text-red-500 mt-1">
        {{ v$.fullname.$errors[0].$message }}
      </p>

      <DynamicInput
        v-model="authData.email"
        label="Email Address"
        type="email"
        placeholder="Enter your email"
      />
      <DynamicInput
        v-model="authData.phone"
        label="Phone Number"
        type="text"
        placeholder="Enter your phone number"
      />

      <DynamicInput
        v-model="authData.password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        @input="v$.password.$touch()"
        @blur="v$.password.$touch()"
      />

      <ul
        v-if="v$.password.$dirty && v$.password.$error"
        class="mt-2 text-xs text-red-500 space-y-1"
      >
        <li v-for="(item, i) in v$.password.$errors" :key="i">
          {{ item.$message }}
        </li>
      </ul>

      <button
        :disabled="loading || v$.$invalid"
        class="w-full mainBtn transition duration-300"
        type="submit"
      >
        Sign Up
      </button>
    </div>
  </form>
</template>
