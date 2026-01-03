import { createRouter, createWebHistory } from 'vue-router'
import { userResource } from '@/stores/user'
import { sessionStore } from '@/stores/session'
import { viewsStore } from '@/stores/views'

/**
 * Wrap a promise with a timeout to prevent navigation deadlock
 * @param {Promise} promise - The promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} name - Name of the promise for logging
 * @returns {Promise} - Promise that rejects on timeout
 */
function withTimeout(promise, ms = 5000, name = 'Promise') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        console.error(`[Router] Timeout waiting for ${name} (${ms}ms)`)
        reject(new Error(`Timeout waiting for ${name}`))
      }, ms)
    ),
  ])
}

const routes = [
  {
    path: '/',
    name: 'Home',
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/MobileNotification.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
  },
  {
    alias: '/leads',
    path: '/leads/view/:viewType?',
    name: 'Leads',
    component: () => import('@/pages/Leads.vue'),
  },
  {
    path: '/leads/:leadId',
    name: 'Lead',
    component: () => import(`@/pages/${handleMobileView('Lead')}.vue`),
    props: true,
  },
  {
    alias: '/deals',
    path: '/deals/view/:viewType?',
    name: 'Deals',
    component: () => import('@/pages/Deals.vue'),
  },
  {
    path: '/deals/:dealId',
    name: 'Deal',
    component: () => import(`@/pages/${handleMobileView('Deal')}.vue`),
    props: true,
  },
  {
    alias: '/notes',
    path: '/notes/view/:viewType?',
    name: 'Notes',
    component: () => import('@/pages/Notes.vue'),
  },
  {
    alias: '/tasks',
    path: '/tasks/view/:viewType?',
    name: 'Tasks',
    component: () => import('@/pages/Tasks.vue'),
  },
  {
    alias: '/contacts',
    path: '/contacts/view/:viewType?',
    name: 'Contacts',
    component: () => import('@/pages/Contacts.vue'),
  },
  {
    path: '/contacts/:contactId',
    name: 'Contact',
    component: () => import(`@/pages/${handleMobileView('Contact')}.vue`),
    props: true,
  },
  {
    alias: '/organizations',
    path: '/organizations/view/:viewType?',
    name: 'Organizations',
    component: () => import('@/pages/Organizations.vue'),
  },
  {
    path: '/organizations/:organizationId',
    name: 'Organization',
    component: () => import(`@/pages/${handleMobileView('Organization')}.vue`),
    props: true,
  },
  {
    alias: '/call-logs',
    path: '/call-logs/view/:viewType?',
    name: 'Call Logs',
    component: () => import('@/pages/CallLogs.vue'),
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('@/pages/Welcome.vue'),
  },
  {
    path: '/:invalidpath',
    name: 'Invalid Page',
    component: () => import('@/pages/InvalidPage.vue'),
  },
]

const handleMobileView = (componentName) => {
  return window.innerWidth < 768 ? `Mobile${componentName}` : componentName
}

let router = createRouter({
  history: createWebHistory('/crm'),
  routes,
})

router.beforeEach(async (to, from, next) => {
  try {
    const { isLoggedIn } = sessionStore()

    // Wait for user resource with timeout protection
    if (isLoggedIn) {
      try {
        await withTimeout(userResource.promise, 5000, 'userResource')
      } catch (error) {
        console.error('[Router] Failed to load user resource:', error)
        // Continue navigation even if user resource fails to load
        // The app can handle missing user data gracefully
      }
    }

    if (to.name === 'Home' && isLoggedIn) {
      const { views, getDefaultView } = viewsStore()

      // Wait for views with timeout protection
      try {
        await withTimeout(views.promise, 5000, 'views')
      } catch (error) {
        console.error('[Router] Failed to load views:', error)
        // Fallback to default Leads view if views fail to load
        next({ name: 'Leads' })
        return
      }

      let defaultView = getDefaultView()
      if (!defaultView) {
        next({ name: 'Leads' })
        return
      }

      let { route_name, type, name, is_standard } = defaultView
      route_name = route_name || 'Leads'

      if (name && !is_standard) {
        next({ name: route_name, params: { viewType: type }, query: { view: name } })
      } else {
        next({ name: route_name, params: { viewType: type } })
      }
    } else if (!isLoggedIn) {
      window.location.href = '/login?redirect-to=/crm'
    } else if (to.matched.length === 0) {
      next({ name: 'Invalid Page' })
    } else if (['Deal', 'Lead'].includes(to.name) && !to.hash) {
      let storageKey = to.name === 'Deal' ? 'lastDealTab' : 'lastLeadTab'
      const activeTab = localStorage.getItem(storageKey) || 'activity'
      const hash = '#' + activeTab
      next({ ...to, hash })
    } else {
      next()
    }
  } catch (error) {
    // Global error handler for navigation guard
    console.error('[Router] Navigation guard error:', error)
    // Allow navigation to proceed even if guard fails
    // This prevents the app from freezing completely
    next()
  }
})

export default router
