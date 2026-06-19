# 1. Appointment System Deep Audit

## 1.1 Entry points
- Patient-facing booking UI: [src/components/patient-dashboard-panel.tsx](src/components/patient-dashboard-panel.tsx)
  - Creates appointments via `trpc.appointment.createMy.mutate(...)`
  - Lists and cancels the patient’s own appointments via `listMy` and `cancelMy`
- Staff-facing scheduling UI: [src/components/staff-dashboard-panel.tsx](src/components/staff-dashboard-panel.tsx)
  - Creates, lists, edits, updates status, and deletes appointments
  - Uses a weekly calendar view from [src/components/weekly-calendar.tsx](src/components/weekly-calendar.tsx)
- Backend router: [src/server/api/routers/appointment.ts](src/server/api/routers/appointment.ts)
  - Exposes `createMy`, `listMy`, `cancelMy`, `list`, `createByStaff`, `updateStatus`, `updateByStaff`, and `deleteByStaff`
- Application service wiring: [src/server/shared/service-container.ts](src/server/shared/service-container.ts)
  - Connects appointment use-cases to Prisma-backed repositories
- Domain layer: [src/server/modules/appointment/domain/appointment.entity.ts](src/server/modules/appointment/domain/appointment.entity.ts) and [src/server/modules/appointment/domain/appointment.repository.ts](src/server/modules/appointment/domain/appointment.repository.ts)

## 1.2 UI flow in detail
- Patient flow
  - The patient dashboard loads the authenticated user, checks role, then loads the patient’s appointments.
  - The form collects patient name, phone, service, doctor, date/time, and notes.
  - Submission creates a record and refreshes the list.
  - A cancel action updates appointment status to `CANCELLED`.
- Staff flow
  - The staff dashboard loads all appointments, media review items, and video items.
  - The UI supports a calendar tab, list tab, create form, and inline edit form.
  - The calendar supports week navigation and add-on-day actions.
  - Staff can confirm, cancel, edit, and delete appointments.
- UX observations
  - The UI is already functional as a CRUD shell, but it is not a full booking system.
  - There is no visible availability engine, no slot conflict protection, and no doctor schedule/rule model in the UI.

## 1.3 Backend flow in detail
- Request validation
  - The router validates input with `zod` in [src/server/api/routers/appointment.ts](src/server/api/routers/appointment.ts)
  - Required fields include patient name, phone, doctor, service, requested time, and optional notes.
- Auth and permissions
  - Access is gated by tRPC middleware in [src/server/api/trpc.ts](src/server/api/trpc.ts)
  - `patientProcedure` allows only `PATIENT`
  - `staffProcedure` allows `STAFF`, `ADMIN`, and `SUPER_ADMIN`
- Create flow
  - The router calls `services.appointment.create.execute(...)`
  - The use-case in [src/server/modules/appointment/application/create-appointment.use-case.ts](src/server/modules/appointment/application/create-appointment.use-case.ts) is currently a thin wrapper over the repository.
- Persistence
  - The repository in [src/server/modules/appointment/infrastructure/prisma-appointment.repository.ts](src/server/modules/appointment/infrastructure/prisma-appointment.repository.ts) creates and updates appointment rows in Prisma.
- Notifications
  - After create, staff email notifications are sent using [src/server/modules/staff-email/application/notify-staff.use-case.ts](src/server/modules/staff-email/application/notify-staff.use-case.ts) and [src/server/modules/staff-email/infrastructure/smtp-email.sender.ts](src/server/modules/staff-email/infrastructure/smtp-email.sender.ts)
  - This is a basic notification hook, not a full booking workflow automation.

## 1.4 Data model and constraints
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- Core appointment fields
  - `id`, `createdByUserId`, `patientName`, `patientPhone`, `doctorName`, `requestedAt`, `serviceName`, `notes`, `status`, `createdAt`
- Status enum
  - `PENDING`, `CONFIRMED`, `CANCELLED`
- Current constraints
  - No explicit doctor calendar/schedule model
  - No service-duration or room/slot model
  - No uniqueness rule to prevent double-booking for the same doctor/time
  - No reminder or follow-up model
  - No audit trail of booking changes beyond basic CRUD
- Inferred constraint
  - The current system likely treats appointment time as a simple timestamp and relies on client/server validation only; no availability engine is present in the repository or router.

## 1.5 Current limitations
- No real availability logic
  - No provider/doctor schedule rules, no time-slot generation, no conflict detection.
- No booking domain depth
  - No consultation type, duration, location, payment state, reminder, or follow-up state.
- No robust staff workflow
  - Status transitions are manual and there is no rule-based workflow for confirmations, reassignments, or cancellations.
- No persistence for booking history or audit events
  - Changes are only visible through current record values.
- No true patient self-service experience
  - The patient can create and cancel, but there is no ability to reschedule with constraints or choose from a real availability calendar.

## 1.6 Exact redesign touchpoints
- UI layer
  - [src/components/patient-dashboard-panel.tsx](src/components/patient-dashboard-panel.tsx)
  - [src/components/staff-dashboard-panel.tsx](src/components/staff-dashboard-panel.tsx)
  - [src/components/weekly-calendar.tsx](src/components/weekly-calendar.tsx)
  - [src/components/appointment-date-time-input.tsx](src/components/appointment-date-time-input.tsx)
- Backend layer
  - [src/server/api/routers/appointment.ts](src/server/api/routers/appointment.ts)
  - [src/server/modules/appointment/application](src/server/modules/appointment/application)
  - [src/server/modules/appointment/infrastructure/prisma-appointment.repository.ts](src/server/modules/appointment/infrastructure/prisma-appointment.repository.ts)
  - [prisma/schema.prisma](prisma/schema.prisma)
