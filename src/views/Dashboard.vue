<script setup>
// import TheHeader from '../components/TheHeader.vue'
import TheSideBar from '../components/TheSidebar.vue'
import { RouterView } from 'vue-router'
import TheMobileMenu from '@/components/TheMobileMenu.vue'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import PopUpNotification from '@/components/PopUpNotification.vue'
import { useModal } from 'vue-final-modal'
import PopupSuscription from '@/components/PopupSuscription.vue'

const { privileges, notificationData, user } = useUserStore()

const { open: openPayment, close: closePayment } = useModal({
  component: PopupSuscription,
  attrs: {
    onPaid() {
      closePayment()
    },
  },
})

const { open, close } = useModal({
  component: PopUpNotification,
  attrs: {
    onConfirm() {
      close()
    },
  },
})

onMounted(() => {
  if (
    (privileges.can_view_products && (notificationData.expiring || notificationData.low_stock)) ||
    (privileges.can_view_sales_records && notificationData.due_payments)
  ) {
    open()
  }

  // const expiration = new Date(notificationData.subscription_expiry).getTime()
  // console.log('Expiration Time:', notificationData.subscription_expiry, 'Current Time:', Date.now())
  // if (Date.now() >= expiration) {
  //   openPayment()
  // }

  const expiryDate = `${notificationData.subscription_expiry}T23:59:59.999`
  const expiration = new Date(expiryDate).getTime()
  // console.log(new Date(1756421999999).toString())
  console.log('subscription_expiry:', notificationData.subscription_expiry)

  if (Date.now() >= expiration) {
    openPayment()
  }
})

// import { watch } from 'vue'

// watch(
//   () => notificationData.subscription_expiry,
//   (expiry) => {
//     if (!expiry) return

//     const expiration = new Date(`${expiry}T23:59:59.999`).getTime()

//     if (Date.now() <= expiration) {
//       openPayment()
//     }
//   },
//   { immediate: true }
// )

</script>

<template>
  <!-- <TheHeader /> -->
  <TheSideBar />
  <!-- <TheMobileMenu /> -->

  <main class="min-h-[100dvh] overflow-y-auto mx-5 py-5 lg:ml-[270px] pb-[60px]">
    <!-- Global route-specific loading indicator -->
    <!-- <LoadingIndicator :routeName="$route.name" :text="`Loading ${$route.name}...`" /> -->
    <RouterView />
  </main>
</template>
