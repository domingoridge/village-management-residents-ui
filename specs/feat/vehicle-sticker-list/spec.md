# Feature Specification: Vehicle Sticker Request List Page

**Feature Branch**: `feat/vehicle-sticker-list`
**Created**: 2025-10-20
**Status**: Draft
**Input**: User description: "create a vehicle sticker list page similar to the guests page at app/(dashboard)/guests/page.tsx. The page should: 1. Display a list of vehicle sticker requests for the current household in a card-based layout similar to GuestCard 2. Include filtering by sticker request status (pending, approved, rejected, cancelled) 3. Show pagination for the list with configurable page size (10 items per page) 4. Include realtime updates using Supabase realtime subscriptions 5. Display empty states when no stickers are found 6. Have a Request New Sticker button that links to /stickers/new 7. Use TanStack Query for state management 8. Create a StickerCard component similar to GuestCard that displays: Vehicle plate number as the title, Vehicle make and model, Sticker type (resident or beneficial_user), Request status with a badge component, Submission date, Review date (if reviewed) 9. The page should be located at app/(dashboard)/stickers/page.tsx 10. Follow the same patterns and structure as the guests list page"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View All Sticker Requests (Priority: P1)

A resident wants to view all their household's vehicle sticker requests to check the status of pending applications and see which vehicles have been approved or rejected.

**Why this priority**: This is the core functionality of the feature - residents must be able to see their sticker requests. Without this, the feature provides no value.

**Independent Test**: Can be fully tested by navigating to the stickers page and verifying that all household sticker requests are displayed in a card layout, delivering immediate value by showing request status.

**Acceptance Scenarios**:

1. **Given** a resident is logged in and their household has 5 sticker requests, **When** they navigate to /stickers, **Then** they see all 5 requests displayed as cards showing vehicle information and status
2. **Given** a resident is logged in and their household has no sticker requests, **When** they navigate to /stickers, **Then** they see an empty state message with a button to request their first sticker
3. **Given** a resident is viewing the stickers page, **When** another household member submits a new request, **Then** the new request appears in the list automatically without page refresh

---

### User Story 2 - Filter Requests by Status (Priority: P2)

A resident wants to filter their vehicle sticker requests by status to quickly find pending requests that need attention or view only approved stickers.

**Why this priority**: Filtering improves usability when households have multiple requests, but the feature is functional without it. Users can still see all requests even without filtering.

**Independent Test**: Can be tested independently by clicking status filter buttons and verifying that only requests matching the selected status are displayed.

**Acceptance Scenarios**:

1. **Given** a resident is viewing 10 sticker requests with mixed statuses, **When** they click the "Pending" filter, **Then** only requests with pending status are displayed
2. **Given** a resident has filtered requests by "Approved" status, **When** they click "All", **Then** all requests are displayed again
3. **Given** a resident filters by "Rejected" and no rejected requests exist, **When** the filter is applied, **Then** they see an empty state message indicating no rejected requests

---

### User Story 3 - Navigate Through Paginated Results (Priority: P2)

A resident with many vehicle sticker requests wants to browse through them in manageable pages to avoid overwhelming information on screen.

**Why this priority**: Pagination is important for households with many vehicles, but most households will have fewer than 10 requests. The feature works without pagination for small datasets.

**Independent Test**: Can be tested by creating more than 10 requests and verifying pagination controls appear and function correctly.

**Acceptance Scenarios**:

1. **Given** a household has 25 sticker requests, **When** a resident views the stickers page, **Then** they see 10 requests per page with pagination controls
2. **Given** a resident is on page 1 of 3, **When** they click "Next" or page 2, **Then** they see the next 10 requests and the current page indicator updates
3. **Given** a resident is viewing page 2, **When** they apply a status filter, **Then** pagination resets to page 1 showing filtered results

---

### User Story 4 - Request New Vehicle Sticker (Priority: P1)

A resident wants to initiate a new vehicle sticker request directly from the list page.

**Why this priority**: This is a critical user action that connects the list view to the creation flow. Users need an obvious way to request new stickers.

**Independent Test**: Can be tested by clicking the "Request New Sticker" button and verifying navigation to the sticker request form.

**Acceptance Scenarios**:

1. **Given** a resident is viewing the stickers list page, **When** they click "Request New Sticker", **Then** they are navigated to /stickers/new
2. **Given** a resident is viewing the empty state (no requests), **When** they click the request button in the empty state, **Then** they are navigated to /stickers/new

---

### User Story 5 - View Detailed Request Information (Priority: P3)

