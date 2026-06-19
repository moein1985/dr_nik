# APPOINTMENT REDESIGN SPECIFICATION

**Version**: 2.0  
**Date**: 1405/03/29  
**Status**: Implementation Ready

---

## 1. Objective

### Problem Statement
The current appointment booking system supports basic CRUD operations but lacks:
- **Real-time availability checking** — patients book any arbitrary time without verifying doctor availability
- **Doctor schedule enforcement** — no working hours, off-days, or service durations
- **Conflict prevention** — duplicate/overlapping appointments possible
- **Clinic-realistic modeling** — no service catalog, buffer times, or status workflow

### Why Current Implementation Is Insufficient
For a beauty clinic:
- Prevents doctor overbooking ❌
- Displays only available slots ❌
- Enforces business rules ❌
- Provides conflict alerts ❌
- Enables automated reminders ❌

---

## 2. Goals

✅ Implement `DoctorSchedule` (working hours, off-days)  
✅ Implement `Service` (catalog with duration, buffer)  
✅ Generate real-time available time slots  
✅ Prevent appointment conflicts via constraints + logic  
✅ Enhance patient booking UI (calendar + slot picker)  
✅ Enhance staff dashboard (conflict detection)  
✅ Support rescheduling/cancellation with slot release  
✅ Implement appointment status workflow  
✅ Optional: appointment reminders + handoff from AI chat  

---

## 3. Non-Goals

❌ Payment/billing (Phase 2+)  
❌ Multi-location branches (assume single location)  
❌ Recurring series (handle one-off bookings)  
❌ Automatic SMS/email (manual setup only)  
❌ Calendar sync (Google, Outlook)  
❌ Overbooking tolerance / waiting lists  

---

## 4. Current System Summary

### Entry Points

| Component | Path | Purpose |
|-----------|------|---------|
| Booking Page | `src/app/[locale]/booking/page.tsx` | Public patient form |
| Patient Dashboard | `src/components/patient-dashboard-panel.tsx` | Appointments + creation |
| Staff Dashboard | `src/components/staff-dashboard-panel.tsx` | Calendar + management |
| Weekly Calendar | `src/components/weekly-calendar.tsx` | Shared view |
| Appointment Router | `src/server/api/routers/appointment.ts` | Core API |

### Current Appointment Model
```prisma
model Appointment {
  id: String
  patientName: String
  patientPhone: String
  serviceName: String              // ❌ free text
  doctorName: String               // ❌ free text
  requestedAt: DateTime            // ❌ unconstrained
  notes: String?
  status: AppointmentStatus
}
```

### Limitations
❌ `requestedAt` unconstrained (past dates, non-working hours)  
❌ No `Service` entity (free text)  
❌ No `DoctorSchedule` (no working hours enforcement)  
❌ No conflict detection  
❌ No appointment duration model  
❌ No status workflow  

---

## 5. Target User Flows

### 5.1 Patient Self-Booking

**Future Flow:**
```
1. Select Service (dropdown) → shows doctors offering it
2. Select Doctor (dropdown) → shows calendar
3. Select Date (calendar) → shows available time slots
4. Select Time Slot (slot picker) → confirms booking
5. Success page → confirmation email sent
```

**Key Changes:**
- `requestedAt` → **exact time** from available slots
- UI shows **availability calendar** + **slot picker**
- Backend validates slot before booking

### 5.2 Patient Rescheduling

**Flow:**
```
1. View appointments in dashboard
2. Click "Reschedule" → new slot picker shown
3. Select new slot
4. System moves appointment, frees old slot
5. Confirmation email sent
```

### 5.3 Staff Booking Management

**Flow:**
```
1. View assigned doctors' calendar
2. Create appointment → slot picker enforced
3. Edit appointment → must select available slot
4. See conflicts → red highlights
5. Mark completed / cancel with reason
```

---

## 6. Proposed Domain Model

### 6.1 New Entities

#### `Service`
```prisma
model Service {
  id: String @id @default(cuid())
  nameEn: String
  nameFa: String
  nameAr: String
  description: String?
  durationMinutes: Int              // e.g., 30, 45, 60
  bufferMinutesAfter: Int?          // e.g., 15 (prep time)
  isActive: Boolean @default(true)
  createdAt: DateTime @default(now())
  
  appointments: Appointment[]
}
```

