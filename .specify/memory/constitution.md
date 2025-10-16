<!--
Sync Impact Report - Constitution Update
Version: 1.0.0 (initial ratification)
Date: 2025-10-16

Modified Principles:
- All principles are new (initial creation)

Added Sections:
- Core Principles (7 principles covering development, naming, UX, tooling, documentation)
- Technical Standards (development principles, type safety, code quality)
- UX & Design Requirements (accessibility, mobile-first, visual design)
- Governance (amendment process, compliance, documentation requirements)

Templates Requiring Updates:
- ✅ spec-template.md - Aligns with mobile-first and accessibility requirements
- ✅ plan-template.md - Constitution Check section will use these principles
- ✅ tasks-template.md - Task organization supports component-driven development
- ⚠ All command files - Should reference this constitution for compliance checks

Follow-up TODOs:
- None - all placeholders filled with concrete values
-->

# Village Management Resident UI Constitution

## Core Principles

### I. Modern Web Standards

All development MUST use modern, standards-based web technologies with a focus on performance,
accessibility, and maintainability. The application prioritizes client-side rendering for
optimal user experience and follows current best practices for web application architecture.

**Rationale**: Modern standards ensure long-term sustainability, broad browser support,
and access to the latest performance optimizations and security features.

### II. Component-Driven Development

Every UI element MUST be implemented as a self-contained, reusable component. Components MUST be
functional with hooks, never class-based. Each component owns its logic, styling, and behavior.

**Requirements**:

- Use functional components with React hooks exclusively
- Each component must be independently testable
- Components must follow single responsibility principle
- Shared logic extracted to custom hooks with "use" prefix

**Rationale**: Component-driven architecture enables parallel development, easier testing,
code reuse, and clear separation of concerns.

### III. Type Safety & Code Quality (NON-NEGOTIABLE)

All code MUST be statically typed. The use of `any` type is PROHIBITED unless explicitly
approved with written justification. Code MUST be lint-clean and follow defined ESLint
and TypeScript configuration rules.

**Requirements**:

- Strict TypeScript mode enabled
- Union types for variables requiring specific value sets
- No `any` types without explicit approval and documentation
- All ESLint and TSConfig rules must pass
- Zero console.log statements unless explicitly configured by user

**Rationale**: Type safety prevents entire categories of runtime errors, improves IDE support,
serves as living documentation, and reduces maintenance burden.

### IV. Naming & Code Organization Standards

Consistent naming conventions MUST be applied across the entire codebase to ensure
readability and predictability.

**Conventions**:

- **Components**: PascalCase (e.g., `HouseholdList`, `StickerForm`)
- **Files**: Match component name (e.g., `HouseholdList.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth`, `usePermissions`)
- **Utilities**: camelCase (e.g., `formatDate`, `calculateRoadFee`)
- **Constants**: UPPER_SNAKE_CASE in dedicated constants folder (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `Household`, `StickerStatus`)
- **Enums/Unions**: PascalCase with UPPER_CASE values (e.g., `StickerStatus.ACTIVE`)
- **API Transformation**: snake_case from API MUST be converted to camelCase
- **Form Controls**: camelCase version of database column names

**Organization**:

- Shared constants in `/constants` folder with domain-specific file naming
- Import constants where needed, avoid magic values
- Group related functionality by domain/feature

**Rationale**: Consistent naming reduces cognitive load, makes code searchable,
and enables team members to navigate unfamiliar code quickly.

### V. Accessibility & UX First

User experience and accessibility MUST be prioritized from the start, not added later.
WCAG 2.1 AA compliance is the minimum acceptable standard.

**Requirements**:

- WCAG 2.1 AA compliance mandatory
- Mobile-first responsive design (test mobile breakpoints first)
- Clear visual hierarchy and minimalist design
- Readable typography with proper contrast ratios
- Design tokens for spacing, color, and typography
- Dark mode support required
- Golden ratio applied to layout proportions where applicable
- Icons MUST come from approved library/package only
- Skeleton loaders for all components during data loading
- Loading indicators MUST show during save operations
- Toast notifications for success/error messages (top-right positioning)

**Rationale**: Accessibility is a legal requirement in many jurisdictions and ensures
the application serves all users. Mobile-first design ensures the experience works
everywhere, and consistent UX patterns reduce user confusion.

### VI. Testing & Quality Assurance

Code quality MUST be maintained through automated testing and quality gates.
Important elements MUST include test identifiers for automation.

**Requirements**:

- Add `data-testid` attributes to important interactive elements
- Husky pre-commit hooks MUST run and pass before commits
- All tests must pass before merging
- Test automation must be able to reliably target elements

**Rationale**: Testing infrastructure catches regressions early, enables confident
refactoring, and ensures the application behaves as expected across changes.

### VII. Documentation & Specification Discipline

Every feature MUST begin with a specification document created via `/specify`.
Changes MUST trace back to specifications. Documentation MUST remain current.

**Requirements**:

- All features begin with `/specify` workflow
- Each change must reference originating specification
- Architecture diagrams kept in `/docs` and updated with changes
- No undocumented architectural decisions

**Rationale**: Specifications prevent scope creep, enable informed decision-making,
provide audit trail for changes, and ensure knowledge transfer across team members.

## Technical Standards

### Development Workflow

- Client-side rendering by default unless explicitly specified otherwise
- No unnecessary fallbacks or defensive code that adds complexity
- Self-documenting code preferred over comments
- Lint-clean code at all times (zero warnings tolerated)
- Modular, testable, extensible architecture

### Code Quality Gates

All code changes MUST pass:

- TypeScript compilation with zero errors
- ESLint with zero warnings or errors
- Pre-commit hooks (enforced via Husky)
- All automated tests
- Manual code review

## UX & Design Requirements

### Visual Design Principles

- Clear visual hierarchy guides user attention
- Minimalism: remove unnecessary elements
- Typography must be readable with sufficient size and line height
- Design tokens ensure consistency across the application
- Color schemes must support both light and dark modes
- Layout proportions follow golden ratio where applicable

### Interaction Design

- Mobile-first: design for smallest screen first, progressively enhance
- Touch targets minimum 44x44 pixels
- Loading states: skeleton loaders during initial load
- Save operations: show explicit loading indicator
- Feedback: toast notifications for all success/error states
- Toast position: top-right unless explicitly overridden

### Component Standards

- Only use icons from the approved icon library/package
- No custom icon implementations without approval
- Skeleton loaders required for all data-driven components
- Loading states must be visually consistent across the application

## Governance

### Amendment Process

This constitution supersedes all other development practices and guidelines.
Amendments require:

1. Documentation of proposed change with rationale
2. Review and approval from technical leadership
3. Migration plan for affected code and templates
4. Version bump following semantic versioning rules
5. Update of all dependent templates and documentation

### Versioning Policy

Constitution follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes, principle removals, incompatible governance changes
- **MINOR**: New principles added, material expansions to existing guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance & Review

- All pull requests MUST verify compliance with constitution principles
- Code reviewers MUST check adherence to naming conventions and standards
- Complexity that violates principles MUST be explicitly justified in PR description
- Pre-commit hooks enforce automated compliance checks
- Regular constitution reviews ensure principles remain relevant

### Constitution as Source of Truth

When conflicts arise between this constitution and other documentation:

- Constitution takes precedence
- Other documentation should be updated to align
- Conflicts should be resolved through amendment process

### Living Document

This constitution is a living document that evolves with the project.
Regular reviews (suggested quarterly) ensure principles remain aligned with
project needs while maintaining stability and consistency.

**Version**: 1.0.0 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-16
