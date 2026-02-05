<script setup>
import ExpenseList from './ExpenseList.vue'

</script>

<template>
  <header>
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-gray-900">Expenses</h2>
        <p class="mt-2.5">View all Expenses made.</p>
      </div>
    </div>

    <ExpenseList />
  </header>
</template>