#### `DoctorSchedule` (weekly repeating pattern)
```prisma
model DoctorSchedule {
  id: String @id @default(cuid())
  doctorUserId: String
  dayOfWeek: Int                    // 0=Sunday, ..., 6=Saturday
  startTimeHHMM: String             // "08:00"
  endTimeHHMM: String               // "17:00"
  isWorkingDay: Boolean @default(true)
  maxAppointmentsPerDay: Int?
  
  @@unique([doctorUserId, dayOfWeek])
}
```

#### `AppointmentBlockedTime` (off-days, lunch breaks)
```prisma
model AppointmentBlockedTime {
  id: String @id @default(cuid())
  doctorUserId: String
  blockedFrom: DateTime
  blockedTo: DateTime
  reason: String?                   // "Lunch", "Holiday"
  isAllDay: Boolean @default(false)
  
  @@index([doctorUserId, blockedFrom])
}
```

#### `AppointmentStatusLog` (audit trail)
```prisma
model AppointmentStatusLog {
  id: String @id @default(cuid())
  appointmentId: String
  oldStatus: AppointmentStatus
  newStatus: AppointmentStatus
  changedBy: String
  reason: String?
  createdAt: DateTime @default(now())
}
```

### 6.2 Enhanced `Appointment`

```prisma
model Appointment {
  // NEW: structured references
  doctorUserId: String              // replaces doctorName
  serviceId: String                 // replaces serviceName
  appointmentDateTime: DateTime     // replaces requestedAt (exact time)
  estimatedEndTime: DateTime        // calculated from service duration
  
  // EXISTING + enhanced
  patientUserId: String?
  patientName: String
  patientPhone: String
  status: AppointmentStatus
  
  // NEW: audit & workflow
  statusHistory: AppointmentStatusLog[]
  notes: String?
  internalNotes: String?
  
  // EXISTING
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  // Relations
  doctor: User @relation(fields: [doctorUserId], references: [id])
  service: Service @relation(fields: [serviceId], references: [id])
  
  // CONSTRAINT: prevent overlaps
  @@unique([doctorUserId, appointmentDateTime])
  @@index([appointmentDateTime])
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

---

## 7. Database Changes

### 7.1 New Models
✅ `Service`  
✅ `DoctorSchedule`  
✅ `AppointmentBlockedTime`  
✅ `AppointmentStatusLog`  

### 7.2 Appointment Migration
**Old:**
```prisma
doctorName: String              // free text
serviceName: String             // free text
requestedAt: DateTime           // unconstrained
```

**New:**
```prisma
doctorUserId: String            // FK to User
serviceId: String               // FK to Service
appointmentDateTime: DateTime   // exact time
estimatedEndTime: DateTime      // calculated
```

### 7.3 Conflict Prevention
```sql
ALTER TABLE "Appointment" ADD CONSTRAINT "unique_doctor_time"
UNIQUE ("doctorUserId", "appointmentDateTime");
```

---

## 8. Backend Changes

### 8.1 New tRPC Queries

#### `getAvailableSlots`
```typescript
input: {
  doctorUserId: string
  serviceId: string
  desiredDate: Date
}
output: TimeSlot[] // [{startTime, endTime}, ...]
```
**Logic:**
- Read `DoctorSchedule` for that day
- Read existing `Appointment`s + `AppointmentBlockedTime`
- Generate 30-min slots, exclude booked + buffer + blocked
- Return available slots

#### `getAvailableDates`
```typescript
input: {
  doctorUserId: string
  serviceId: string
  fromDate: Date
  toDate: Date
}
output: DateAvailability[]
```

### 8.2 New tRPC Mutations

#### `createAppointmentWithSlot`
```typescript
input: {
  doctorUserId: string
  serviceId: string
  appointmentDateTime: DateTime  // must be valid slot
  patientName: string
  patientPhone: string
  notes?: string
}
output: Appointment
```
**Validation:**
- Verify slot is available
- Prevent concurrent double-booking
- Create appointment

#### `rescheduleAppointment`
```typescript
input: {
  appointmentId: string
  newAppointmentDateTime: DateTime
}
output: Appointment
```

#### `updateAppointmentStatus`
```typescript
input: {
  appointmentId: string
  newStatus: AppointmentStatus
  reason?: string
}
output: Appointment & statusLog
```

### 8.3 New Services

#### `AppointmentAvailabilityService`
```typescript
getSlots(doctorId, serviceId, date)
getAvailableDates(doctorId, serviceId, range)
isSlotAvailable(doctorId, dateTime)
```

#### `DoctorScheduleService`
```typescript
getSchedule(doctorId, date)
setWeeklySchedule(doctorId, schedules)
blockTime(doctorId, from, to, reason)
```

---

## 9. Frontend Changes

### 9.1 Patient Booking (`/[locale]/booking`)

**Current:**
```
Service Name (free text)
Doctor Name (free text)
Date/Time (free text)
Submit
```

**Target:**
```
Service Dropdown
↓
Doctor Dropdown
↓
Availability Calendar
↓
Time Slot Picker
↓
Confirm
```

### 9.2 New Components

#### `AvailabilityCalendar`
Shows dates with available slots

#### `TimeSlotPicker`
Shows time slots for selected date

#### `AppointmentCard`
Shows appointment with reschedule/cancel actions

### 9.3 Error States

| State | Message |
|-------|---------|
| No slots available | "متاسفانه برای این روز فرصت آزادی وجود ندارد" |
| Slot already booked | "این فرصت حالا رزرو شده است" |
| Past date | (disabled) |

---

## 10. File-Level Implementation Plan

### Files to Create

| File | Purpose |
|------|---------|
| `prisma/migrations/*_add_appointments_v2.sql` | Schema migration |
| `src/server/modules/appointment/domain/availability.service.ts` | Slot logic |
| `src/server/modules/appointment/infrastructure/doctor-schedule.repository.ts` | Schedule queries |
| `src/components/availability-calendar.tsx` | Calendar UI |
| `src/components/time-slot-picker.tsx` | Slot picker UI |

### Files to Modify

| File | Changes | Impact |
|------|---------|--------|
| `prisma/schema.prisma` | Add 4 new models, enhance Appointment | 🔴 High |
| `src/server/api/routers/appointment.ts` | Add availability queries + slot mutations | 🔴 High |
| `src/app/[locale]/booking/page.tsx` | Replace free-text with calendar/picker | 🔴 High |
| `src/components/patient-dashboard-panel.tsx` | Add reschedule UI | 🟡 Medium |
| `src/components/staff-dashboard-panel.tsx` | Add conflict alerts | 🟡 Medium |

---

## 11. Risks and Open Questions

### Risks

| Risk | Mitigation |
|------|-----------|
| Concurrent double-booking | DB unique constraint + atomic transaction |
| Timezone handling | Always UTC in DB, display in Asia/Tehran |
| Schedule becomes hard to manage | Admin UI for batch setup |
| Service restrictions per doctor | Add many-to-many if needed |

### Questions

1. **Can every doctor perform every service?**
   - Needs: `DoctorService` join table?

2. **Service duration: per service or per doctor?**
   - Default: per service

3. **Buffer time: per service or global?**
   - Default: per service

4. **Can staff override availability?**
   - Yes, optional flag for emergencies

---

## 12. Phased Delivery

### Phase 1: Foundation (3-4 days)
- Add `Service`, `DoctorSchedule`, `AppointmentBlockedTime` models
- Implement `AppointmentAvailabilityService`
- Write `getAvailableSlots` query
- Integration tests

### Phase 2: Patient UX (2-3 days)
- Build `AvailabilityCalendar` + `TimeSlotPicker`
- Update booking page
- Update patient dashboard (reschedule)
- E2E tests

### Phase 3: Staff Enhancements (1-2 days)
- Show availability in staff dashboard
- Add conflict alerts
- Staff-side slot booking

### Phase 4: Polish (1-2 days)
- Smoke tests
- Edge case handling
- i18n

---

## 13. Acceptance Criteria

### Slot Availability
- [ ] Patient sees only dates with available slots
- [ ] Patient sees only times doctor is working
- [ ] Patient cannot book already-booked time
- [ ] Patient cannot book in past
- [ ] Service duration prevents overlap with next appointment

### Schedule Management
- [ ] Admin can set weekly working hours
- [ ] Admin can block one-off times
- [ ] Blocked times respected in slot generation

### Conflict Prevention
- [ ] DB constraint prevents double-booking
- [ ] Staff sees conflict alerts

### Rescheduling/Cancellation
- [ ] Patient can reschedule to new slot
- [ ] Old slot freed after reschedule
- [ ] Confirmation emails sent

---

**Status**: Ready for Implementation  
**Last Updated**: 1405/03/29
