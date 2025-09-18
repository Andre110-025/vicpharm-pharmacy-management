<script setup>
import { ref, reactive, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import IconCheckCertificate from './IconCheckCertificate.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import DynamicInput from './DynamicInput.vue'
import { useFormatCurrency } from '@/formatCurrency'

const { user } = useUserStore()
const { formatCurrency } = useFormatCurrency()

const props = defineProps({
  sales: {
    type: Object,
    default: () => ({}),
  },
})

const emits = defineEmits(['confirm'])

// to two decimal places
const maxAmount = (props.sales.total_amount - props.sales.amount_paid).toFixed(2)
const isLoading = ref(false)

const paymentMode = ['credit', 'cash', 'POS', 'transfer']

const completeData = reactive({
  user_type: user.userType,
  payment_mode: null, // cash, transfer, POS
  amount_paid: 0,
  note: 'sale update',
  payment_status: null, // partially paid
  due_date: null,
})

const rules = computed(() => ({
  amount_paid: {
    required,
  },
  payment_mode: {
    required,
  },
}))

const v$ = useVuelidate(rules, completeData)

const completeSale = async () => {
  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  if (maxAmount > parseFloat(completeData.amount_paid)) {
    completeData.payment_status = 'partially paid'
  } else if (maxAmount == parseFloat(completeData.amount_paid)) {
    completeData.payment_status = 'paid'
  } else if (parseFloat(completeData.amount_paid) > maxAmount) {
    toast.error(`Amount paid cannot be greater than ${maxAmount}`, {
      position: toast.POSITION.TOP_CENTER,
    })
    return
  }
  // completeData.amount_paid = parseFloat(parseFloat(completeData.amount_paid))
  console.log(completeData, parseFloat(completeData.amount_paid) == maxAmount)

  isLoading.value = true
  try {
    const { data, status } = await axios.post(
      `editorderamount/${props.sales.order_code}`,
      completeData,
    )
    if (status === 202 && data.success) {
      toast.success('Sale Completed Successful', {
        position: toast.POSITION.TOP_CENTER,
      })
      emits('confirm', true)
    } else {
      toast.success('Sale Could not be Completed', {
        position: toast.POSITION.TOP_CENTER,
      })
      emits('confirm')
    }
  } catch (error) {
    console.error('Error completing sale:', error)
    emits('confirm', false)
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
    <div class="flex flex-col p-6">
      <div class="flex flex-row items-start gap-4">
        <div
          class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center"
        >
          <IconCheckCertificate color="#05716c" />
        </div>
        <div class="flex flex-col justify-center">
          <h2 class="text-lg font-semibold">Complete Sale</h2>
          <p class="text-gray-600">Enter Amount paid and payment mode used.</p>
        </div>
      </div>
    </div>
    <div>
      <form @submit.prevent="completeSale()" class="flex flex-col gap-4 px-6 py-4">
        <DynamicInput
          v-model="completeData.amount_paid"
          id="amount_paid"
          currency
          placeholder="0.00"
        >
          <template #label>
            <span class="text-sm font-semibold">
              Amount Paid
              <i>
                (Must not be greater than
                {{ formatCurrency(maxAmount, 2, false) }})
              </i>
            </span>
          </template>
        </DynamicInput>

        <DynamicInput
          v-model="completeData.due_date"
          label="Due Date"
          type="date"
          placeholder="Enter Due Date"
        />

        <div class="flex flex-col gap-2">
          <label for="payment_mode" class="text-sm font-semibold">Payment Mode</label>
          <select
            id="payment_mode"
            v-model="completeData.payment_mode"
            class="border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-mainColor"
          >
            <option class="capitalize" v-for="mode in paymentMode" :key="mode" :value="mode">
              {{ mode }}
            </option>
          </select>
        </div>

        <div class="flex flex-row gap-2.5 mt-2.5">
          <button
            type="button"
            @click="emits('confirm')"
            :disabled="isLoading"
            class="secondaryBtn rounded-md flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading || v$.$invalid"
            class="mainBtn rounded-md flex-1"
          >
            Update Sale
          </button>
        </div>
      </form>
    </div>
  </VueFinalModal>
</template>
