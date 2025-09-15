<script setup>
import { RouterView } from 'vue-router'
import { ModalsContainer } from 'vue-final-modal'
import LoadingBar from '@/components/LoadingBar.vue'
</script>

<template>
  <LoadingBar color="#AF3585" :height="3" />
  <RouterView />
  <ModalsContainer />
</template>
