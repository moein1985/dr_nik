# Manual Testing Checklist

این چک‌لیست برای تست دستی critical flows در پروژه dr_nik_clinic طراحی شده است.

---

## Authentication Flow

### Login
- [ ] Login با phone number صحیح
- [ ] Login با phone number نادرست
- [ ] Login با username صحیح
- [ ] Login با username نادرست
- [ ] Login با OTP code صحیح
- [ ] Login با OTP code نادرست
- [ ] Login با expired OTP
- [ ] Login بعد از 5 بار تلاش ناموفق (lockout)
- [ ] Logout و redirect به صفحه home

### Password Reset
- [ ] درخواست reset با phone number معتبر
- [ ] درخواست reset با phone name نامعتبر
- [ ] وارد کردن OTP code صحیح
- [ ] وارد کردن OTP code نادرست
- [ ] تغییر password با minimum length
- [ ] تغییر password با weak password
- [ ] تغییر password موفق

---

## Appointment Booking Flow

### Create Appointment
- [ ] انتخاب doctor از لیست
- [ ] انتخاب date در past (باید fail شود)
- [ ] انتخاب date در future
- [ ] انتخاب time slot موجود
- [ ] انتخاب time slot ناموجود
- [ ] وارد کردن patient name
- [ ] وارد کردن patient phone number
- [ ] انتخاب service
- [ ] اضافه کردن notes (اختیاری)
- [ ] submit موفق
- [ ] verify appointment در dashboard

### Update Appointment (Staff)
- [ ] مشاهده لیست appointments
- [ ] تغییر status به CONFIRMED
- [ ] تغییر status به CANCELLED
- [ ] assign به doctor
- [ ] unassign از doctor
- [ ] edit patient information
- [ ] edit notes

### Cancel Appointment
- [ ] cancel توسط patient
- [ ] cancel توسط staff
- [ ] verify status در dashboard
- [ ] verify audit log

---

## Doctor Dashboard

### Availability Management
- [ ] افزودن availability slot جدید
- [ ] edit availability slot موجود
- [ ] delete availability slot
- [ ] set inactive برای slot
- [ ] verify slot در booking page

### Service Management
- [ ] افزودن service جدید
- [ ] edit service موجود
- [ ] delete service
- [ ] set inactive برای service

### Staff Assignment
- [ ] assign staff به doctor
- [ ] unassign staff از doctor
- [ ] view assigned staff list

---

## AI Chat Flow

### Start Chat
- [ ] start chat با doctor موجود
- [ ] start chat با doctor ناموجود
- [ ] send text message
- [ ] send image message
- [ ] view chat history
- [ ] receive AI response

### Chat Session
- [ ] view active sessions
- [ ] close session
- [ ] archive session
- [ ] reopen archived session

---

## Admin Dashboard

### User Management
- [ ] view لیست users
- [ ] filter by role
- [ ] activate user
- [ ] deactivate user
- [ ] change user role
- [ ] view user details

### Audit Log
- [ ] view audit logs
- [ ] filter by action type
- [ ] filter by date range
- [ ] filter by actor
- [ ] view before/after changes

---

## Edge Cases

### Error Handling
- [ ] network error هنگام submit
- [ ] server error (500)
- [ ] timeout error
- [ ] validation error در فرم
- [ ] unauthorized access

### Data Validation
- [ ] empty form submission
- [ ] invalid phone number format
- [ ] invalid email format
- [ ] extremely long text input
- [ ] special characters در input

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (iOS)
- [ ] Mobile (Android)

---

## Performance

### Load Time
- [ ] صفحه home < 2 seconds
- [ ] dashboard < 3 seconds
- [ ] booking page < 2 seconds
- [ ] chat interface < 2 seconds

### Responsiveness
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Security

### Authentication
- [ ] protected routes بدون login
- [ ] session expiration
- [ ] concurrent login از device های مختلف
- [ ] logout از همه devices

### Authorization
- [ ] patient access به admin functions
- [ ] staff access به super admin functions
- [ ] doctor access به other doctor data

### Data Privacy
- [ ] sensitive data در console logs
- [ ] sensitive data در network requests
- [ ] data exposure در error messages
