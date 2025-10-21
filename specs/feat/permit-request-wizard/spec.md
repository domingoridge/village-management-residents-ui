# Feature Specification: Permit Request Wizard

**Feature Branch**: `feat/permit-request-wizard`
**Created**: 2025-10-20
**Status**: Draft
**Input**: User description: "Create new page for requesting for permit via wizard form, see designs @docs/ui-designs/v1/new_permit_1.png @docs/ui-designs/v1/new_permit_2.png @docs/ui-designs/v1/new_permit_3.png."

## Clarifications

### Session 2025-10-20

- Q: How should form fields adapt when different permit types are selected? → A: Separate form templates for each major permit category, with dynamic fields that appear/disappear based on selected permit type
- Q: How many files can be uploaded per document category and how should they be displayed? → A: Combined into single PDF requirement per category, with option for multiple files with visual list depending on document type
- Q: Are all document categories mandatory or does it vary by permit type? → A: Required documents vary by permit type
- Q: How are permit fees calculated and do they change dynamically? → A: Fees calculated based on permit type and project parameters
- Q: How is "Pay Now" payment processing handled within the wizard flow? → A: Redirect to external payment gateway, return to confirmation

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Submit Basic Permit Information (Priority: P1)

A resident needs to apply for a construction permit by providing project details and contractor information through a guided multi-step form.

**Why this priority**: This is the core functionality that enables residents to initiate permit applications. Without this, no permit requests can be made, making it the foundational capability.

**Independent Test**: Can be fully tested by navigating to the permit request page, filling out Step 1 (project details and contractor information), and verifying the data is captured and validated correctly. Delivers immediate value by allowing residents to begin the permit application process.

**Acceptance Scenarios**:

1. **Given** a resident is on the permit request page, **When** they select a permit type from the dropdown, enter project dates, add a project description, and fill in contractor details, **Then** all fields are validated and the resident can proceed to the next step.
2. **Given** a resident enters invalid data (e.g., empty required fields, invalid email format, end date before start date), **When** they attempt to proceed, **Then** appropriate validation messages are displayed for each invalid field.
3. **Given** a resident has partially filled the form, **When** they leave the page and return, **Then** their progress is preserved (if saved as draft).

---

### User Story 2 - Upload Required Documents (Priority: P2)

A resident needs to upload supporting documents for their permit application, including building plans, contracts, and site photos, with file format and size validation.

**Why this priority**: Document submission is essential for permit review and approval, but depends on having basic permit information captured first (P1). This is the second most critical step in completing a valid permit application.

**Independent Test**: Can be tested by navigating to Step 2 of the wizard, uploading files of various formats and sizes, and verifying that the system accepts valid files, rejects invalid ones with clear error messages, and displays upload status correctly.

**Acceptance Scenarios**:

1. **Given** a resident is on Step 2 (Upload Documents), **When** they drag and drop or click to select files for Building Plans/Blueprints (JPG, PNG, DWG), Contracts/Agreements (PDF, JPG, PNG), and Site Photos (JPG, PNG), **Then** files within the 10MB limit are uploaded successfully with visual feedback.
2. **Given** a resident attempts to upload a file, **When** the file exceeds 10MB or is in an unsupported format, **Then** the system displays an error message indicating the specific validation failure (e.g., "File size exceeds 10MB limit" or "Unsupported file format").
3. **Given** a resident has uploaded files, **When** they review the upload list, **Then** they can see file names, sizes, upload status (complete/error), and have the option to remove and re-upload files.

---

### User Story 3 - Review Fees and Complete Payment (Priority: P3)

A resident needs to review the calculated permit fees and choose a payment option (Pay Now or Pay Later) to complete their permit application.

**Why this priority**: Payment processing is important for completing the transaction, but the permit application can still be submitted and reviewed even if payment is deferred. This makes it a lower priority than capturing core information and documents.

**Independent Test**: Can be tested by navigating to Step 3 (Payment), verifying the fee breakdown is displayed correctly, selecting different payment options, and confirming the application submission. Delivers value by enabling residents to understand costs and complete payment.

**Acceptance Scenarios**:

