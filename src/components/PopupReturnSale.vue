<script setup>
import { ref, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import axios from 'axios'
import IconCheckCertificate from './IconCheckCertificate.vue'
import IconCancel from './IconCancel.vue'
import { useUserStore } from '@/stores/user'
import { toast } from 'vue3-toastify'

const { user } = useUserStore()

const emits = defineEmits(['confirm'])

const props = defineProps({
  orderItem: {
    type: Object,
    default: () => ({}),
  },
})

const isLoading = ref(false)

const returnType = ref('returnable')
const note = ref('')
const returnAmount = ref(0)

const validateReturn = computed(() => {
  if (isLoading.value) return false
  else
    return (
      returnType.value &&
      returnAmount.value > 0 &&
      returnAmount.value <= props.orderItem.qty &&
      note.value.trim() !== ''
    )
})

const submitReturnData = async () => {
  isLoading.value = true

  try {
    const { data, status } = await axios.post(
      `returnitem/${user.userType}/${props.orderItem.id}/${returnType.value}/${returnAmount.value}`,
      {
        note: note.value,
      },
    )

    if (status === 202 && data.success) {
      toast.success('Item Returned Successfully', {
        position: toast.POSITION.TOP_CENTER,
      })
      emits('confirm', true)
    } else {
      toast.error('An error occurred while processing the return.', {
        position: toast.POSITION.TOP_CENTER,
      })
    }
  } catch (error) {
    console.error('Error submitting return data:', error)
    toast.error('An error occurred while processing the return.', {
      position: toast.POSITION.TOP_CENTER,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[450px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-col gap-4 h-full w-full p-5">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-row gap-3">
          <div
            class="mt-1.5 w-10 h-10 bg-[rgba(175,53,133,0.1)] rounded-sm flex items-center justify-center"
          >
            <IconCheckCertificate color="#9c417c" />
          </div>
          <div class="flex flex-col justify-center">
            <h2 class="text-lg font-semibold">Return Sale</h2>
            <p class="text-gray-600">Record stocks returned by customers</p>
          </div>
        </div>
        <button
          @click="emits('confirm')"
          class="border border-black rounded p-1 flex items-center justify-center"
        >
          <IconCancel color="black" class="w-5 h-5" />
        </button>
      </div>
      <div class="space-y-2 bg-gray-200 p-2 rounded-md">
        <div class="flex flex-row gap-2 items-center">
          <p>Item Name:</p>
          <p class="flex-1 text-end" v-text="orderItem.product_name"></p>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <p>Quantity:</p>
          <p class="flex-1 text-end" v-text="orderItem.qty"></p>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <p>Sub Total:</p>
          <p
            class="flex-1 text-end"
            v-text="
              orderItem.subtotal.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })
            "
          ></p>
        </div>
      </div>

      <form class="space-y-2.5">
        <div class="flex flex-col gap-2">
          <label for="payment_mode" class="text-sm font-semibold"
            >Is Item Returned back to store?</label
          >
          <select
            id="payment_mode"
            v-model="returnType"
            class="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-mainColor"
          >
            <option value="returnable">Yes</option>
            <option value="nonreturnable">No</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="return_amount" class="text-sm font-semibold">Quantity to Return</label>
          <input
            type="number"
            placeholder="Enter Quantity to return"
            min="1"
            :max="orderItem.qty"
            id="return_amount"
            v-model="returnAmount"
            class="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-mainColor"
          />
        </div>

        <div>
          <label class="block mb-2">Reason for Return <i>(Required)</i></label>
          <textarea
            class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm"
            name=""
            id=""
            cols="30"
            rows="2"
            v-model="note"
          ></textarea>
        </div>
      </form>
      <div class="flex flex-row gap-3 mt-auto">
        <button
          class="w-full flex items-center justify-center gap-2 px-4 py-2 w-35 border border-gray-400 rounded-md text-black hover:bg-gray-100 transition"
          @click="emits('confirm')"
          :disabled="isLoading"
          type="button"
        >
          <span class="text-[#9c417c]">Cancel</span>
        </button>
        <button
          class="w-full mainBtn flex items-center justify-center transition duration-300 rounded-md"
          :disabled="!validateReturn"
          type="submit"
          @click="submitReturnData()"
        >
          <span>Submit sale return</span>
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>
