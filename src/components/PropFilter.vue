<script setup>
import { ref, reactive, onMounted } from 'vue'
import IconCancel from './IconCancel.vue'
import { toast } from 'vue3-toastify'

const props = defineProps({
  dateFilter: {
    type: Object,
    default: () => ({
      start: '',
      end: '',
      status: '',
    }),
  },
  options: {
    type: Array,
    default: () => [],
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['changeDate'])

// convert this '15/04/2025' to '2025-04-15'
const formatDate = (date) => {
  if (!date) return ''
  const [day, month, year] = date.split('/')
  return `${year}-${month}-${day}`
}
const date = reactive({
  start: formatDate(props.dateFilter.start),
  end: formatDate(props.dateFilter.end),
  status: props.dateFilter.status || '',
})

const showFilter = defineModel('showFilter')

const passDate = () => {
  // console.log('date', date)
  if (date.start && date.end) {
    // check if start date is before end date
    const startDate = new Date(date.start)
    const endDate = new Date(date.end)
    if (startDate > endDate) {
      toast.error('Start date cannot be after end date')
      return
    }

    const formattedStartDate = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`
    const formattedEndDate = `${endDate.getDate()}/${endDate.getMonth() + 1}/${endDate.getFullYear()}`
    const reformedDate = {
      start: formattedStartDate,
      end: formattedEndDate,
      status: date.status,
    }

    emit('changeDate', reformedDate)
    showFilter.value = false
  } else if (date.start && !date.end) {
    toast.error('Please select an end date')
  } else if (!date.start && date.end) {
    toast.error('Please select a start date')
  } else if (date.status && !date.start && !date.end) {
    const reformedDate = {
      start: '',
      end: '',
      status: date.status,
    }

    emit('changeDate', reformedDate)
    showFilter.value = false
  } else {
    toast.error('Please select both start and end dates')
  }
}

onMounted(() => {
  showFilter.value = false
})
</script>

<template>
  <!-- Filter starts here -->
  <div
    class="flex flex-col w-fit h-fit bg-white shadow-md rounded-md p-6 gap-6 absolute z-10 right-4"
    :class="showFilter ? '' : 'hidden'"
  >
    <div class="flex flex-row justify-between items-center">
      <h3>Filter by date</h3>
      <label for="closeFilterButton" class="cursor-pointer" @click="showFilter = false"
        ><IconCancel
      /></label>
      <input
        type="checkbox"
        name="closeFilter"
        id="closeFilterButton"
        class="hidden"
        ref="closeFilterButton"
      />
    </div>
    <!-- fields made here -->
    <div class="space-y-4">
      <div class="flex flex-col">
        <p>Date</p>
        <div class="flex flex-row gap-3">
          <div class="relative w-[130px]">
            <input
              type="date"
              placeholder="Start"
              class="w-[130px] h-[40px] border border-gray-300 px-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
              v-model="date.start"
            />
          </div>
          <div class="relative w-[130px]">
            <input
              type="date"
              placeholder="End"
              class="w-full h-[40px] border border-gray-300 px-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
              v-model="date.end"
            />
          </div>
        </div>
      </div>
      <div v-if="showStatus" class="flex flex-col">
        <p>Status</p>
        <div class="flex flex-row gap-3">
          <select
            name="status"
            id="status"
            class="w-full h-[40px] border border-gray-300 px-2 text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
            v-model="date.status"
          >
            <option
              v-for="option in options"
              :key="option.label"
              :value="option.value"
              v-text="option.label"
            ></option>
          </select>
        </div>
      </div>

      <!-- button -->
      <div>
        <button @click="passDate()" class="w-full mainBtn transition duration-300" type="submit">
          Proceed
        </button>
      </div>
    </div>
  </div>
</template>
