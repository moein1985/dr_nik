# AI CHAT REDESIGN SPECIFICATION

**Version**: 1.0  
**Date**: 1405/03/29  
**Status**: Implementation Ready

---

## 1. Objective

### Problem Statement
The current AI chat system is a **demo/stub** that:
- Has no real LLM integration (or placeholder only)
- Lacks message persistence (session storage)
- Has no chat history or conversation memory
- Has no rate limiting or quota enforcement
- Has no prompt engineering or system context
- Has no doctor/provider context injection
- Has no transition path from chat → appointment booking
- Has no safety/moderation guardrails

### Why Current Implementation Is Insufficient

A production-ready clinic AI chat must:
- ✅ Connect to real LLM provider (AvalAI + Gemini 2.5 Flash)
- ✅ Persist chat sessions + messages
- ✅ Enforce per-patient, per-doctor quota (5 questions)
- ✅ Inject doctor profile context (specialties, credentials, hours, insurances, location)
- ✅ Support multi-language prompts (Persian, English, Arabic)
- ✅ Handle conversation history
- ✅ Enable seamless handoff to appointment booking
- ✅ Log interactions for audit
- ✅ Gracefully handle provider failures

---

## 2. Goals

✅ Real LLM integration (AvalAI endpoint with Gemini 2.5 Flash)  
✅ Chat session persistence (per patient, per doctor)  
✅ Message history storage + retrieval  
✅ 5-question per-patient-per-doctor quota enforcement  
✅ Doctor profile context in system prompt  
✅ Conversation memory (messages loaded + displayed)  
✅ Chat UI with timestamps + role-based styling  
✅ Smooth transition from chat → appointment booking  
✅ Error handling + provider fallback  
✅ Multilingual support (fa, en, ar)  
✅ Security: rate limiting, input validation, output sanitization  

---

## 3. Non-Goals

❌ Medical diagnosis or medical advice (for consultation notes only)  
❌ Complex NLP intent detection (simple message echo + LLM response)  
❌ Voice/audio chat (text-only for Phase 1)  
❌ Real-time multiplayer chat  
❌ Chat history export (PDF, email)  
❌ Advanced prompt tuning system  
❌ Chatbot personality customization per clinic  
❌ Integration with external CRM or ticketing systems  

---

## 4. Current System Summary

### Entry Points

| Component | Path | Purpose |
|-----------|------|---------|
| Chat Widget | `src/components/chat-lead-widget.tsx` | Public consultation form |
| Patient Dashboard | `src/components/patient-dashboard-panel.tsx` | Chat with AI section |
| Consultation Lead | `src/app/api/consultation-lead/route.ts` | Lead capture endpoint |
| AI Router | `src/server/api/routers/ai.ts` | Core chat API |

### Current AI Implementation Status

**✅ Already Implemented:**
- ChatSession + ChatMessage Prisma models
- getOrCreateChatSession logic
- getQuotaUsage (5-question enforcement)
- recordChatMessage (message persistence)
- buildSystemPrompt with doctor context injection
- createMessage mutation with AvalAI integration
- getChatHistory query
- Chat history display in patient dashboard

**❌ Remaining:**
- Real provider connection test
- Rate limiting middleware
- Error fallback responses
- Input validation + sanitization
- Audit logging
- Multilingual error messages

---

## 5. Target User Flows

### 5.1 Patient AI Chat with Doctor Context

**Flow:**
```
1. Patient logs in → patient dashboard
2. Select doctor from dropdown
3. Chat history loads (if any)
4. Patient types question
5. System validates: quota > 0?
6. Call AvalAI with doctor context
7. Response arrives with "Dr. [name]:" prefix
8. Message stored in ChatMessage
9. Quota display updates: "N-1 سؤال باقی‌مانده"
10. After 5 messages: form disabled, show booking transition
```

**Key Features:**
- Doctor profile in system prompt (specialties, credentials, hours, insurances, location, experience)
- Quota counter: "3 سؤال باقی‌مانده" or "خلاص شدید"
- Chat history with timestamps
- Smooth transition to booking

---

## 6. Proposed Domain Model

### 6.1 Existing Models (Already Added)

#### `ChatSession`
```prisma
model ChatSession {
  id: String @id @default(cuid())
  patientUserId: String
  doctorUserId: String
  status: String @default("active")
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  messages: ChatMessage[]
  
  @@unique([patientUserId, doctorUserId])
}
```

#### `ChatMessage`
```prisma
model ChatMessage {
  id: String @id @default(cuid())
  sessionId: String
  role: String              // "user" or "assistant"
  content: String
  createdAt: DateTime @default(now())
  
  session: ChatSession @relation(...)
  
  @@index([sessionId])
  @@index([createdAt])
}
```

#### `AiProviderSetting` (Super-admin managed)
```prisma
model AiProviderSetting {
  id: String
  provider: String          // "aval-ai"
  model: String             // "gemini-2.5-flash"
  apiKey: String            // encrypted
  baseUrl: String
  isEnabled: Boolean
}
```

---

## 7. Backend Implementation

### 7.1 Already Implemented ✅

#### `createMessage` (Mutation)
```typescript
input: {
  text: string
  imageUrl?: string
  doctorUserId: string
}
output: {
  reply: string
  queueStatus: string
  quotaRemaining: number
}
```