- Integration layer
  - [src/server/shared/service-container.ts](src/server/shared/service-container.ts)
  - [src/server/modules/staff-email](src/server/modules/staff-email)
- Redesign focus areas
  - Introduce doctor schedules and availability rules
  - Add slot-generation and conflict-prevention checks
  - Add appointment type/duration/location fields
  - Add audit trail and reminder workflow
  - Replace current manual status UI with rule-based workflow states

# 2. AI Chat / Consultation Assistant Deep Audit

## 2.1 Entry points
- Patient-facing AI demo UI: [src/components/patient-dashboard-panel.tsx](src/components/patient-dashboard-panel.tsx)
  - Sends text and optional image URL to the AI endpoint
- Backend router: [src/server/api/routers/ai.ts](src/server/api/routers/ai.ts)
  - Current mutation is `createMessage`
- Placeholder consultation intake API: [src/app/api/consultation-lead/route.ts](src/app/api/consultation-lead/route.ts)
  - Validates a phone number and logs it as a placeholder lead
- Placeholder contact lead API: [src/app/api/contact-lead/route.ts](src/app/api/contact-lead/route.ts)
  - Validates a short contact form payload and logs it as a placeholder lead

## 2.2 UI flow in detail
- The patient dashboard includes a small “AI consultation” form.
- It collects a text prompt and optional image URL.
- On submit, it calls `trpc.ai.createMessage.mutate(...)`.
- The UI displays the server response as a simple reply banner.
- There is no multi-turn chat, no session history, no attachment handling beyond a URL, and no escalation or queue state beyond a fixed reply.

## 2.3 Backend/API flow in detail
- The AI router is currently a stub in [src/server/api/routers/ai.ts](src/server/api/routers/ai.ts)
- It accepts:
  - `text` with a minimum length of 2 and maximum of 1000
  - optional `imageUrl`
- The mutation returns:
  - `reply`
  - `queueStatus: "RECEIVED"`
- The endpoint does not call an LLM provider, vector store, CRM, or external consultation system.
- The consultation-lead API in [src/app/api/consultation-lead/route.ts](src/app/api/consultation-lead/route.ts) is also a placeholder and only logs the phone number.
- Inferred detail
  - The current implementation appears intended as a demo placeholder rather than a production assistant; that is inferred from the hard-coded response text and the absence of provider integration.

## 2.4 Prompt/state/storage audit
- Prompt handling
  - Prompt text is passed directly from the client to the router with no templating layer, moderation layer, or provider-specific instruction set.
- State handling
  - UI state is local only; there is no persisted conversation or message storage.
- Storage
  - No Prisma model for chat messages, chat sessions, or consultation threads exists in [prisma/schema.prisma](prisma/schema.prisma)
- Session behavior
  - No session ID, conversation ID, or thread continuity is present.
- Inferred detail
  - A production design would likely need a chat message table and a consultation session table, but those are not present in the current schema.

## 2.5 Current limitations
- Stubbed responses only
  - The assistant never calls a real model/provider.
- No conversation memory
  - No history, no context window management, and no user/session continuity.
- No persistence
  - Messages and consultation intents are not stored.
- No escalation path
  - No handoff to a human staff flow, no CRM integration, and no follow-up logic.
- No structured intake
  - The consultation-lead route only validates a phone number and logs it.

## 2.6 Exact redesign touchpoints
- UI layer
  - [src/components/patient-dashboard-panel.tsx](src/components/patient-dashboard-panel.tsx)
- Backend layer
  - [src/server/api/routers/ai.ts](src/server/api/routers/ai.ts)
  - [src/app/api/consultation-lead/route.ts](src/app/api/consultation-lead/route.ts)
  - [src/app/api/contact-lead/route.ts](src/app/api/contact-lead/route.ts)
- Persistence layer
  - [prisma/schema.prisma](prisma/schema.prisma)
- Integration layer
  - [src/server/shared/service-container.ts](src/server/shared/service-container.ts)
- Redesign focus areas
  - Replace stub with provider-backed chat flow
  - Add message/session persistence
  - Add prompt templates and safety controls
  - Add human handoff and CRM integration
  - Support multi-turn consultation with structured intake fields

# 3. Cross-Section Architecture Notes
- Both areas share the same app architecture pattern
  - React client components call typed tRPC procedures
  - tRPC routers sit on top of use-cases and repositories
  - Prisma is the persistence layer
- Auth and permissions are already centralized in [src/server/api/trpc.ts](src/server/api/trpc.ts)
  - This is a strong base for role-aware booking and consultation workflows
- The appointment and AI flows both currently rely on thin CRUD or stub implementations
  - Appointment flow is a real workflow but lacks business rules
  - AI flow is a placeholder with no external provider or storage
- The most likely next step is to evolve from CRUD/stub patterns into domain-rich workflows with persistence, validation, and workflow state
- Inferred architecture gap
  - The codebase appears to be moving toward a modular use-case/repository structure, but business rules are still mostly missing from the appointment and AI domains.

# 4. Recommended Next Specs
- Spec A: Appointment booking redesign
  - Add doctor schedules and availability slots
  - Add conflict prevention and slot selection UI
  - Add appointment duration, consultation type, and status workflow
  - Add audit trail and reminder notifications
  - Deliverables: schema changes, router changes, UI changes, and tests
- Spec B: AI consultation assistant redesign
  - Replace stubbed response with provider-backed multi-turn chat
  - Add persistent chat sessions and message history
  - Add structured consultation intake and human handoff
  - Add safety rules, prompt management, and logging
  - Deliverables: schema changes, provider adapter, router changes, UI changes, and tests
- Spec C: Shared workflow foundation
  - Add a reusable workflow-state model for booking and consultation events
  - Add event logging and notification hooks for both systems
  - Ensure role-based permissions and auditability are enforced consistently
