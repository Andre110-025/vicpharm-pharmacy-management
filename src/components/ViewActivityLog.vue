<script setup>
import { ref, reactive, onMounted } from 'vue'
import ActivityLogTable from './ActivityLogTable.vue'
import IconPlus from './IconPlus.vue'
import axios from 'axios'
import PropFilter from './PropFilter.vue'
import PropPaginator from './PropPaginator.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import IconFilter from './IconFilter.vue'

const isLoading = ref(false)
const logFilter = reactive({ start: '', end: '' })
const activityList = ref(null)

const getActivityList = async (page = 1) => {
  try {
    isLoading.value = true
    activityList.value = null

    const response = await axios.post(`staffloglist?page=${page}`, logFilter)

    if (response.status === 201) {
      activityList.value = response.data.Returns
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    isLoading.value = false
  }
}

const showLogFilter = ref(false)

const updateDate = (date) => {
  logFilter.start = date.start
  logFilter.end = date.end
  getActivityList()
}

onMounted(() => {
  getActivityList()
})
</script>

<template>
  <header>
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-gray-900">Activity Log</h2>
        <p class="mt-2.5">View all Staff activity.</p>
      </div>
    </div>
  </header>

  <div class="flex gap-2.5 justify-end">
    <PropButtonIcon
      class="border-gray-400 text-black hover:bg-gray-100 transition"
      :icon-component="IconFilter"
      text="Filter Date"
      @click="showLogFilter = true"
    />
  </div>
  <div class="relative">
    <PropFilter
      :dateFilter="logFilter"
      v-model:showFilter="showLogFilter"
      @changeDate="updateDate"
    />
  </div>

  <div class="mt-8 w-full overflow-hidden rounded-lg">
    <ActivityLogTable :activityLog-data="activityList.data" v-if="!isLoading && activityList" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <PropPaginator
      v-if="activityList && !isLoading"
      :pagination="activityList"
      :limit="2"
      :keepLength="false"
      :showInfo="true"
      @page-changed="getActivityList"
    />
  </div>
</template>
