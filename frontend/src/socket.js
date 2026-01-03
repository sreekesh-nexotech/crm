import { io } from 'socket.io-client'
import { socketio_port } from '../../../../sites/common_site_config.json'
import { getCachedListResource } from 'frappe-ui/src/resources/listResource'
import { getCachedResource } from 'frappe-ui/src/resources/resources'
import { debounce } from 'lodash'

// Track reload events for monitoring
let reloadEventCount = 0
let reloadEventTimestamp = Date.now()

// Create a map to store debounced reload functions per cache_key
const debouncedReloads = new Map()

// Reset counter every minute for monitoring
setInterval(() => {
  const now = Date.now()
  const elapsed = now - reloadEventTimestamp
  if (elapsed >= 60000) {
    if (reloadEventCount > 50) {
      console.warn(
        `[Socket] High reload event rate detected: ${reloadEventCount} events in ${elapsed}ms`
      )
    }
    reloadEventCount = 0
    reloadEventTimestamp = now
  }
}, 60000)

export function initSocket() {
  let host = window.location.hostname
  let siteName = window.site_name
  let port = window.location.port ? `:${socketio_port}` : ''
  let protocol = port ? 'http' : 'https'
  let url = `${protocol}://${host}${port}/${siteName}`

  let socket = io(url, {
    withCredentials: true,
    reconnectionAttempts: 5,
  })

  socket.on('refetch_resource', (data) => {
    reloadEventCount++

    if (data.cache_key) {
      let resource =
        getCachedResource(data.cache_key) ||
        getCachedListResource(data.cache_key)

      if (resource) {
        // Get or create a debounced reload function for this cache_key
        if (!debouncedReloads.has(data.cache_key)) {
          // Debounce reload for 300ms to prevent reload storms
          // If multiple events for same resource arrive within 300ms, only reload once
          const debouncedFn = debounce(
            (res) => {
              if (import.meta.env.DEV) {
                console.log(`[Socket] Reloading resource: ${data.cache_key}`)
              }
              res.reload()
            },
            300,
            {
              leading: false,
              trailing: true,
              maxWait: 1000, // Force reload after max 1 second of continuous events
            }
          )
          debouncedReloads.set(data.cache_key, debouncedFn)
        }

        // Call the debounced reload function
        debouncedReloads.get(data.cache_key)(resource)
      }
    }
  })

  return socket
}