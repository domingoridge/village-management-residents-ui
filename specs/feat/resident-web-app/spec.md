# Feature Specification: Village Management Resident Web Application

**Feature Branch**: `feat/resident-web-app`
**Created**: 2025-10-16
**Status**: Draft
**Input**: User description: "docs/business-requirements/resident-requirements.md"

## Visual Identity

The web app should align with the company’s modern, clean, minimalist design.

### Color Palette (Design Intent)

| Role       | Name         | Hex       | Usage                           |
| ---------- | ------------ | --------- | ------------------------------- |
| Primary    | Lapis Lazuli | `#166088` | Buttons, links, key highlights  |
| Secondary  | White        | `#FEFEFE` | Secondary buttons, hover states |
| Accent     | Burnt Sienna | `#E2725B` | Alerts, highlights              |
| Success    | Emerald      | `#22C55E` | Confirmation, success states    |
| Error      | Red          | `#EF4444` | Errors, destructive actions     |
| Background | White        | `#FEFEFE` | Page background                 |
| Text       | Slate        | `#333333` | Primary text                    |

---

---

## Design Mockups

![Dashboard Page Mockup](../designs/dashboard.png)
![Household Management Page Mockup](../designs/household_management.png)
![Household management details Page Mockup](../designs/household_management_details.png)
![Vehicle Sticker IssuancePage Mockup](../designs/vehicle_sticker_issuance.png)
![Construction Permit Page Mockup](../designs/construction_permit.png)

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Guest Pre-Authorization (Priority: P1)

As a household head or member, I want to pre-register guests before they arrive so that they can enter smoothly without delays at the gate, and I can approve walk-in guests remotely when I'm not home.

**Why this priority**: Guest management is the most frequently used feature and directly impacts daily resident experience. Pre-authorization reduces gate wait times and provides convenience for busy residents who can't always answer calls from guards.

**Independent Test**: Can be fully tested by creating a guest pre-registration, verifying it appears in the upcoming guests list, simulating guard notification for walk-in guest approval, and confirming guest status updates are reflected in the system.

**Acceptance Scenarios**:

1. **Given** I am logged in as a household head, **When** I fill out the guest pre-registration form with name, expected arrival date, and vehicle plate number, **Then** the guest is added to my upcoming guests list with "Pending" status
2. **Given** I have a pre-authorized guest, **When** the guest arrives at the gate, **Then** I receive a notification and the guest status updates to "At Gate"
3. **Given** I receive a walk-in guest notification from the guard, **When** I approve the guest within 5 minutes, **Then** the guard is notified and the guest is allowed entry
4. **Given** I receive a walk-in guest notification, **When** I do not respond within 5 minutes, **Then** the request auto-denies and the guard is notified
5. **Given** I have upcoming guests, **When** I cancel a guest before their arrival, **Then** the guest is removed from active guests and guards are notified
6. **Given** I search my guest history, **When** I filter by date range or guest name, **Then** I see only matching guest records

---

### User Story 2 - Vehicle Sticker Management (Priority: P2)

As a household head or member, I want to request vehicle stickers for my household vehicles and track their status, renewal, and expiration so that my vehicles can access the village without issues.

**Why this priority**: Vehicle stickers are essential for regular village access. This feature enables self-service sticker requests and reduces administrative burden while ensuring residents stay compliant with sticker requirements.

**Independent Test**: Can be tested by submitting a sticker request with vehicle details and documents, tracking the application status through the approval workflow, viewing all household stickers with their expiration dates, and requesting renewal for an expiring sticker.

**Acceptance Scenarios**:

