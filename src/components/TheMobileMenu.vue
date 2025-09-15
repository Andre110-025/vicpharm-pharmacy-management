<script setup>
import IconDashboard from './IconDashboard.vue'
import IconCustomers from './IconCustomers.vue'
import IconIncome from './IconIncome.vue'
import IconSale from './IconSale.vue'
import IconBox from './IconBox.vue'
</script>

<template>
  <aside
    class="md:hidden fixed flex flex-row bottom-0 left-0 z-50 h-fit w-full bg-white px-5 justify-center"
  >
    <div class="flex flex-row gap-4">
      <RouterLink :to="{ name: 'overview' }" class="dashNav">
        <IconDashboard class="" />
        Home
      </RouterLink>
      <RouterLink :to="{ name: 'Customers' }" class="dashNav">
        <IconCustomers class="" />
        Customers
      </RouterLink>
      <RouterLink :to="{ name: 'Income' }" class="dashNav">
        <IconIncome class="" />
        Income
      </RouterLink>
      <RouterLink :to="{ name: 'Inventory' }" class="dashNav">
        <IconBox class="" />
        Inventory
      </RouterLink>
      <RouterLink :to="{ name: 'Sales' }" class="dashNav">
        <IconSale class="" />
        Sales
      </RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.dashNav {
  @apply flex items-center justify-center flex-col p-0;
}
.dashNav svg {
  @apply mr-0 w-4 h-4;
}
</style>
