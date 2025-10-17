# Feature Specification: Guest Visit Date Range Picker

**Feature Branch**: `enhc/guest-visit-daterange`
**Created**: 2025-10-17
**Status**: Draft
**Input**: User description: "add daterange picker for visit_date_start and visit_date_end in @app/(dashboard)/guests/new/page.tsx"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Specify Visit Duration for Multi-Day Guests (Priority: P1)

Residents need to pre-authorize guests who will be staying for multiple days (e.g., relatives visiting for a week, contractors working over several days). Currently, the system only captures expected arrival date/time, which doesn't clearly communicate when the guest authorization should expire.

**Why this priority**: This is the core value proposition - enabling residents to specify both start and end dates for guest visits, ensuring guards know the valid period for guest entry.

**Independent Test**: Can be fully tested by filling out the guest form with a date range (e.g., Dec 20-27) and verifying the authorization is valid for all days within that period and expires afterward.

**Acceptance Scenarios**:

1. **Given** a resident is creating a guest pre-authorization, **When** they select a visit start date of Dec 20 and visit end date of Dec 27, **Then** the system accepts the date range and the guest can enter anytime between Dec 20-27
2. **Given** a resident selects a visit date range, **When** the start date is after the end date, **Then** the system shows a validation error preventing submission
3. **Given** a resident is filling out the form, **When** they select a visit start date, **Then** the end date picker only allows selecting dates on or after the start date
4. **Given** a guest pre-authorization exists for Dec 20-27, **When** the current date is Dec 28, **Then** the authorization is expired and no longer valid for entry

---

### User Story 2 - Quick Single-Day Visit Entry (Priority: P2)

For short visits (deliveries, day guests), residents want to quickly specify a single-day authorization without having to select the same date twice.

**Why this priority**: Improves user experience for the most common use case (single-day visits), reducing friction in the form completion process.

**Independent Test**: Can be tested by selecting only a start date and verifying the system automatically sets the end date to match, creating a valid single-day authorization.

**Acceptance Scenarios**:

1. **Given** a resident selects a visit start date, **When** they leave the end date empty, **Then** the system defaults the end date to match the start date
2. **Given** a resident wants a same-day visit, **When** they select today's date as start date, **Then** they can complete the form without touching the end date field
3. **Given** a resident selected start and end dates, **When** they clear the end date, **Then** the system reverts to treating it as a single-day visit

---

### User Story 3 - Advance Booking for Extended Stays (Priority: P3)

Residents planning ahead want to pre-authorize guests for visits up to 30 days in advance, with the visit duration clearly defined upfront.

**Why this priority**: Supports planning for holidays, extended family visits, and scheduled contractor work, improving resident convenience.

**Independent Test**: Can be tested by creating an authorization with a start date 30 days in the future and a multi-day duration, verifying the authorization is properly scheduled.

**Acceptance Scenarios**:

1. **Given** today is Dec 1, **When** a resident selects a visit start date of Dec 25 and end date of Jan 2, **Then** the system accepts the future date range
2. **Given** a resident tries to create an authorization, **When** the start date is more than 30 days in the future, **Then** the system shows a validation error
3. **Given** a resident selects a date range, **When** the duration exceeds reasonable limits, **Then** the system allows it but may show a warning for unusually long visits

---

### Edge Cases

- What happens when a resident selects a start date in the past? (System should prevent or warn)
- How does the system handle time zones when determining if a date range is expired?
- What happens if the end date is significantly far in the future (e.g., 6 months)? (System may need maximum duration limits)
- How does the system behave when a resident changes the start date after already setting an end date? (Should re-validate the range)
- What if a resident wants to extend an existing guest's visit end date? (May be covered by edit functionality, out of scope for this spec)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow residents to select a visit start date when pre-authorizing a guest
- **FR-002**: System MUST allow residents to select a visit end date when pre-authorizing a guest
- **FR-003**: System MUST validate that the visit end date is on or after the visit start date
- **FR-004**: System MUST prevent selecting visit start dates that are in the past
- **FR-005**: System MUST default the visit end date to match the visit start date if no end date is specified
- **FR-006**: System MUST display the date range picker in an intuitive, user-friendly format
- **FR-007**: System MUST store both visit_date_start and visit_date_end in the guest authorization record
- **FR-008**: System MUST restrict visit start dates to no more than 30 days in the future (based on existing tip text)
- **FR-009**: System MUST clearly indicate required vs optional date fields in the form
- **FR-010**: System MUST provide helpful error messages when date validation fails

### Key Entities

- **Guest Authorization**: Represents a pre-authorized guest entry, now including:
  - visit_date_start: The first date the guest is authorized to enter
  - visit_date_end: The last date the guest is authorized to enter
  - All existing attributes (guest name, phone, vehicle plate, purpose, special instructions, etc.)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Residents can specify multi-day guest visits in under 30 seconds using the date range picker
- **SC-002**: Form validation prevents 100% of invalid date range submissions (end date before start date)
- **SC-003**: Single-day visits require only one date selection (start date), reducing input effort by 50%
- **SC-004**: Date picker interface is intuitive enough that 95% of users complete it without errors on first attempt
- **SC-005**: Guards can clearly see the valid date range for each guest authorization, reducing verification time at the gate

## Assumptions

- The system already has infrastructure to store date fields in the database
- The existing "Expected Arrival Date" field will be replaced or repurposed as "Visit Start Date"
- Guards have access to view the date range information when verifying guests at the gate
- The date picker component is accessible and works on both desktop and mobile devices
- Time zone handling follows the village's local time zone for all date comparisons
- The 30-day advance booking limit mentioned in the existing help text applies to the start date
- Single-day visits are the most common use case, followed by multi-day visits
