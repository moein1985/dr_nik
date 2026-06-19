# PROJECT ANALYSIS FOR APPOINTMENT AND AI CHAT REDESIGN

## 1. Project Summary

- This repository is a clinic website and staff/patient management app built with Next.js App Router + TypeScript.
- The main business purpose is to support:
  - public clinic information pages,
  - patient registration/login,
  - appointment booking and staff-side scheduling,
  - admin/staff dashboards,
  - basic lead capture / consultation intake,
  - a lightweight AI consultation demo section.
- Main user-facing features:
  - multilingual public pages (fa/en/ar)
  - patient dashboard for creating/canceling appointments
  - staff dashboard for calendar, scheduling, status changes, edits, and media approval
  - admin/super-admin user management and role controls
  - OTP-based password reset flow
  - AI consultation demo form (text + optional image URL)

---

## 2. Tech Stack

- Frontend framework:
  - Next.js 15 (App Router)
  - React 19
  - TypeScript
- Backend framework:
  - tRPC over Next.js route handlers
  - App Router API routes for lighter endpoints
- Database:
  - PostgreSQL via Prisma ORM
- State management:
  - local React state in dashboard components
  - tRPC client + React Query dependency is present but not heavily used in the current UI
- Styling approach:
  - Tailwind CSS
  - custom utility classes and card-based dashboard components
- Build/deployment tools:
  - npm scripts
  - Docker Compose
  - Prisma migrations
- Third-party services:
  - SMTP (Nodemailer) for staff notifications
  - Kavenegar mock/real OTP SMS integration path
  - optional Mailpit in local Docker setup

---

## 3. Folder and File Structure

High-level tree (relevant parts):

