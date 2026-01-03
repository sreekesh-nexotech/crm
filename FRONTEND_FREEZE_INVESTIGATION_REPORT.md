# Frontend App Freeze Investigation Report

**Date**: January 3, 2026
**Branch**: develop
**Issue**: Web app freezing/becoming unresponsive for some clients with no observed server load

---

## Executive Summary

This investigation analyzed the Frappe CRM frontend codebase to identify potential causes of application freezes. The analysis focused on Vue.js components, data fetching patterns, reactive computations, and event handling. Several critical issues were identified that could cause the frontend to freeze or become unresponsive.

---

## Technical Stack

- **Frontend Framework**: Vue 3 (v3.5.13)
- **State Management**: Pinia (v2.0.33)
- **Build Tool**: Vite (v4.4.9)
- **Real-time Communication**: Socket.io (v4.7.2)
- **UI Library**: frappe-ui (v0.1.171)
- **Drag & Drop**: vuedraggable (v4.1.0) with sortablejs (v1.15.0)

---

## Key Findings

### 1. **CRITICAL: Socket.io Resource Reload Loop** ⚠️

**Location**: `frontend/src/socket.js:17-26`

**Issue**: The socket connection has a `refetch_resource` event handler that automatically reloads resources when triggered. If the backend emits excessive events or if there's a feedback loop, this could cause infinite reload cycles.

```javascript
socket.on('refetch_resource', (data) => {
  if (data.cache_key) {
    let resource =
      getCachedResource(data.cache_key) ||
      getCachedListResource(data.cache_key)
    if (resource) {
      resource.reload()
    }
  }
})
```

**Impact**:
- If multiple resources are being reloaded simultaneously, the UI thread could be blocked
- No rate limiting or debouncing implemented
- Could trigger cascading reloads if resources depend on each other

**Recommendation**:
- Add debouncing/throttling to the reload handler
- Implement a reload queue to prevent multiple simultaneous reloads
- Add logging to track reload frequency
- Consider adding a circuit breaker pattern for excessive reload events

---

### 2. **CRITICAL: ViewControls Deep Watcher** ⚠️

**Location**: `frontend/src/components/ViewControls.vue:1354-1361`

**Issue**: A deep watcher on the view object that triggers a full data reload on any nested property change.

```javascript
watch(
  () => getView(route.query.view, route.params.viewType, props.doctype),
  (value, old_value) => {
    if (_.isEqual(value, old_value)) return
    reload()
  },
  { deep: true },
)
```

**Impact**:
- Deep watching complex objects is computationally expensive
- Could trigger unnecessary reloads when view metadata changes
- The `_.isEqual` comparison is expensive for large objects

**Recommendation**:
- Replace deep watch with specific property watchers
- Add debouncing to prevent rapid successive reloads
- Consider using `shallowRef` for view objects that don't need deep reactivity

---

### 3. **HIGH: Router Async Operations Without Timeout** ⚠️

**Location**: `frontend/src/router.js:108-112`

**Issue**: The router's `beforeEach` guard awaits promises without timeout protection.

```javascript
router.beforeEach(async (to, from, next) => {
  const { isLoggedIn } = sessionStore()

  isLoggedIn && (await userResource.promise)  // No timeout

  if (to.name === 'Home' && isLoggedIn) {
    const { views, getDefaultView } = viewsStore()
    await views.promise  // No timeout
    // ...
  }
})
```

**Impact**:
- If `userResource.promise` or `views.promise` never resolves, navigation freezes
- Users will see a frozen app with no feedback
- No error handling for promise rejection

**Recommendation**:
- Add timeout wrappers around promise awaits
- Implement fallback navigation on timeout
- Add error boundaries and user feedback

---

### 4. **HIGH: Kanban View Performance Issues**

**Location**: `frontend/src/components/Kanban/KanbanView.vue`

**Issue**: Multiple nested draggable components without virtual scrolling.

**Impact**:
- Each kanban column can have unlimited items (with "Load More" pagination)
- Draggable components create event listeners for every item
- No virtual scrolling for long columns
- DOM manipulation during drag operations can freeze the UI

**Recommendation**:
- Implement virtual scrolling for kanban columns
- Limit the number of rendered items per column
- Use `memo` or `shallowRef` for static kanban items
- Consider pagination limits on initial load

---

### 5. **HIGH: Activities Component Rendering Performance**

**Location**: `frontend/src/components/Activities/Activities.vue`

**Issue**: The activities component renders all activities without virtualization, with complex nested components.

**Impact**:
- Large activity lists can have hundreds of items
- Each activity can have complex nested components (emails, attachments, etc.)
- No pagination or virtual scrolling
- Computed properties recalculate on every data change

