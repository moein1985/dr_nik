# Final Change Plan: Booking + Doctor AI

## Approved Decisions
- Replace role semantics: `ADMIN` → `DOCTOR` (role name stays `ADMIN` in DB for now, but domain meaning changes)
- Keep `SUPER_ADMIN` role
- Add `DoctorProfile` model for doctor-specific information
- `super_admin` creates both doctors and staff
- Doctors choose staff only from existing pre-created staff users
- One staff can be assigned to multiple doctors
- Staff can switch between assigned doctors in their panel
- Patient can cancel own appointment only up to 24 hours before start
- AI is doctor-specific with doctor profile as orchestration context
- AI provider: AvalAI, model: Gemini 2.5 Flash
- AI question limit: 5 per patient per doctor
- Super_admin manages AI settings

---

## Likely Impacted Files

### Schema / Data Layer
- `prisma/schema.prisma`
  - Add `DoctorProfile` model
  - Add `DoctorStaffAssignment` many-to-many model
  - Appointment: add/ensure `doctorUserId` field

### Backend Router / Auth
- `src/server/api/routers/auth.ts`
  - Add procedures for doctor profile read/write
  - Add procedures for staff assignment
  - Update role checks

### Backend Modules
- `src/server/modules/appointment/**`
  - Update permission checks for doctor context
  - Enforce 24h cancellation rule
  - Add doctor filtering

### UI Components
- `src/components/doctor-dashboard-panel.tsx` (new)
- `src/components/staff-dashboard-panel.tsx`
  - Add doctor switcher
  - Filter appointments by doctor context
- `src/components/patient-dashboard-panel.tsx`
  - Add doctor selection during booking
- `src/components/super-admin-dashboard-panel.tsx`
  - Add staff creation UI (if not present)
  - Add doctor creation UI (if not present)

### i18n
- `src/i18n/messages/en.ts`, `fa.ts`, `ar.ts`
  - Add doctor profile labels if not present

---

## Required Database Changes

### New Models
- `DoctorProfile` with fields:
  - userId, bio, credentials, acceptedInsurances, workingHours, specialties, services, branchAddress, experience, extraNotes, aiProfileContext, timestamps
- `DoctorStaffAssignment` with:
  - doctorUserId, staffUserId, isActive, assignedAt, timestamps
  - unique constraint on (doctorUserId, staffUserId)

### Appointment Schema
- Add `doctorUserId` field if not present
- Update indexes for doctor context

---

## Required Permission Changes

### super_admin
- Can create/edit/delete doctors
- Can create/edit/delete staff users
- Can manage AI provider settings globally

### doctor
- Can read/write only own profile
- Can assign/unassign own staff from pre-created pool
- Can view only own appointments

### staff
- Can manage appointments only for assigned doctors
- Can switch between assigned doctors in UI
- Can access only appointment data for assigned doctors

### patient
- Can book appointments
- Can cancel own appointments if within 24h rule
- Can message AI doctor assistant (5 question limit)

---

## Required UI Changes

### Doctor Panel
- Profile sections: About Me, Credentials, Insurances, Working Hours, Specialties, Address, Experience, AI Context
- Staff assignment section with switcher

### Staff Panel
- Add doctor switcher/dropdown at top
- Filter all appointment displays by selected doctor
- Permission validation for each doctor context

### Patient Booking
- Add doctor selection step if not present
- Enforce doctor context in appointment creation

### Super Admin Panel
- Ensure staff creation UI present
- Doctor creation UI already present

---

## Recommended Implementation Order

1. **Phase 1**: Role semantics + basic doctor profile schema
2. **Phase 2**: Doctor↔staff assignment relationship
3. **Phase 3**: Doctor profile UI in doctor panel
4. **Phase 4**: Doctor context in appointment workflows
5. **Phase 5**: AI doctor-specific orchestration
6. **Phase 6**: 5-question limit per patient per doctor

---

## Open Questions (if any)
- Are working hours structured or free text? → recommend free text for phase 1
- Is `doctorUserId` already in Appointment schema? → verify in next step
- Does staff dashboard already support context switching? → inspect in phase 2
