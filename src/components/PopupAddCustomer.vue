<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import IconAccount from './IconAccount.vue'
import IconCancel from './IconCancel.vue'
import IconAccount2 from './IconAccount2.vue'
import DynamicInput from './DynamicInput.vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { db } from '@/db'

const { user } = useUserStore()

const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
  customData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['confirm'])

//country dropdown
const open = ref(false)
const selectedFlag = ref('ng')
const selectedCode = ref('+234')
const isLoading = ref(false)

const customerData = reactive({
  name: props.customData?.name || null,
  email: props.customData?.email || null,
  phone: props.customData?.phone || null,
  branch: 'Abeokuta VicPharm',
  user_type: user.userType,
  address: props.customData?.address || null,
})

const countries = [
  { flag: 'us', code: '+1' },
  { flag: 'gb', code: '+44' },
  { flag: 'ng', code: '+234' },
]

const selectCountry = (country) => {
  selectedFlag.value = country.flag
  selectedCode.value = country.code
  open.value = false
}

const currentView = ref('first')

//Telling current time of transactions
const currentTime = ref(getCurrentTime())

function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

let interval
onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const handleSubmit = async () => {
  try {
    isLoading.value = true

    if (!navigator.onLine) {
      console.log('Offline: Cannot create or edit customer while offline.')

      const offlineId = `temp-${Date.now()}`;
      const payload = { 
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        branch: customerData.branch,
        user_type: customerData.user_type
    };
      const finalData = { ...payload, id: offlineId, syncStatus: 'pending' };

      // Save to the local Customer table so they appear in lists immediately
      await db.customers.put(finalData);
    await db.syncQueue.add({
        endpoint: props.edit ? `editCustomer/${props.customData.id}` : 'addCustomer',
        method: 'POST',
        payload: payload, // Use the clean payload
        timestamp: Date.now(),
        type: props.edit ? 'EDIT_CUSTOMER' : 'ADD_CUSTOMER'
    });

      toast.info('Saved! Will sync when online.', {
        position: toast.POSITION.TOP_CENTER,
      })

      emit('confirm', true)
      isLoading.value = false
      return
    }

    const { data, status } = await axios.post(
      props.edit ? `editCustomer/${props.customData.id}` : 'addCustomer',
      customerData,
    )

    console.log('Server Response:', data);

    if (status === 201) {
      const serverId = data.id || data.Data?.id || data.customer?.id || props.customData?.id || `temp-${Date.now()}`;
      await db.customers.put({ ...customerData, id: serverId })
      if (props.edit) {
        toast.success('Customer Updated Successfully', {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.success('Customer Added Successfully', {
          position: toast.POSITION.TOP_CENTER,
        })
      }
      emit('confirm', true)
      isLoading.value = false
    } else if (status === 200) {
      toast.warning(data['save type'][0], {
        position: toast.POSITION.TOP_CENTER,
      })
    }
  } catch (error) {
    console.error('Error creating customer:', error)
    // Handle error state
    if (props.edit) {
      toast.error('Error Updating Customer', {
        position: toast.POSITION.TOP_CENTER,
      })
    } else {
      toast.error('Error Updating Customer', {
        position: toast.POSITION.TOP_CENTER,
      })
    }
    isLoading.value = false
  } finally {
    isLoading.value = false
  }
}

// const handleSubmit = async () => {
//   try {
//     isLoading.value = true

//     if (!navigator.onLine) {
//       console.log('Offline: Cannot create or edit customer while offline.')

//       const offlineId = props.edit ? props.customData.id : `temp-${Date.now()}`
//       const finalData = {
//         ...customerData,
//         id: offlineId,
//         syncStatus: 'pending' // Flag to know it's not on the server yet
//       }

//       // Save to the local Customer table so they appear in lists immediately
//       await db.customers.put(JSON.parse(JSON.stringify(finalData)))

//       await db.syncQueue.add({
//         endpoint: props.edit ? `editCustomer/${props.customData.id}` : 'addCustomer',
//         method: 'POST',
//         payload: JSON.parse(JSON.stringify(customerData)),
//         timestamp: Date.now(),
//         type: props.edit ? 'EDIT_CUSTOMER' : 'ADD_CUSTOMER'
//       })

//       toast.info('Saved! Will sync when online.', {
//         position: toast.POSITION.TOP_CENTER,
//       })

//       emit('confirm', true)
//       isLoading.value = false
//       return
//     }

//     const { data, status } = await axios.post(
//       props.edit ? `editCustomer/${props.customData.id}` : 'addCustomer',
//       customerData,
//     )

//     if (status === 201) {
//       await db.customers.put({ ...customerData, id: data.id || props.customData?.id })
//       if (props.edit) {
//         toast.success('Customer Updated Successfully', {
//           position: toast.POSITION.TOP_CENTER,
//         })
//       } else {
//         toast.success('Customer Added Successfully', {
//           position: toast.POSITION.TOP_CENTER,
//         })
//       }
//       emit('confirm', true)
//       isLoading.value = false
//     } else if (status === 200) {
//       toast.warning(data['save type'][0], {
//         position: toast.POSITION.TOP_CENTER,
//       })
//     }
//   } catch (error) {
//     console.error('Error creating customer:', error)
//     // Handle error state
//     if (props.edit) {
//       toast.error('Error Updating Customer', {
//         position: toast.POSITION.TOP_CENTER,
//       })
//     } else {
//       toast.error('Error Updating Customer', {
//         position: toast.POSITION.TOP_CENTER,
//       })
//     }
//     isLoading.value = false
//   } finally {
//     isLoading.value = false
//   }
// }
</script>

<template>
  <!--Add customer Popup-->
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[520px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-row justify-between items-center p-5">
      <div class="flex flex-row items-center gap-3">
        <div
          class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
        >
          <IconAccount class="w-8 h-8" />
        </div>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">{{ props.edit ? 'Edit' : 'Add' }} Customer</h2>
          <p class="text-gray-600">
            {{ props.edit ? 'Edit Customer Information' : 'Add new customer to your business' }}
          </p>
        </div>
      </div>
      <button
        @click="emit('confirm')"
        type="button"
        class="border border-black rounded p-1 flex items-center justify-center"
      >
        <IconCancel color="black" class="w-5 h-5" />
      </button>
    </div>
    <form @submit.prevent="handleSubmit">
      <div class="px-5">
        <div class="flex flex-col">
          <DynamicInput v-model="customerData.name" type="text" placeholder="Enter Customer Name" />
          <div
            class="relative mb-4 w-full focus-within:ring-1 ring-mainColor flex items-center border border-gray-300 rounded-md overflow-hidden"
          >
            <div class="relative">
              <button
                @click="open = !open"
                type="button"
                class="flex items-center gap-2 p-2 border-r border-gray-400 rounded-l-md"
              >
                <img
                  :src="`https://flagcdn.com/w40/${selectedFlag}.png`"
                  class="w-5 h-5"
                  alt="Flag"
                />
                <span>{{ selectedCode }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <div v-if="open" class="absolute left-0 mt-1 w-[120px] bg-white rounded shadow-md">
                <button
                  v-for="country in countries"
                  :key="country.code"
                  @click="selectCountry(country)"
                  class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                >
                  <img
                    :src="`https://flagcdn.com/w40/${country.flag}.png`"
                    class="w-5 h-5"
                    :alt="`${country.flag} Flag`"
                  />
                  <span>{{ country.code }}</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              required
              class="w-full p-2 pr-10 focus:outline-none text-sm"
              placeholder="913 673 909"
              v-model="customerData.phone"
            />
          </div>

          <!-- <div v-if="false" class="flex flex-row gap-3">
            <select
              id="Country"
              name="Country"
              class="w-[230px] h-[40px] border border-gray-400 px-2 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
            >
              <option value="" disabled selected>Country</option>
              <option value="South Africa">South Africa</option>
              <option value="Egypt">Egypt</option>
              <option value="India">India</option>
              <option value="Australia">Australia</option>
              <option value="Brazil">Brazil</option>
            </select>
            <select
              id="State"
              name="State"
              class="w-[230px] h-[40px] border border-gray-400 px-2 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
            >
              <option value="" disabled selected>State</option>
              <option value="KwaZulu-Natal">KwaZulu-Natal</option>
              <option value="Punjab ">Punjab</option>
              <option value="Bavaria">Bavaria</option>
              <option value="São Paulo ">São Paulo</option>
              <option value="Queensland">Queensland</option>
            </select>
          </div> -->

          <DynamicInput
            v-model="customerData.email"
            type="email"
            placeholder="Enter Customer Email"
          />

          <textarea
            class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm"
            name=""
            id=""
            cols="30"
            rows="2"
            placeholder="Enter Address"
            v-model="customerData.address"
          ></textarea>
        </div>
      </div>
      <div class="mt-3 bg-[#f7f8fa] h-[99px] rounded-bl-2xl rounded-br-2xl flex items-center">
        <div class="flex flex-row items-center justify-end space-x-2 w-full px-4">
          <button
            class="px-4 py-2 border border-gray-400 rounded-md text-black hover:bg-gray-100 transition"
            type="button"
            @click="emit('confirm')"
            :disabled="isLoading"
          >
            <span class="text-[#05716c]">Cancel</span>
          </button>
          <button
            class="mainBtn flex items-center justify-center transition duration-300 rounded-md"
            type="submit"
            :disabled="isLoading"
          >
            <IconAccount2 class="w-5 h-5" />
            <span>Save Customer Info</span>
          </button>
        </div>
      </div>
    </form>
  </VueFinalModal>
</template>
