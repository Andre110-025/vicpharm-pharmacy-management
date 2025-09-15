<script setup>
import { ref } from 'vue'
import IconNotePad from './IconNotePad.vue'
import IconDelete from './IconDelete.vue'
import { useModal } from 'vue-final-modal'
import PopUpCreateAdmin from './PopUpCreateAdmin.vue'
import PopUpConfirmAction from './PopUpConfirmAction.vue'
import { useHelpers } from '@/helper'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'

const { privileges } = useUserStore()

const { formatDateTime, formatTime } = useHelpers()

const emit = defineEmits(['refresh'])

const Props = defineProps({
  adminData: {
    type: Array,
    default: () => [],
  },
})

const openEditUser = (admin) => {
  const { open, close } = useModal({
    component: PopUpCreateAdmin,
    attrs: {
      edit: true,
      customData: admin,
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

const openDeleteUser = (id) => {
  const { open, close } = useModal({
    component: PopUpConfirmAction,
    attrs: {
      // edit: true,
      // customData: admin,
      onConfirm(bool) {
        if (bool) {
          deleteUser(id)
        }
        close()
      },
    },
  })

  open()
}

const deleteUser = async (id) => {
  return toast
    .promise(
      axios.delete(`delStoreStaff/${id}`),
      {
        pending: 'Deleting user...',
        success: {
          render: ({ data }) => {
            return data.data[0] || 'User deleted successfully'
          },
        },
        error: 'Error deleting user',
      },
      {
        position: toast.POSITION.TOP_CENTER,
      },
    )
    .then(() => {
      emit('refresh')
    })
    .catch((error) => {
      // console.error('Error deleting user:', error)
      // Handle error state
    })
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <table class="w-full border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Admin Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Email
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Role
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Date Added
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(data, index) in adminData" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500 capitalize">
            {{ data.full_name }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {{ data.email }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500 capitalize">
            {{ data.user_type }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p class="h-fit">
              {{ formatDateTime(data.created_at) }} | {{ formatTime(data.created_at) }}
            </p>
          </td>
          <td>
            <div class="flex space-x-2 justify-center">
              <button
                @click="openEditUser(data)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Edit Role"
                v-if="privileges.change_staff_position"
              >
                <IconNotePad class="w-6 h-6" />
              </button>
              <button
                @click="openDeleteUser(data.id)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Delete User"
                v-if="privileges.add_delete_staff"
              >
                <IconDelete class="w-6 h-6" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!adminData.length">
          <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Admin found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