1. **Given** I am logged in as a household head, **When** I submit a sticker request with vehicle type, plate number, make/model, color, and upload OR/CR documents, **Then** the sticker request is created with "Pending" status
2. **Given** I have submitted a sticker request, **When** an admin approves it, **Then** the sticker appears in my sticker list with "Active" status and expiration date
3. **Given** I have an active sticker expiring in 30 days, **When** I view my sticker list, **Then** I see an expiry warning and a "Renew" button is available
4. **Given** I click the renew button on an expiring sticker, **When** I submit the renewal request with updated information, **Then** a new renewal request is created
5. **Given** I view my sticker list, **When** I check sticker details, **Then** I can see assigned user, vehicle details, violation count, and expiration countdown
6. **Given** my sticker is suspended, **When** I view the sticker details, **Then** I see the suspension status, reason, and violation history

---

### User Story 3 - Household Profile and Access History (Priority: P2)

As a household head or member, I want to view my household information, member list, and entry/exit history so that I can monitor household activity and understand who is accessing the village under my household.

**Why this priority**: Transparency into household access provides security and accountability. This foundational feature supports all other features by giving residents visibility into their household status and activity.

**Independent Test**: Can be tested by viewing household profile with member list and sticker quota, filtering access history by date range and vehicle, and verifying that all household entries and exits are logged correctly.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I view my household profile, **Then** I see household code, address, household head information, resident list, and sticker quota usage
2. **Given** I view my access history, **When** I filter by date range, **Then** I see all entry/exit logs for household vehicles within that range
3. **Given** I view my access history, **When** I filter by specific vehicle (sticker), **Then** I see only logs for that vehicle
4. **Given** I am a household member, **When** I view access logs, **Then** I see entry type (Resident, Guest, Delivery, Construction), gate location, and timestamp
5. **Given** I am a beneficial user, **When** I view my access history, **Then** I see only my personal access logs, not the entire household's
6. **Given** I need to update contact information, **When** I edit my phone number or email, **Then** my profile is updated and I receive a confirmation

---

### User Story 4 - Announcements and Village Updates (Priority: P3)

As any resident user, I want to view village announcements, filter by type, and receive notifications for urgent updates so that I stay informed about events, maintenance, emergencies, and rule changes.

**Why this priority**: Communication is vital for community engagement and safety. Announcements keep residents informed without requiring active outreach from administration.

**Independent Test**: Can be tested by viewing the announcement feed, filtering by type (Event, Emergency, Maintenance), marking announcements as read, receiving notifications for new urgent announcements, and viewing announcement attachments.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I view the announcements feed, **Then** I see announcements in reverse chronological order with type, priority, and read/unread status
2. **Given** there are multiple announcement types, **When** I filter by "Emergency", **Then** I see only emergency announcements
3. **Given** a new urgent announcement is published, **When** I have notifications enabled, **Then** I receive an immediate notification
4. **Given** I view an unread announcement, **When** I open the announcement details, **Then** the announcement is marked as read
5. **Given** an announcement has attachments, **When** I view the announcement details, **Then** I can view images and PDF attachments
6. **Given** I want to share an announcement, **When** I click the share button, **Then** I can share the announcement via web share API or copy the link

---

### User Story 5 - Payments and Billing (Priority: P3)

As a household head or member, I want to view my payment history, outstanding balances, and make online payments so that I can conveniently pay association fees, road fees, and other charges without visiting the office.

**Why this priority**: Online payments provide convenience and reduce payment friction. This feature improves cash flow for the village and provides residents with transparency into their financial obligations.

**Independent Test**: Can be tested by viewing the payment dashboard with outstanding balance, filtering payment history by status and type, initiating an online payment, and downloading a receipt after successful payment.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I view the payment dashboard, **Then** I see total outstanding balance, upcoming due payments, and recent payment history
2. **Given** I have outstanding payments, **When** I filter by "Overdue", **Then** I see only overdue payments with amounts and due dates
3. **Given** I select a payment to pay, **When** I choose a payment method (GCash, Credit Card, PayMaya) and complete the transaction, **Then** payment is processed and I receive a confirmation notification
4. **Given** I complete a payment, **When** I view my payment history, **Then** the payment appears with "Paid" status and I can download the receipt as PDF
5. **Given** I have a payment due in 7 days, **When** the due date approaches, **Then** I receive a payment reminder notification
6. **Given** I view payment breakdown, **When** I check payment types, **Then** I see categorized amounts for Association Fee, Road Fee, Sticker Fee, and Penalties