- src/
  - app/
    - [locale]/
      - booking/
      - patient/
      - staff/
      - admin/
      - super-admin/
      - contact/
      - services/
      - doctor-portfolio/
      - gallery/
    - api/
      - contact-lead/
      - consultation-lead/
      - auth/session/*
      - trpc/[trpc]/route.ts
  - components/
    - booking-auth-panel.tsx
    - patient-dashboard-panel.tsx
    - staff-dashboard-panel.tsx
    - admin-dashboard-panel.tsx
    - super-admin-dashboard-panel.tsx
    - weekly-calendar.tsx
    - appointment-date-time-input.tsx
    - chat-lead-widget.tsx
  - server/
    - api/
      - routers/appointment.ts
      - routers/auth.ts
      - routers/ai.ts
      - trpc.ts
      - root.ts
    - modules/
      - appointment/
      - auth/
      - staff-email/
    - shared/service-container.ts
    - config/env.ts
    - security/
  - i18n/
    - messages/en.ts / fa.ts / ar.ts
    - dictionary.ts
  - lib/
    - doctor-portfolio-map.ts
  - trpc/client.ts
- prisma/
  - schema.prisma

Important files and roles:

- src/app/[locale]/booking/page.tsx
  - public booking entry page
- src/components/booking-auth-panel.tsx
  - auth/register/login/reset UI for booking journey
- src/components/patient-dashboard-panel.tsx
  - patient appointment creation, list, cancel, and AI demo form
- src/components/staff-dashboard-panel.tsx
  - staff scheduling calendar, CRUD for appointments, media review panel
- src/components/weekly-calendar.tsx
  - week-grid scheduling UI for staff
- src/components/appointment-date-time-input.tsx
  - localized date/time picker for appointment forms
- src/server/api/routers/appointment.ts
  - main appointment tRPC endpoints
- src/server/api/routers/auth.ts
  - login, register, OTP reset, role/user management endpoints
- src/server/api/routers/ai.ts
  - current AI/chat stub endpoint
- src/server/shared/service-container.ts
  - dependency wiring for auth, appointment, email, SMS, rate limiting
- prisma/schema.prisma
  - core DB models: User, Appointment, Session, PasswordReset, Video, Media

---

## 4. Application Architecture

- Frontend and backend interaction:
  - The UI uses tRPC client calls for structured backend actions.
  - Some simple public endpoints are plain Next.js API routes for lead capture.
  - The App Router uses server components for locale detection and page shells.
- Key modules and responsibilities:
  - auth module: user creation, login, session, password reset, role management
  - appointment module: appointment creation, listing, updates, cancellation, staff-side management
  - staff-email module: SMTP notification for new appointments
  - security module: rate limiting and login lockout
- Routing structure:
  - Locale-based public routes under src/app/[locale]/
  - API routes under src/app/api/
  - tRPC endpoint under src/app/api/trpc/[trpc]/route.ts
- Shared utilities/services:
  - tRPC client wrapper in src/trpc/client.ts
  - service container for dependency composition in src/server/shared/service-container.ts
  - i18n dictionary and localized date helpers in src/i18n/

Inferred architecture notes:
- The codebase appears to follow a clean-architecture style with domain/application/infrastructure layers under src/server/modules.
- Prisma repository implementations are used behind use cases and then wired through the service container.
- The project is currently more of a clinic operations prototype than a full production booking engine.

---

## 5. Appointment / Booking System

Relevant files:
- src/components/patient-dashboard-panel.tsx
- src/components/staff-dashboard-panel.tsx
- src/components/weekly-calendar.tsx
- src/components/appointment-date-time-input.tsx
- src/server/api/routers/appointment.ts
- src/server/modules/appointment/**
- prisma/schema.prisma

Current UI flow:
1. Patient enters booking form on patient dashboard.
2. Patient selects doctor, service, phone, notes, and a date/time.
3. Appointment is submitted via tRPC mutation.
4. Staff receives an email notification about the new booking.
5. Staff dashboard can:
   - view appointments in a weekly calendar,
   - change status (PENDING / CONFIRMED / CANCELLED),
   - edit appointment details,
   - delete appointments.

Current business logic:
- Appointment creation stores:
  - patientName
  - patientPhone
  - doctorName
  - requestedAt
  - serviceName
  - notes
  - createdByUserId
  - default status PENDING
- Patient can list and cancel only their own appointments.
- Staff/admin roles can list and manage all appointments.

Validation rules:
- Patient name: minimum 2 chars
- Patient phone: minimum 7 chars in tRPC input
- Doctor name: minimum 2 chars
- Service name: minimum 2 chars
- Notes: max 1000 chars
- Date/time is required; the UI prevents submission without a selected timestamp

Data sent/stored:
- Sent from frontend to tRPC mutation
- Persisted in Prisma model Appointment
- Notification email built from the appointment fields

APIs/endpoints used:
- appointment.createMy (patient)
- appointment.listMy (patient)
- appointment.cancelMy (patient)
- appointment.createByStaff (staff/admin)
- appointment.list (staff/admin)
- appointment.updateStatus
- appointment.updateByStaff
- appointment.deleteByStaff

Database tables/models involved:
- Appointment
- User (for createdByUserId relation)
- Session / PasswordReset are relevant for auth but not booking itself

Admin-side handling:
- Staff/admin dashboards can update statuses and edit records.
- Admin user-management panel can change user roles and activation.

Weak points / code smells / unclear areas:
- The booking flow appears to be a prototype; there is no real calendar availability logic, slot blocking, doctor-specific schedule rules, or time-slot conflict prevention.
- The UI accepts any doctor/service string rather than selecting from structured catalog data.
- The appointment model does not capture clinic branch, room, duration, reminder, or payment status.
- Notification email is sent on every create, but there is no richer workflow or reminder system.
- The app currently uses a simple weekly calendar view, not a full reservation engine with availability and conflict handling.

---

## 6. AI Chat / Chatbot Section

Relevant files:
- src/components/patient-dashboard-panel.tsx
- src/components/chat-lead-widget.tsx
- src/server/api/routers/ai.ts
- src/app/api/consultation-lead/route.ts
- src/i18n/messages/en.ts / fa.ts / ar.ts

UI flow:
- The patient dashboard contains a demo AI consultation form with:
  - text input,
  - optional image URL,
  - submit button,
  - response area.
- The site also contains a floating chat lead widget for consultation intake.

Backend/API integration:
- Current AI/chat backend is a stub in src/server/api/routers/ai.ts.
- It does not connect to any real LLM provider such as OpenAI, Gemini, Anthropic, Azure OpenAI, or a local model.
- The response is hard-coded based only on whether an image URL was included.

Model/provider usage:
- Inferred: no real AI provider is wired in this codebase.
- The current implementation is a placeholder/demo response.

Prompt handling:
- No prompt template, retrieval, system prompt, or model parameters are present.
- No conversation history or session storage exists in the current repo.

Session/message storage:
- No database model for chat sessions/messages exists in prisma/schema.prisma.
- The AI section is not backed by persistent chat storage.

Weak points / code smells / unclear areas:
- The AI section is currently a demo stub, not a real assistant.
- The widget named “AI Consultation” is functionally just a canned response placeholder.
- There is no real provider integration, no prompt management, no safety guardrails, and no audit trail.
- The consultation lead route is also a placeholder that only logs the phone number.

---

## 7. Data Layer

Main entities/models:
- User
  - id, phoneNumber, username, email, role, passwordHash, isActive, createdAt
- Appointment
  - id, createdByUserId, patientName, patientPhone, doctorName, requestedAt, serviceName, notes, status, createdAt
- Session
  - token, userId, userRole, expiresAt
- PasswordReset
  - userId, otpCodeHash, expiresAt, consumedAt
- Video
  - title, url, coverImage, doctorSlug
- Media
  - title, url, category, status

Relationships:
- User has many Appointments, Sessions, PasswordResets.
- Appointment belongs to one User (createdByUserId).
- Session and PasswordReset both point back to User.

Important fields:
- Appointment.status is enum PENDING | CONFIRMED | CANCELLED.
- User.role is PATIENT | STAFF | ADMIN | SUPER_ADMIN.
- Media.status is DRAFT | PENDING | APPROVED | REJECTED.

Where booking and chat data are stored:
- Appointment data: PostgreSQL via Prisma model Appointment.
- Auth/session data: PostgreSQL via User / Session / PasswordReset.
- AI chat data: currently not stored at all; this is a stub implementation.
- Consultation lead data: only logged in server output; not persisted in DB.

---

## 8. API and Integrations

Internal APIs:
- tRPC routers:
  - appointmentRouter
  - authRouter
  - aiRouter
- Next.js route handlers:
  - /api/contact-lead
  - /api/consultation-lead
  - /api/auth/session/login
  - /api/auth/session/logout
  - /api/auth/session/me
  - /api/trpc/[trpc]

External APIs/services:
- Kavenegar SMS (optional, via env-driven provider selection)
- SMTP / Nodemailer for appointment notification emails
- Local Docker Mailpit for mail capture in development

Auth-related endpoints:
- registerPatient
- login
- me
- forgotPassword
- resetPassword
- createStaff
- createAdmin
- listUsers
- setUserActive
- setUserRole

Appointment-related endpoints:
- createMy
- listMy
- cancelMy
- createByStaff
- list
- updateStatus
- updateByStaff
- deleteByStaff

Chat/AI-related endpoints:
- ai.createMessage (stub response only)
- consultation-lead placeholder endpoint

---

## 9. Reusable UI Components

Shared components relevant to booking and chat:
- src/components/booking-auth-panel.tsx
  - registration/login/forgot/reset panel used by booking page
- src/components/appointment-date-time-input.tsx
  - localized date/time input for scheduling forms
- src/components/weekly-calendar.tsx
  - reusable weekly scheduling UI for staff
- src/components/patient-dashboard-panel.tsx
  - combined booking + AI demo UI for patients
- src/components/staff-dashboard-panel.tsx
  - staff operations dashboard with appointment CRUD and media review
- src/components/chat-lead-widget.tsx
  - floating consultation lead capture widget
- src/components/contact-lead-form.tsx
  - contact intake form

Likely redesign touchpoints:
- booking/auth panel: good base for a redesigned patient booking onboarding flow
- weekly-calendar.tsx: suitable starting point for improved appointment scheduling UX
- patient-dashboard-panel.tsx: best place to integrate a richer AI assistant experience with booking context

---

## 10. Risks / Gaps / Unknowns

- No real AI model integration exists today.
- The AI chat section is a hard-coded demo and should not be treated as production-ready.
- The appointment system lacks:
  - real availability logic,
  - slot conflict prevention,
  - doctor-specific time rules,
  - repeat booking logic,
  - reminder workflows,
  - payment or insurance data.
- The staff dashboard mixes content-management and appointment-management responsibilities in one panel, which may complicate redesign.
- The consultation lead endpoints are placeholders and currently only log input.
- There is no dedicated chat session/message schema in Prisma.
- The code appears to be in an early prototype stage, with several areas intentionally stubbed for future integration.

---

## 11. Recommended Starting Points

For appointment redesign:
1. src/server/api/routers/appointment.ts
2. src/server/modules/appointment/**
3. src/components/patient-dashboard-panel.tsx
4. src/components/staff-dashboard-panel.tsx
5. src/components/weekly-calendar.tsx
6. prisma/schema.prisma (Appointment model)

For AI chat improvements:
1. src/server/api/routers/ai.ts
2. src/components/patient-dashboard-panel.tsx (AI demo UI)
3. src/components/chat-lead-widget.tsx
4. src/app/api/consultation-lead/route.ts
5. src/i18n/messages/* (copy and UX strings)

---

## Bottom Line

This project is a clinic operations prototype with solid auth + appointment infrastructure, but the AI chat section is still a placeholder. The strongest redesign starting points are the appointment tRPC router and the existing patient/staff dashboard components, because they already contain the real user flows that a future booking + AI assistant pipeline would need to extend.
