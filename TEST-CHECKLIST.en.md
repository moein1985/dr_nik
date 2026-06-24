# Test Checklist & Bug Report - Dr. Nik Clinic

**Date:** June 23, 2026  
**Version:** v2.0 (Phases 0-5 Implemented)  
**Test Environment:** http://192.168.85.77

---

## 🔐 Login Credentials

### Default Users:
- **Super Admin:** `superadmin` / `SuperAdmin123!`
- **Staff:** `staff` / `Staff123!`
- **Doctor:** `doctor1` / `Doctor123!` (must be created)

---

## ✅ Phase 0 — Baseline

### Test 1: TypeScript & Build
- [ ] Project compiles without TypeScript errors
- [ ] `npm run build` succeeds
- [ ] No console errors in browser

**How to Test:**
```bash
cd C:\Users\Moein\Documents\Codes\dr_nik_clinic
npx tsc --noEmit
```

**Result:** ✅ / ❌  
**Bug (if any):**

---

## ✅ Phase 1 — Fix Redirect Loop

### Test 1: Service Pages
- [ ] `/fa/services/skin-rejuvenation` opens without redirect loop
- [ ] `/fa/services/body-contouring` opens without redirect loop
- [ ] Page content displays correctly

**How to Test:**
1. Open http://192.168.85.77/fa/services/skin-rejuvenation
2. Verify page loads without infinite loop

**Result:** ✅ / ❌  
**Bug (if any):**

---

## ✅ Phase 2 — RBAC (Super Admin Read-Only)

### Test 1: Super Admin Access
- [ ] Login with `superadmin` succeeds
- [ ] "Appointments Overview" section visible in super admin panel
- [ ] "Read-only" badge displayed
- [ ] Appointments list shown (if any exist)
- [ ] No "Create Appointment" button
- [ ] No "Edit" buttons for appointments
- [ ] No "Delete" buttons for appointments

**How to Test:**
1. Open http://192.168.85.77
2. Login with `superadmin` / `SuperAdmin123!`
3. Navigate to super admin panel
4. Check appointments section

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 2: Staff Access
- [ ] Login with `staff` succeeds
- [ ] "Create Appointment" button visible in staff panel
- [ ] Can create new appointment
- [ ] Can edit existing appointment
- [ ] Can delete existing appointment

**Result:** ✅ / ❌  
**Bug (if any):**

---

## ✅ Phase 3 — Testimonials Image Slider

### Test 1: Slider Display
- [ ] "Testimonials" section visible on homepage
- [ ] Patient1 image displays in slider
- [ ] Patient2 image displays in slider
- [ ] Each slide contains image + quote text
- [ ] Slider auto-advances (~4 seconds)
- [ ] Previous/Next buttons work
- [ ] Navigation dots work
- [ ] Images load without 404 errors

**How to Test:**
1. Open http://192.168.85.77
2. Scroll to testimonials section
3. Wait for auto-advance
4. Click navigation buttons

**Result:** ✅ / ❌  
**Bug (if any):**

---

## ✅ Phase 4 — Doctor Scheduling Engine

### Prerequisite: Create Doctor User
- [ ] Login with `superadmin`
- [ ] Navigate to super admin panel → "Create New User"
- [ ] Create user with:
  - Username: `doctor1`
  - Password: `Doctor123!`
  - Role: `DOCTOR`
- [ ] User created successfully

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 1: Availability Management UI
- [ ] Logout and login with `doctor1` / `Doctor123!`
- [ ] "Working Hours Schedule" section visible at top of doctor panel
- [ ] "Add Time Slot" button works
- [ ] Can select weekday (dropdown)
- [ ] Can set start time (input type="time")
- [ ] Can set end time (input type="time")
- [ ] Can toggle active/inactive (checkbox)
- [ ] "Remove" button works for each slot
- [ ] "Save Schedule" button works
- [ ] Success message displayed

**How to Test:**
1. Login with `doctor1`
2. Navigate to doctor panel
3. Click "Add Time Slot"
4. Configure:
   - Day: **Wednesday**
   - From: **08:00**
   - To: **14:00**
   - Active: ✅
