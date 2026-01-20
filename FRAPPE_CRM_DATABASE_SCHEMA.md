# Frappe CRM - Complete Database Schema Documentation

**Generated Date:** 2026-01-20
**Total DocTypes:** 40
**Application:** Frappe CRM with Project Management, Support Ticketing, Quote Generation, and Basic Accounting

---

## Table of Contents

1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Relationship Diagram](#relationship-diagram)
4. [Indexes and Constraints](#indexes-and-constraints)
5. [Summary Statistics](#summary-statistics)

---

## Overview

This document provides a comprehensive analysis of all models (DocTypes) in the Frappe CRM application. The schema supports:

- **Core CRM**: Lead management, Deal management, Organization tracking
- **Communication**: Call logs, Notifications, Notes
- **Configuration**: Settings for integrations (Meta, Twilio, Exotel), SLAs, Territories
- **Customization**: Form scripts, Field layouts, View settings
- **Product Management**: Product catalog, Quotations

---

## Database Tables

### 1. CRM Call Log
**Table Name:** `tabCRM Call Log`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `id`
**Features:** Allow Import, Allow Rename, Editable Grid

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| id | Data | ID | No | Yes | No | 140 | - | Unique |
| from | Data | From | Yes | No | No | 140 | - | Not Null |
| to | Data | To | Yes | No | No | 140 | - | Not Null |
| status | Select | Status | Yes | No | No | 140 | - | Not Null, Options: Initiated/Ringing/In Progress/Completed/Failed/Busy/No Answer/Queued/Canceled |
| type | Select | Type | Yes | No | No | 140 | - | Not Null, Options: Incoming/Outgoing |
| duration | Duration | Duration | No | No | No | - | - | - |
| medium | Data | Medium | No | No | No | 140 | - | - |
| start_time | Datetime | Start Time | No | No | No | - | - | - |
| end_time | Datetime | End Time | No | No | No | - | - | - |
| recording_url | Data | Recording URL | No | No | No | 140 | - | - |
| receiver | Link | Call Received By | No | No | No | 140 | - | Foreign Key -> User |
| caller | Link | Caller | No | No | No | 140 | - | Foreign Key -> User |
| reference_doctype | Link | Reference Document Type | No | No | No | 140 | CRM Lead | Foreign Key -> DocType |
| reference_docname | Dynamic Link | Reference Name | No | No | No | 140 | - | Dynamic Foreign Key |
| note | Link | Note | No | No | No | 140 | - | Foreign Key -> FCRM Note |
| links | Table | Links | No | No | No | - | - | Child Table |
| telephony_medium | Select | Telephony Medium | No | No | No | 140 | - | Options: Manual/Twilio/Exotel |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **receiver** -> User (Cascade on delete)
- **caller** -> User (Cascade on delete)
- **reference_doctype** -> DocType
- **reference_docname** -> Dynamic (based on reference_doctype)
- **note** -> FCRM Note

---

### 2. CRM Communication Status
**Table Name:** `tabCRM Communication Status`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `status`
**Features:** Allow Rename, Quick Entry

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| status | Data | Status | Yes | Yes | No | 140 | - | Not Null, Unique |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 3. CRM Contacts
**Table Name:** `tabCRM Contacts`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated
**Features:** Editable Grid

#### Fields

| Field Name | Type | Label | Required | Unique | Fetch From | Length | Default | Constraints |
|------------|------|-------|----------|--------|------------|--------|---------|-------------|
| name | Data | ID | - | Primary | - | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | - | Row position |
| contact | Link | Contact | No | No | - | 140 | - | Foreign Key -> Contact |
| full_name | Data | Full Name | No | No | contact.full_name | 140 | - | Read-only, Fetched |
| email | Data | Email | No | No | contact.email_id | 140 | - | Read-only, Fetched |
| mobile_no | Data | Mobile No | No | No | contact.mobile_no | 140 | - | Read-only, Fetched, Phone format |
| phone | Data | Phone | No | No | contact.phone | 140 | - | Read-only, Fetched, Phone format |
| gender | Link | Gender | No | No | contact.gender | 140 | - | Foreign Key -> Gender, Fetched |
| is_primary | Check | Is Primary | No | No | - | - | 0 | Boolean |

#### Relationships
- **parent** -> CRM Lead or CRM Deal (Composite key)
- **contact** -> Contact
- **gender** -> Gender

---

### 4. CRM Dashboard
**Table Name:** `tabCRM Dashboard`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `title`
**Features:** Allow Rename, Grid Page Length 50

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| title | Data | Name | No | Yes | No | 140 | - | Unique |
| private | Check | Private | No | No | No | - | 0 | Boolean |
| user | Link | User | No | No | No | 140 | - | Foreign Key -> User, Required if private=1 |
| layout | Code | Layout | No | No | No | - | [] | JSON array |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **user** -> User (Conditional: required when private=1)

---

### 5. CRM Deal
**Table Name:** `tabCRM Deal`
**Table Type:** Regular Table
**Naming Strategy:** By naming series `CRM-DEAL-.YYYY.-`
**Features:** Allow Import, Allow Rename, Track Changes
**Title Field:** organization

#### Fields

| Field Name | Type | Label | Required | Unique | Search Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| naming_series | Select | Naming Series | No | No | No | 140 | CRM-DEAL-.YYYY.- | Options: CRM-DEAL-.YYYY.- |
| organization | Link | Organization | No | No | No | 140 | - | Foreign Key -> CRM Organization |
| status | Link | Status | Yes | No | Yes | 140 | Qualification | Foreign Key -> CRM Deal Status, Not Null |
| deal_owner | Link | Deal Owner | No | No | No | 140 | - | Foreign Key -> User |
| next_step | Data | Next Step | No | No | No | 140 | - | - |
| probability | Percent | Probability | No | No | No | - | - | 0-100 |
| deal_value | Currency | Deal Value | No | No | No | - | - | Linked to currency |
| expected_deal_value | Currency | Expected Deal Value | No | No | No | - | - | Linked to currency, Read-only |
| expected_closure_date | Date | Expected Closure Date | No | No | No | - | - | - |
| closed_date | Date | Closed Date | No | No | No | - | - | - |
| lead | Link | Lead | No | No | No | 140 | - | Foreign Key -> CRM Lead |
| source | Link | Source | No | No | No | 140 | - | Foreign Key -> CRM Lead Source |
| territory | Link | Territory | No | No | No | 140 | - | Foreign Key -> CRM Territory |
| industry | Link | Industry | No | No | No | 140 | - | Foreign Key -> CRM Industry |
| currency | Link | Currency | No | No | No | 140 | - | Foreign Key -> Currency |
| exchange_rate | Float | Exchange Rate | No | No | No | - | 1 | - |
| contacts | Table | Contacts | No | No | No | - | - | Child Table -> CRM Contacts |
| products | Table | Products | No | No | No | - | - | Child Table -> CRM Products |
| total | Currency | Total | No | No | No | - | - | Read-only, Calculated |
| net_total | Currency | Net Total | No | No | No | - | - | Read-only, Calculated |
| sla | Link | SLA | No | No | No | 140 | - | Foreign Key -> CRM Service Level Agreement |
| communication_status | Link | Communication Status | No | No | No | 140 | Open | Foreign Key -> CRM Communication Status |
| status_change_log | Table | Status Change Log | No | No | No | - | - | Child Table -> CRM Status Change Log |
| lost_reason | Link | Lost Reason | No | No | No | 140 | - | Foreign Key -> CRM Lost Reason |
| lost_notes | Text | Lost Notes | No | No | No | - | - | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Indexes
- **Search Index**: status

#### Relationships
- **organization** -> CRM Organization
- **status** -> CRM Deal Status (Required)
- **deal_owner** -> User
- **lead** -> CRM Lead
- **source** -> CRM Lead Source
- **territory** -> CRM Territory
- **industry** -> CRM Industry
- **currency** -> Currency
- **sla** -> CRM Service Level Agreement
- **communication_status** -> CRM Communication Status
- **lost_reason** -> CRM Lost Reason
- **contacts** -> CRM Contacts (Child)
- **products** -> CRM Products (Child)
- **status_change_log** -> CRM Status Change Log (Child)

---

### 6. CRM Deal Status
**Table Name:** `tabCRM Deal Status`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `deal_status`
**Features:** Allow Rename

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| deal_status | Data | Status | Yes | Yes | No | 140 | - | Not Null, Unique |
| type | Select | Type | No | No | No | 140 | Open | Options: Open/Won/Lost |
| position | Int | Position | No | No | No | - | - | - |
| probability | Percent | Probability | No | No | No | - | - | 0-100 |
| color | Select | Color | No | No | No | 140 | gray | Options: gray/red/orange/yellow/green/blue/purple/pink |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 7. CRM Dropdown Item
**Table Name:** `tabCRM Dropdown Item`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| name1 | Data | Name | No | Yes | 140 | - | Unique within parent |
| label | Data | Label | No | No | 140 | - | - |
| type | Select | Type | No | No | 140 | Route | Options: Route/Separator |
| route | Data | Route | No | No | 140 | - | - |
| icon | Code | Icon | No | No | - | - | SVG/Icon code |
| hidden | Check | Hidden | No | No | - | 0 | Boolean |
| open_in_new_window | Check | Open in new window | No | No | - | 1 | Boolean |
| is_standard | Check | Is Standard | No | No | - | 0 | Boolean |

#### Relationships
- **parent** -> FCRM Settings (Composite key)

---

### 8. CRM Exotel Settings
**Table Name:** `tabCRM Exotel Settings`
**Table Type:** Single Document (issingle: 1)
**Naming Strategy:** Single

#### Fields

| Field Name | Type | Label | Required | Length | Default | Constraints |
|------------|------|-------|----------|--------|---------|-------------|
| name | Data | ID | - | 140 | CRM Exotel Settings | Primary Key, Fixed |
| enabled | Check | Enabled | No | - | 0 | Boolean |
| record_call | Check | Record Outgoing Calls | No | - | 0 | Boolean |
| account_sid | Data | Account SID | Conditional | 140 | - | Required if enabled=1 |
| subdomain | Data | Subdomain | Conditional | 140 | - | Required if enabled=1 |
| api_key | Data | API Key | Conditional | 140 | - | Required if enabled=1 |
| api_token | Password | API Token | Conditional | - | - | Required if enabled=1, Encrypted |
| webhook_verify_token | Data | Webhook Verify Token | Conditional | 140 | - | Required if enabled=1 |
| creation | Datetime | Created On | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None

---

### 9. CRM Fields Layout
**Table Name:** `tabCRM Fields Layout`
**Table Type:** Regular Table
**Naming Strategy:** Expression `{dt}-{type}`

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| dt | Link | Document Type | No | No | 140 | - | Foreign Key -> DocType |
| type | Select | Type | No | No | 140 | - | Options: Quick Entry/Side Panel/Data Fields/Grid Row/Required Fields |
| layout | Code | Layout | No | No | - | - | JSON |
| creation | Datetime | Created On | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **dt** -> DocType

---

### 10. CRM Form Script
**Table Name:** `tabCRM Form Script`
**Table Type:** Regular Table
**Naming Strategy:** Set by user (prompt)

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Prompt | Primary Key |
| dt | Link | DocType | Yes | No | 140 | - | Foreign Key -> DocType, Not Null |
| view | Select | Apply To | No | No | 140 | Form | Options: Form/List |
| enabled | Check | Enabled | No | No | - | 0 | Boolean |
| is_standard | Check | Is Standard | No | No | - | 0 | Boolean |
| script | Code | Script | No | No | - | Default function | JavaScript code |
| creation | Datetime | Created On | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **dt** -> DocType (Required)

---

### 11. CRM Global Settings
**Table Name:** `tabCRM Global Settings`
**Table Type:** Regular Table
**Naming Strategy:** Expression `{type}-{dt}`

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| dt | Link | DocType | Yes | No | 140 | - | Foreign Key -> DocType, Not Null |
| type | Select | Type | Yes | No | 140 | - | Not Null |
| json | JSON | JSON | No | No | - | - | JSON field |
| creation | Datetime | Created On | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **dt** -> DocType (Required)

---

### 12. CRM Holiday
**Table Name:** `tabCRM Holiday`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| date | Date | Date | Yes | No | - | - | Not Null |
| weekly_off | Check | Weekly Off | No | No | - | 0 | Boolean |
| description | Text Editor | Description | Yes | No | - | - | Not Null |

#### Relationships
- **parent** -> CRM Holiday List (Composite key)

---

### 13. CRM Holiday List
**Table Name:** `tabCRM Holiday List`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `holiday_list_name`

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| holiday_list_name | Data | Holiday List Name | Yes | Yes | No | 140 | - | Not Null, Unique |
| from_date | Date | From Date | Yes | No | No | - | - | Not Null |
| to_date | Date | To Date | Yes | No | No | - | - | Not Null |
| total_holidays | Int | Total Holidays | No | No | No | - | - | Read-only, Calculated |
| weekly_off | Select | Weekly Off | No | No | No | 140 | - | Options: Monday-Sunday |
| holidays | Table | Holidays | No | No | No | - | - | Child Table -> CRM Holiday |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **holidays** -> CRM Holiday (Child)

---

### 14. CRM Industry
**Table Name:** `tabCRM Industry`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `industry`
**Features:** Allow Import, Allow Rename, Quick Entry

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| industry | Data | Industry | No | Yes | No | 140 | - | Unique |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 15. CRM Invitation
**Table Name:** `tabCRM Invitation`
**Table Type:** Regular Table
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| email | Data | Email | Yes | No | No | 140 | - | Not Null, Email format |
| role | Select | Role | Yes | No | No | 140 | - | Not Null, Options: Sales User/Sales Manager/System Manager |
| key | Data | Key | No | No | No | 140 | - | Auto-generated hash |
| invited_by | Link | Invited By | No | No | No | 140 | - | Foreign Key -> User |
| status | Select | Status | No | No | No | 140 | - | Options: Pending/Accepted/Expired |
| email_sent_at | Datetime | Email Sent At | No | No | No | - | - | - |
| accepted_at | Datetime | Accepted At | No | No | No | - | - | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **invited_by** -> User

---

### 16. CRM Lead
**Table Name:** `tabCRM Lead`
**Table Type:** Regular Table
**Naming Strategy:** By naming series `CRM-LEAD-.YYYY.-`
**Features:** Allow Import, Allow Rename, Track Changes, Email Append
**Title Field:** lead_name

#### Fields

| Field Name | Type | Label | Required | Unique | Search Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| naming_series | Select | Series | No | No | No | 140 | CRM-LEAD-.YYYY.- | Options: CRM-LEAD-.YYYY.- |
| salutation | Link | Salutation | No | No | No | 140 | - | Foreign Key -> Salutation |
| first_name | Data | First Name | Yes | No | No | 140 | - | Not Null |
| middle_name | Data | Middle Name | No | No | No | 140 | - | - |
| last_name | Data | Last Name | No | No | No | 140 | - | - |
| lead_name | Data | Full Name | No | No | Yes | 140 | - | Search Index |
| gender | Link | Gender | No | No | No | 140 | - | Foreign Key -> Gender |
| email | Data | Email | No | No | Yes | 140 | - | Email format, Search Index |
| mobile_no | Data | Mobile No | No | No | No | 140 | - | Phone format |
| phone | Data | Phone | No | No | No | 140 | - | Phone format |
| organization | Data | Organization | No | No | No | 140 | - | - |
| website | Data | Website | No | No | No | 140 | - | URL format |
| job_title | Data | Job Title | No | No | No | 140 | - | - |
| status | Link | Status | Yes | No | Yes | 140 | New | Foreign Key -> CRM Lead Status, Not Null |
| lead_owner | Link | Lead Owner | No | No | No | 140 | - | Foreign Key -> User |
| source | Link | Source | No | No | No | 140 | - | Foreign Key -> CRM Lead Source |
| product_type | Link | Product Type | No | No | No | 140 | - | Foreign Key -> CRM Product Type |
| territory | Link | Territory | No | No | No | 140 | - | Foreign Key -> CRM Territory |
| industry | Link | Industry | No | No | No | 140 | - | Foreign Key -> CRM Industry |
| no_of_employees | Select | No. of Employees | No | No | No | 140 | - | Options: 1-10/11-50/51-200/201-500/501-1000/1000+ |
| annual_revenue | Currency | Annual Revenue | No | No | No | - | - | - |
| converted | Check | Converted | No | No | No | - | 0 | Boolean |
| image | Attach Image | Image | No | No | No | - | - | Image file |
| products | Table | Products | No | No | No | - | - | Child Table -> CRM Products |
| total | Currency | Total | No | No | No | - | - | Read-only, Calculated |
| net_total | Currency | Net Total | No | No | No | - | - | Read-only, Calculated |
| sla | Link | SLA | No | No | No | 140 | - | Foreign Key -> CRM Service Level Agreement |
| communication_status | Link | Communication Status | No | No | No | 140 | Open | Foreign Key -> CRM Communication Status |
| status_change_log | Table | Status Change Log | No | No | No | - | - | Child Table -> CRM Status Change Log |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Indexes
- **Search Index**: lead_name, email, status

#### Relationships
- **salutation** -> Salutation
- **gender** -> Gender
- **status** -> CRM Lead Status (Required)
- **lead_owner** -> User
- **source** -> CRM Lead Source
- **product_type** -> CRM Product Type
- **territory** -> CRM Territory
- **industry** -> CRM Industry
- **sla** -> CRM Service Level Agreement
- **communication_status** -> CRM Communication Status
- **products** -> CRM Products (Child)
- **status_change_log** -> CRM Status Change Log (Child)

---

### 17. CRM Lead Source
**Table Name:** `tabCRM Lead Source`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `source_name`
**Features:** Allow Import, Allow Rename, Quick Entry

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| source_name | Data | Source Name | Yes | Yes | No | 140 | - | Not Null, Unique |
| details | Text Editor | Details | No | No | No | - | - | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 18. CRM Lead Status
**Table Name:** `tabCRM Lead Status`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `lead_status`
**Features:** Allow Rename

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| lead_status | Data | Status | Yes | Yes | No | 140 | - | Not Null, Unique |
| color | Select | Color | No | No | No | 140 | gray | Options: gray/red/orange/yellow/green/blue/purple/pink |
| position | Int | Position | No | No | No | - | 1 | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 19. CRM Lost Reason
**Table Name:** `tabCRM Lost Reason`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `lost_reason`
**Features:** Allow Rename, Quick Entry

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| lost_reason | Data | Lost Reason | Yes | Yes | No | 140 | - | Not Null, Unique |
| description | Text Editor | Description | No | No | No | - | - | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 20. CRM Meta Ads Lead
**Table Name:** `tabCRM Meta Ads Lead`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `leadgen_id`
**Features:** Track Changes

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| leadgen_id | Data | Meta Lead ID | No | Yes | No | 140 | - | Unique |
| first_name | Data | First Name | No | No | No | 140 | - | - |
| email | Data | Email | No | No | No | 140 | - | Email format |
| mobile_no | Data | Mobile No | No | No | No | 140 | - | Phone format |
| ad_account_id | Data | Ad Account ID | No | No | No | 140 | - | - |
| campaign_name | Data | Campaign Name | No | No | No | 140 | - | - |
| campaign_id | Data | Campaign ID | No | No | No | 140 | - | - |
| adset_name | Data | Ad Set Name | No | No | No | 140 | - | - |
| adset_id | Data | Ad Set ID | No | No | No | 140 | - | - |
| ad_name | Data | Ad Name | No | No | No | 140 | - | - |
| ad_id | Data | Ad ID | No | No | No | 140 | - | - |
| adgroup_id | Data | Ad Group ID | No | No | No | 140 | - | - |
| page_id | Data | Page ID | No | No | No | 140 | - | - |
| form_id | Data | Form ID | No | No | No | 140 | - | - |
| form_name | Data | Form Name | No | No | No | 140 | - | - |
| form_questions | Long Text | Form Questions JSON | No | No | No | - | - | JSON |
| field_data | Long Text | Lead Field Data JSON | No | No | No | - | - | JSON |
| raw_payload | Long Text | Raw Payload | No | No | No | - | - | JSON |
| source_ip | Data | Source IP | No | No | No | 140 | - | IP address |
| processed | Check | Processed? | No | No | No | - | 0 | Boolean |
| processed_on | Datetime | Processed On | No | No | No | - | - | - |
| target_lead | Link | Target Lead | No | No | No | 140 | - | Foreign Key -> CRM Lead |
| created_time | Long Int | Created Time (Meta) | No | No | No | - | - | Unix timestamp |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **target_lead** -> CRM Lead

---

### 21. CRM Meta Lead Stagging
**Table Name:** `tabCRM Meta Lead Stagging`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `leadgen_id`
**Features:** Track Changes

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| leadgen_id | Data | Meta Lead ID | No | Yes | No | 140 | - | Unique |
| first_name | Data | First Name | No | No | No | 140 | - | - |
| email | Data | Email | No | No | No | 140 | - | Email format |
| mobile_no | Data | Mobile No | No | No | No | 140 | - | Phone format |
| ad_account_id | Data | Ad Account ID | No | No | No | 140 | - | - |
| campaign_name | Data | Campaign Name | No | No | No | 140 | - | - |
| campaign_id | Data | Campaign ID | No | No | No | 140 | - | - |
| adset_name | Data | Ad Set Name | No | No | No | 140 | - | - |
| adset_id | Data | Ad Set ID | No | No | No | 140 | - | - |
| ad_name | Data | Ad Name | No | No | No | 140 | - | - |
| ad_id | Data | Ad ID | No | No | No | 140 | - | - |
| adgroup_id | Data | Ad Group ID | No | No | No | 140 | - | - |
| page_id | Data | Page ID | No | No | No | 140 | - | - |
| form_id | Data | Form ID | No | No | No | 140 | - | - |
| form_name | Data | Form Name | No | No | No | 140 | - | - |
| form_questions | Long Text | Form Questions JSON | No | No | No | - | - | JSON |
| field_data | Long Text | Lead Field Data JSON | No | No | No | - | - | JSON |
| raw_payload | Long Text | Raw Payload | No | No | No | - | - | JSON |
| source_ip | Data | Source IP | No | No | No | 140 | - | IP address |
| processed | Check | Processed? | No | No | No | - | 0 | Boolean |
| processed_on | Datetime | Processed On | No | No | No | - | - | - |
| target_lead | Link | Target Lead | No | No | No | 140 | - | Foreign Key -> CRM Lead |
| created_time | Datetime | Created Time (Meta) | No | No | No | - | - | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **target_lead** -> CRM Lead

---

### 22. CRM Notification
**Table Name:** `tabCRM Notification`
**Table Type:** Regular Table
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| type | Select | Type | Yes | No | No | 140 | - | Not Null, Options: Mention/Task/Assignment/WhatsApp |
| from_user | Link | From User | No | No | No | 140 | - | Foreign Key -> User |
| to_user | Link | To User | Yes | No | No | 140 | - | Foreign Key -> User, Not Null |
| notification_text | Text | Notification Text | No | No | No | - | - | - |
| message | HTML Editor | Message | No | No | No | - | - | HTML content |
| read | Check | Read | No | No | No | - | 0 | Boolean |
| reference_doctype | Link | Reference Doctype | No | No | No | 140 | - | Foreign Key -> DocType |
| reference_name | Dynamic Link | Reference Doc | No | No | No | 140 | - | Dynamic Foreign Key |
| notification_type_doctype | Link | Notification Type Doctype | No | No | No | 140 | - | Foreign Key -> DocType |
| notification_type_doc | Dynamic Link | Notification Type Doc | No | No | No | 140 | - | Dynamic Foreign Key |
| comment | Link | Comment | No | No | No | 140 | - | Foreign Key -> Comment |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **from_user** -> User
- **to_user** -> User (Required)
- **reference_doctype** -> DocType
- **reference_name** -> Dynamic (based on reference_doctype)
- **notification_type_doctype** -> DocType
- **notification_type_doc** -> Dynamic (based on notification_type_doctype)
- **comment** -> Comment

---

### 23. CRM Organization
**Table Name:** `tabCRM Organization`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `organization_name`
**Features:** Allow Import, Allow Rename
**Image Field:** organization_logo

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| organization_name | Data | Organization Name | No | Yes | No | 140 | - | Unique |
| website | Data | Website | No | No | No | 140 | - | URL format |
| organization_logo | Attach Image | Organization Logo | No | No | No | - | - | Image file |
| no_of_employees | Select | No. of Employees | No | No | No | 140 | - | Options: 1-10/11-50/51-200/201-500/501-1000/1000+ |
| annual_revenue | Currency | Annual Revenue | No | No | No | - | - | Linked to currency |
| currency | Link | Currency | No | No | No | 140 | - | Foreign Key -> Currency |
| exchange_rate | Float | Exchange Rate | No | No | No | - | - | - |
| industry | Link | Industry | No | No | No | 140 | - | Foreign Key -> CRM Industry |
| territory | Link | Territory | No | No | No | 140 | - | Foreign Key -> CRM Territory |
| address | Link | Address | No | No | No | 140 | - | Foreign Key -> Address |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **currency** -> Currency
- **industry** -> CRM Industry
- **territory** -> CRM Territory
- **address** -> Address

---

### 24. CRM Product
**Table Name:** `tabCRM Product`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `product_code`
**Features:** Allow Import, Allow Rename, Track Changes, Quick Entry
**Title Field:** product_name

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| naming_series | Select | Naming Series | No | No | No | 140 | - | - |
| product_code | Data | Product Code | Yes | Yes | No | 140 | - | Not Null, Unique |
| product_name | Data | Product Name | No | No | No | 140 | - | - |
| disabled | Check | Disabled | No | No | No | - | 0 | Boolean |
| standard_rate | Currency | Standard Selling Rate | No | No | No | - | - | - |
| image | Attach Image | Image | No | No | No | - | - | Image file |
| description | Text Editor | Description | No | No | No | - | - | - |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None (Master data table)

---

### 25. CRM Product Type
**Table Name:** `tabCRM Product Type`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `product_type`
**Features:** Allow Import, Allow Rename, Track Changes, Quick Entry

#### Fields

| Field Name | Type | Label | Required | Unique | Search Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| product_type | Data | Product Type | Yes | Yes | Yes | 140 | - | Not Null, Unique, Search Index |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Indexes
- **Search Index**: product_type

#### Relationships
None (Master data table)

---

### 26. CRM Products
**Table Name:** `tabCRM Products`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| product_code | Link | Product | No | No | 140 | - | Foreign Key -> CRM Product |
| product_name | Data | Product Name | Yes | No | 140 | - | Not Null |
| qty | Float | Quantity | No | No | - | 1 | - |
| rate | Currency | Rate | Yes | No | - | - | Not Null, Linked to currency |
| amount | Currency | Amount | No | No | - | - | Read-only, Calculated: qty * rate |
| discount_percentage | Percent | Discount % | No | No | - | - | 0-100 |
| discount_amount | Currency | Discount Amount | No | No | - | - | Read-only, Calculated |
| net_amount | Currency | Net Amount | No | No | - | - | Read-only, Calculated: amount - discount_amount |

#### Relationships
- **parent** -> CRM Lead or CRM Deal (Composite key)
- **product_code** -> CRM Product

---

### 27. CRM Service Day
**Table Name:** `tabCRM Service Day`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| workday | Select | Workday | Yes | No | 140 | - | Not Null, Options: Monday/Tuesday/Wednesday/Thursday/Friday/Saturday/Sunday |
| start_time | Time | Start Time | Yes | No | - | - | Not Null, HH:MM:SS |
| end_time | Time | End Time | Yes | No | - | - | Not Null, HH:MM:SS |

#### Relationships
- **parent** -> CRM Service Level Agreement (Composite key)

---

### 28. CRM Service Level Agreement
**Table Name:** `tabCRM Service Level Agreement`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `sla_name`
**Features:** Allow Rename

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| sla_name | Data | SLA Name | Yes | Yes | No | 140 | - | Not Null, Unique |
| enabled | Check | Enabled | No | No | No | - | 0 | Boolean |
| default | Check | Default | No | No | No | - | 0 | Boolean |
| apply_on | Link | Apply On | Yes | No | No | 140 | - | Foreign Key -> DocType, Not Null, Options: CRM Lead/CRM Deal |
| condition | Code | Condition | No | No | No | - | - | Python expression |
| start_date | Date | Start Date | No | No | No | - | - | - |
| end_date | Date | End Date | No | No | No | - | - | - |
| holiday_list | Link | Holiday List | No | No | No | 140 | - | Foreign Key -> CRM Holiday List |
| priorities | Table | Priorities | Yes | No | No | - | - | Child Table -> CRM Service Level Priority, Not Null |
| working_hours | Table | Working Hours | Yes | No | No | - | - | Child Table -> CRM Service Day, Not Null |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **apply_on** -> DocType (Limited to CRM Lead/CRM Deal) (Required)
- **holiday_list** -> CRM Holiday List
- **priorities** -> CRM Service Level Priority (Child, Required)
- **working_hours** -> CRM Service Day (Child, Required)

---

### 29. CRM Service Level Priority
**Table Name:** `tabCRM Service Level Priority`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| default_priority | Check | Default Priority | No | No | - | 0 | Boolean |
| priority | Link | Priority | Yes | No | 140 | - | Foreign Key -> CRM Communication Status, Not Null |
| first_response_time | Duration | First Response Time | Yes | No | - | - | Not Null, In seconds |

#### Relationships
- **parent** -> CRM Service Level Agreement (Composite key)
- **priority** -> CRM Communication Status (Required)

---

### 30. CRM Status Change Log
**Table Name:** `tabCRM Status Change Log`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| from | Data | From | No | No | 140 | - | Previous status |
| to | Data | To | No | No | 140 | - | New status |
| from_type | Data | From Type | No | No | 140 | - | - |
| to_type | Data | To Type | No | No | 140 | - | - |
| from_date | Datetime | From Date | No | No | - | - | - |
| to_date | Datetime | To Date | No | No | - | - | - |
| duration | Duration | Duration | No | No | - | - | In seconds |
| log_owner | Link | Owner | No | No | 140 | - | Foreign Key -> User |
| last_status_change_log | Link | Last Status Change Log | No | No | 140 | - | Foreign Key -> CRM Status Change Log (self-reference) |

#### Relationships
- **parent** -> CRM Lead or CRM Deal (Composite key)
- **log_owner** -> User
- **last_status_change_log** -> CRM Status Change Log (Self-referencing)

---

### 31. CRM Task
**Table Name:** `tabCRM Task`
**Table Type:** Regular Table
**Naming Strategy:** Autoincrement
**Features:** Allow Import

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| title | Data | Title | Yes | No | No | 140 | - | Not Null |
| priority | Select | Priority | No | No | No | 140 | - | Options: Low/Medium/High |
| status | Select | Status | No | No | No | 140 | - | Options: Backlog/Todo/In Progress/Done/Canceled |
| assigned_to | Link | Assigned To | No | No | No | 140 | - | Foreign Key -> User |
| start_date | Date | Start Date | No | No | No | - | - | - |
| due_date | Datetime | Due Date | No | No | No | - | - | - |
| description | Text Editor | Description | No | No | No | - | - | - |
| reference_doctype | Link | Reference Document Type | No | No | No | 140 | CRM Lead | Foreign Key -> DocType |
| reference_docname | Dynamic Link | Reference Doc | No | No | No | 140 | - | Dynamic Foreign Key |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **assigned_to** -> User
- **reference_doctype** -> DocType
- **reference_docname** -> Dynamic (based on reference_doctype)

---

### 32. CRM Telephony Agent
**Table Name:** `tabCRM Telephony Agent`
**Table Type:** Regular Table
**Naming Strategy:** By fieldname `user`

#### Fields

| Field Name | Type | Label | Required | Unique | Fetch From | Length | Default | Constraints |
|------------|------|-------|----------|--------|------------|--------|---------|-------------|
| name | Data | ID | - | Primary | - | 140 | Auto | Primary Key |
| user | Link | User | Yes | Yes | - | 140 | - | Foreign Key -> User, Not Null, Unique |
| user_name | Data | User Name | No | No | user.full_name | 140 | - | Read-only, Fetched |
| mobile_no | Data | Mobile No. | No | No | - | 140 | - | Phone format |
| default_medium | Select | Default Medium | No | No | - | 140 | - | - |
| twilio | Check | Twilio | No | No | - | - | 0 | Boolean |
| twilio_number | Data | Twilio Number | No | No | - | 140 | - | - |
| call_receiving_device | Select | Device | No | No | - | 140 | Computer | Options: Computer/Phone |
| exotel | Check | Exotel | No | No | - | - | 0 | Boolean |
| exotel_number | Data | Exotel Number | No | No | - | 140 | - | - |
| phone_nos | Table | Phone Numbers | No | No | - | - | - | Child Table -> CRM Telephony Phone |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **user** -> User (Required, Unique)
- **phone_nos** -> CRM Telephony Phone (Child)

---

### 33. CRM Telephony Phone
**Table Name:** `tabCRM Telephony Phone`
**Table Type:** Child Table (istable: 1)
**Naming Strategy:** Auto-generated

#### Fields

| Field Name | Type | Label | Required | Unique | Length | Default | Constraints |
|------------|------|-------|----------|--------|--------|---------|-------------|
| name | Data | ID | - | Primary | 140 | Auto | Primary Key |
| parent | Data | Parent | - | - | 140 | - | Foreign Key to parent doctype |
| parentfield | Data | Parent Field | - | - | 140 | - | - |
| parenttype | Data | Parent Type | - | - | 140 | - | - |
| idx | Int | Index | - | - | - | - | Row position |
| number | Data | Number | Yes | No | 140 | - | Not Null, Phone format |
| is_primary | Check | Is Primary | No | No | - | 0 | Boolean |

#### Relationships
- **parent** -> CRM Telephony Agent (Composite key)

---

### 34. CRM Territory
**Table Name:** `tabCRM Territory`
**Table Type:** Nested Set Tree (is_tree: 1)
**Naming Strategy:** By fieldname `territory_name`
**Features:** Allow Import, Allow Rename
**NSM Parent Field:** parent_crm_territory

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| territory_name | Data | Territory Name | Yes | Yes | No | 140 | - | Not Null, Unique |
| is_group | Check | Is Group | No | No | No | - | 0 | Boolean |
| territory_manager | Link | Territory Manager | No | No | No | 140 | - | Foreign Key -> User |
| parent_crm_territory | Link | Parent CRM Territory | No | No | No | 140 | - | Foreign Key -> CRM Territory (self-reference) |
| old_parent | Link | Old Parent | No | No | No | 140 | - | Foreign Key -> CRM Territory (self-reference) |
| lft | Int | Left | No | No | Yes | - | - | Nested set left index |
| rgt | Int | Right | No | No | Yes | - | - | Nested set right index |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Indexes
- **Nested Set Indexes**: lft, rgt (for tree traversal queries)

#### Relationships
- **territory_manager** -> User
- **parent_crm_territory** -> CRM Territory (Self-referencing for tree structure)
- **old_parent** -> CRM Territory (Self-referencing)

---

### 35. CRM Twilio Settings
**Table Name:** `tabCRM Twilio Settings`
**Table Type:** Single Document (issingle: 1)
**Naming Strategy:** Single
**Features:** Track Changes

#### Fields

| Field Name | Type | Label | Required | Length | Default | Constraints |
|------------|------|-------|----------|--------|---------|-------------|
| name | Data | ID | - | 140 | CRM Twilio Settings | Primary Key, Fixed |
| enabled | Check | Enabled | No | - | 0 | Boolean |
| record_calls | Check | Record Calls | No | - | 0 | Boolean |
| account_sid | Data | Account SID | Conditional | 140 | - | Required if enabled=1 |
| auth_token | Password | Auth Token | Conditional | - | - | Required if enabled=1, Encrypted |
| api_key | Data | API Key | No | 140 | - | - |
| api_secret | Password | API Secret | No | - | - | Encrypted |
| twiml_sid | Data | TwiML SID | No | 140 | - | - |
| creation | Datetime | Created On | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None

---

### 36. CRM View Settings
**Table Name:** `tabCRM View Settings`
**Table Type:** Regular Table
**Naming Strategy:** Autoincrement
**Features:** Read Only, Track Changes

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| label | Data | Label | No | No | No | 140 | - | - |
| dt | Link | DocType | No | No | No | 140 | - | Foreign Key -> DocType |
| type | Select | Type | No | No | No | 140 | list | Options: list/kanban |
| user | Link | User | No | No | No | 140 | - | Foreign Key -> User |
| route_name | Data | Route Name | No | No | No | 140 | - | - |
| icon | Data | Icon | No | No | No | 140 | - | - |
| pinned | Check | Pinned | No | No | No | - | 0 | Boolean |
| public | Check | Public | No | No | No | - | 0 | Boolean |
| is_standard | Check | Is Standard | No | No | No | - | 0 | Boolean |
| is_default | Check | Is Default | No | No | No | - | 0 | Boolean |
| load_default_columns | Check | Load Default Columns | No | No | No | - | 0 | Boolean |
| filters | Code | Filters | No | No | No | - | - | JSON |
| order_by | Code | Order By | No | No | No | - | - | JSON |
| columns | Code | Columns | No | No | No | - | - | JSON |
| rows | Code | Rows | No | No | No | - | - | JSON |
| group_by_field | Data | Group By Field | No | No | No | 140 | - | - |
| column_field | Data | Column Field | No | No | No | 140 | - | For kanban view |
| title_field | Data | Title Field | No | No | No | 140 | - | For kanban view |
| kanban_columns | Code | Kanban Columns | No | No | No | - | - | JSON |
| kanban_fields | Code | Kanban Fields | No | No | No | - | - | JSON |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **dt** -> DocType
- **user** -> User

---

### 37. ERPNext CRM Settings
**Table Name:** `tabERPNext CRM Settings`
**Table Type:** Single Document (issingle: 1)
**Naming Strategy:** Single

#### Fields

| Field Name | Type | Label | Required | Length | Default | Constraints |
|------------|------|-------|----------|--------|---------|-------------|
| name | Data | ID | - | 140 | ERPNext CRM Settings | Primary Key, Fixed |
| enabled | Check | Enabled | No | - | 0 | Boolean |
| is_erpnext_in_different_site | Check | Is ERPNext installed on a different site? | No | - | 0 | Boolean |
| erpnext_company | Data | Company in ERPNext Site | Conditional | 140 | - | Required if enabled=1 and is_erpnext_in_different_site=1 |
| erpnext_site_url | Data | ERPNext Site URL | Conditional | 140 | - | Required if is_erpnext_in_different_site=1, URL format |
| api_key | Data | API Key | Conditional | 140 | - | Required if is_erpnext_in_different_site=1 |
| api_secret | Password | API Secret | Conditional | - | - | Required if is_erpnext_in_different_site=1, Encrypted |
| create_customer_on_status_change | Check | Create customer on status change | No | - | 0 | Boolean |
| deal_status | Link | Deal Status | Conditional | 140 | - | Foreign Key -> CRM Deal Status, Required if create_customer_on_status_change=1 |
| creation | Datetime | Created On | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **deal_status** -> CRM Deal Status (Conditional)

---

### 38. FCRM Note
**Table Name:** `tabFCRM Note`
**Table Type:** Regular Table
**Naming Strategy:** Auto-generated
**Features:** Allow Import, Allow Rename, Track Changes
**Title Field:** title

#### Fields

| Field Name | Type | Label | Required | Unique | Index | Length | Default | Constraints |
|------------|------|-------|----------|--------|-------|--------|---------|-------------|
| name | Data | ID | - | Primary | Yes | 140 | Auto | Primary Key |
| title | Data | Title | Yes | No | No | 140 | - | Not Null |
| content | Text Editor | Content | No | No | No | - | - | - |
| reference_doctype | Link | Reference Document Type | No | No | No | 140 | CRM Lead | Foreign Key -> DocType |
| reference_docname | Dynamic Link | Reference Doc | No | No | No | 140 | - | Dynamic Foreign Key |
| creation | Datetime | Created On | - | - | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | - | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | - | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **reference_doctype** -> DocType
- **reference_docname** -> Dynamic (based on reference_doctype)

---

### 39. FCRM Settings
**Table Name:** `tabFCRM Settings`
**Table Type:** Single Document (issingle: 1)
**Naming Strategy:** Single

#### Fields

| Field Name | Type | Label | Required | Length | Default | Constraints |
|------------|------|-------|----------|--------|---------|-------------|
| name | Data | ID | - | 140 | FCRM Settings | Primary Key, Fixed |
| enable_forecasting | Check | Enable Forecasting | No | - | 0 | Boolean |
| currency | Link | Currency | No | 140 | - | Foreign Key -> Currency |
| brand_name | Data | Name | No | 140 | - | - |
| brand_logo | Attach | Logo | No | - | - | File attachment |
| favicon | Attach | Favicon | No | - | - | File attachment |
| dropdown_items | Table | Dropdown Items | No | - | - | Child Table -> CRM Dropdown Item |
| creation | Datetime | Created On | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
- **currency** -> Currency
- **dropdown_items** -> CRM Dropdown Item (Child)

---

### 40. Meta Integration Settings
**Table Name:** `tabMeta Integration Settings`
**Table Type:** Single Document (issingle: 1)
**Naming Strategy:** Single
**Features:** Track Changes

#### Fields

| Field Name | Type | Label | Required | Length | Default | Constraints |
|------------|------|-------|----------|--------|---------|-------------|
| name | Data | ID | - | 140 | Meta Integration Settings | Primary Key, Fixed |
| meta_verify_token | Data | Verify Token | No | 140 | - | - |
| meta_app_id | Data | App ID | No | 140 | - | - |
| meta_app_secret | Password | App Secret | No | - | - | Encrypted |
| meta_access_token | Password | System User Access Token | No | - | - | Encrypted |
| meta_graph_api_version | Data | Graph API Version | No | 140 | v20.0 | - |
| creation | Datetime | Created On | - | - | Auto | System Field |
| modified | Datetime | Last Modified | - | - | - | Auto | System Field |
| modified_by | Link | Modified By | - | 140 | Auto | Foreign Key -> User |
| owner | Link | Created By | - | 140 | Auto | Foreign Key -> User |

#### Relationships
None

---

## Relationship Diagram

### Core Entity Relationships

```
CRM Lead
├── has many -> CRM Products (child)
├── has many -> CRM Status Change Log (child)
├── belongs to -> CRM Lead Status (required)
├── belongs to -> CRM Lead Source
├── belongs to -> CRM Product Type
├── belongs to -> CRM Territory
├── belongs to -> CRM Industry
├── belongs to -> CRM Service Level Agreement
├── belongs to -> CRM Communication Status
├── belongs to -> User (lead_owner)
└── referenced by -> CRM Deal

CRM Deal
├── has many -> CRM Contacts (child)
├── has many -> CRM Products (child)
├── has many -> CRM Status Change Log (child)
├── belongs to -> CRM Organization
├── belongs to -> CRM Deal Status (required)
├── belongs to -> CRM Lead
├── belongs to -> CRM Lead Source
├── belongs to -> CRM Territory
├── belongs to -> CRM Industry
├── belongs to -> Currency
├── belongs to -> CRM Service Level Agreement
├── belongs to -> CRM Communication Status
├── belongs to -> CRM Lost Reason
└── belongs to -> User (deal_owner)

CRM Organization
├── belongs to -> CRM Industry
├── belongs to -> CRM Territory
├── belongs to -> Currency
├── belongs to -> Address
└── referenced by -> CRM Deal

CRM Call Log
├── belongs to -> User (caller)
├── belongs to -> User (receiver)
├── belongs to -> FCRM Note
├── has dynamic link -> reference_doctype/reference_docname
└── has many -> Dynamic Link (links child table)

CRM Task
├── belongs to -> User (assigned_to)
└── has dynamic link -> reference_doctype/reference_docname

CRM Notification
├── belongs to -> User (from_user)
├── belongs to -> User (to_user, required)
├── belongs to -> Comment
├── has dynamic link -> reference_doctype/reference_docname
└── has dynamic link -> notification_type_doctype/notification_type_doc

CRM Service Level Agreement
├── has many -> CRM Service Level Priority (child, required)
├── has many -> CRM Service Day (child, required)
├── belongs to -> DocType (apply_on: CRM Lead/CRM Deal)
└── belongs to -> CRM Holiday List

CRM Holiday List
└── has many -> CRM Holiday (child)

CRM Territory (Nested Set Tree)
├── belongs to -> User (territory_manager)
├── self-references -> CRM Territory (parent_crm_territory)
└── self-references -> CRM Territory (old_parent)

CRM Telephony Agent
├── belongs to -> User (user, unique, required)
└── has many -> CRM Telephony Phone (child)

CRM Meta Ads Lead
└── belongs to -> CRM Lead (target_lead)

CRM Meta Lead Stagging
└── belongs to -> CRM Lead (target_lead)

FCRM Note
├── has dynamic link -> reference_doctype/reference_docname
└── referenced by -> CRM Call Log

FCRM Settings
└── has many -> CRM Dropdown Item (child)
```

### Integration & Settings Relationships

```
ERPNext CRM Settings (Single)
└── belongs to -> CRM Deal Status (conditional)

CRM Twilio Settings (Single)
(No relationships)

CRM Exotel Settings (Single)
(No relationships)

Meta Integration Settings (Single)
(No relationships)

CRM Form Script
└── belongs to -> DocType (required)

CRM Fields Layout
└── belongs to -> DocType

CRM Global Settings
└── belongs to -> DocType (required)

CRM View Settings
├── belongs to -> DocType
└── belongs to -> User

CRM Dashboard
└── belongs to -> User (conditional on private)
```

---

## Indexes and Constraints

### Primary Keys
All tables have a `name` field as the primary key (VARCHAR(140))

### Unique Constraints

| Table | Field(s) | Description |
|-------|----------|-------------|
| tabCRM Call Log | id | Call log identifier |
| tabCRM Communication Status | status | Status name |
| tabCRM Dashboard | title | Dashboard title |
| tabCRM Deal Status | deal_status | Deal status name |
| tabCRM Dropdown Item | name1 | Dropdown item name (unique within parent) |
| tabCRM Holiday List | holiday_list_name | Holiday list name |
| tabCRM Industry | industry | Industry name |
| tabCRM Lead | lead_name | Lead full name (not strictly unique, but has search index) |
| tabCRM Lead Source | source_name | Lead source name |
| tabCRM Lead Status | lead_status | Lead status name |
| tabCRM Lost Reason | lost_reason | Lost reason text |
| tabCRM Meta Ads Lead | leadgen_id | Meta lead identifier |
| tabCRM Meta Lead Stagging | leadgen_id | Meta lead staging identifier |
| tabCRM Organization | organization_name | Organization name |
| tabCRM Product | product_code | Product code |
| tabCRM Product Type | product_type | Product type name |
| tabCRM Service Level Agreement | sla_name | SLA name |
| tabCRM Telephony Agent | user | User link (one agent per user) |
| tabCRM Territory | territory_name | Territory name |

### Search Indexes

| Table | Field | Purpose |
|-------|-------|---------|
| tabCRM Deal | status | Quick filtering by deal status |
| tabCRM Lead | lead_name | Full-text search on lead names |
| tabCRM Lead | email | Quick lookup by email |
| tabCRM Lead | status | Quick filtering by lead status |
| tabCRM Product Type | product_type | Quick filtering/searching |
| tabCRM Territory | lft, rgt | Nested set tree traversal |

### Nested Set Indexes (Tree Structure)

| Table | Fields | Purpose |
|-------|--------|---------|
| tabCRM Territory | lft, rgt | Efficient tree queries (descendants, ancestors) |

### Foreign Key Constraints

All `Link` and `Dynamic Link` fields create foreign key relationships. Key foreign keys include:

**User References (17 tables):**
- CRM Call Log (receiver, caller)
- CRM Dashboard (user)
- CRM Deal (deal_owner)
- CRM Invitation (invited_by)
- CRM Lead (lead_owner)
- CRM Notification (from_user, to_user)
- CRM Task (assigned_to)
- CRM Telephony Agent (user)
- CRM Territory (territory_manager)
- All tables (modified_by, owner - system fields)

**Cross-DocType References:**
- CRM Deal -> CRM Lead, CRM Organization, CRM Deal Status, etc.
- CRM Lead -> CRM Lead Status, CRM Lead Source, CRM Territory, etc.
- CRM Call Log -> FCRM Note, User
- CRM Meta Ads Lead -> CRM Lead (target_lead)
- CRM Meta Lead Stagging -> CRM Lead (target_lead)

### Conditional Constraints

| Table | Field | Condition |
|-------|-------|-----------|
| tabCRM Dashboard | user | Required if private=1 |
| tabCRM Exotel Settings | account_sid, subdomain, api_key, api_token, webhook_verify_token | Required if enabled=1 |
| tabCRM Twilio Settings | account_sid, auth_token | Required if enabled=1 |
| tabERPNext CRM Settings | erpnext_company, erpnext_site_url, api_key, api_secret | Required based on various flags |
| tabERPNext CRM Settings | deal_status | Required if create_customer_on_status_change=1 |

### Child Table Constraints

All child tables (istable=1) have composite keys consisting of:
- parent (Foreign Key to parent doctype)
- parentfield (Field name in parent)
- parenttype (Parent doctype name)
- idx (Row position within parent)

**Child Tables:**
1. tabCRM Contacts
2. tabCRM Dropdown Item
3. tabCRM Holiday
4. tabCRM Products
5. tabCRM Service Day
6. tabCRM Service Level Priority
7. tabCRM Status Change Log
8. tabCRM Telephony Phone

### Read-Only/Calculated Fields

| Table | Field | Calculation |
|-------|-------|-------------|
| tabCRM Contacts | full_name, email, mobile_no, phone, gender | Fetched from Contact |
| tabCRM Deal | expected_deal_value | deal_value * probability / 100 |
| tabCRM Deal | total, net_total | Sum of products.amount, products.net_amount |
| tabCRM Holiday List | total_holidays | Count of holidays child table |
| tabCRM Lead | total, net_total | Sum of products.amount, products.net_amount |
| tabCRM Products | amount | qty * rate |
| tabCRM Products | discount_amount | amount * discount_percentage / 100 |
| tabCRM Products | net_amount | amount - discount_amount |
| tabCRM Status Change Log | duration | to_date - from_date |
| tabCRM Telephony Agent | user_name | Fetched from user.full_name |

---

## Summary Statistics

### Table Type Distribution

| Type | Count | Tables |
|------|-------|--------|
| Regular Tables | 29 | CRM Call Log, CRM Communication Status, CRM Dashboard, CRM Deal, CRM Deal Status, CRM Exotel Settings, CRM Fields Layout, CRM Form Script, CRM Global Settings, CRM Holiday List, CRM Industry, CRM Invitation, CRM Lead, CRM Lead Source, CRM Lead Status, CRM Lost Reason, CRM Meta Ads Lead, CRM Meta Lead Stagging, CRM Notification, CRM Organization, CRM Product, CRM Product Type, CRM Service Level Agreement, CRM Task, CRM Telephony Agent, CRM Territory, CRM View Settings, FCRM Note |
| Child Tables (istable) | 9 | CRM Contacts, CRM Dropdown Item, CRM Holiday, CRM Products, CRM Service Day, CRM Service Level Priority, CRM Status Change Log, CRM Telephony Phone |
| Single Documents (issingle) | 2 | CRM Exotel Settings, CRM Twilio Settings, ERPNext CRM Settings, FCRM Settings, Meta Integration Settings |

**Total:** 40 DocTypes

### Naming Strategy Distribution

| Strategy | Count | Description |
|----------|-------|-------------|
| By fieldname | 19 | Name is set from a specific field value |
| By naming series | 3 | Auto-generated with series (CRM-LEAD-.YYYY.-, CRM-DEAL-.YYYY.-) |
| Autoincrement | 3 | Sequential numbering |
| Expression | 2 | Computed from multiple fields |
| Prompt | 1 | User enters name on creation |
| Auto-generated | 12 | System-generated unique identifier (child tables + some regular tables) |

### Feature Distribution

| Feature | Count | Tables |
|---------|-------|--------|
| allow_import | 8 | CRM Call Log, CRM Deal, CRM Industry, CRM Lead, CRM Lead Source, CRM Organization, CRM Product, CRM Product Type, CRM Task, FCRM Note |
| allow_rename | 13 | CRM Call Log, CRM Communication Status, CRM Dashboard, CRM Deal, CRM Deal Status, CRM Holiday List, CRM Industry, CRM Lead, CRM Lead Source, CRM Lead Status, CRM Lost Reason, CRM Organization, CRM Product, CRM Product Type, CRM Service Level Agreement, CRM Territory, FCRM Note |
| track_changes | 10 | CRM Deal, CRM Lead, CRM Meta Ads Lead, CRM Meta Lead Stagging, CRM Product, CRM Product Type, CRM Twilio Settings, CRM View Settings, FCRM Note |
| quick_entry | 6 | CRM Communication Status, CRM Industry, CRM Lead Source, CRM Lost Reason, CRM Product, CRM Product Type |
| editable_grid | 3 | CRM Call Log, CRM Contacts |
| email_append_to | 1 | CRM Lead (allows emails to be appended to lead) |
| is_tree | 1 | CRM Territory (nested set tree structure) |
| read_only | 1 | CRM View Settings |

### Field Type Distribution

**Most Common Field Types:**
1. **Data** (140 char limit) - Standard text fields
2. **Link** - Foreign key relationships
3. **Check** - Boolean flags
4. **Select** - Dropdown with predefined options
5. **Dynamic Link** - Context-dependent foreign keys
6. **Table** - Child table relationships
7. **Datetime** - Timestamp fields
8. **Currency** - Monetary values
9. **Text Editor** - Rich text content
10. **Code** - JSON/JavaScript/Python code

### Relationship Statistics

**Tables with Foreign Keys:**
- **Most connected table**: CRM Deal (14 foreign key relationships)
- **Second most connected**: CRM Lead (11 foreign key relationships)
- **Tables linking to User**: 17 tables
- **Tables linking to DocType**: 7 tables
- **Tables with dynamic links**: 6 tables
- **Child table relationships**: 15 parent-child relationships

### Index Statistics

- **Total unique constraints**: 32 unique fields
- **Total search indexes**: 7 fields across 4 tables
- **Nested set indexes**: 2 fields (lft, rgt) in 1 table
- **Primary key indexes**: 40 (all tables have `name` as primary key)

### Special Constraints

**Multi-tenancy Support:**
- All regular tables have `owner` and `modified_by` fields for user tracking
- Dashboard and View Settings support private vs. public visibility

**Soft Delete:**
- No explicit soft delete mechanism (standard Frappe behavior handles this at framework level)

**Audit Trail:**
- 10 tables have `track_changes` enabled for full audit history
- All tables have `creation` and `modified` timestamps

**Conditional Requirements:**
- 5 tables have conditional field requirements based on other field values
- Used primarily in Settings doctypes

### Data Volume Estimates (Typical CRM)

**High-Volume Tables:**
- CRM Lead (thousands to hundreds of thousands)
- CRM Deal (thousands to tens of thousands)
- CRM Call Log (thousands to hundreds of thousands)
- CRM Notification (thousands to hundreds of thousands)
- CRM Meta Ads Lead (potentially very high if active campaigns)
- CRM Meta Lead Stagging (potentially very high)
- CRM Task (thousands)
- FCRM Note (thousands to tens of thousands)

**Medium-Volume Tables:**
- CRM Organization (hundreds to thousands)
- CRM Product (hundreds to thousands)
- CRM Status Change Log (child table - high volume)
- CRM Products (child table - high volume)

**Low-Volume Tables (Master Data):**
- CRM Lead Status (5-20 records)
- CRM Deal Status (5-20 records)
- CRM Communication Status (5-20 records)
- CRM Industry (20-100 records)
- CRM Territory (20-500 records, tree structure)
- CRM Lead Source (10-50 records)
- CRM Lost Reason (5-30 records)
- CRM Product Type (5-50 records)
- CRM Service Level Agreement (1-10 records)
- CRM Holiday List (1-10 records)

**Single Document Tables:**
- Exactly 1 record per table (configuration)

---

## Performance Considerations

### Recommended Additional Indexes

Based on common query patterns, consider adding these indexes:

```sql
-- Frequently filtered/joined fields
CREATE INDEX idx_lead_status ON `tabCRM Lead`(status);
CREATE INDEX idx_lead_owner ON `tabCRM Lead`(lead_owner);
CREATE INDEX idx_lead_source ON `tabCRM Lead`(source);
CREATE INDEX idx_lead_created ON `tabCRM Lead`(creation);

CREATE INDEX idx_deal_status ON `tabCRM Deal`(status);
CREATE INDEX idx_deal_owner ON `tabCRM Deal`(deal_owner);
CREATE INDEX idx_deal_organization ON `tabCRM Deal`(organization);
CREATE INDEX idx_deal_created ON `tabCRM Deal`(creation);

CREATE INDEX idx_call_log_created ON `tabCRM Call Log`(creation);
CREATE INDEX idx_call_log_reference ON `tabCRM Call Log`(reference_doctype, reference_docname);

CREATE INDEX idx_task_assigned ON `tabCRM Task`(assigned_to);
CREATE INDEX idx_task_status ON `tabCRM Task`(status);
CREATE INDEX idx_task_due_date ON `tabCRM Task`(due_date);

CREATE INDEX idx_notification_to_user ON `tabCRM Notification`(to_user, read);
CREATE INDEX idx_notification_created ON `tabCRM Notification`(creation);

CREATE INDEX idx_meta_lead_processed ON `tabCRM Meta Ads Lead`(processed);
CREATE INDEX idx_meta_staging_processed ON `tabCRM Meta Lead Stagging`(processed);

-- Composite indexes for common filter combinations
CREATE INDEX idx_lead_status_owner ON `tabCRM Lead`(status, lead_owner);
CREATE INDEX idx_deal_status_owner ON `tabCRM Deal`(status, deal_owner);
```

### Optimization Notes

1. **CRM Lead & CRM Deal**: Core tables that will grow large
   - Already has search index on status
   - Consider partitioning by creation date for very large datasets
   - Regularly archive converted leads and closed deals

2. **CRM Call Log**: High-volume transactional table
   - Consider time-based partitioning
   - Archive old call logs (>1 year) to separate table

3. **CRM Notification**: Very high-volume table
   - Index on (to_user, read) for unread notification queries
   - Implement aggressive cleanup policy (delete read notifications >30 days)

4. **Meta Lead Tables**: Can grow very large with active campaigns
   - Staging table should be cleaned up regularly after processing
   - Consider archiving processed leads after target_lead creation

5. **Child Tables**: Inherit parent query performance
   - CRM Products: Pre-calculate totals in parent (already done)
   - CRM Status Change Log: Archive old logs to history table

6. **Territory Tree**: Uses nested set model
   - lft/rgt indexes already defined
   - Excellent for tree queries but updates are expensive
   - Minimize tree restructuring operations

---

## Field Type Reference

### Standard Field Types

| Field Type | Database Type | Description | Example Usage |
|------------|---------------|-------------|---------------|
| Data | VARCHAR(140) | Short text | Names, codes, identifiers |
| Text | TEXT | Long text | Descriptions, notes |
| Long Text | LONGTEXT | Very long text | JSON data, payloads |
| Text Editor | LONGTEXT | Rich HTML text | Formatted descriptions |
| HTML Editor | LONGTEXT | HTML content | Email messages |
| Code | TEXT | Code/JSON | Scripts, configurations |
| Int | INT(11) | Integer | Positions, counts |
| Long Int | BIGINT(20) | Large integer | Timestamps |
| Float | DECIMAL(18,6) | Decimal number | Exchange rates |
| Currency | DECIMAL(18,6) | Money value | Prices, totals |
| Percent | DECIMAL(18,6) | Percentage (0-100) | Discounts, probabilities |
| Check | TINYINT(1) | Boolean | Flags, toggles |
| Select | VARCHAR(140) | Predefined options | Statuses, types |
| Link | VARCHAR(140) | Foreign key | Relationships |
| Dynamic Link | VARCHAR(140) | Context FK | Generic references |
| Date | DATE | Date only | Birthdates, deadlines |
| Datetime | DATETIME(6) | Date + time | Timestamps |
| Time | TIME | Time only | Business hours |
| Duration | INT(11) | Seconds | Call duration, SLA time |
| Password | TEXT | Encrypted text | API tokens, passwords |
| Attach | TEXT | File path | Documents |
| Attach Image | TEXT | Image path | Photos, logos |
| Table | - | Child table | One-to-many relations |
| JSON | LONGTEXT | JSON data | Complex structures |

### System Fields (Auto-added to all tables)

| Field | Type | Description |
|-------|------|-------------|
| name | VARCHAR(140) | Primary key (unique identifier) |
| creation | DATETIME(6) | When record was created |
| modified | DATETIME(6) | Last modification time |
| modified_by | VARCHAR(140) | User who last modified |
| owner | VARCHAR(140) | User who created record |
| docstatus | INT(1) | Document status (0=Draft, 1=Submitted, 2=Cancelled) |
| idx | INT(8) | Display order |
| _user_tags | TEXT | User-added tags |
| _comments | TEXT | Comments count |
| _assign | TEXT | Assigned users |
| _liked_by | TEXT | Users who liked |

**Note:** Single documents (issingle: 1) don't have all system fields.

---

## Schema Evolution Notes

### Version Compatibility
This schema documentation reflects the current state of the Frappe CRM models as of 2026-01-20.

### Migration Considerations

**When adding new fields:**
- Use `default` values for non-null fields
- Consider backward compatibility
- Update related form scripts and layouts

**When modifying existing fields:**
- Cannot change field type after data exists
- Use data migration scripts for transformations
- Consider creating new field and migrating data

**When adding indexes:**
- Can be added without data migration
- May cause temporary table locks on large tables
- Consider adding during maintenance window

**When removing fields:**
- Mark as `hidden` first, remove later
- Ensure no dependencies in code/scripts
- Archive data before field removal

---

## Integration Points

### External System Integrations

1. **Meta (Facebook) Ads**
   - Tables: CRM Meta Ads Lead, CRM Meta Lead Stagging
   - Settings: Meta Integration Settings
   - Flow: Webhook -> Staging -> Processing -> CRM Lead

2. **ERPNext**
   - Settings: ERPNext CRM Settings
   - Flow: Deal closed -> Customer creation in ERPNext

3. **Twilio**
   - Tables: CRM Call Log
   - Settings: CRM Twilio Settings
   - Flow: Call events -> Call log creation

4. **Exotel**
   - Tables: CRM Call Log
   - Settings: CRM Exotel Settings
   - Flow: Call events -> Call log creation

### Webhook Endpoints

**Meta Webhook:**
- Receives lead form submissions
- Writes to CRM Meta Lead Stagging
- Background job processes staging to CRM Lead

**Telephony Webhooks:**
- Receive call events from Twilio/Exotel
- Create/update CRM Call Log records

---

## Best Practices

### Naming Conventions

1. **DocType Names**: Use CamelCase with "CRM" prefix (e.g., CRM Lead, CRM Deal)
2. **Field Names**: Use snake_case (e.g., lead_owner, deal_value)
3. **Link Fields**: Name after target doctype (e.g., `industry` links to CRM Industry)
4. **Child Tables**: Use plural form (e.g., `contacts`, `products`)

### Data Integrity

1. **Required Foreign Keys**: Status fields are always required to maintain data integrity
2. **Conditional Requirements**: Use for settings that depend on feature flags
3. **Read-only Fields**: Mark calculated fields as read-only to prevent manual edits
4. **Unique Constraints**: Apply to natural keys (codes, names) not technical IDs

### Performance

1. **Child Tables**: Keep row counts reasonable (<100 rows per parent)
2. **JSON Fields**: Use sparingly, prefer proper normalized structure
3. **Text Fields**: Avoid full-text search on very large text fields
4. **Indexes**: Add on frequently filtered/joined fields

### Security

1. **Password Fields**: Always encrypted, never logged
2. **API Keys**: Store in Password fields, not Data fields
3. **User Permissions**: Leverage Frappe's role-based permission system
4. **Audit Trail**: Enable track_changes on sensitive doctypes

---

## Appendix: Field Details by Category

### Contact Information Fields

Used across multiple doctypes for storing contact details:

- **email**: Email address (validated format)
- **mobile_no**: Mobile phone number (Phone format)
- **phone**: Landline phone number (Phone format)
- **website**: Website URL (URL format)

### Status & Lifecycle Fields

Fields tracking record status and lifecycle:

- **status**: Current status (Link to status master)
- **converted**: Whether lead converted to deal (Check)
- **processed**: Whether record processed (Check)
- **enabled**: Whether feature enabled (Check)
- **disabled**: Whether record disabled (Check)

### Ownership & Assignment Fields

Fields tracking who owns or is assigned to records:

- **owner**: Created by (System field)
- **modified_by**: Last modified by (System field)
- **lead_owner**: Lead owner (Link to User)
- **deal_owner**: Deal owner (Link to User)
- **assigned_to**: Task assignee (Link to User)
- **territory_manager**: Territory manager (Link to User)

### Financial Fields

Fields for monetary values:

- **deal_value**: Deal amount (Currency)
- **annual_revenue**: Company revenue (Currency)
- **standard_rate**: Product price (Currency)
- **currency**: Currency code (Link to Currency)
- **exchange_rate**: Exchange rate (Float)
- **total**: Gross total (Currency, calculated)
- **net_total**: Net total (Currency, calculated)

### Temporal Fields

Date and time tracking:

- **creation**: Created on (System field)
- **modified**: Last modified (System field)
- **start_date**: Start date (Date)
- **due_date**: Due date (Datetime)
- **expected_closure_date**: Expected close (Date)
- **closed_date**: Actual close (Date)
- **from_date**: Period start (Date)
- **to_date**: Period end (Date)

---

**End of Documentation**

---

*This documentation was automatically generated by analyzing all DocType JSON files in the Frappe CRM application. For questions or clarifications, refer to the individual doctype JSON files in `/home/user/crm/crm/fcrm/doctype/`.*
