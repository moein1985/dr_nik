# Implementation Phase Checklist

## Phase 1 — Role Semantics + Doctor Profile Foundation
**Goal**: Introduce DOCTOR role, add doctor profile model

- [ ] Add `DOCTOR` role to Prisma enum (if not present)
- [ ] Create `DoctorProfile` model with basic fields
- [ ] Add procedure `auth.getMyDoctorProfile`
- [ ] Add procedure `auth.upsertMyDoctorProfile`
- [ ] Create doctor panel component shell
- [ ] Update all role-check auth guards to support `DOCTOR`
- [ ] Test: doctor can log in and see panel

**Expected Output**: Doctor role exists, profile model persists, basic CRUD works

---

## Phase 2 — Doctor↔Staff Assignment
**Goal**: Enable many-to-many doctor-staff assignments

- [ ] Add `DoctorStaffAssignment` model to schema
- [ ] Add procedure `auth.assignStaffToMe` (doctor assigns staff)
- [ ] Add procedure `auth.unassignStaffFromMe` (doctor removes staff)
- [ ] Add procedure `auth.listMyAssignedStaff` (doctor views assigned staff)
- [ ] Add procedure `auth.listAssignableStaff` (list all active staff)
- [ ] Test: doctor can assign/unassign staff

**Expected Output**: Staff assignment relationship persists and queries work

---

## Phase 3 — Doctor Profile UI Enrichment
**Goal**: Implement all doctor profile sections

- [ ] Add form sections to doctor panel:
  - About Me
  - Credentials
  - Accepted Insurances
  - Working Hours
  - Specialties / Services
  - Address / Branch
  - Experience / Notes
  - AI Context
- [ ] Add staff assignment UI (list + buttons)
- [ ] Test: doctor can save and edit all sections

**Expected Output**: Doctor panel is functional for profile management

---

## Phase 4 — Doctor Context in Appointments
**Goal**: Make appointment system doctor-aware, enforce permission rules

- [ ] Add `doctorUserId` to Appointment schema (if not present)
- [ ] Update `appointment.list` to filter by doctor context
- [ ] Enforce: staff can only manage appointments for assigned doctors
- [ ] Enforce: patient cancellation 24h rule at backend
- [ ] Add doctor selector in patient booking UI
- [ ] Test: staff can switch doctors and see correct appointments

**Expected Output**: Appointment filtering by doctor works, permission checks pass

---

## Phase 5 — AI Doctor-Specific Orchestration
**Goal**: Make AI chat use doctor profile as context

- [ ] Ensure `AIProviderSetting` model exists
- [ ] Update AI router to fetch doctor profile context
- [ ] Pass doctor context into AI message handler
- [ ] Test: AI response uses doctor profile info

**Expected Output**: AI chat receives doctor context in prompts

---

## Phase 6 — AI 5-Question Limit Per Patient Per Doctor
**Goal**: Enforce quota per patient per doctor

- [ ] Add usage tracking logic in AI message handler
- [ ] Check quota before allowing message
- [ ] Return quota exceeded error when limit hit
- [ ] Display remaining quota in patient UI
- [ ] Test: quota enforces correctly

**Expected Output**: Patient limited to 5 questions per doctor, quota visible

---

## Post-Implementation
- [ ] Full typecheck pass
- [ ] Manual smoke test: doctor, staff, patient flows
- [ ] Migration to production-like environment
