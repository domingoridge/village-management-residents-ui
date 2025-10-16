# Web Resident App - Business Requirements Document

## Document Version: 1.0

**Date:** October 7, 2025
**Source:** Village Management System Technical Specification v1.0
**Platform:** Web Application

---

## 1. Overview and Purpose

The Resident Web App is a mobile first web application designed for household heads, household members, and beneficial users to manage their village access, communicate with administration, and stay informed about village activities. The application enables residents to pre-authorize guests, manage vehicle stickers, submit requests, make payments, and receive real-time notifications.

### Target Users

- **household-head**: Resident admin who manages household users
- **household-member**: Resident admin who manages household users
- **household-beneficial-user**: Non-resident but associated with a household, issued a vehicle pass

### Key Objectives

- Empower residents with self-service capabilities
- Enable convenient guest pre-authorization from anywhere
- Provide real-time notifications for guest arrivals and village updates
- Facilitate easy payment of fees and dues
- Enable direct communication with village administration
- Provide transparency into household activities and access logs

---

## 2. Target Users & User Roles

### household-head Role

**Resident admin who manages household users** - Full household management capabilities

**Capabilities:**

- Pre-register and authorize guests
- Request vehicle sticker issuance and renewal
- Submit construction permit applications
- Make online payments for fees and dues
- View household payment history and outstanding balances
- Manage household residents (view only, admin adds/removes)
- Report incidents and maintenance issues
- View announcements and village rules
- Receive real-time notifications
- View household access history
- Provide delivery instructions

### household-member Role

**Resident admin who manages household users** - Full household management capabilities

**Capabilities:**

- Pre-register and authorize guests
- Request vehicle sticker issuance and renewal
- Submit construction permit applications
- Make online payments for fees and dues
- View household payment history and outstanding balances
- Manage household residents (view only, admin adds/removes)
- Report incidents and maintenance issues
- View announcements and village rules
- Receive real-time notifications
- View household access history
- Provide delivery instructions

### household-beneficial-user Role

**Non-resident but associated with a household, issued a vehicle pass** - Limited privileges for vehicle pass management

**Capabilities:**

- View assigned vehicle sticker
- View announcements and village rules
- Receive notifications
- View personal access history
- View household information (read-only)

---

## 3. Key Features and User Stories

### 3.1 Guest Pre-Authorization

#### User Stories

**As a household-head, I want to:**

- Pre-register guests before they arrive at the gate
- Specify expected arrival date and time
- Provide guest contact information and vehicle details
- Set visit purpose and special instructions
- Receive notification when my guest arrives
- Approve walk-in guests remotely when called by guards
- View history of all guest visits
- Cancel guest pre-authorization if plans change
- Share a QR code with my guest for quick entry

**As a household-member, I want to:**

- Pre-register guests before they arrive at the gate
- Specify expected arrival date and time
- Provide guest contact information and vehicle details
- Set visit purpose and special instructions
- Receive notification when my guest arrives
- Approve walk-in guests remotely when called by guards
- View history of all guest visits
- Cancel guest pre-authorization if plans change

**As a household-beneficial-user, I want to:**

- Receive notification when visiting the village
- View my access history

#### Features

- **Guest Pre-registration Form**
  - Guest name (required)
  - Phone number (optional)
  - Vehicle plate number (optional)
  - Purpose of visit (free text)
  - Expected arrival date (required)
  - Expected arrival time (optional)
  - Special instructions for guards
  - Pre-authorized flag (instant approval)

- **Guest Approval Workflow**
  - Walk-in guest notification from guard
  - Browser notification with guest details
  - Quick approve/deny action buttons
  - Option to call guard for clarification
  - Approval expiration (auto-deny after 5 minutes)

- **Guest List Management**
  - View upcoming guests
  - View past guests
  - Filter by date range
  - Search by guest name
  - Cancel pending guests
  - View guest status (Pending, Approved, Denied, Completed)

- **QR Code Generation** (Future Enhancement)
  - Generate QR code for pre-authorized guests
  - Guest scans QR at gate for instant entry
  - Time-bound QR codes

#### UI Requirements

