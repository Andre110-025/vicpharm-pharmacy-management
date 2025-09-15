<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  permissions: {
    type: Object,
    required: true,
    default: () => ({
      can_view_analytics: false,
      can_view_income_records: false,
      can_view_products: false,
      can_add_products: false,
      can_edit_products_details: false,
      can_add_bulk_products: false,
      can_add_new_sku: false,
      can_deactivate_products: false,
      can_view_customers: false,
      can_add_edit_customers: false,
      can_view_sales_records: false,
      can_return_sales_records: false,
      can_return_sales_orders: false,
      can_complete_sales_orders: false,
      can_make_sales: false,
      view_other_staff_activities: false,
      add_delete_staff: false,
      change_staff_position: false,
      can_view_staff: false,
      can_create_role: false,
    }),
  },
})

// Check if a permission is active
const isActive = (key) => {
  if (!props.permissions) return false
  return props.permissions[key] === true
}

// Permission categories with human-readable labels for each permission
const permissionCategories = {
  Dashboard: {
    can_view_analytics: 'View dashboard analytics',
  },
  Income: {
    can_view_income_records: 'View income records',
  },
  Sale: {
    can_view_sales_records: 'View sales records',
    can_return_sales_records: 'Return sales records',
    can_return_sales_orders: 'Return sales orders',
    can_complete_sales_orders: 'Complete sales orders',
    can_make_sales: 'Make sales transactions',
  },
  Inventory: {
    can_view_products: 'View products',
    can_add_products: 'Add new products',
    can_edit_products_details: 'Edit product details',
    can_add_bulk_products: 'Add products in bulk',
    can_add_new_sku: 'Add new SKUs',
    can_deactivate_products: 'Deactivate products',
  },
  Admin: {
    view_other_staff_activities: 'View staff activities',
    add_delete_staff: 'Add or delete staff members',
    change_staff_position: 'Change staff positions',
    can_view_staff: 'View staff records',
    can_create_role: 'Create new roles',
  },
  Customer: {
    can_view_customers: 'View customer records',
    can_add_edit_customers: 'Add or edit customers',
  },
}

// Flag to toggle between compact and detailed view
const showDetailedView = ref(true)
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">Role Permissions</h3>
      <button
        @click="showDetailedView = !showDetailedView"
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        {{ showDetailedView ? 'Show Compact View' : 'Show Detailed View' }}
      </button>
    </div>

    <!-- Detailed View (shows all individual permissions) -->
    <div v-if="showDetailedView" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div
        v-for="(permissions, category) in permissionCategories"
        :key="category"
        class="border rounded-lg p-4 bg-white shadow-sm"
      >
        <p class="font-medium text-gray-800 mb-3 pb-2 border-b">{{ category }}</p>

        <div class="space-y-2">
          <div v-for="(label, key) in permissions" :key="key" class="flex items-center">
            <div class="w-5 h-5 mr-3 flex items-center justify-center">
              <span v-if="isActive(key)" class="text-green-500 text-lg font-bold">✓</span>
              <span v-else class="text-gray-300 text-lg">×</span>
            </div>
            <span :class="isActive(key) ? 'text-gray-800' : 'text-gray-400'" class="text-sm">{{
              label
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Original Compact View -->
    <div v-else class="flex flex-row gap-7 mt-4">
      <div class="flex flex-col gap-5">
        <!-- Dashboard Section -->
        <div>
          <p class="font-medium text-gray-800 mb-1">Dashboard</p>
          <p
            :class="isActive('can_view_analytics') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('can_view_analytics')" class="mr-1.5">✓</span>
            User can view dashboard
          </p>
        </div>

        <!-- Customer Section -->
        <div>
          <p class="font-medium text-gray-800 mb-1">Customer</p>
          <p
            :class="isActive('can_view_customers') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('can_view_customers')" class="mr-1.5">✓</span>
            User can view customer
          </p>
          <p
            :class="isActive('can_add_edit_customers') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('can_add_edit_customers')" class="mr-1.5">✓</span>
            User can manage customer
          </p>
        </div>

        <!-- Income Section -->
        <div>
          <p class="font-medium text-gray-800 mb-1">Income</p>
          <p
            :class="isActive('can_view_income_records') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('can_view_income_records')" class="mr-1.5">✓</span>
            User can view income
          </p>
        </div>
      </div>

      <div class="flex flex-col gap-5">
        <!-- Sale Section -->
        <div>
          <p class="font-medium text-gray-800 mb-1">Sale</p>
          <p
            :class="isActive('can_view_sales_records') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('can_view_sales_records')" class="mr-1.5">✓</span>
            User can view sale
          </p>
          <p
            :class="[
              isActive('can_return_sales_orders') ||
              isActive('can_complete_sales_orders') ||
              isActive('can_make_sales')
                ? 'text-blue-600'
                : 'text-gray-400',
            ]"
            class="flex items-center text-sm"
          >
            <span
              v-if="
                isActive('can_return_sales_orders') ||
                isActive('can_complete_sales_orders') ||
                isActive('can_make_sales')
              "
              class="mr-1.5"
              >✓</span
            >
            User can manage sale
          </p>
        </div>

        <!-- Inventory Section -->
        <div>
          <p class="font-medium text-gray-800 mb-1">Inventory</p>
          <p
            :class="isActive('can_view_products') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('can_view_products')" class="mr-1.5">✓</span>
            User can view inventory
          </p>
          <p
            :class="[
              isActive('can_add_products') ||
              isActive('can_edit_products_details') ||
              isActive('can_add_bulk_products') ||
              isActive('can_add_new_sku') ||
              isActive('can_deactivate_products')
                ? 'text-blue-600'
                : 'text-gray-400',
            ]"
            class="flex items-center text-sm"
          >
            <span
              v-if="
                isActive('can_add_products') ||
                isActive('can_edit_products_details') ||
                isActive('can_add_bulk_products') ||
                isActive('can_add_new_sku') ||
                isActive('can_deactivate_products')
              "
              class="mr-1.5"
              >✓</span
            >
            User can manage inventory
          </p>
        </div>

        <!-- Admin Section -->
        <div>
          <p class="font-medium text-gray-800 mb-1">Admin</p>
          <p
            :class="isActive('view_other_staff_activities') ? 'text-blue-600' : 'text-gray-400'"
            class="flex items-center text-sm"
          >
            <span v-if="isActive('view_other_staff_activities')" class="mr-1.5">✓</span>
            User can view admin
          </p>
          <p
            :class="[
              isActive('add_delete_staff') || isActive('change_staff_position')
                ? 'text-blue-600'
                : 'text-gray-400',
            ]"
            class="flex items-center text-sm"
          >
            <span
              v-if="isActive('add_delete_staff') || isActive('change_staff_position')"
              class="mr-1.5"
              >✓</span
            >
            User can manage staff
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