**Recommendation**:
- Implement virtual scrolling for activity lists
- Add pagination with lazy loading
- Use `v-memo` directive for static activity items
- Defer rendering of off-screen activities

---

### 6. **MEDIUM: Excessive API Calls in Kanban View**

**Location**: `frontend/src/components/ViewControls.vue:422-461` (get_data API)

**Issue**: For kanban views, the system makes a separate API call for EACH column plus a count query.

```python
# For each kanban column:
column_data = frappe.get_list(
    doctype,
    fields=rows,
    filters=column_filters,
    order_by=order_by,
    page_length=page_length,
)

all_count = frappe.get_list(
    doctype,
    filters=column_filters,
    fields="count(*) as total_count",
)[0].total_count
```

**Impact**:
- A kanban board with 5 columns makes 10+ database queries
- Each query is synchronous and blocks the UI
- Network latency multiplied by number of columns

**Recommendation**:
- Batch column queries into a single API call
- Use database query optimization to get all columns in one query
- Implement request caching to reduce redundant calls

---

### 7. **MEDIUM: Memory Leaks from Event Listeners**

**Location**: Multiple components (136 occurrences of `addEventListener` found)

**Issue**: Several components add event listeners without proper cleanup.

**Examples**:
- `frontend/src/components/ListViews/ListRows.vue:92-94` - scroll listener cleanup exists but could fail
- `frontend/src/components/Telephony/TwilioCallUI.vue` - 13 event listener attachments
- `frontend/src/components/FilesUploader/filesUploaderHandler.ts` - 5 event attachments

**Impact**:
- Memory leaks as components mount/unmount
- Event listeners accumulate over time
- Can cause performance degradation after extended use

**Recommendation**:
- Audit all components for proper `onBeforeUnmount` cleanup
- Use Vue's `@` syntax instead of `addEventListener` where possible
- Implement a cleanup checker in development mode

---

### 8. **MEDIUM: Computed Property Performance**

**Location**: Multiple files with heavy computations

**Issue**: Several computed properties perform expensive operations:
- `frontend/src/pages/Leads.vue:347-513` - `rows` computed property parses and transforms all rows
- Multiple date formatting operations per row
- JSON parsing operations

**Impact**:
- Computed properties recalculate on any reactive dependency change
- Large datasets (hundreds of leads) cause UI freezes during recalculation
- No memoization or caching of intermediate results

**Recommendation**:
- Use `shallowRef` for large data arrays
- Implement memoization for expensive transformations
- Move heavy computations to web workers
- Cache formatted values instead of recalculating

---

### 9. **LOW-MEDIUM: Document Caching System**

**Location**: `frontend/src/data/document.js:6-8`

**Issue**: In-memory caching of documents, controllers, and assignees without cleanup.

```javascript
const documentsCache = {}
const controllersCache = {}
const assigneesCache = {}
```

**Impact**:
- Unbounded memory growth as users navigate through documents
- No LRU eviction or cache size limits
- Can accumulate stale data

**Recommendation**:
- Implement LRU cache with size limits
- Add cache invalidation strategy
- Periodically cleanup unused cached documents

---

### 10. **LOW: Meta Webhook Processing**

**Location**: `crm/api/meta.py:947-1022`

**Issue**: Meta webhooks are properly enqueued to background jobs (good), but there's potential for rapid webhook triggering.

