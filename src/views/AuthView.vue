<script setup>
import { RouterView } from 'vue-router'
import Logo from '@/components/Logo.vue'
</script>

<template>
  <main class="min-h-dvh h-dvh flex">
    <div
      class="flex-1 min-h-full w-1/2 relative bg-cover"
      style="background-image: url('/pharmacist.png')"
    >
      <!-- <div class="absolute inset-0 bg-black/40"></div> -->
      <div
        class="inset-5 h-full flex flex-col items-start justify-center text-white px-10 bg-black/40"
      >
        <h2 class="">Track and Monitor your Inventory on a single Dashboard.</h2>
        <p class="mt-4">
          Make informed sales decisions by monitoring consumer<br />
          behaviours, brand acceptance and market performance.
        </p>
      </div>
    </div>
    <div class="flex-1 flex flex-col items-center justify-center bg-white min-h-full">
      <Logo class="mb-4 w-40" />
      <RouterView />
    </div>
  </main>
</template>
