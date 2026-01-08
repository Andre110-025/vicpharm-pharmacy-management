<script setup>
import IconNotePad from './IconNotePad.vue'
import IconEye from './IconEye.vue'
import { useModal } from 'vue-final-modal'
import PopupAddCustomer from './PopupAddCustomer.vue'
import PopUpCustomerDetail from './PopUpCustomerDetail.vue'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'

const { formatDateTime } = useHelpers()
const { privileges } = useUserStore()

const emit = defineEmits(['refresh'])

const props = defineProps({
  customers: {
    type: Array,
    default: () => [],
  },
})

// Track which dropdown is currently open
const openDropdownId = ref(null)

// Toggle dropdown visibility
const toggleDropdown = (customerId) => {
  if (openDropdownId.value === customerId) {
    openDropdownId.value = null // Close if already open
  } else {
    openDropdownId.value = customerId // Open this dropdown, close others
  }
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  openDropdownId.value = null
}

const openEditUser = (customer) => {
  console.log(customer)
  const { open, close } = useModal({
    component: PopupAddCustomer,
    attrs: {
      edit: true,
      customData: customer,
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })

  open()
}

const handleDelete = (customer) => {
  // Implement delete functionality here
  console.log('Delete customer:', customer)

  closeDropdown()
}

const handleViewDetails = (customer) => {
  // Implement view details functionality here
  console.log('View details for customer:', customer)

  const { open, close } = useModal({
    component: PopUpCustomerDetail,
    attrs: {
      customData: customer,
      onConfirm(bool) {
        if (bool) {
          console.log('testing')
          openEditUser(customer)
        }
        close()
      },
    },
  })
  open()
  closeDropdown()
}
</script>

<template>
  <div class="block min-[451px]:hidden space-y-4">
    <div
      v-for="(item, index) in customers"
      :key="index"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Customer Name</p>
          <p class="text-base font-semibold text-gray-900" v-text="item.name"></p>
        </div>

        <div class="flex gap-2">
          <button
            v-if="privileges.can_add_edit_customers"
            @click="openEditUser(item)"
            class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
            title="Edit Details"
          >
            <IconNotePad class="w-5 h-5 text-gray-600" />
          </button>

          <button
            @click.stop="handleViewDetails(item)"
            class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
            title="View Details"
          >
            <IconEye class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-5 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Phone</span>
          <span class="font-medium text-gray-900" v-text="item.phone"></span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Orders</span>
          <span class="font-medium text-gray-900" v-text="item.times_bought"></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Last Order</span>
          <span class="font-medium text-gray-900">
            {{ item.orders?.length ? formatDateTime(item.orders[0].created_at) : 'No order' }}
          </span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Location</span>
          <span class="font-medium text-gray-900 truncate" v-text="item.address"></span>
        </div>
      </div>
    </div>

    <div v-if="!customers.length" class="text-center py-10 text-sm text-gray-500">
      No customers found.
    </div>
  </div>
  <div class="hidden min-[451px]:block w-full overflow-x-auto" @click="closeDropdown">
    <table class="w-full border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Customer Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            location
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Contact Number
          </th>
          <!-- <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Email
          </th> -->
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Number Of Orders
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Last Order
          </th>
          <th class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in customers" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.name"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.address"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.phone"></p>
              </div>
            </div>
          </td>
          <!-- <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.email"></p>
              </div>
            </div>
          </td> -->
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.times_bought"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit">
                  {{ item.orders?.length ? formatDateTime(item.orders[0].created_at) : 'No order' }}
                </p>
              </div>
            </div>
          </td>
          <td>
            <div class="flex space-x-2 justify-center relative">
              <button
                @click="openEditUser(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Edit Details"
                v-if="privileges.can_add_edit_customers"
              >
                <IconNotePad class="w-6 h-6" />
              </button>
              <button
                @click.stop="handleViewDetails(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="View Details"
              >
                <IconEye class="w-6 h-6" />
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="openDropdownId === item.id"
                class="absolute right-0 top-8 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200"
                @click.stop
              >
                <button
                  @click="handleViewDetails(item)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  View Details
                </button>
                <button
                  @click="handleDelete(item)"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="!customers.length">
          <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Customers found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