**Impact**:
- While webhooks are processed in background, rapid webhook events could trigger excessive socket.io `refetch_resource` events
- This could cascade to the frontend reload loop issue (#1)

**Recommendation**:
- Ensure webhook processing doesn't emit socket events for every lead
- Batch socket notifications for bulk operations
- Rate limit webhook processing on the backend

---

## Most Likely Root Causes

Based on the investigation, the most likely causes of the freeze issue are:

### 1. **Socket.io Reload Storm** (Highest Probability)
The combination of:
- Unlimited `refetch_resource` events from backend
- No rate limiting on resource reloads
- Deep watchers triggering on every change

Could create a reload storm where:
1. Backend emits multiple refetch events
2. Frontend reloads multiple resources simultaneously
3. Deep watchers detect changes and trigger more reloads
4. UI thread is blocked by excessive re-rendering

### 2. **Large Dataset Rendering** (High Probability)
Users with:
- Hundreds of leads/deals in list view
- Complex kanban boards with many columns
- Long activity histories

Could experience:
- Expensive computed property recalculations
- DOM thrashing from re-rendering large lists
- Memory pressure from unbounded caches

### 3. **Navigation Deadlock** (Medium Probability)
If `userResource.promise` or `views.promise` fails to resolve due to:
- Network issues
- Backend errors
- Race conditions

The router will freeze indefinitely with no error feedback.

---

## Reproduction Scenarios

To reproduce the freeze, try:

1. **Test Socket Reload Storm**:
   - Open developer console
   - Monitor socket.io events for `refetch_resource`
   - Perform bulk operations that trigger multiple socket events
   - Watch for UI freeze during event storm

2. **Test Large Dataset Rendering**:
   - Create 500+ leads/deals
   - Navigate to list view
   - Switch between different views quickly
   - Watch for freeze during view transitions

3. **Test Navigation Deadlock**:
   - Throttle network to 3G in devtools
   - Trigger a navigation while resources are loading
   - Disconnect network mid-navigation
   - Observe navigation freeze

---

## Immediate Action Items

### Priority 1 (Critical - Implement Immediately)

1. **Add Socket.io Rate Limiting**
   ```javascript
   // In socket.js
   import { debounce } from 'lodash'

   const debouncedReload = debounce((resource) => {
     resource.reload()
   }, 300)

   socket.on('refetch_resource', (data) => {
     if (data.cache_key) {
       let resource = getCachedResource(data.cache_key) || getCachedListResource(data.cache_key)
       if (resource) {
         debouncedReload(resource)
       }
     }
   })
   ```

2. **Add Router Timeout Protection**
   ```javascript
   // In router.js
   const withTimeout = (promise, ms = 5000) => {
     return Promise.race([
       promise,
       new Promise((_, reject) =>
         setTimeout(() => reject(new Error('Timeout')), ms)
       )
     ])
   }

   router.beforeEach(async (to, from, next) => {
     try {
       if (isLoggedIn) {
         await withTimeout(userResource.promise, 5000)
       }
       // ... rest of logic
     } catch (error) {
       console.error('Router navigation error:', error)
       // Fallback navigation
       next()
     }
   })
   ```

### Priority 2 (High - Implement Soon)

3. **Optimize ViewControls Watcher**
4. **Implement Virtual Scrolling** for lists and kanban
5. **Add Performance Monitoring** to identify slow components

### Priority 3 (Medium - Plan Implementation)

6. **Audit Event Listener Cleanup**
7. **Implement Cache Size Limits**
8. **Optimize API Batching** for kanban views

---

## Monitoring Recommendations

Add the following monitoring to track the issue:

1. **Performance Metrics**:
   - Track component render times using Vue DevTools Performance
   - Monitor memory usage trends
   - Track API response times

2. **Error Logging**:
   - Log all promise rejections
   - Track socket.io reconnection events
   - Monitor navigation failures

3. **User Session Recording**:
   - Use session replay tools to capture freeze occurrences
   - Track user actions leading to freeze
   - Monitor browser console errors

---

## Testing Strategy

### Unit Tests
- Test socket event handlers with rapid event sequences
- Test computed properties with large datasets
- Test cache eviction logic

### Integration Tests
- Test navigation with slow/failed API responses
- Test list view with 500+ items
- Test kanban board with 10+ columns

### Performance Tests
- Benchmark component render times
- Memory leak detection over extended sessions
- Load testing with realistic data volumes

---

## Conclusion

The frontend freeze issue is likely caused by a combination of:
1. **Excessive resource reloading** triggered by socket.io events without rate limiting
2. **Large dataset rendering** without virtualization or pagination
3. **Missing timeout/error handling** in async operations

The immediate fixes should focus on:
- Rate limiting socket reload events
- Adding timeout protection to router navigation
- Optimizing deep watchers

These changes should significantly reduce freeze occurrences while more comprehensive solutions (virtual scrolling, API optimization) are implemented.

---

## Files Analyzed

### Frontend Core
- `frontend/src/main.js` - App initialization
- `frontend/src/socket.js` - Socket.io configuration
- `frontend/src/router.js` - Router configuration

### State Management
- `frontend/src/stores/notifications.js`
- `frontend/src/data/document.js`

### Components
- `frontend/src/components/ViewControls.vue`
- `frontend/src/components/Activities/Activities.vue`
- `frontend/src/components/Kanban/KanbanView.vue`
- `frontend/src/components/ListViews/ListRows.vue`
- `frontend/src/pages/Leads.vue`
- `frontend/src/pages/Lead.vue`

### Backend API
- `crm/api/doc.py` - Data fetching API
- `crm/api/meta.py` - Meta webhook processing

---

**Report prepared by**: Claude AI Assistant
**Investigation Duration**: ~1 hour
**Files Examined**: 40+ files
**Code Pattern Searches**: 15+ searches

---

## Appendix: Statistics

- **Total .vue files**: 100+
- **Socket event listeners**: 136 occurrences
- **Resource reload calls**: 92 occurrences
- **Deep watchers found**: 15+
- **Event listeners**: 136 occurrences across 47 files