- Simple, quick guest registration form (< 1 minute to complete)
- Calendar picker for visit date
- Contact auto-complete from saved contacts
- Browser notification with action buttons (Approve/Deny)
- Guest list with action buttons (Cancel, View Details)
- Clear status indicators (Pending, Approved, At Gate, Completed)
- Photo upload option for special events

---

### 3.2 Vehicle Sticker Management

#### User Stories

**As a household-head, I want to:**

- Request new vehicle stickers for my household
- Upload OR/CR documents for verification
- Track sticker application status
- View all household stickers and their status
- Request sticker renewal before expiration
- View violation history for my stickers
- Receive notification when stickers are expiring
- Update vehicle information (change plate, color, etc.)

**As a household-member, I want to:**

- Request new vehicle stickers for my household
- Upload OR/CR documents for verification
- Track sticker application status
- View all household stickers and their status
- Request sticker renewal before expiration
- View violation history for my stickers
- Receive notification when stickers are expiring
- Update vehicle information (change plate, color, etc.)

**As a household-beneficial-user, I want to:**

- View my assigned vehicle sticker (read-only)
- Receive expiration reminder notifications
- View my vehicle access history

#### Features

- **Sticker Request Form**
  - Vehicle type (Car, Motorcycle, SUV, Van, Truck)
  - Plate number (required, with validation)
  - Vehicle make and model
  - Vehicle color
  - User type (Household Member, Beneficial User, Endorsed User)
  - OR/CR document upload (file upload)
  - Photo of vehicle (optional, file upload)

- **Sticker List View**
  - All household stickers
  - Status badges (Active, Expired, Suspended, Revoked)
  - Expiry date with countdown
  - Violation count
  - User type and vehicle details
  - Assigned to (household member name)

- **Sticker Renewal**
  - Renewal request button (available 30 days before expiry)
  - Update vehicle information if changed
  - Upload new OR/CR if required

- **Sticker Notifications**
  - 30 days before expiry
  - 7 days before expiry
  - Suspension notification
  - Violation notification

#### UI Requirements

- Card-based sticker list with vehicle photos
- Visual expiry countdown (green > yellow > red)
- File upload for document upload
- Image preview and cropping
- Form validation (plate number format)
- Status timeline (Requested > Under Review > Approved > Active)
- Violation history timeline

---

### 3.3 Announcements and Village Updates

#### User Stories

**As any user (household-head, household-member, household-beneficial-user), I want to:**

- View all village announcements
- Filter announcements by type (Events, Maintenance, Emergency, General)
- Receive browser notifications for urgent announcements
- View announcement attachments (images, PDFs)
- Mark announcements as read
- Search announcement history
- Share announcements with household members

#### Features

- **Announcement Feed**
  - Reverse chronological list
  - Announcement types: Event, Maintenance, Emergency, General, Rule Change, Fee Notice
  - Priority indicators (Low, Normal, High, Urgent)
  - Read/unread status
  - Publish and expiry dates

- **Announcement Details**
  - Full announcement text
  - Attachments viewer
  - Published date and author
  - Related actions (e.g., pay fee, RSVP to event)

- **Browser Notifications**
  - Instant notification for new announcements
  - Urgent announcements displayed prominently
  - Notification grouping for multiple announcements

#### UI Requirements

- Feed with refresh button
- Unread badge indicators
- Priority color coding (urgent = red)
- Attachment previews (images, PDF thumbnails)
- Share button (web share API or copy link)
- Search functionality
- Filter chips (Event, Emergency, etc.)

---

### 3.4 Payments and Billing

#### User Stories

**As a household-head or household-member, I want to:**

- View all payment history and receipts
- See outstanding balances and due dates
- Make online payments via e-wallet or credit card
- Download official receipts
- Receive payment due reminders
- View payment breakdown by type (Association Fee, Road Fee, etc.)
- Track payment status (Pending, Completed, Failed)
- Request payment plan for large amounts

#### Features

- **Payment Dashboard**
  - Total outstanding balance
  - Upcoming due payments
  - Recent payment history
  - Payment by type breakdown (chart)

