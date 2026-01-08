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
  <div class="block min-[451px]:hidden space-y-4">
    <div
      v-for="(data, index) in adminData"
      :key="index"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Admin Name</p>
          <p class="text-base font-semibold text-gray-900 capitalize" v-text="data.full_name"></p>
        </div>

        <div class="flex gap-2">
          <button
            @click="openEditUser(data)"
            class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
            title="Edit Role"
            v-if="privileges.change_staff_position"
          >
            <IconNotePad class="w-5 h-5 text-gray-600" />
          </button>
          <button
            @click="openDeleteUser(data.id)"
            class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
            title="Delete User"
            v-if="privileges.add_delete_staff"
          >
            <IconDelete class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Email</span>
          <span class="font-medium text-gray-900 truncate" v-text="data.email"></span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Date Added</span>
          <span class="font-medium text-gray-900">
            {{ formatDateTime(data.created_at) }} | {{ formatTime(data.created_at) }}
          </span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Role</span>
          <span class="font-medium text-gray-900 capitalize" v-text="data.user_type"></span>
        </div>

        <div></div>
      </div>

      <div v-if="!adminData.length" class="text-center py-10 text-sm text-gray-500">
        No Admin found.
      </div>
    </div>
  </div>
  <div class="hidden min-[451px]:block w-full overflow-x-auto">
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
