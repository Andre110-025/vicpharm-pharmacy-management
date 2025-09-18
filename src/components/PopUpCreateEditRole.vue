<script setup>
import { ref, reactive } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import CheckboxInput from './CheckboxInput.vue'
import IconAccount from './IconAccount.vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'
import DynamicInput from './DynamicInput.vue'

const { user } = useUserStore()

const emit = defineEmits(['confirm'])

const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
  customRoleData: {
    type: Object,
    default: () => ({}),
  },
})

const isLoading = ref(false)

const roleData = reactive({
  role_name: props.edit ? props.customRoleData.role_name : null,
  can_view_analytics: props.edit ? props.customRoleData.rolepreviledges.can_view_analytics : false,
  can_view_income_records: props.edit
    ? props.customRoleData.rolepreviledges.can_view_income_records
    : false,
  can_view_products: props.edit ? props.customRoleData.rolepreviledges.can_view_products : false,
  can_add_products: props.edit ? props.customRoleData.rolepreviledges.can_add_products : false,
  can_edit_products_details: props.edit
    ? props.customRoleData.rolepreviledges.can_edit_products_details
    : false,
  can_add_bulk_products: props.edit
    ? props.customRoleData.rolepreviledges.can_add_bulk_products
    : false,
  can_add_new_sku: props.edit ? props.customRoleData.rolepreviledges.can_add_new_sku : false,
  can_deactivate_products: props.edit
    ? props.customRoleData.rolepreviledges.can_deactivate_products
    : false,
  can_view_customers: props.edit ? props.customRoleData.rolepreviledges.can_view_customers : false,
  can_add_edit_customers: props.edit
    ? props.customRoleData.rolepreviledges.can_add_edit_customers
    : false,
  can_view_sales_records: props.edit
    ? props.customRoleData.rolepreviledges.can_view_sales_records
    : false,
  can_return_sales_records: props.edit
    ? props.customRoleData.rolepreviledges.can_return_sales_records
    : false,
  can_return_sales_orders: props.edit
    ? props.customRoleData.rolepreviledges.can_return_sales_orders
    : false,
  can_complete_sales_orders: props.edit
    ? props.customRoleData.rolepreviledges.can_complete_sales_orders
    : false,
  can_make_sales: props.edit ? props.customRoleData.rolepreviledges.can_make_sales : false,
  view_other_staff_activities: props.edit
    ? props.customRoleData.rolepreviledges.view_other_staff_activities
    : false,
  add_delete_staff: props.edit ? props.customRoleData.rolepreviledges.add_delete_staff : false,
  change_staff_position: props.edit
    ? props.customRoleData.rolepreviledges.change_staff_position
    : false,
  can_view_staff: props.edit ? props.customRoleData.rolepreviledges.can_view_staff : false,
  can_create_role: props.edit ? props.customRoleData.rolepreviledges.can_create_role : false,
})

const permissionGroups = {
  analytics: [
    { key: 'can_view_analytics', label: 'View Analytics' },
    { key: 'can_view_income_records', label: 'View Income Records' },
  ],
  products: [
    { key: 'can_view_products', label: 'View Products' },
    { key: 'can_add_products', label: 'Add Products' },
    { key: 'can_edit_products_details', label: 'Edit Product Details' },
    { key: 'can_add_bulk_products', label: 'Add Bulk Products' },
    { key: 'can_add_new_sku', label: 'Add New SKU' },
    { key: 'can_deactivate_products', label: 'Deactivate Products' },
  ],
  customers: [
    { key: 'can_view_customers', label: 'View Customers' },
    { key: 'can_add_edit_customers', label: 'Add and Edit Customers' },
  ],
  sales: [
    { key: 'can_view_sales_records', label: 'View Sales Records' },
    { key: 'can_return_sales_records', label: 'Return Sales Records' },
    { key: 'can_return_sales_orders', label: 'Return Sales Orders' },
    { key: 'can_complete_sales_orders', label: 'Complete Sales Orders' },
    { key: 'can_make_sales', label: 'Make Sales' },
  ],
  staff: [
    { key: 'can_view_staff', label: 'View Staff' },
    { key: 'can_create_role', label: 'Can Create Role' },
    { key: 'add_delete_staff', label: 'Add/Delete Staff' },
    { key: 'change_staff_position', label: 'Change Staff Position' },
    { key: 'view_other_staff_activities', label: 'View Staff Activities' },
  ],
}