A resident wants to see complete details about a specific sticker request including submission date, review date, and vehicle information.

**Why this priority**: While helpful for detailed review, the card view already shows the most critical information. Detailed views can be added later.

**Independent Test**: Can be tested by clicking a sticker card and verifying that detailed information is displayed or navigation occurs.

**Acceptance Scenarios**:

1. **Given** a resident is viewing a list of sticker requests, **When** they click on a sticker card, **Then** they see detailed information about that request

---

### Edge Cases

- What happens when the household quota is exceeded but existing requests are still displayed?
- How does the system handle real-time updates when a request changes status while the user is actively filtering?
- What happens if network connectivity is lost while viewing the page?
- How does the system handle pagination when the total number of requests changes due to real-time updates?
- What happens when a sticker request is deleted/cancelled while the user is viewing that specific page of results?
- How does filtering behave when no requests match the selected status?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display all vehicle sticker requests belonging to the current user's household in a card-based layout
- **FR-002**: System MUST show the following information on each sticker request card: vehicle plate number, vehicle make and model, sticker type, request status, submission date, and review date if reviewed
- **FR-003**: System MUST provide status filtering with options for: all, pending, approved, rejected, and cancelled
- **FR-004**: System MUST implement pagination with 10 requests per page
- **FR-005**: System MUST display pagination controls showing current page, total pages, and navigation buttons
- **FR-006**: System MUST reset pagination to page 1 when filters are changed
- **FR-007**: System MUST display an empty state message when no sticker requests exist
- **FR-008**: System MUST display appropriate empty state messages when filtered results return no matches
- **FR-009**: System MUST provide a "Request New Sticker" button that navigates to /stickers/new
- **FR-010**: System MUST automatically update the displayed list when new requests are created, updated, or deleted in real-time without requiring page refresh
- **FR-011**: System MUST display a visual badge component indicating the status of each request
- **FR-012**: System MUST show loading states while fetching sticker request data
- **FR-013**: System MUST preserve filter selections when navigating between pages
- **FR-014**: System MUST display total request count information for the current filter
- **FR-015**: Sticker cards MUST be clickable and navigate to the detailed view of the request

### Key Entities

- **Sticker Request**: Represents a vehicle sticker application submitted by a household resident, including vehicle information (plate number, make, model, color, year, registered owner), sticker type (resident or beneficial user), request status (pending, approved, rejected, cancelled), submission timestamp, and optional review timestamp
- **Household**: The residential unit that owns multiple sticker requests, with an associated sticker quota limiting total allowed stickers
- **Status Badge**: A visual indicator displaying the current state of a sticker request (pending, approved, rejected, cancelled) with appropriate color coding

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Residents can view all their household's sticker requests within 2 seconds of page load
- **SC-002**: Status filter changes display filtered results in under 1 second
- **SC-003**: Real-time updates appear in the list within 3 seconds of the underlying data change
- **SC-004**: Users can complete the action of viewing a specific request and navigating to create a new one in under 30 seconds
- **SC-005**: 95% of residents successfully understand request status from the visual badge without needing additional explanation
- **SC-006**: Page navigation (pagination) completes in under 1 second
- **SC-007**: Empty states are clear enough that 90% of users understand they need to create their first request

## Assumptions

- The household ID is available from the current authenticated user's session
- The stickers page follows the same authentication and authorization patterns as the guests page
- The existing Supabase real-time subscription infrastructure is already configured and functional
- The Button, Card, Pagination, and Skeleton UI components already exist and are reusable
- The formatDate utility function is available for displaying dates consistently
- Status badge styling will follow the same pattern as GuestStatusBadge
- Users have already completed authentication before accessing this page
- The /stickers/new route already exists and is functional
- Request details page routing will follow the pattern /stickers/[id] similar to guests
- The page will use the same responsive grid layout as the guests page (md:grid-cols-2 lg:grid-cols-3)

## Dependencies

- Existing Supabase database with vehicle_sticker table
- TanStack Query (React Query) library already installed and configured
- Existing useRealtime hook for Supabase real-time subscriptions
- Existing UI components: Button, Card, Pagination, Skeleton
- Existing routing structure in Next.js App Router
- Authentication system providing household context

## Out of Scope

- Editing existing sticker requests
- Deleting or cancelling sticker requests
- Admin review/approval functionality
- Printing or downloading sticker information
- Sorting options (by date, status, plate number, etc.)
- Search functionality for finding specific vehicles
- Bulk actions on multiple requests
- Export of sticker request list
- Notifications when request status changes
- Request detail page implementation (only navigation to it)
