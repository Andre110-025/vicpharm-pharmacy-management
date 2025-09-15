<script setup>
import { ref, computed, watch } from 'vue'
import IconEye from './IconEye.vue'
import IconHidden from './IconHidden.vue'

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  link: {
    type: Object,
    default: null,
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  currency: {
    type: Boolean,
    default: false,
  },
})

const model = defineModel()
const displayValue = ref('')
const passwordVisible = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') {
    return passwordVisible.value ? 'text' : 'password'
  }
  if (props.currency) {
    return 'text'
  }
  return props.type
})

const formatCurrency = (value) => {
  if (!value) return '0.00'

  // Convert to string and remove all non-digits
  const digits = value.toString().replace(/\D/g, '')

  if (!digits) return '0.00'

  // Convert to cents (integer)
  const cents = parseInt(digits)

  // Convert cents to dollars
  const dollars = cents / 100

  // Format with commas and always show 2 decimal places
  return dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const parseCurrency = (value) => {
  if (!value) return '0'
  // Remove commas and return clean number
  return value.replace(/,/g, '')
}

const handleInput = (event) => {
  if (props.currency) {
    const inputValue = event.target.value

    // Only allow digits for currency input
    const digitsOnly = inputValue.replace(/\D/g, '')

    const formatted = formatCurrency(digitsOnly)
    displayValue.value = formatted

    // Update the model with the clean numeric value (dollars)
    const cleanValue = parseCurrency(formatted)
    model.value = cleanValue
  } else {
    model.value = event.target.value
  }
}

const handleKeydown = (event) => {
  if (props.currency) {
    // Allow: backspace, delete, tab, escape, enter
    if (
      [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (event.keyCode === 65 && event.ctrlKey === true) ||
      (event.keyCode === 67 && event.ctrlKey === true) ||
      (event.keyCode === 86 && event.ctrlKey === true) ||
      (event.keyCode === 88 && event.ctrlKey === true)
    ) {
      return
    }
    // Ensure that it is a number and stop the keypress
    if (
      (event.shiftKey || event.keyCode < 48 || event.keyCode > 57) &&
      (event.keyCode < 96 || event.keyCode > 105)
    ) {
      event.preventDefault()
    }
  }
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
}

// Initialize display value for currency inputs
watch(
  () => model.value,
  (newValue) => {
    if (props.currency && newValue !== undefined) {
      displayValue.value = formatCurrency(newValue)
    }
  },
  { immediate: true },
)

// Set initial display value
if (props.currency && model.value) {
  displayValue.value = formatCurrency(model.value)
}
</script>

<template>
  <div class="mb-4">
    <label class="block mb-2" v-if="label || $slots.label" :for="id">
      <slot name="label">{{ label }}</slot>
    </label>
    <div class="relative flex">
      <input
        class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
        :class="{ 'pr-6': inputType == 'password', 'text-right placeholder:text-start': currency }"
        :id="id"
        :type="inputType"
        :value="currency ? displayValue : model"
        @input="handleInput"
        :placeholder="placeholder"
        :autocomplete="type === 'password' ? 'new-password' : 'off'"
        :readonly="props.readonly"
      />

      <button
        v-if="type === 'password'"
        type="button"
        class="absolute p-0 right-1 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer"
        @click="togglePasswordVisibility"
      >
        <IconHidden v-if="passwordVisible" />
        <IconEye v-else />
      </button>
    </div>
    <RouterLink v-if="link" :to="{ name: `${link.route}` }" class="text-mainColor mt-1 block">{{
      link.label
    }}</RouterLink>
  </div>
</template>
