# Phase 3 - Doctor Panel UI Status

## Implemented
- Added a dedicated doctor panel component with editable profile sections.
- Connected doctor panel to backend APIs:
  - `auth.getMyDoctorProfile`
  - `auth.upsertMyDoctorProfile`
- Updated `/[locale]/admin` page to render doctor profile panel instead of user-management panel.

## Doctor profile sections now available
- about me
- credentials
- accepted insurances
- working hours
- specialties
- services
- address / branch
- experience
- extra notes
- AI assistant context

## Design notes
- `super_admin` user management remains on `/[locale]/super-admin`.
- The doctor panel accepts both `DOCTOR` and legacy `ADMIN` roles during migration.

## Next logical phase
- Add doctor-staff assignment model and APIs.
- Add staff doctor switcher with scoped appointment access by assigned doctor.