- **Payment List**
  - Filter by status (Paid, Pending, Overdue)
  - Filter by type (Association Fee, Road Fee, Sticker Fee, Penalty)
  - Date range filter
  - Search by receipt number

- **Online Payment**
  - Payment gateway integration (PayMongo, GCash, PayMaya)
  - Multiple payment methods (Credit Card, Debit Card, GCash, PayMaya, Bank Transfer)
  - Payment amount confirmation
  - Transaction reference tracking
  - Payment confirmation notification
  - Embedded payment gateway (modal or iframe)

- **Receipt Management**
  - Download receipt as PDF
  - View receipt details
  - Email receipt to self
  - Receipt number for reference

- **Payment Reminders**
  - 7 days before due date
  - On due date
  - Overdue notifications

#### UI Requirements

- Dashboard with balance cards
- Payment method selector with logos
- Secure payment modal/iframe
- Payment success/failure screens
- Receipt viewer (PDF viewer in browser)
- Payment history with receipt download buttons
- Due date calendar view
- Payment amount input with currency formatting

---

### 3.5 Construction Permit Application

#### User Stories

**As a household-head or household-member, I want to:**

- Submit construction permit applications
- Upload required documents (building plans, contracts)
- Track application status and approval
- View calculated road fees
- Pay road fees online
- Receive notifications on permit status changes
- View permit conditions and restrictions
- Monitor active permit progress

#### Features

- **Permit Application Form**
  - Project description (text area)
  - Contractor name and contact
  - Proposed start and end dates
  - Document uploads via file upload (blueprints, contracts, permits)
  - Photo uploads via file upload (current site condition)

- **Permit Status Tracking**
  - Status: Pending, Approved, Rejected, In Progress, Completed
  - Approval/rejection reason
  - Calculated road fee
  - Payment status
  - Timeline of status changes

- **Permit List**
  - Active permits
  - Permit history
  - Filter by status
  - Permit details view

- **Permit Notifications**
  - Application received confirmation
  - Approval/rejection notification
  - Payment due notification
  - Permit expiration reminder

#### UI Requirements

- Multi-step application form wizard
- Document upload with file upload interface
- Date picker for start/end dates
- Status progress indicator
- Fee breakdown display
- Payment integration within permit flow
- Rejection reason display
- Permit timeline view

---

### 3.6 Maintenance Requests and Incident Reporting

#### User Stories

**As any user (household-head, household-member, household-beneficial-user), I want to:**

- Report incidents or suspicious activities
- Submit maintenance requests
- Attach photos and location to reports
- Track status of my reports
- Receive updates on resolution
- View history of reported incidents

#### Features

- **Incident Reporting**
  - Incident type selection (Security Threat, Traffic Violation, Noise Complaint, Suspicious Activity, Emergency, Fire, Medical, Other)
  - Title and description
  - Location (browser geolocation API or manual entry)
  - Photo/video upload via file upload
  - Severity selection (Low, Medium, High, Critical)
  - Submit anonymously option

- **Incident Status Tracking**
  - Status: Reported, Acknowledged, In Progress, Resolved, Closed
  - Assigned guard information
  - Resolution notes
  - Timeline of updates

- **Incident List**
  - My incidents
  - Filter by status and type
  - Date range filter

- **Incident Notifications**
  - Acknowledgment notification
  - Status change notifications
  - Resolution notification

#### UI Requirements

- Quick-report button on dashboard
- Incident type icon selector
- File upload for photos
- Location map picker (Google Maps or similar)
- Severity slider
- Status tracking timeline
- Browser notifications for updates

---

### 3.7 Household Profile and Access History

#### User Stories

**As a household-head or household-member, I want to:**

- View complete household information
- See all household members
- View access history (entries and exits)
- See current sticker quota and usage
- View household compliance status
- Update household contact information

**As a household-beneficial-user, I want to:**

- View my household information (read-only)
- View my personal access history

#### Features

- **Household Profile**
  - Household code
  - Address (Block, Lot)
  - Household head information
  - Resident list with relationships
  - Sticker quota and usage
  - Status (Active, Inactive, Suspended)

