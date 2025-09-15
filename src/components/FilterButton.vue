<script setup>
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import IconArrowD from './IconArrowD.vue'
import IconFilterFunnel from './IconFilterFunnel.vue'

const props = defineProps({
  options: {
    type: Array,
  },
})

const options = props.options

const target = ref(null)

const selection = ref(options[0])
const showOptions = ref(false)
onClickOutside(target, (event) => (showOptions.value = false))

function select(value) {
  showOptions.value = false
  selection.value = value
}
</script>

<template>
  <div class="relative select-none w-56 max-w-[100%]">
    <div
      class="flex justify-between capitalize bg-mainColor/10 text-mainColor px-4 py-1 text-[.75rem] gap-2 cursor-pointer rounded-md"
      @click="showOptions = !showOptions"
      ref="target"
    >
      <IconFilterFunnel class="w-4 h-auto" />
      {{ selection }}
      <IconArrowD class="w-4 my-auto" />
    </div>

    <div v-if="showOptions" class="absolute pt-10 top-0 z-50 w-full cursor-pointer">
      <div class="bg-white shadow-lg text-xs flex flex-col w-full h-fit">
        <button
          v-for="(option, index) in options"
          :key="index"
          class="text-left capitalize py-2 px-4 hover:bg-mainColor/10 text-mainColor w-full"
          :class="{ hidden: option === selection }"
          @click="(select(option), $emit('change-cat', option))"
        >
          {{ option }}
        </button>
      </div>
    </div>
  </div>
</template>