---

### User Story 6 - Construction Permit Application (Priority: P4)

As a household head or member, I want to submit construction permit applications with required documents, track approval status, and pay road fees so that I can legally conduct construction work in my property.

**Why this priority**: While less frequent than daily operations, construction permits are important for compliance and preventing illegal construction. This feature streamlines the application process.

**Independent Test**: Can be tested by submitting a permit application with project description, contractor details, dates, and documents, tracking the approval status, viewing calculated road fees, and paying fees online.

**Acceptance Scenarios**:

1. **Given** I want to apply for a construction permit, **When** I submit the application form with project description, contractor name/contact, proposed start/end dates, and upload blueprints and contracts, **Then** the permit application is created with "Pending" status
2. **Given** I have a pending permit application, **When** the admin approves it, **Then** I receive a notification, the status updates to "Approved", and calculated road fee is displayed
3. **Given** my permit is approved with road fees, **When** I pay the road fee online, **Then** the payment is recorded and the permit status updates to "In Progress"
4. **Given** my permit application is rejected, **When** I view the permit details, **Then** I see the rejection reason and can resubmit if needed
5. **Given** I have an active permit, **When** I view permit details, **Then** I see timeline of status changes, payment status, and permit conditions
6. **Given** my permit is nearing expiration, **When** the expiration date approaches, **Then** I receive a reminder notification

---

### User Story 7 - Incident Reporting (Priority: P4)

As any resident user, I want to report incidents or suspicious activities with photos and location details so that security and administration can respond quickly to safety concerns.

**Why this priority**: Safety and security reporting is critical but less frequent than daily operations. Quick reporting mechanisms encourage residents to report issues promptly.

**Independent Test**: Can be tested by submitting an incident report with type, description, location, photos, and severity, tracking the incident status, receiving status update notifications, and viewing resolution notes.

**Acceptance Scenarios**:

1. **Given** I witness an incident, **When** I submit an incident report with type (Security Threat, Traffic Violation, Noise Complaint), title, description, location, photos, and severity, **Then** the incident is created with "Reported" status
2. **Given** I submit an incident report, **When** a guard acknowledges it, **Then** I receive an acknowledgment notification and the status updates to "Acknowledged"
3. **Given** my incident is being handled, **When** the status changes to "In Progress" or "Resolved", **Then** I receive status update notifications
4. **Given** my incident is resolved, **When** I view the incident details, **Then** I see assigned guard information, resolution notes, and timeline of updates
5. **Given** I want to report anonymously, **When** I check the "Submit anonymously" option, **Then** my identity is not disclosed to guards
6. **Given** I view my incident list, **When** I filter by status or type, **Then** I see only matching incidents

---

### User Story 8 - Village Rules and Regulations (Priority: P5)

As any resident user, I want to view village rules, search for specific regulations, and receive notifications when rules change so that I understand my obligations and avoid violations.

**Why this priority**: Rules awareness helps residents comply and avoid penalties. This is a reference feature used occasionally rather than daily.

**Independent Test**: Can be tested by viewing categorized rules list, searching for specific rules by keyword, filtering by category, viewing rule details with penalties, and receiving notifications for new or updated rules.

**Acceptance Scenarios**:

1. **Given** I want to understand village rules, **When** I view the rules list, **Then** I see rules categorized by type (Curfew, Speed Limit, Parking, Noise, Construction Hours, Pet Policy)
2. **Given** I need specific rule information, **When** I search for a keyword, **Then** I see all rules matching that keyword
3. **Given** I view a rule, **When** I open the rule details, **Then** I see full rule text, effective date, penalty information, and related documents
4. **Given** a rule is updated or added, **When** I view the rules list, **Then** I see a "New" or "Updated" badge on changed rules
5. **Given** a new urgent rule is published, **When** notifications are enabled, **Then** I receive a notification about the rule change
6. **Given** I want to view rule documents, **When** I click on a rule with attachments, **Then** I can view PDF documents in the browser

---

### User Story 9 - Communication with Administration (Priority: P5)

As a household head or member, I want to send messages to village administration, attach photos or documents, and receive responses so that I can get assistance without visiting the office.

**Why this priority**: Direct communication channel improves resident satisfaction but is less urgent than operational features. Most issues can be handled through other features.

**Independent Test**: Can be tested by sending a message to admin with category and attachments, viewing conversation history, receiving admin replies, and getting notifications for new responses.

**Acceptance Scenarios**:

1. **Given** I need to contact administration, **When** I compose a message with category (General Inquiry, Complaint, Request, Feedback) and optional attachments, **Then** the message is sent to admin
2. **Given** I have sent messages, **When** I view conversation history, **Then** I see threaded conversations with timestamps
3. **Given** admin replies to my message, **When** the reply is received, **Then** I get a notification and see an unread badge
4. **Given** I receive an admin reply, **When** I open the conversation, **Then** the unread indicator is cleared
5. **Given** I want to attach evidence, **When** I add photos or documents to my message, **Then** attachments are uploaded and visible to admin
6. **Given** I have multiple conversations, **When** I view my message list, **Then** I see conversation preview, last message timestamp, and unread indicators

---

### Edge Cases

- What happens when a user loses internet connection while submitting a form (guest registration, payment, permit)?
- How does the system handle file uploads that exceed the maximum file size limit?
- What happens when a guest approval request expires due to no response?
- How does the system handle concurrent sticker requests when approaching household quota limit?
- What happens when a payment gateway transaction fails or times out?
- How does the system handle notification permission denial by the user?
- What happens when a user tries to renew a suspended or revoked sticker?
- How does the system handle viewing large access history datasets (multiple years)?
- What happens when an announcement expires or is deleted after a user has bookmarked it?
- How does the system handle form submission when session expires during the process?

## Requirements _(mandatory)_

### Functional Requirements

**Authentication & Authorization**

- **FR-001**: System MUST authenticate users via email/phone and password with JWT token-based sessions
- **FR-002**: System MUST support three user roles: household-head, household-member, and household-beneficial-user with distinct permission levels
- **FR-003**: System MUST automatically log out users after 30 minutes of inactivity
- **FR-004**: System MUST provide automatic token refresh mechanism to maintain active sessions
- **FR-005**: System MUST allow users to change their password securely

**Guest Management**

- **FR-006**: System MUST allow household heads and members to pre-register guests with name, phone, vehicle plate, purpose, expected arrival date/time, and special instructions
- **FR-007**: System MUST send real-time notifications when pre-authorized guests arrive at the gate
- **FR-008**: System MUST allow household heads and members to approve or deny walk-in guest requests within 5 minutes
- **FR-009**: System MUST auto-deny walk-in guest requests that receive no response within 5 minutes
- **FR-010**: System MUST allow users to view upcoming guests, past guests, and filter by date range or name
- **FR-011**: System MUST allow users to cancel pending guest pre-authorizations
- **FR-012**: System MUST display guest status (Pending, Approved, At Gate, Denied, Completed)

**Vehicle Sticker Management**