- **Access History**
  - Entry/exit logs for all household vehicles
  - Filter by date range
  - Filter by vehicle (sticker)
  - Entry type (Resident, Guest, Delivery, Construction)
  - Gate location
  - Timestamp

- **Profile Update**
  - Update phone number
  - Update email address
  - Update emergency contact

#### UI Requirements

- Profile card layout
- Resident list with avatars
- Sticker quota progress bar
- Access log table/list
- Date range picker
- Filter chips
- Refresh functionality

---

### 3.8 Village Rules and Regulations

#### User Stories

**As any user (household-head, household-member, household-beneficial-user), I want to:**

- View all village rules and regulations
- Understand curfew times and restrictions
- View penalty information
- Search for specific rules
- Receive notifications when rules change

#### Features

- **Rules List**
  - Categorized by type (Curfew, Speed Limit, Parking, Noise, Construction Hours, Pet Policy, Visitor Policy, General)
  - Effective dates
  - Penalty amounts
  - Description and details

- **Rule Details**
  - Full rule text
  - Effective date
  - Penalty information
  - Related documents

- **Rule Search**
  - Keyword search
  - Category filter

- **Rule Change Notifications**
  - Browser notification for new rules
  - In-app highlight for updated rules

#### UI Requirements

- Categorized list with expandable sections
- Search bar
- Category filter chips
- Rule detail modal
- New/updated badge indicators
- PDF viewer for rule documents

---

### 3.9 Communication with Administration

#### User Stories

**As a household-head or household-member, I want to:**

- Send messages to village administration
- Request assistance or information
- View message history
- Receive responses to my inquiries

#### Features

- **Messaging Interface**
  - Send message to admin
  - Message categories (General Inquiry, Complaint, Request, Feedback)
  - Attach photos or documents
  - View conversation history
  - Receive admin responses

- **Message Notifications**
  - Browser notification for admin reply
  - Unread message badge

#### UI Requirements

- Chat-like interface
- Message composition form
- Category selector
- Attachment support
- Conversation threading
- Timestamp display
- Unread indicators

---

## 4. Technical Requirements

### 4.1 Web Technology Stack

**Frontend Framework**

- **React 18+** with TypeScript
- Component-based architecture
- Responsive design for desktop, tablet, and mobile devices

**State Management**

- Redux Toolkit or Zustand
- Redux Persist or localStorage for state persistence

**Routing**

- React Router v6+
- Client-side routing for single-page application
- Protected routes for authenticated users

**Local Storage**

- localStorage for user preferences and settings
- sessionStorage for temporary data
- IndexedDB for larger datasets (cached announcements, access logs)

**Networking**

- Axios or Fetch API for HTTP requests
- WebSocket for real-time notifications
- Service Worker for background sync and caching
- Retry logic and request queuing

**Browser Notifications**

- Web Push API for browser notifications
- Service Worker for background notification handling
- Notification permission management

**Media Handling**

- File input for document and image uploads
- Client-side image compression before upload
- Drag-and-drop file upload support

**Authentication**

- JWT tokens stored in httpOnly cookies or localStorage
- Automatic token refresh mechanism
- Session timeout handling

### 4.2 Browser Requirements

**Supported Browsers**

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Required Browser Features**

- ES6+ JavaScript support
- WebSocket support
- Web Push API (optional, for notifications)
- Geolocation API (optional, for incident reporting)
- File API for uploads

### 4.3 API Integration Requirements

#### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/change-password` - Change password

#### Guest Management Endpoints

- `GET /api/v1/guests` - List household guests
- `POST /api/v1/guests` - Pre-register guest
- `GET /api/v1/guests/:id` - Get guest details
- `PUT /api/v1/guests/:id` - Update guest
- `POST /api/v1/guests/:id/approve` - Approve guest entry
- `POST /api/v1/guests/:id/deny` - Deny guest entry
- `DELETE /api/v1/guests/:id` - Cancel guest

#### Vehicle Sticker Endpoints

- `GET /api/v1/stickers` - List household stickers
- `POST /api/v1/stickers` - Request new sticker
- `GET /api/v1/stickers/:id` - Get sticker details
- `POST /api/v1/stickers/:id/renew` - Request renewal