1. **Given** a resident is on Step 3 (Payment), **When** the page loads, **Then** they see a detailed fee breakdown (Base Fee, Processing Fee, Road Use Fee) and the total amount.
2. **Given** a resident is reviewing payment options, **When** they select "Pay Later", **Then** they can proceed to submit the application without immediate payment, and the system marks the application as pending payment.
3. **Given** a resident selects "Pay Now", **When** they choose a payment method (GCash, PayMaya, or Credit/Debit Card), **Then** they are redirected to the external payment gateway, complete the payment there, and return to the application confirmation page with payment status.
4. **Given** a resident completes all steps, **When** they click "Next/Review", **Then** they are taken to a review/confirmation page showing their submitted application details and next steps.

---

### User Story 4 - Save Progress as Draft (Priority: P3)

A resident wants to save their incomplete permit application as a draft and return to complete it later.

**Why this priority**: Draft saving enhances user experience by preventing data loss, but is not essential for the core permit submission flow. Users can complete the application in one session without this feature.

**Independent Test**: Can be tested by partially filling any step of the wizard, clicking "Save as Draft", leaving the page, and returning to verify the saved data is restored correctly.

**Acceptance Scenarios**:

1. **Given** a resident is on any step of the wizard, **When** they click "Save as Draft", **Then** their current progress is saved and they receive confirmation that the draft has been saved.
2. **Given** a resident has saved a draft, **When** they return to the permit request page, **Then** they can resume from where they left off with all previously entered data populated.
3. **Given** a resident has multiple drafts, **When** they view their applications, **Then** they can identify and access draft applications separately from submitted applications.

---

### Edge Cases

- Which specific document categories require single PDF vs. multiple file uploads for each permit type?
- What is the maximum number of files allowed for categories that accept multiple files?
- Which document categories are mandatory vs. optional for each specific permit type?
- Which specific project parameters influence fee calculations for different permit types?
- How are fee calculation rules configured and updated in the system?
- How does the system handle network interruptions during file upload?
- What happens if a resident navigates backward in the wizard after completing a step?
- How does the system handle payment failures or timeouts from external gateways?
- What happens if a resident closes the browser during payment gateway redirect?
- How does the system verify payment callback authenticity from external gateways?
- How does the system preserve filled data when a resident changes permit type mid-form (different template)?
- How are permit type categories defined and which specific types belong to each category?
- How does the system handle expired draft applications?
- What happens if a resident tries to submit without completing all mandatory steps?
- How does the system handle character limits in text fields (e.g., 500 characters for project description)?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a multi-step wizard interface with three distinct steps: Project Details, Upload Documents, and Payment
- **FR-002**: System MUST display a progress indicator showing the current step and overall completion percentage (e.g., "Step 2 of 4: Documents" with "50%" progress)
- **FR-003**: System MUST allow residents to select a permit type from a predefined list via dropdown, which determines the form template and dynamic fields displayed
- **FR-003a**: System MUST organize permit types into major categories, each with its own form template
- **FR-003b**: System MUST dynamically show/hide fields based on the selected permit type within a category
- **FR-004**: System MUST provide date picker controls for project start date and end date (duration)
- **FR-005**: System MUST validate that the project end date is not before the start date
- **FR-006**: System MUST provide a text area for project description with a visible character counter and 500-character limit
- **FR-007**: System MUST collect contractor information including name, contact number, email address, and business address
- **FR-008**: System MUST validate email addresses using standard email format validation
- **FR-009**: System MUST validate that all required fields are completed before allowing progression to the next step
- **FR-010**: System MUST provide document upload sections for Building Plans/Blueprints, Contracts/Agreements, and Site Photos/Current Condition
- **FR-010a**: System MUST require single PDF uploads for certain document categories, while allowing multiple files with visual list for others (configuration depends on document type)
- **FR-010b**: System MUST determine which document categories are required or optional based on the selected permit type
- **FR-011**: System MUST enforce file format restrictions for each document type (JPG, PNG, DWG, PDF for plans; PDF for contracts; JPG, PNG for photos)
- **FR-012**: System MUST enforce a 10MB maximum file size limit for all uploads
- **FR-013**: System MUST provide drag-and-drop and click-to-upload interfaces for document submission
- **FR-014**: System MUST display upload progress and completion status for each file
- **FR-015**: System MUST allow residents to remove and re-upload files before final submission
- **FR-016**: System MUST display validation error messages for files that exceed size limits or are in unsupported formats
- **FR-017**: System MUST calculate and display a permit fee breakdown including Base Fee, Processing Fee, and Road Use Fee with a total amount, where fees are determined by both permit type and project parameters (such as duration, scope, or other relevant factors)
- **FR-018**: System MUST present payment options: "Pay Later" and "Pay Now"
- **FR-019**: System MUST provide multiple payment methods when "Pay Now" is selected: GCash, PayMaya, and Credit/Debit Card
- **FR-019a**: System MUST redirect residents to the appropriate external payment gateway when a payment method is selected
- **FR-019b**: System MUST return residents to a confirmation page after payment gateway processing (success or failure)
- **FR-020**: System MUST allow residents to save incomplete applications as drafts at any step
- **FR-021**: System MUST provide "Back", "Save as Draft", and "Next" navigation buttons on each step
- **FR-022**: System MUST validate all required information across all steps before final submission
- **FR-023**: System MUST provide confirmation feedback when an application is successfully submitted
- **FR-024**: System MUST persist draft applications so residents can resume later
- **FR-025**: System MUST display the currency format for fees using Philippine Peso (₱) with proper decimal formatting