- **FR-013**: System MUST allow household heads and members to request new vehicle stickers with vehicle type, plate number, make/model, color, user type, and OR/CR documents
- **FR-014**: System MUST support file uploads for OR/CR documents and vehicle photos
- **FR-015**: System MUST display all household stickers with status (Active, Expired, Suspended, Revoked), expiration date, and violation count
- **FR-016**: System MUST allow sticker renewal requests 30 days before expiration
- **FR-017**: System MUST send notifications 30 days and 7 days before sticker expiration
- **FR-018**: System MUST allow beneficial users to view their assigned sticker in read-only mode
- **FR-019**: System MUST display sticker approval workflow status (Requested, Under Review, Approved, Active)
- **FR-020**: System MUST notify users when stickers are suspended or revoked with violation details

**Household Profile & Access History**

- **FR-021**: System MUST display household profile with household code, address, household head, resident list, sticker quota, and status
- **FR-022**: System MUST display access history with entry/exit logs showing entry type, gate location, vehicle, and timestamp
- **FR-023**: System MUST allow filtering access history by date range and vehicle
- **FR-024**: System MUST allow household heads and members to update contact information (phone, email, emergency contact)
- **FR-025**: System MUST show beneficial users only their personal access history, not the entire household's

**Announcements**

- **FR-026**: System MUST display announcements in reverse chronological order with type, priority, read/unread status, and publish date
- **FR-027**: System MUST support announcement types: Event, Maintenance, Emergency, General, Rule Change, Fee Notice
- **FR-028**: System MUST support announcement priorities: Low, Normal, High, Urgent
- **FR-029**: System MUST allow filtering announcements by type and search by keyword
- **FR-030**: System MUST send real-time notifications for urgent announcements
- **FR-031**: System MUST mark announcements as read when viewed
- **FR-032**: System MUST display announcement attachments (images, PDFs) with preview capability
- **FR-033**: System MUST allow sharing announcements via web share API or copy link

**Payments & Billing**

- **FR-034**: System MUST display payment dashboard with total outstanding balance, upcoming due payments, and recent payment history
- **FR-035**: System MUST allow filtering payments by status (Paid, Pending, Overdue) and type (Association Fee, Road Fee, Sticker Fee, Penalty)
- **FR-036**: System MUST support online payment via multiple methods (GCash, PayMaya, Credit Card, Bank Transfer)
- **FR-037**: System MUST send payment confirmation notifications upon successful transaction
- **FR-038**: System MUST allow users to download payment receipts as PDF
- **FR-039**: System MUST send payment reminders 7 days before due date, on due date, and for overdue payments
- **FR-040**: System MUST display payment breakdown by type with amounts and due dates

**Construction Permits**

- **FR-041**: System MUST allow household heads and members to submit construction permit applications with project description, contractor details, proposed dates, and document uploads
- **FR-042**: System MUST display permit status (Pending, Approved, Rejected, In Progress, Completed)
- **FR-043**: System MUST display calculated road fees for approved permits
- **FR-044**: System MUST allow online payment of permit road fees
- **FR-045**: System MUST display approval/rejection reason for permit applications
- **FR-046**: System MUST send notifications for permit application received, approval/rejection, payment due, and expiration
- **FR-047**: System MUST display permit timeline showing all status changes

**Incident Reporting**

- **FR-048**: System MUST allow all users to report incidents with type, title, description, location, photos/videos, severity, and optional anonymous submission
- **FR-049**: System MUST support incident types: Security Threat, Traffic Violation, Noise Complaint, Suspicious Activity, Emergency, Fire, Medical, Other
- **FR-050**: System MUST support severity levels: Low, Medium, High, Critical
- **FR-051**: System MUST display incident status (Reported, Acknowledged, In Progress, Resolved, Closed)
- **FR-052**: System MUST send notifications for incident acknowledgment, status changes, and resolution
- **FR-053**: System MUST allow filtering incidents by status, type, and date range
- **FR-054**: System MUST display assigned guard information and resolution notes for resolved incidents
- **FR-055**: System MUST support geolocation for incident location capture

**Village Rules**