#### Announcement Endpoints

- `GET /api/v1/announcements` - List announcements
- `GET /api/v1/announcements/:id` - Get announcement details

#### Payment Endpoints

- `GET /api/v1/payments` - List household payments
- `POST /api/v1/payments` - Initiate online payment
- `GET /api/v1/payments/:id` - Get payment details
- `GET /api/v1/payments/household/:id/summary` - Payment summary

#### Construction Permit Endpoints

- `GET /api/v1/construction-permits` - List household permits
- `POST /api/v1/construction-permits` - Submit permit application
- `GET /api/v1/construction-permits/:id` - Get permit details

#### Incident Endpoints

- `POST /api/v1/incidents` - Report incident
- `GET /api/v1/incidents` - List household incidents
- `GET /api/v1/incidents/:id` - Get incident details

#### Household Endpoints

- `GET /api/v1/households/:id` - Get household details
- `GET /api/v1/households/:id/residents` - List residents
- `PUT /api/v1/users/me` - Update profile

#### Access Log Endpoints

- `GET /api/v1/access-logs/household/:id` - Get household access history

#### Village Rules Endpoints

- `GET /api/v1/village-rules` - List village rules

#### Notification Endpoints

- `GET /api/v1/notifications` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/mark-all-read` - Mark all as read

#### WebSocket Events

- `WS /ws/notifications` - Real-time notification stream
  - `guest:arrival` - Guest arrived at gate
  - `delivery:arrival` - Delivery arrived
  - `incident:new` - New incident reported
  - `announcement:new` - New announcement published
  - `payment:reminder` - Payment due reminder

### 4.4 Caching and Progressive Web App (PWA) Capabilities

**Caching Strategy**

- Service Worker for asset caching
- Cache-first strategy for static assets
- Network-first strategy for dynamic data
- Background sync for queued actions

**Progressive Web App Features**

- Installable on desktop and mobile devices
- App-like experience with splash screen
- Works offline with cached data
- Add to home screen prompt

**Cached Data**

- Guest list (last 30 days)
- Household stickers
- Recent announcements (last 60 days)
- Payment history (last 12 months)
- Access logs (last 30 days)

**Sync Strategy**

- Automatic sync when connection restored
- Manual refresh option
- Sync status indicator
- Conflict resolution (last-write-wins)

### 4.5 Performance Requirements

- Initial page load: < 3 seconds
- Page navigation: < 300ms
- API response rendering: < 500ms
- Image loading: Progressive with placeholders and lazy loading
- Browser notification delivery: < 5 seconds
- Cached data access: Instant
- First Contentful Paint (FCP): < 1.5 seconds
- Largest Contentful Paint (LCP): < 2.5 seconds
- Time to Interactive (TTI): < 3.5 seconds

### 4.6 Web Optimization

- Code splitting for reduced bundle size
- Lazy loading of routes and components
- Image optimization and responsive images
- Minification and compression (gzip/brotli)
- CDN for static assets
- Browser caching strategies
- Debouncing for search and input fields

---

## 5. Web-Specific UI/UX Requirements

### 5.1 Design Principles

- **Responsive Design**: Optimized for desktop, tablet, and mobile viewports
- **Progressive Enhancement**: Core functionality works on all browsers
- **Accessible**: WCAG 2.1 Level AA compliance
- **Clear hierarchy**: Important information prominent
- **Fast actions**: Minimal clicks for common tasks
- **Intuitive Navigation**: Consistent navigation across all pages

### 5.2 Navigation Structure

**Desktop Navigation (Sidebar or Top Nav)**

- Dashboard (Home)
- Guests
- Stickers
- Payments
- Permits
- Incidents
- Announcements
- Messages
- Household Profile
- Village Rules
- Settings

**Mobile Navigation (Hamburger Menu or Bottom Nav)**

- Dashboard
- Guests
- Stickers
- Payments
- More (submenu with remaining items)

**Dashboard Screen**

- Quick actions (Pre-register Guest, Report Incident, Pay Bills)
- Upcoming guests
- Recent announcements
- Outstanding payments
- Active permits
- Recent access history

### 5.3 Key UI Patterns

**Cards**

- Guest cards with action buttons
- Sticker cards with status badges
- Announcement cards with priority indicators
- Payment cards with amount and status

**Lists**

- Refresh button or auto-refresh
- Infinite scroll or pagination
- Empty state illustrations
- Loading skeletons
- Sortable columns (for desktop)

**Forms**

- Multi-column layouts on desktop, single-column on mobile
- Appropriate input types (date, email, tel, number)
- Inline validation with clear error messages
- Auto-save drafts to localStorage
- Progress indicators for multi-step forms

**Notifications**

- Toast notifications for in-app alerts
- Browser notifications for important events
- Notification center with grouping
- Badge indicators on navigation items

**Modals and Dialogs**

- Modal overlays for focused tasks
- Confirmation dialogs for destructive actions
- Keyboard accessibility (Esc to close)

### 5.4 Responsive Breakpoints

**Mobile (< 768px)**

- Single-column layouts
- Hamburger menu or bottom navigation
- Touch-friendly tap targets (minimum 44x44px)
- Simplified data tables (card view)

**Tablet (768px - 1024px)**

- Two-column layouts where appropriate
- Sidebar navigation
- Expanded data tables

**Desktop (> 1024px)**

- Multi-column layouts
- Full sidebar navigation
- Enhanced data tables with sorting and filtering
- Larger action buttons and controls

### 5.5 Accessibility

- Semantic HTML5 elements
- ARIA labels and roles where needed
- Keyboard navigation support (Tab, Enter, Esc)
- Screen reader support
- High contrast mode support
- Minimum touch/click target size: 44x44px
- WCAG 2.1 Level AA color contrast ratios
- Focus indicators for keyboard navigation
- Alternative text for images

### 5.6 Onboarding

- Welcome banner explaining key features
- Permission requests with context (Browser Notifications, Location)
- Guided tooltips for first-time users
- Help center or FAQ section
- Dismiss option for returning users

---

## 6. Notification Strategy

### 6.1 Notification Types

**Critical (Immediate Delivery)**

- Guest arrival at gate
- Guest approval request from guard
- Emergency announcements
- Incident updates (if reporter)
- Payment overdue final notice

**High Priority**

- New announcements (urgent)
- Permit approval/rejection
- Sticker suspension/revocation
- Payment due (7 days before)

**Normal Priority**

- New general announcements
- Sticker expiration reminder (30 days)
- Incident resolution
- Admin message reply

**Low Priority**

- Payment receipt confirmation
- Guest visit completed
- System updates

### 6.2 Notification Preferences

- Allow users to customize notification types
- Enable/disable browser notifications
- Email notification preferences
- In-app notification center

### 6.3 Notification Behavior

- Browser notifications require user permission
- Respect user notification preferences
- Do Not Disturb mode available in settings
- Critical notifications can override user preferences (Emergency only)

### 6.4 Notification Actions

- Guest arrival: Approve, Deny, Call Guard
- Payment due: Pay Now, View Details
- Announcement: Read, Dismiss
- Incident update: View Details

---

## 7. Success Metrics

### 7.1 User Adoption Metrics

- 80%+ of residents register and activate their account within 3 months
- 60%+ monthly active users (MAU)
- Average session frequency: 3+ times per week
- Return visitor rate: > 70%

### 7.2 Feature Usage Metrics

- Guest pre-registration: 70%+ of guests pre-authorized
- Payment completion rate: 50%+ of payments made via web app
- Announcement read rate: 60%+ of announcements viewed
- Incident reporting: 40%+ of incidents reported via web app

### 7.3 Performance Metrics

- Page error rate: < 1%
- Browser notification opt-in rate: > 30%
- API error rate: < 2%
- Average page load time: < 3 seconds
- User satisfaction score: > 4.0/5.0

### 7.4 User Satisfaction

- In-app feedback score: > 4.0/5.0
- Support ticket volume: < 10 per week
- Feature request tracking for improvements
- Net Promoter Score (NPS): > 40

---

## 8. Dependencies on Other Components

### 8.1 Backend Services

- All features require corresponding REST APIs
- Real-time notifications require WebSocket server
- Browser notifications require Web Push server
- File uploads require document storage service (AWS S3, Azure Blob, etc.)

### 8.2 Web Admin Dashboard

- Admin approves sticker requests
- Admin approves permit applications
- Admin publishes announcements
- Admin responds to messages

### 8.3 Security Guard App

- Guards approve walk-in guests
- Guards log access entries
- Guards monitor deliveries

### 8.4 External Integrations

- Payment gateway (PayMongo, GCash, PayMaya)
- SMS gateway (for OTP, alerts)
- Email gateway (for receipts, notifications)
- Web Push notification service
- Map service (Google Maps API for location features)

---

## 9. Security Requirements

### 9.1 Authentication

- Secure login (email/phone + password)
- JWT token storage in httpOnly cookies (preferred) or localStorage
- Optional: Two-factor authentication (2FA)
- Auto-logout after inactivity (30 minutes)
- Session expiration and refresh token handling
- CSRF protection for state-changing operations

### 9.2 Data Security

- HTTPS only (TLS 1.3)
- Encrypt sensitive data in transit and at rest
- No sensitive data in browser console logs
- Secure file upload (presigned URLs or secure upload endpoint)
- Input validation and sanitization (client and server-side)
- XSS protection (Content Security Policy)
- SQL injection prevention (parameterized queries)

### 9.3 Browser Permissions

- Request only necessary permissions
- Explain permission purpose before request
- Graceful degradation if permission denied
- Optional: Notifications, Geolocation
- File upload via standard HTML file input

---

## 10. Development Phases

### Phase 1: Foundation (Week 1-2)

- Project setup (React 18+ with TypeScript)
- Authentication and user profile
- Responsive layout and navigation structure
- Basic API integration
- Route configuration

### Phase 2: Guest Management (Week 3-4)

- Guest pre-registration form
- Guest list view
- Guest approval notifications
- Browser notification setup (Web Push)

### Phase 3: Stickers & Household (Week 5-6)

- Vehicle sticker list
- Sticker request form with file upload
- Household profile view
- Access history

### Phase 4: Announcements & Payments (Week 7-8)

- Announcement feed
- Payment dashboard
- Online payment integration
- Receipt viewer (PDF in browser)

### Phase 5: Permits & Incidents (Week 9-10)

- Construction permit application
- Incident reporting with file upload
- Status tracking for both

### Phase 6: Additional Features (Week 11-12)

- Village rules viewer
- Messaging with admin
- Settings and preferences
- Notification preferences
- PWA manifest and service worker

### Phase 7: Polish & Testing (Week 13-14)

- UI/UX refinements
- Responsive design testing (mobile, tablet, desktop)
- PWA and caching testing
- Performance optimization
- Cross-browser testing
- Beta testing with residents
- Bug fixes

### Phase 8: Launch (Week 15)

- Production deployment
- SSL certificate setup
- Marketing and rollout plan
- User onboarding materials
- Support documentation
- User training sessions

---

## 11. Open Questions

1. Should residents be able to manage multiple households (e.g., own house + rental property)?
2. Should the web app support multiple languages (English, Tagalog, etc.)?
3. What is the maximum file size for document uploads?
4. Should there be parental controls for minor residents?
5. Should the web app support dark mode?
6. What level of PWA functionality is required (full offline mode vs. cached data only)?
7. Should there be live chat support or FAQ section?
8. Should the web app track user analytics (page views, feature usage)?
9. What hosting platform will be used (AWS, Azure, Vercel, etc.)?
10. Should the web app be available as a subdomain (residents.village.com) or path (/residents)?

---

## 12. Reference to Main Specification

This document is derived from:

- **Main Document**: Village Management System Technical Specification v1.0
- **Section References**:
  - Section 1: Business Requirement Summary
  - Section 2: Technical Translation - Functional Requirements
  - Section 5: API Endpoints Specification
  - Section 6: User Roles & Permissions Matrix
  - Section 10.4: Web App Requirements
  - Section 13: Web Apps Finalization

For complete technical architecture, database schema, and backend integration details, refer to the main technical specification document.

---

**Document End**
