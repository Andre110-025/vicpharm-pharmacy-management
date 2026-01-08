import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import Dashboard from '@/views/Dashboard.vue'
import Overview from '@/components/Overview.vue'
import ViewCustomer from '../components/ViewCustomer.vue'
import ViewIncome from '../components/ViewIncome.vue'
import ViewSales from '../components/ViewSales.vue'
import ViewInventory from '../components/ViewInventory.vue'
import ViewInventoryByBrands from '../components/ViewInventoryByBrands.vue'
import ViewAdministration from '../components/ViewAdministration.vue'
import ViewTopSelling from '@/components/ViewTopSelling.vue'
import ViewActivityLog from '../components/ViewActivityLog.vue'
import ViewSetting from '../components/ViewSetting.vue'
import ViewProfile from '../components/ViewProfile.vue'
import { useUserStore } from '@/stores/user'
import { useLoadingStore } from '@/stores/loadingStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
      beforeEnter: (to, from, next) => {
        const { user } = useUserStore()
        if (!user.expirationTime && !user.token) {
          next()
        } else if (user.expirationTime && user.token) {
          next({ name: 'overview' })
        }
      },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('../components/AuthLogin.vue'),
        },
        {
          path: 'sign-up',
          name: 'signUp',
          component: () => import('../components/AuthSignUp.vue')
        },
        {
          path: 'forget-password',
          name: 'ForgetPassword',
          component: () => import('../components/AuthForgetPassword.vue'),
        },
        {
          path: 'auth-token',
          name: 'authToken',
          component: () => import('../components/AuthVerify.vue'),
          beforeEnter: (to, from) => {
            if (from.name == 'ForgetPassword') {
              return true
            } else {
              router.push('/forget-password')
            }
          },
        },
        {
          path: 'change-password',
          name: 'ChangePassword',
          component: () => import('../components/AuthResetPassword.vue'),
          beforeEnter: (to, from) => {
            if (from.name == 'authToken') {
              return true
            } else {
              router.push('/forget-password')
            }
          },
        },
      ],
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      beforeEnter: async (to, from, next) => {
        const { getUserDetails } = useUserStore()

        await getUserDetails()

        next()
      },
      children: [
        {
          path: '',
          name: 'overview',
          component: Overview,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_analytics) {
              next()
            } else {
              next({ name: 'Customers' })
            }
          },
        },
        {
          path: 'customers',
          name: 'Customers',
          component: ViewCustomer,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_customers) {
              next()
            } else {
              next({ name: 'Income' })
            }
          },
        },
        {
          path: 'income',
          name: 'Income',
          component: ViewIncome,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_income_records) {
              next()
            } else {
              next({ name: 'Sales' })
            }
          },
        },
        {
          path: 'sales',
          name: 'Sales',
          component: ViewSales,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_sales_records) {
              next()
            } else {
              next({ name: 'Inventory' })
            }
          },
        },
        {
          path: 'Inventory',
          name: 'Inventory',
          component: ViewInventory,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_products) {
              next()
            } else {
              next({ name: 'Administration' })
            }
          },
        },
        {
          path: 'inventory-by-brands',
          name: 'InventoryByBrands',
          component: ViewInventoryByBrands,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_products) {
              next()
            } else {
              next({ name: 'Administration' })
            }
          },
        },
        {
          path: 'inventory-by-top-selling',
          name: 'topSellingProducts',
          component: ViewTopSelling,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_products) {
              next()
            } else {
              next({ name: 'Administration' })
            }
          },
        },
        {
          path: 'administration',
          name: 'Administration',
          component: ViewAdministration,
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.can_view_staff) {
              next()
            } else {
              next({ name: 'ActivityLog' })
            }
          },
        },
        {
          path: 'activityLog',
          name: 'ActivityLog',
          component: () => import('../components/ViewActivityLog.vue'),
          beforeEnter: async (to, from, next) => {
            const { privileges } = useUserStore()

            if (privileges.view_other_staff_activities) {
              next()
            } else {
              next({ name: 'Settings' })
            }
          },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../components/ViewSetting.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../components/ViewProfile.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'login' } },
  ],
})

// Add global navigation guards
router.beforeEach((to, from, next) => {
  if (to.name) {
    useLoadingStore().startLoading(to.name)
  }
  next()
})

router.afterEach((to) => {
  if (to.name) {
    useLoadingStore().finishLoading(to.name)
  }
})

export default router
