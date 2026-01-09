<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, helpers, minLength, sameAs } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'

const touched = ref(false)
const loading = ref(false)
const { containsUppercase, containsLowercase, containsNumber, containsSpecial } = useHelpers()
const router = useRouter()


const authData = reactive({
  full_name: '',
  email: '',
  password: '',
  cPassword: '',
  phone_number: '',
  business_name: '',
  user_type: 'owner',
  owner_id: 0,
  country_code: '+234',
  storehive_officer: '',
  address: '',
})

onMounted(() => {
  document.addEventListener('click', () => {
    open.value = false
  })
})

const countries = [
  { name: 'United States', code: 'US', dial_code: '+1' },
  { name: 'United Kingdom', code: 'GB', dial_code: '+44' },
  { name: 'Nigeria', code: 'NG', dial_code: '+234' },
  { name: 'Canada', code: 'CA', dial_code: '+1' },
  { name: 'Germany', code: 'DE', dial_code: '+49' },
]

const open = ref(false)

const selectedCode = ref(authData.country_code)
const selectedFlag = ref(countries.find((c) => c.dial_code === authData.country_code)?.code || 'US')

function selectCountry(country, event) {
  event.stopPropagation()
  selectedCode.value = country.dial_code
  selectedFlag.value = country.code
  authData.country_code = country.dial_code
  open.value = false
}

const rules = computed(() => ({
  full_name: {
    required: helpers.withMessage('Name is required', required),
    minLength: helpers.withMessage('Name must be at least 8 characters', minLength(8)),
  },
  email: {
    email,
    required,
  },
  phone_number: {
    required,
  },
  business_name: {
    required,
  },
  country_code: {
    required,
  },
  storehive_officer: {
    required,
  },
  address: {
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
  cPassword: {
    required: helpers.withMessage('Password confirmation is required', required),
    sameAsPassword: helpers.withMessage(
      "Passwords don't match",
      sameAs(computed(() => authData.password)),
    ),
  },
}))

const v$ = useVuelidate(rules, authData)

const handleSignUp = async () => {
  const isFormValid = await v$.value.$validate()
  if (!isFormValid) return

  try {
    loading.value = true
    const { address, cPassword, ...payload } = authData
    const resgisterRes = await axios.post('/register', payload)
    console.log(resgisterRes)

    // data.value = response.data
    if (resgisterRes.status !== 201) {
      throw new Error('Registration failed')
    }

    const token = resgisterRes.data.success.token
    const branchName = `${authData.business_name.replace(/\s+/g, '')}012`

    // await axios.post('/createbranch', {
    //   branch_name: branchName,
    //   location: authData.address,
    //   token: token,
    // })
    await axios.post(
      '/createBranch',
      {
        branch_name: branchName,
        location: authData.address,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    userStore.regUser = {
      full_name: authData.full_name,
      email: authData.email,
      business_name: authData.business_name,
      phone_number: authData.phone_number,
      address: authData.address,
      user_type: authData.user_type,
      owner_id: authData.owner_id,
      storehive_officer: authData.storehive_officer,
    }

    toast.success('Registration successful!', {
      position: toast.POSITION.TOP_CENTER,
    })
    setTimeout(() => {
      window.location.reload()
    }, 4000)
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
  <div class="h-[500px] flex items-center justify-center p-4">
    <div
      class="w-[600px] max-w-lg h-full max-h-[90vh] overflow-y-auto bg-white p-10 rounded-lg shadow-lg"
    >
      <form @submit.prevent="handleSignUp" class="space-y-6">
        <h2 class="text-2xl font-semibold mb-4">Sign Up</h2>

        <DynamicInput
          v-model="authData.full_name"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          @input="v$.full_name.$touch()"
          @blur="v$.full_name.$touch()"
        />
        <p v-if="v$.full_name.$error" class="text-xs text-red-500 mt-1">
          {{ v$.full_name.$errors[0].$message }}
        </p>

        <DynamicInput
          v-model="authData.email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
        />

        <!-- Country dropdown at the top -->
        <div class="mb-4 w-full relative" @click.outside="open = false">
          <label class="block mb-1">Select Country</label>
          <button
            type="button"
            @click.stop="open = !open"
            class="flex items-center gap-2 p-2 border border-gray-300 rounded-md bg-white w-full justify-between"
          >
            <div class="flex items-center gap-2">
              <img
                :src="`https://flagcdn.com/w20/${selectedFlag.toLowerCase()}.png`"
                class="w-5 h-5"
                alt="Flag"
              />
              <span>{{ selectedCode }}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <!-- Dropdown -->
          <div
            v-if="open"
            @click.stop
            class="absolute left-0 mt-1 w-full max-h-60 overflow-y-auto bg-white rounded shadow-md z-50 border border-gray-200"
          >
            <button
              v-for="country in countries"
              :key="country.code"
              type="button"
              @click="selectCountry(country, $event)"
              class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 text-sm"
            >
              <img
                :src="`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`"
                class="w-5 h-5"
                :alt="`${country.name} Flag`"
              />
              <span>{{ country.dial_code }} - {{ country.name }}</span>
            </button>
          </div>
        </div>

        <!-- Phone number input separately -->
        <div class="mb-4 w-full">
          <label class="block mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="913 673 909"
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm"
            v-model="authData.phone_number"
          />
        </div>

        <DynamicInput
          v-model="authData.business_name"
          label="Business Name"
          type="text"
          placeholder="Enter your business name"
        />

        <DynamicInput
          v-model="authData.storehive_officer"
          label="SMB Officer"
          type="text"
          placeholder="Enter your SMB officer id"
        />
        <DynamicInput
          v-model="authData.address"
          label="Address"
          type="text"
          placeholder="Enter your address"
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
          <li v-for="(item, i) in v$.password.$errors" :key="i">{{ item.$message }}</li>
        </ul>

        <DynamicInput
          v-model="authData.cPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          @input="v$.cPassword.$touch()"
          @blur="v$.cPassword.$touch()"
        />
        <ul
          v-if="v$.cPassword.$dirty && v$.cPassword.$error"
          class="mt-2 text-xs text-red-500 space-y-1"
        >
          <li v-for="(item, i) in v$.cPassword.$errors" :key="i">{{ item.$message }}</li>
        </ul>

        <button
          :disabled="loading || v$.$invalid"
          class="w-full mainBtn transition duration-300"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
</style>
