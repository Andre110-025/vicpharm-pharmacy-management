<script setup>
import IconNotePad from './IconNotePad.vue'
import IconDelete from './IconDelete.vue'
import PopUpConfirmAction from './PopUpConfirmAction.vue'
import { useModal } from 'vue-final-modal'
import PopUpCreateEditRole from './PopUpCreateEditRole.vue'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'
import axios from 'axios'

const { privileges } = useUserStore()

const { formatDateTime, formatTime } = useHelpers()

const emit = defineEmits(['refresh'])

const Props = defineProps({
  adminData: {
    type: Array,
    default: () => [],
  },
})

const openEditRole = (admin) => {
  const { open, close } = useModal({
    component: PopUpCreateEditRole,
    attrs: {
      edit: true,
      customRoleData: admin,
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

const openDeleteRole = (id) => {
  const { open, close } = useModal({
    component: PopUpConfirmAction,
    attrs: {
      onConfirm(bool) {
        if (bool) {
          deleteRole(id)
        }
        close()
      },
    },
  })

  open()
}

const deleteRole = async (id) => {
  return toast
    .promise(
      axios.delete(`deleterole/${id}`),
      {
        pending: 'Deleting Role...',
        success: {
          render: ({ data }) => {
            return data.data[0] || 'Role deleted successfully'
          },
        },
        error: {
          render: ({ data }) => {
            console.log('deleting role:', data)
            return data.response.data.Error || 'error deleting role'
          },
        },
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

const returnFormatted = (dataTimeStr) => {
  const date = new Date(dataTimeStr)

  // Format parts
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date)

  const getPart = (type) => parts.find((p) => p.type === type)?.value || ''

  // Build custom format: Thu, 01 Feb 2024 | 12:55 AM
  const formatted = `${getPart('weekday')}, ${getPart('day')} ${getPart('month')} ${getPart('year')} | ${getPart('hour')}:${getPart('minute')} ${getPart('dayPeriod')}`

  // console.log(formatted, parts, getPart)
  return formatted
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
            Role Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Created At
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Update At
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
            v-if="privileges.can_create_role"
          >
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(data, index) in adminData" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500 capitalize">
            {{ data.role_name }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {{ returnFormatted(data.created_at) }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500 capitalize">
            {{ returnFormatted(data.updated_at) }}
          </td>
          <td v-if="privileges.can_create_role">
            <div class="flex space-x-2 justify-center">
              <button
                @click="openEditRole(data)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Edit Role"
              >
                <IconNotePad class="w-6 h-6" />
              </button>

              <button
                @click="openDeleteRole(data.id)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Delete Role"
                v-if="privileges.add_delete_staff"
              >
                <IconDelete class="w-6 h-6" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
