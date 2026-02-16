# Exotel Integration Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Configuration](#configuration)
4. [Features](#features)
5. [API Endpoints](#api-endpoints)
6. [Webhooks](#webhooks)
7. [Call Flow](#call-flow)
8. [Frontend Components](#frontend-components)
9. [Database Schema](#database-schema)
10. [Security](#security)
11. [Error Handling](#error-handling)

## Overview

The Exotel integration enables telephony capabilities within the CRM system, allowing users to make and receive calls directly from the application. Exotel is a cloud-based telephony platform that provides voice calling services.

### Key Capabilities
- Outgoing calls initiated from the CRM
- Incoming call handling and routing
- Automatic call logging and tracking
- Call recording (optional)
- Real-time call status updates via WebSocket
- Contact/Lead/Deal association with calls
- Call notes and task creation

## Architecture

### Backend Structure

```
crm/
├── fcrm/doctype/crm_exotel_settings/
│   ├── crm_exotel_settings.json         # DocType definition
│   ├── crm_exotel_settings.py           # Settings validation logic
│   ├── crm_exotel_settings.js           # Frontend controller
│   └── test_crm_exotel_settings.py      # Unit tests
├── integrations/
│   ├── api.py                            # Common integration APIs
│   └── exotel/
│       └── handler.py                    # Exotel webhook & API handler
└── fcrm/doctype/
    ├── crm_call_log/                     # Call logging DocType
    └── crm_telephony_agent/              # Agent configuration
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── Telephony/
│   │   ├── ExotelCallUI.vue             # Exotel-specific call UI
│   │   ├── CallUI.vue                    # Generic call UI wrapper
│   │   └── TaskPanel.vue                 # Task creation panel
│   └── Settings/
│       └── TelephonySettings.vue         # Telephony configuration UI
└── composables/
    └── settings.js                       # Settings state management
```

## Configuration

### CRM Exotel Settings

The integration requires the following configuration fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | Check | No | Enable/disable Exotel integration |
| `account_sid` | Data | Yes* | Exotel Account SID |
| `api_key` | Data | Yes* | Exotel API Key |
| `api_token` | Password | Yes* | Exotel API Token (encrypted) |
| `subdomain` | Data | Yes* | Exotel API subdomain (e.g., api.exotel.com) |
| `webhook_verify_token` | Data | Yes* | Token for webhook authentication |
| `record_call` | Check | No | Enable call recording for outgoing calls |

*Required when `enabled` is checked

### Credential Validation

The system automatically validates credentials when settings are saved:

**File:** `crm/fcrm/doctype/crm_exotel_settings/crm_exotel_settings.py:14-26`

```python
def verify_credentials(self):
    if self.enabled:
        response = requests.get(
            "https://{subdomain}/v1/Accounts/{sid}".format(
                subdomain=self.subdomain, sid=self.account_sid
            ),
            auth=(self.api_key, self.get_password("api_token")),
        )
        if response.status_code != 200:
            frappe.throw(
                _(f"Please enter valid exotel Account SID, API key & API token: {response.reason}"),
                title=_("Invalid credentials"),
            )
```

### Telephony Agent Configuration

Each user who needs to make/receive calls must be configured as a Telephony Agent:

**DocType:** CRM Telephony Agent

| Field | Description |
|-------|-------------|
| `user` | Link to User (unique identifier) |
| `mobile_no` | User's mobile number for outgoing calls |
| `exotel` | Enable Exotel for this user |
| `exotel_number` | Exotel virtual number assigned to user |
| `default_medium` | Default calling medium (Twilio/Exotel) |

### Permissions

- **System Manager & Sales Manager:** Full access to settings
- **All:** Read-only access to settings
- **Sales User & Sales Manager:** Create, read, update call logs

## Features

### 1. Outgoing Calls

Users can initiate calls from:
- Lead detail page
- Deal detail page
- Contact cards
- Any interface with phone numbers

**Implementation:** `crm/integrations/exotel/handler.py:69-130`

Key features:
- Automatic caller ID validation
- Exotel phone number (exophone) validation
- Optional call recording
- Status callback configuration
- Automatic call log creation

### 2. Incoming Calls

Incoming calls are:
- Routed to configured agents
- Automatically logged in the system
- Associated with existing Contacts/Leads/Deals
- Displayed in real-time via WebSocket

**Implementation:** `crm/integrations/exotel/handler.py:20-66`

### 3. Call Logging

Every call creates a CRM Call Log entry with:
- Unique call ID (from Exotel)
- Call direction (Incoming/Outgoing)
- Participants (from/to numbers)
- Status tracking (Ringing, In Progress, Completed, etc.)
- Duration
- Recording URL (if recorded)
- Start and end timestamps
- Automatic linking to Lead/Deal/Contact

**File:** `crm/fcrm/doctype/crm_call_log/crm_call_log.json`

Call statuses:
- Initiated
- Ringing
- In Progress
- Completed
- Failed
- Busy
- No Answer
- Queued
- Canceled

### 4. Real-time Updates

The system uses Frappe's WebSocket (frappe.publish_realtime) to push call events to connected clients:

**File:** `crm/integrations/exotel/handler.py:42`

```python
frappe.publish_realtime("exotel_call", call_payload)
```

Frontend subscribes to these events:

**File:** `frontend/src/components/Telephony/ExotelCallUI.vue:420-439`

```javascript
$socket.on('exotel_call', (data) => {
    // Handle call updates
})
```

### 5. Contact/Lead/Deal Linking

Calls are automatically linked to:
1. **Contact** - if phone number matches a contact
2. **Lead** - if phone number matches an unconverted lead
3. **Deal** - if contact is associated with a deal

**Implementation:** `crm/integrations/exotel/handler.py:211-223`

The linking logic:
- Searches contacts first
- Falls back to leads if no contact found
- Prioritizes deals over standalone contacts
- Uses phone number normalization for matching

### 6. Call Notes and Tasks

Users can create:
- **Notes:** Text notes about the call
- **Tasks:** Follow-up tasks with due dates and assignments

**API Endpoints:**
- `crm.integrations.api.add_note_to_call_log`
- `crm.integrations.api.add_task_to_call_log`

**Files:**
- `crm/integrations/api.py:48-67` (Notes)
- `crm/integrations/api.py:70-104` (Tasks)

## API Endpoints

### 1. Make Outgoing Call

**Endpoint:** `crm.integrations.exotel.handler.make_a_call`

**Method:** POST (Frappe whitelist)

**Parameters:**
- `to_number` (required): Destination phone number
- `from_number` (optional): Caller's mobile number (defaults to user's configured number)
- `caller_id` (optional): Exotel number to use (defaults to user's configured exophone)

**Returns:** Call details object with CallSid

**Example:**
```python
# Frontend call
createResource({
    url: 'crm.integrations.exotel.handler.make_a_call',
    params: { to_number: '+919876543210' },
    auto: true
})
```

### 2. Handle Webhook

**Endpoint:** `crm.integrations.exotel.handler.handle_request`

**Method:** POST (Allow guest with key validation)

**URL Format:**
```
https://<site>/api/method/crm.integrations.exotel.handler.handle_request?key=<webhook_verify_token>
```

**Parameters:** All Exotel webhook parameters (form data)

**Security:** Token-based authentication via query parameter

### 3. Check Integration Status

**Endpoint:** `crm.integrations.exotel.handler.is_integration_enabled`

**Method:** GET

**Returns:** Boolean indicating if Exotel is enabled

### 4. Get Contact by Phone

**Endpoint:** `crm.integrations.api.get_contact_by_phone_number`

**Method:** GET

**Parameters:**
- `phone_number`: Phone number to search

**Returns:** Contact/Lead details with image, name, mobile_no, and linked deal/lead

## Webhooks

### Webhook Configuration

Exotel webhooks must be configured to call:
```
https://<your-site>/api/method/crm.integrations.exotel.handler.handle_request?key=<your_webhook_verify_token>
```

### Webhook Events

The handler processes these Exotel events:

#### Outgoing Calls
- **answered:** Call is being dialed (Legs[0] in progress, Legs[1] empty)
- **answered:** Call connected (both legs in progress)
- **terminal:** Call ended (completed/no-answer/busy/failed)

#### Incoming Calls
- **Dial:** Incoming call ringing
- **incomplete:** Call not answered or failed
- **completed/client-hangup:** Call finished

### Status Callback Events

For outgoing calls, the system requests these callback events:

**File:** `crm/integrations/exotel/handler.py:106-108`

```python
"StatusCallbackEvents[0]": "terminal",
"StatusCallbackEvents[1]": "answered",
```

## Call Flow

### Outgoing Call Flow

```
1. User clicks call button in UI
   ↓
2. Frontend calls make_a_call API
   ↓
3. Backend validates:
   - Integration enabled
   - User has mobile number configured
   - User has Exotel number assigned
   - Exotel number is valid (in account)
   ↓
4. Backend makes API call to Exotel
   POST to: /Calls/connect.json
   Parameters:
   - From: User's mobile number
   - To: Destination number
   - CallerId: Exotel number
   - Record: true/false
   - StatusCallback: Webhook URL
   ↓
5. Create initial call log (status: Ringing)
   ↓
6. Exotel initiates call
   ↓
7. Webhook updates received:
   a. answered (ringing) → Update status
   b. answered (connected) → Update status, start timer
   c. terminal → Update status, duration, recording
   ↓
8. Frontend receives real-time updates via WebSocket
   ↓
9. Call UI updates automatically
```

### Incoming Call Flow

```
1. Call arrives at Exotel number
   ↓
2. Exotel routes to configured agent
   ↓
3. Exotel sends webhook to CRM
   ↓
4. Handler validates webhook token
   ↓
5. Create/Update call log
   ↓
6. Link call to Contact/Lead/Deal
   ↓
7. Publish real-time event to frontend
   ↓
8. Frontend shows incoming call popup
   ↓
9. Subsequent webhooks update call status
   ↓
10. Call UI reflects current status
```

## Frontend Components

### ExotelCallUI.vue

**Location:** `frontend/src/components/Telephony/ExotelCallUI.vue`

Main component for Exotel call interface with:

**Features:**
- Draggable call popup window
- Minimizable to small indicator
- Call status display with live timer
- Contact information display
- Note taking interface (TextEditor)
- Task creation panel
- Quick navigation to Deal/Lead

**Key Methods:**
- `makeOutgoingCall(number)`: Initiates outgoing call
- `setup()`: Sets up WebSocket listener
- `updateStatus(data)`: Parses Exotel webhook data to determine call status
- `toggleCallPopup()`: Minimizes/maximizes call window
- `save()` / `update()`: Saves notes and tasks

**State Management:**
```javascript
const callStatus = ref('')        // Current call status
const phoneNumber = ref('')       // Phone number being called
const callData = ref(null)        // Full call data from Exotel
const contact = ref({})           // Associated contact details
const note = ref({})              // Call note
const task = ref({})              // Follow-up task
```

### CallUI.vue

**Location:** `frontend/src/components/Telephony/CallUI.vue`

Wrapper component that:
- Manages both Twilio and Exotel instances
- Provides unified call interface
- Handles calling medium selection
- Sets default calling medium

**Key Logic:**
```javascript
function makeCall(number) {
  if (twilioEnabled && exotelEnabled && !defaultCallingMedium) {
    // Show selection dialog
  } else {
    // Use default or only available medium
  }
}
```

### TelephonySettings.vue

**Location:** `frontend/src/components/Settings/TelephonySettings.vue`

Settings interface that:
- Displays Exotel configuration form
- Allows System Managers to configure settings
- Validates settings on save
- Shows real-time validation errors
- Manages default calling medium per user

**Key Features:**
- Dynamic field layout from DocType
- Tab-based organization
- Dirty state tracking
- Error display

## Database Schema

### CRM Exotel Settings (Single DocType)

```sql
CREATE TABLE `tabCRM Exotel Settings` (
    name VARCHAR(140) PRIMARY KEY,
    enabled TINYINT(1) DEFAULT 0,
    account_sid VARCHAR(140),
    api_key VARCHAR(140),
    api_token TEXT,  -- Encrypted
    subdomain VARCHAR(140),
    webhook_verify_token VARCHAR(140),
    record_call TINYINT(1) DEFAULT 0,
    ...
)
```

### CRM Call Log

```sql
CREATE TABLE `tabCRM Call Log` (
    name VARCHAR(140) PRIMARY KEY,
    id VARCHAR(140) UNIQUE,  -- Exotel CallSid
    telephony_medium VARCHAR(140),  -- 'Exotel'
    from VARCHAR(140) NOT NULL,
    to VARCHAR(140) NOT NULL,
    type VARCHAR(140) NOT NULL,  -- Incoming/Outgoing
    status VARCHAR(140) NOT NULL,
    duration INT,  -- Seconds
    start_time DATETIME,
    end_time DATETIME,
    medium VARCHAR(140),  -- Exotel PhoneNumberSid
    recording_url VARCHAR(140),
    caller VARCHAR(140),  -- Link to User (outgoing)
    receiver VARCHAR(140),  -- Link to User (incoming)
    reference_doctype VARCHAR(140),
    reference_docname VARCHAR(140),
    note VARCHAR(140),  -- Link to FCRM Note
    ...
)
```

### CRM Telephony Agent

```sql
CREATE TABLE `tabCRM Telephony Agent` (
    name VARCHAR(140) PRIMARY KEY,
    user VARCHAR(140) UNIQUE NOT NULL,  -- Link to User
    user_name VARCHAR(140),
    mobile_no VARCHAR(140),
    default_medium VARCHAR(140),  -- Twilio/Exotel
    exotel TINYINT(1) DEFAULT 0,
    exotel_number VARCHAR(140),
    ...
)
```

## Security

### Webhook Authentication

Since Exotel doesn't support request signatures, the system uses token-based authentication:

**Implementation:** `crm/integrations/exotel/handler.py:162-170`

```python
def validate_request():
    webhook_verify_token = frappe.db.get_single_value("CRM Exotel Settings", "webhook_verify_token")
    key = frappe.request.args.get("key")
    is_valid = key and key == webhook_verify_token

    if not is_valid:
        frappe.throw(_("Unauthorized request"), exc=frappe.PermissionError)
```

### Best Practices

1. **Token Security:**
   - Use a strong, randomly generated webhook_verify_token
   - Store API token encrypted (Password field type)
   - Never expose tokens in logs

2. **API Access:**
   - Webhook endpoint allows guest access (required for Exotel)
   - All other endpoints require authentication
   - Permissions controlled via DocType roles

3. **Input Validation:**
   - Phone numbers normalized before searching
   - Exotel number validated against account's exophones
   - Credentials validated on settings save

4. **Data Privacy:**
   - Recording URLs stored securely
   - Call logs respect CRM permissions
   - User phone numbers stored in agent configuration

## Error Handling

### API Errors

**File:** `crm/integrations/exotel/handler.py:112-114`

```python
except requests.exceptions.HTTPError:
    if exc := response.json().get("RestException"):
        frappe.throw(bleach.linkify(exc.get("Message")), title=_("Exotel Exception"))
```

### Webhook Errors

**File:** `crm/integrations/exotel/handler.py:58-66`

```python
except Exception:
    request_log.status = "Failed"
    request_log.error = frappe.get_traceback()
    frappe.db.rollback()
    frappe.log_error(title="Error while creating/updating call record")
    frappe.db.commit()
```

All webhook errors are:
- Logged to Error Log
- Tracked in Integration Request logs
- Don't break the webhook response (always returns 200)

### Common Error Scenarios

1. **Invalid Credentials:**
   - Caught during settings save
   - Displays clear error message
   - Prevents saving invalid configuration

2. **Missing Agent Configuration:**
   - Throws error: "You do not have Exotel Number set in your Telephony Agent"
   - Throws error: "You do not have mobile number set in your Telephony Agent"

3. **Invalid Exotel Number:**
   - Validates against account's exophones
   - Throws error: "Exotel Number {0} is not valid"

4. **Integration Disabled:**
   - Throws error: "Please setup Exotel integration"
   - Returns early from webhook handler

## References

### Exotel Documentation
- API Reference: https://developer.exotel.com/api/
- Passthru Applet: https://support.exotel.com/support/solutions/articles/48283-working-with-passthru-applet

### Related Files
- Backend Handler: `crm/integrations/exotel/handler.py`
- Settings DocType: `crm/fcrm/doctype/crm_exotel_settings/`
- Frontend UI: `frontend/src/components/Telephony/ExotelCallUI.vue`
- Integration API: `crm/integrations/api.py`
- Call Log DocType: `crm/fcrm/doctype/crm_call_log/`
- Telephony Agent: `crm/fcrm/doctype/crm_telephony_agent/`

### Contact Matching Logic

The system uses sophisticated phone number matching:

**File:** `crm/integrations/api.py:107-181`

1. Parse phone number with country code
2. Normalize number (remove spaces, dashes, parentheses, plus signs)
3. Search contacts with normalized matching
4. Validate numbers using phonenumbers library
5. Fallback to leads if no contact found
6. Return first match with deal association priority

### Status Mapping

**File:** `crm/integrations/exotel/handler.py:231-259`

Exotel statuses are mapped to CRM statuses:

| Exotel Status | Call Type | CRM Status |
|---------------|-----------|------------|
| completed | any | Completed |
| in-progress | outbound-api | In Progress |
| busy | any | Ringing |
| no-answer | incomplete | No Answer |
| failed | incomplete | Failed |
| canceled | client-hangup | Canceled |

---

**Document Version:** 1.0
**Last Updated:** 2026-02-16
**Maintained By:** CRM Development Team