**Logic Already Done:**
- ✅ readAiSettings() → fetch provider config
- ✅ readDoctorProfile(doctorUserId) → get doctor context
- ✅ buildSystemPrompt() → inject context into system message
- ✅ getOrCreateChatSession() → ensure one per patient-doctor
- ✅ getQuotaUsage() → count user-role messages, check < 5
- ✅ Call AvalAI with full message history
- ✅ recordChatMessage() → save user + assistant messages
- ✅ Return quotaRemaining

#### `getChatHistory` (Query)
```typescript
input: { doctorUserId: string }
output: Array<{ id, role, content, createdAt }>
```

**Logic Already Done:**
- ✅ Find ChatSession for (patientId, doctorId)
- ✅ Fetch messages ordered chronologically
- ✅ Return with timestamps

### 7.2 Remaining Work

#### Rate Limiting
```typescript
const limiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 5,
  keyGenerator: (ctx) => ctx.userId
});
```

#### Error Handling
```typescript
const fallbackResponses = {
  fa: "متأسفانه سرویس موقتاً دسترسی‌پذیر نیست.",
  en: "Service temporarily unavailable.",
  ar: "الخدمة غير متاحة حاليًا."
};
```

#### Input Validation
```typescript
// Sanitize user input before sending to LLM
// Max 500 chars, no injections
```

---

## 8. Frontend Implementation

### 8.1 Already Implemented ✅

**In `patient-dashboard-panel.tsx`:**
- ✅ `selectedDoctorId` state
- ✅ `doctors` array (from listActiveDoctors query)
- ✅ `chatHistory` state with typed messages
- ✅ `aiQuotaRemaining` state (0-5)
- ✅ `loadChatHistory()` function
- ✅ `useEffect` to load history when doctor changes
- ✅ Chat history rendering loop with:
  - ✅ Role-based styling (user = cyan right, assistant = gray left)
  - ✅ Timestamps with Persian locale
  - ✅ Line-clamped content

### 8.2 Remaining Work

#### Doctor Selector with Label
**Status**: ✅ FIXED (added aria-label + title)

#### Quota Counter Enhancement
```tsx
{aiQuotaRemaining > 0 ? (
  <p>{aiQuotaRemaining} سؤال باقی‌مانده</p>
) : (
  <div>
    <p>خلاص شدید!</p>
    <button onClick={() => router.push('/booking')}>
      برای نوبت رزرو کنید
    </button>
  </div>
)}
```

#### Better Loading State
```tsx
{aiLoading && (
  <div className="flex items-center gap-2">
    <Spinner />
    <p>جاری... دکتر فکر می‌کند</p>
  </div>
)}
```

#### Error Display
```tsx
{aiError && (
  <Alert variant="error">
    {aiError}
  </Alert>
)}
```

---

## 9. File-Level Implementation Plan

### Already Modified ✅

| File | Status |
|------|--------|
| `src/server/api/routers/ai.ts` | ✅ Complete |
| `prisma/schema.prisma` | ✅ ChatSession + ChatMessage |
| `src/components/patient-dashboard-panel.tsx` | ✅ Chat history + UI |

### To Modify

| File | Changes |
|------|---------|
| `src/components/patient-dashboard-panel.tsx` | Add error state, better loading UI |
| `src/server/api/routers/ai.ts` | Add rate limiting, error fallback |
| `src/i18n/messages/*.ts` | AI chat labels (already there mostly) |

---

## 10. AI Provider Integration

### AvalAI Connection

```
Provider: AvalAI (OpenAI-compatible)
Model: gemini-2.5-flash
Endpoint: https://api.aval-ai.com/v1/chat/completions
Auth: Bearer token
```

### System Prompt Injection

**Example for Doctor [نام]:**
```
تو دستیار مشاورهٔ کلینیک است. شما با بیمار از طرف دکتر نام صحبت می‌کنید.

تخصص: پوست و زیبایی
مدارک: دکتری پزشکی، تخصص پوست
تجربه: 10 سال
ساعات کاری: شنبه تا چهارشنبه، 9 صبح تا 6 عصر
بیمه: تمام بیمه‌های معتبر
آدرس: تهران، میدان انقلاب

سؤالات را به فارسی و مفید پاسخ دهید.
اگر خارج از دستاورد است، دکتر بپرسید.
```

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| LLM hallucination / misinformation | Add disclaimer + escalation button |
| API rate limit abuse | Server-side throttling (1 msg/10 sec) |
| Quota enforcement bypass | Check server-side, never trust client |
| Provider downtime | Fallback responses + retry logic |
| Privacy leaks | Messages encrypted, audit logs secured |

---

## 12. Phased Delivery

### Phase 1: Validation ✅ (Already done)
- ✅ Models created
- ✅ Quota logic working
- ✅ Doctor context injected
- ✅ Chat history persisted

### Phase 2: Polish (1 day)
- Better error states
- Rate limiting middleware
- Audit logging
- Input sanitization

### Phase 3: Testing (1 day)
- Smoke tests (doctor → chat → quota → booking)
- Edge cases (quota exhausted, provider down)
- Multilingual tests

### Phase 4: Monitoring (ongoing)
- Track API costs
- Monitor response times
- Alert on failures

---

## 13. Acceptance Criteria

- [ ] Chat persists across browser refresh
- [ ] Quota enforced strictly (5 per patient per doctor)
- [ ] Doctor context visible in responses
- [ ] History loads instantly when doctor selected
- [ ] Rate limiting prevents abuse
- [ ] Provider errors handled gracefully
- [ ] Transition to booking works
- [ ] All labels in fa/en/ar

---

**Status**: 80% Complete — Core implementation done, remaining: polish + testing  
**Last Updated**: 1405/03/29