- **FR-056**: System MUST display village rules categorized by type (Curfew, Speed Limit, Parking, Noise, Construction Hours, Pet Policy, Visitor Policy, General)
- **FR-057**: System MUST allow searching rules by keyword
- **FR-058**: System MUST display rule details including full text, effective date, penalty information, and related documents
- **FR-059**: System MUST send notifications when new rules are added or existing rules are updated
- **FR-060**: System MUST display "New" or "Updated" badges on recently changed rules
- **FR-061**: System MUST support viewing rule documents (PDFs) in the browser

**Communication**

- **FR-062**: System MUST allow household heads and members to send messages to administration with categories (General Inquiry, Complaint, Request, Feedback)
- **FR-063**: System MUST support attaching photos or documents to messages
- **FR-064**: System MUST display conversation history with threaded messages and timestamps
- **FR-065**: System MUST send notifications when admin replies to user messages
- **FR-066**: System MUST display unread message badges and clear them when messages are viewed

**Notifications**

- **FR-067**: System MUST support real-time notifications via WebSocket connection
- **FR-068**: System MUST request browser notification permission and handle permission denial gracefully
- **FR-069**: System MUST allow users to customize notification preferences by type
- **FR-070**: System MUST display in-app notification center with notification history
- **FR-071**: System MUST support notification actions (e.g., Approve/Deny for guest requests, Pay Now for payments)

**General System Requirements**

- **FR-072**: System MUST be responsive and function on desktop, tablet, and mobile devices
- **FR-073**: System MUST support progressive web app (PWA) capabilities with offline access to cached data
- **FR-074**: System MUST cache guest list (30 days), household stickers, announcements (60 days), payment history (12 months), and access logs (30 days)
- **FR-075**: System MUST provide manual refresh option for all data views
- **FR-076**: System MUST validate all form inputs client-side before submission
- **FR-077**: System MUST compress images client-side before upload
- **FR-078**: System MUST support drag-and-drop file uploads
- **FR-079**: System MUST display loading indicators during save operations
- **FR-080**: System MUST display toast notifications for success and error messages in the top-right position
- **FR-081**: System MUST provide skeleton loaders for all components during data loading

### Key Entities

- **User**: Represents a resident or beneficial user with authentication credentials, role (household-head, household-member, household-beneficial-user), contact information, and household association
- **Household**: Represents a residential unit with household code, address (block/lot), household head, resident list, sticker quota, and status (Active, Inactive, Suspended)
- **Guest**: Represents a visitor pre-registered or approved for entry with name, phone, vehicle plate, purpose, expected arrival date/time, status (Pending, Approved, At Gate, Denied, Completed), and special instructions
- **Vehicle Sticker**: Represents a vehicle pass with vehicle type, plate number, make/model, color, user type, assigned user, expiration date, status (Active, Expired, Suspended, Revoked), and violation count
- **Announcement**: Represents a village-wide communication with type (Event, Maintenance, Emergency, General, Rule Change, Fee Notice), priority (Low, Normal, High, Urgent), title, content, attachments, publish date, expiry date, and read status per user
- **Payment**: Represents a financial transaction with amount, type (Association Fee, Road Fee, Sticker Fee, Penalty), status (Paid, Pending, Overdue), due date, payment date, payment method, and receipt information
- **Construction Permit**: Represents a construction application with project description, contractor details, proposed dates, status (Pending, Approved, Rejected, In Progress, Completed), calculated road fee, payment status, documents, and approval/rejection reason
- **Incident**: Represents a reported issue with type (Security Threat, Traffic Violation, etc.), title, description, location, severity (Low, Medium, High, Critical), status (Reported, Acknowledged, In Progress, Resolved, Closed), photos/videos, assigned guard, resolution notes, and status timeline
- **Access Log**: Represents an entry/exit record with household, vehicle (sticker), entry type (Resident, Guest, Delivery, Construction), gate location, timestamp (entry/exit), and associated guest or permit if applicable
- **Village Rule**: Represents a regulation with category (Curfew, Speed Limit, etc.), title, description, effective date, penalty amount, related documents, and last updated timestamp
- **Message**: Represents communication between user and administration with category (General Inquiry, Complaint, Request, Feedback), conversation thread, message content, attachments, timestamp, sender, and read status
- **Notification**: Represents a system notification with type (guest arrival, payment due, etc.), priority (Critical, High, Normal, Low), title, content, action buttons, timestamp, read status, and associated entity reference

