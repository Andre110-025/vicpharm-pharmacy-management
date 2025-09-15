<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).substring(2, 9)}`,
  },
})

const model = defineModel()
</script>

<template>
  <div class="flex items-center mb-2">
    <input
      type="checkbox"
      :id="id"
      v-model="model"
      :disabled="disabled"
      class="form-checkbox h-4 w-4 text-mainColor accent-mainColor transition duration-150 ease-in-out rounded focus:ring-2 focus:ring-mainColor focus:ring-opacity-50"
    />
    <label
      :for="id"
      class="ml-2 block text-sm text-gray-700 cursor-pointer"
      :class="{ 'opacity-60': disabled }"
    >
      {{ label }}
    </label>
  </div>
</template>
