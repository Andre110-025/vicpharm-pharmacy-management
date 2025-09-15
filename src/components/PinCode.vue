<template>
  <div class="flex flex-row justify-center gap-2">
    <input
      v-for="(_, index) in inputs"
      :key="index"
      :ref="(el) => setInputRef(el, index)"
      v-model="inputs[index]"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :placeholder="placeholder"
      maxlength="1"
      :class="['h-10 w-10 rounded border text-center text-xl', inputClasses(index)]"
      @input="handleInput(index, $event)"
      @keydown="handleKeyDown($event, index)"
      @paste.prevent="handlePaste($event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  digits: {
    type: Number,
    default: 4,
  },
  placeholder: {
    type: String,
    default: '',
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: '',
  },
  successClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const focusedInputIndex = ref(0)
const inputRefs = ref([])
const inputs = ref(initialInputs())

// Method to set input refs
const setInputRef = (el, index) => {
  if (el) inputRefs.value[index] = el
}

// Compute input classes
const inputClasses = (index) => {
  const baseClasses = [
    'border-gray-300',
    'focus:outline-none',
    props.inputClass ||
      'hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200',
  ]

  return isValid.value ? [...baseClasses, props.successClass || 'border-green-500'] : baseClasses
}

// Computed properties
const isValid = computed(() => inputs.value.join('').length === props.digits)

// Focus methods
const focusInputByIndex = (index) => {
  if (inputRefs.value[index]) {
    inputRefs.value[index].focus()
    inputRefs.value[index].select()
    focusedInputIndex.value = index
  }
}

// Input handling
const handleInput = (index, event) => {
  // Replace any non-numeric characters
  const input = event.target.value.replace(/[^0-9]/g, '')

  // Set input to the first numeric character (if any)
  inputs.value[index] = input.charAt(0)

  // Move to next input if current input is filled
  if (input.charAt(0) && index < props.digits - 1) {
    focusInputByIndex(index + 1)
  }
}

// Prevent paste of non-numeric content
const handlePaste = (event) => {
  const pastedText = event.clipboardData.getData('text')
  const numericOnly = pastedText.replace(/[^0-9]/g, '')

  // Distribute numeric characters across input fields
  const pastedDigits = numericOnly.split('').slice(0, props.digits)
  pastedDigits.forEach((digit, index) => {
    if (index < inputs.value.length) {
      inputs.value[index] = digit
    }
  })

  // Focus on the last filled or last input
  const lastFilledIndex = pastedDigits.length - 1
  focusInputByIndex(Math.min(lastFilledIndex, props.digits - 1))
}

// Key handling
const handleKeyDown = (e, index) => {
  // Prevent non-numeric input
  if (
    e.key &&
    !/^[0-9]$/.test(e.key) &&
    e.key !== 'Backspace' &&
    e.key !== 'Delete' &&
    e.key !== 'ArrowLeft' &&
    e.key !== 'ArrowRight'
  ) {
    e.preventDefault()
    return
  }

  // Handle delete/backspace to move focus
  if ((e.key === 'Backspace' || e.key === 'Delete') && !inputs.value[index]) {
    if (index > 0) {
      focusInputByIndex(index - 1)
      inputs.value[index - 1] = ''
    }
  }
}

// Initial inputs generation
function initialInputs() {
  if (props.modelValue) {
    return props.modelValue.length <= props.digits
      ? [
          ...props.modelValue.split('').filter((char) => /[0-9]/.test(char)),
          ...[...Array(props.digits - props.modelValue.length)].map(() => ''),
        ]
      : props.modelValue
          .slice(0, props.digits)
          .split('')
          .filter((char) => /[0-9]/.test(char))
  }
  return [...Array(props.digits)].map(() => '')
}

// Watch for input changes
watch(
  inputs,
  (newInputs) => {
    const inputValue = newInputs.join('')
    emit('update:modelValue', inputValue)
  },
  { deep: true },
)

// Autofocus on mount
onMounted(() => {
  nextTick(() => {
    if (props.autofocus && inputRefs.value[0]) {
      inputRefs.value[0].focus()
    }
  })
})

// Expose methods for external use
defineExpose({
  reset: () => {
    inputs.value = initialInputs()
  },
})
</script>