## Success Criteria _(mandatory)_

### Measurable Outcomes

**User Adoption**

- **SC-001**: 80% or more of residents register and activate their account within 3 months of launch
- **SC-002**: 60% or more monthly active users (MAU) sustained after 6 months
- **SC-003**: Average user visits the application 3 or more times per week
- **SC-004**: 70% or more of users return within 7 days of first visit

**Feature Usage**

- **SC-005**: 70% or more of guests are pre-authorized through the application rather than walk-in approvals
- **SC-006**: 50% or more of payments are completed via the web application
- **SC-007**: 60% or more of announcements are viewed within 48 hours of publication
- **SC-008**: 40% or more of incidents are reported via the web application
- **SC-009**: Users can pre-register a guest in under 2 minutes
- **SC-010**: Users can complete a payment transaction in under 3 minutes

**Performance**

- **SC-011**: Initial page load completes in under 3 seconds on 4G mobile connection
- **SC-012**: Page navigation between screens completes in under 300 milliseconds
- **SC-013**: Guest approval actions complete in under 5 seconds from notification to guard confirmation
- **SC-014**: System supports 1,000 concurrent users without performance degradation
- **SC-015**: 95% or more of API requests return results in under 500 milliseconds

**User Satisfaction**

- **SC-016**: In-app feedback score of 4.0 or higher out of 5.0
- **SC-017**: Support tickets related to the resident application are fewer than 10 per week
- **SC-018**: Net Promoter Score (NPS) of 40 or higher
- **SC-019**: 90% or more of users successfully complete their primary task on first attempt
- **SC-020**: Task abandonment rate is below 15% for all major features

**System Reliability**

- **SC-021**: Application error rate is less than 1% of all user sessions
- **SC-022**: Notification delivery success rate is 95% or higher for critical notifications
- **SC-023**: Payment transaction success rate is 98% or higher
- **SC-024**: Application uptime is 99.5% or higher during peak hours (6 AM - 10 PM)

**Business Impact**

- **SC-025**: Reduce guard-to-resident calls for guest approval by 60%
- **SC-026**: Reduce in-person office visits for payments by 50%
- **SC-027**: Reduce sticker application processing time by 40% through digitization
- **SC-028**: Increase on-time payment rate by 30% through automated reminders

## Assumptions

- Users have access to smartphones, tablets, or desktop computers with modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Users have basic digital literacy to navigate web applications and complete forms
- Backend API endpoints are available and functional according to the technical specification
- Payment gateway integrations (GCash, PayMaya, Credit Card processing) are configured and operational
- WebSocket server is available for real-time notifications
- Document storage service (AWS S3 or equivalent) is configured for file uploads
- Users have internet connectivity (WiFi or mobile data) to access the application
- Maximum file upload size is 10MB per file, 50MB total per transaction
- SMS and email gateways are configured for backup notifications when browser notifications are unavailable
- Village administration has a corresponding admin dashboard to approve stickers, permits, and respond to messages
- Security guards have a corresponding guard application to process guest approvals and log access entries
- User data retention follows standard practice: active data indefinitely, archived data for 7 years, deleted data permanently removed after 30 days
- The application will be hosted on a reliable cloud platform with SSL/TLS encryption
- Dark mode support will be implemented using system preferences or user toggle
- The application will be available in English; multi-language support is not required in initial release
- Browser notification opt-in rate is expected to be 30% or higher based on industry standards
- Average household has 2-5 members and 1-3 vehicle stickers