const createAdminRole = async () => {
  try {
    const response = await axios.post('createrole', roleData)

    if (response.status === 201 && !response.data.Error) {
      toast.success('Admin role Created successfully')
      isLoading.value = false
      emit('confirm', true)
    }
  } catch (error) {
    toast.error('Error creating admin')
  }
}

const editAdminRole = async () => {
  try {
    isLoading.value = true

    const response = await axios.post(`editrole/${props.customRoleData.id}`, roleData)

    if (response.status === 201 && !response.data.Error) {
      toast.success('Admin role updated successfully')
      isLoading.value = false
      emit('confirm', true)
    }
  } catch (error) {
    toast.error('Error Updating admin role')
    isLoading.value = false
  }
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[450px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-col w-full h-full">
      <div class="p-6 flex flex-row items-center gap-[15px]">
        <div
          class="w-11 h-11 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
        >
          <IconAccount class="w-8 h-8" />
        </div>
        <div class="flex flex-col">
          <h3 class="text-gray-900">{{ edit ? 'Edit Role' : 'Create Admin Role' }}</h3>
          <h6 class="text-gray-500">Assign Privileges by role</h6>
        </div>
      </div>
      <!-- Form wrapped in a scrollable container -->
      <div class="p-6 bg-white rounded-lg shadow flex-1 overflow-y-auto">
        <DynamicInput
          v-model="roleData.role_name"
          :label="'Role Name'"
          type="text"
          placeholder="Enter Role Name"
        />

        <h2 class="text-xl font-semibold mb-4">Role Permissions</h2>

        <!-- Analytics Permissions -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Analytics</h3>
          <CheckboxInput
            v-for="perm in permissionGroups.analytics"
            :key="perm.key"
            :label="perm.label"
            v-model="roleData[perm.key]"
          />
        </div>

        <!-- Products Permissions -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Products</h3>
          <CheckboxInput
            v-for="perm in permissionGroups.products"
            :key="perm.key"
            :label="perm.label"
            v-model="roleData[perm.key]"
          />
        </div>

        <!-- Customers Permissions -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Customers</h3>
          <CheckboxInput
            v-for="perm in permissionGroups.customers"
            :key="perm.key"
            :label="perm.label"
            v-model="roleData[perm.key]"
          />
        </div>

        <!-- Sales Permissions -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Sales</h3>
          <CheckboxInput
            v-for="perm in permissionGroups.sales"
            :key="perm.key"
            :label="perm.label"
            v-model="roleData[perm.key]"
          />
        </div>

        <!-- Staff Management -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2 text-gray-700 border-b pb-1">Staff Management</h3>
          <CheckboxInput
            v-for="perm in permissionGroups.staff"
            :key="perm.key"
            :label="perm.label"
            v-model="roleData[perm.key]"
          />
        </div>
      </div>

      <div class="my-2.5 px-5 w-full">
        <button
          @click="createAdminRole"
          :disabled="!roleData.role_name || isLoading"
          class="px-4 py-2 w-full bg-mainColor/90 text-white rounded-md hover:bg-mainColor transition duration-200"
          v-if="!edit"
        >
          Create Role
        </button>
        <button
          @click="editAdminRole"
          :disabled="!roleData.role_name || isLoading"
          class="px-4 py-2 w-full bg-mainColor/90 text-white rounded-md hover:bg-mainColor transition duration-200"
          v-else
        >
          Update Role
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>