### Key Entities

- **Permit Application**: Represents a resident's request for a construction permit, including all project details, contractor information, uploaded documents, fee calculations, and payment status. Key attributes include application ID, submission date, status (draft/submitted/approved/rejected), permit type, project dates, description, and total fee amount.

- **Project Details**: Contains information about the construction project, including permit type, start and end dates, detailed description of work to be performed, and project scope.

- **Contractor Information**: Details about the contractor performing the work, including name, contact number, email address, and business address.

- **Document Submission**: Represents uploaded files for the permit application, categorized by type (building plans, contracts, site photos). Each document has attributes like file name, size, format, upload timestamp, and validation status.

- **Fee Breakdown**: Itemized costs associated with the permit application, including base fee, processing fee, road use fee, and calculated total. Fee amounts are dynamically calculated based on permit type and project parameters such as duration, scope, size, or other relevant project characteristics.

- **Payment Record**: Information about the payment transaction, including payment method (GCash/PayMaya/Credit Card/Pay Later), payment status (pending/completed/failed), transaction ID, payment date, and amount paid.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Residents can complete the entire permit application process from start to submission in under 10 minutes for straightforward projects
- **SC-002**: 95% of file uploads complete successfully on the first attempt for files meeting format and size requirements
- **SC-003**: Validation errors are displayed immediately (within 1 second) when residents enter invalid data
- **SC-004**: 90% of residents successfully navigate through all wizard steps without requiring support assistance
- **SC-005**: The progress indicator accurately reflects completion percentage at each step, helping residents understand how much remains
- **SC-006**: Draft applications are saved and can be resumed by residents with 100% data accuracy
- **SC-007**: Fee calculations are displayed accurately and update within 1 second when permit type or project parameters change
- **SC-008**: Payment processing (when "Pay Now" is selected) completes within 30 seconds for successful transactions

## Assumptions

- Residents are authenticated users with valid accounts in the system
- Permit types and associated fee structures are predefined and configured in the system
- Payment gateway integrations for GCash, PayMaya, and Credit/Debit Card processing are available or will be integrated, using external gateway redirects with callback URLs for payment status updates
- File storage infrastructure supports secure upload and retrieval of documents up to 10MB
- The system will send email notifications to residents upon application submission and status changes
- Administrator or staff users have a separate interface to review and process submitted permit applications
- The "Pay Later" option allows applications to be submitted and reviewed before payment, with payment collected at the village office or through follow-up
- Currency is Philippine Peso (₱) based on the design mockups
- Contact numbers follow Philippine phone number formats
- Draft applications are retained for a reasonable period (e.g., 30 days) before expiration