5. Click "Save Schedule"

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 2: Server Validation (Success - Within Range)
- [ ] Logout and login with `staff`
- [ ] Navigate to staff panel → Create appointment
- [ ] Select `doctor1` as doctor
- [ ] Select date: **Next Wednesday**
- [ ] Select time: **10:00** (within 08:00-14:00 range)
- [ ] Appointment created successfully
- [ ] No error displayed

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 3: Server Validation (Fail - Outside Range)
- [ ] Try to create another appointment
- [ ] Select `doctor1`
- [ ] Select date: **Next Wednesday**
- [ ] Select time: **15:00** (outside 08:00-14:00 range)
- [ ] Error message "outside the doctor's working hours" displayed
- [ ] Appointment not created

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 4: Validation for Inactive Day
- [ ] Try to create appointment on **Sunday** (no slot defined)
- [ ] Select `doctor1`
- [ ] Select any time
- [ ] Error displayed
- [ ] Appointment not created

**Result:** ✅ / ❌  
**Bug (if any):**

---

## ✅ Phase 5 — Doctor-Specific Services

### Test 1: Services Management UI
- [ ] Login with `superadmin`
- [ ] "Doctor Services Management" section visible in super admin panel
- [ ] Doctor selection dropdown works
- [ ] `doctor1` appears in dropdown
- [ ] After selecting doctor, 8 services displayed:
  - [ ] Consultation
  - [ ] Botox
  - [ ] Filler
  - [ ] Laser Treatment
  - [ ] Skin Care
  - [ ] Hair Removal
  - [ ] Facial Treatment
  - [ ] Body Contouring
- [ ] Each service has a checkbox
- [ ] "Save Services" button works

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 2: Service Assignment
- [ ] Check "Botox" checkbox
- [ ] Check "Filler" checkbox
- [ ] Click "Save Services"
- [ ] Success message displayed
- [ ] After page refresh, selected services remain checked

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 3: Service Restriction in Appointment Form (Optional)
**Note:** This feature is not yet implemented. All services are expected to show.

- [ ] In appointment form, all services are displayed (current behavior)
- [ ] (Future) Only assigned services should be displayed for selected doctor

**Result:** ✅ / ❌  
**Notes:**

---

## 🔍 General Tests

### Test 1: Internationalization (i18n)
- [ ] Switch to Persian works
- [ ] Switch to English works
- [ ] Switch to Arabic works
- [ ] All texts properly translated
- [ ] No untranslated keys (like `auth.login`) displayed

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 2: Responsive Design
- [ ] Site displays correctly on mobile
- [ ] Site displays correctly on tablet
- [ ] Site displays correctly on desktop
- [ ] Menus and buttons are clickable

**Result:** ✅ / ❌  
**Bug (if any):**

### Test 3: Performance
- [ ] Homepage loads in under 3 seconds
- [ ] No console errors in browser
- [ ] Images load correctly
- [ ] Animations are smooth

**Result:** ✅ / ❌  
**Bug (if any):**

---

## 📝 Bug Report Format

For each bug found, please record:

```
### Bug #[Number]

**Title:** [Brief description]

**Phase:** [Phase number - e.g., Phase 4]

**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Minor

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Actual Result:**
[What happened]

**Expected Result:**
[What should have happened]

**Screenshot:**
[If available]

**Console Error:**
[If any]

**Environment:**
- Browser: [Chrome / Firefox / Safari / ...]
- Browser Version: [...]
- OS: [Windows / Mac / Linux / ...]
```

---

## 📊 Summary

**Test Date:** ___________  
**Tester:** ___________

| Phase | Total Tests | Pass | Fail | Success Rate |
|-------|-------------|------|------|--------------|
| Phase 0 | 1 | ___ | ___ | ___% |
| Phase 1 | 1 | ___ | ___ | ___% |
| Phase 2 | 2 | ___ | ___ | ___% |
| Phase 3 | 1 | ___ | ___ | ___% |
| Phase 4 | 4 | ___ | ___ | ___% |
| Phase 5 | 3 | ___ | ___ | ___% |
| General | 3 | ___ | ___ | ___% |
| **Total** | **15** | ___ | ___ | ___% |

**Total Bugs:** ___  
**Critical Bugs:** ___  
**Medium Bugs:** ___  
**Minor Bugs:** ___

---

## 📞 Contact

For questions or clarifications, contact the development team.

**Important:** Please report all bugs with complete details for faster resolution.
