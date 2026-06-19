# Booking + Doctor AI Roadmap Status

## Phase 1 (in progress)
- Align role semantics: admin => doctor (compatibility mode)
- Keep super_admin role active
- Enforce patient cancellation rule: 24h before appointment start

### Completed in this step
- Added backend cancellation guard for 24-hour window
- Updated role guard procedures to accept DOCTOR (while still supporting ADMIN)
- Updated appointment staff notification recipient role filter to include DOCTOR
- Updated auth and dashboard role handling to support DOCTOR compatibility
- Updated EN/FA/AR UI wording from "Admin" creation language to "Doctor" creation language

## Next Phase 2
- Add DoctorProfile data model
- Add doctor profile panel sections:
  - about me
  - credentials
  - accepted insurances
  - working hours
  - specialties/services
  - address/branch/experience/notes

## Next Phase 3
- Add doctor-staff many-to-many assignment
- Staff doctor switcher and permission-scoped appointment management

## Next Phase 4
- AI settings in super_admin panel (AvalAI + Gemini 2.5 Flash)
- Doctor-specific AI context orchestration from DoctorProfile
- Patient quota: 5 questions per doctor

## Next Phase 5
- AI-to-booking handoff
- Staff escalation and booking CTA integration
