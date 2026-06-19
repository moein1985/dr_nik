# Phase 2 - Doctor Profile Status

## Implemented
- Added `DOCTOR` to user role enum in Prisma schema.
- Added `DoctorProfile` model and one-to-one relation with `User`.
- Added backend module for doctor profile with:
  - domain entity
  - repository interface
  - Prisma repository
  - get-my profile use-case
  - upsert-my profile use-case
- Wired doctor profile services in service container.
- Added doctor-scoped API procedures in auth router:
  - `getMyDoctorProfile`
  - `upsertMyDoctorProfile`
- Added `doctorProcedure` role guard in tRPC.
- Updated doctor account creation path to use `DOCTOR` role (instead of `ADMIN`) for new doctor users.
- Updated default bootstrap admin account role to `DOCTOR`.
- Updated role selector in admin dashboard to prefer `DOCTOR` with legacy `ADMIN` option.

## Not included in this phase
- No doctor profile UI form yet.
- No staff assignment model yet.
- No AI orchestration integration yet.

## Next recommended phase
- Build doctor profile form UI sections in doctor panel:
  - about me
  - credentials
  - accepted insurances
  - working hours
  - specialties / services
  - branch / address / experience / notes
- Connect the form to:
  - `auth.getMyDoctorProfile`
  - `auth.upsertMyDoctorProfile`
