# Shaivika IT Technologies - Enterprise API & Security Architecture Documentation

## Overview
This document specifies the secure API architecture, authentication endpoints, public ingestion services, and Google Apps Script mediation layer for **Shaivika IT Technologies**.

---

## 1. Authentication Service (`/api/admin-auth` -> `netlify/functions/admin-auth.js`)

Provides cryptographically secure administrator authentication, password management, and HMAC-SHA256 session token management.

- **URL**: `/.netlify/functions/admin-auth` (or `/api/admin-auth`)
- **Transport**: HTTPS Only
- **Rate Limiting**: Anti-brute-force IP lockout (max 5 consecutive failed attempts; 15-minute lock window).

### 1.1 Action: Admin Login (`action: "login"`)
- **Method**: `POST`
- **Request Headers**: `Content-Type: application/json`
- **Request Payload**:
```json
{
  "action": "login",
  "username": "shaivika_admin",
  "password": "SecureAdminPassword123!"
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzaGFpdmlrYV9hZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4ODY4MDAwMCwiZXhwIjoxNzg4NzA4ODAwLCJqdGkiOiJmMWU4NzJjYWY4OWEifQ.signature",
  "user": {
    "username": "shaivika_admin",
    "role": "admin"
  },
  "expiresAt": 1788708800000
}
```
- **Error Responses**:
  - `401 Unauthorized` (`INVALID_CREDENTIALS`):
    ```json
    { "status": "error", "code": "INVALID_CREDENTIALS", "message": "Invalid credentials.", "attemptsRemaining": 4 }
    ```
  - `429 Too Many Requests` (`ACCOUNT_LOCKED`):
    ```json
    { "status": "error", "code": "ACCOUNT_LOCKED", "message": "Account locked due to consecutive failed attempts. Please retry in 890 seconds." }
    ```

### 1.2 Action: Verify Token (`action: "verify"`)
- **Method**: `POST`
- **Request Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Payload**: `{ "action": "verify" }`
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "valid": true,
  "user": { "username": "shaivika_admin", "role": "admin" },
  "expiresAt": 1788708800000
}
```
- **Error Response (401 Unauthorized)**:
```json
{ "status": "error", "code": "UNAUTHORIZED", "message": "Invalid or expired session token" }
```

### 1.3 Action: Admin Logout (`action: "logout"`)
- **Method**: `POST`
- **Request Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{ "status": "success", "message": "Session logged out successfully" }
```

### 1.4 Action: Change Password (`action: "changePassword"`)
- **Method**: `POST`
- **Request Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Payload**:
```json
{
  "action": "changePassword",
  "currentPassword": "CurrentSecurePassword123!",
  "newPassword": "NewStrongPassword456!"
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "message": "Password hashed successfully.",
  "newSalt": "e6c27940177b94ad3fc865bc441da025",
  "newHash": "1f6c4495ea52b414f5263a233634032d887a07fc2580a22a36b5bc9353272e0d"
}
```

---

## 2. Secure API Gateway (`/api/gateway` -> `netlify/functions/api.js`)

Centralized gateway mediating public submissions and privileged administrative operations.

### 2.1 Public: Single Invoice Verification (`action: "verifyInvoice"`)
- **Method**: `GET`
- **URL**: `/.netlify/functions/api?action=verifyInvoice&id=INV-2026-0001`
- **Privacy Protection**: Returns only non-sensitive verification metadata and masked customer identity. Prevents bulk database dumping.
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "valid": true,
  "invoice": {
    "invoiceNumber": "INV-2026-0001",
    "invoiceDate": "2026-08-01T00:00:00.000Z",
    "customerName": "S****** M**** K****",
    "service": "Web Development & AI Automation",
    "totalAmount": 25000,
    "status": "PAID",
    "paymentMethod": "Online / Bank Transfer",
    "items": [
      { "description": "Web Development & AI Automation", "qty": 1, "rate": 25000, "total": 25000 }
    ],
    "verifiedAt": "2026-10-24T08:00:00.000Z"
  }
}
```
- **Not Found / Draft Response (404 Not Found)**:
```json
{
  "status": "error",
  "valid": false,
  "message": "The requested invoice could not be authenticated. It may not exist or is still a draft."
}
```

### 2.2 Public: Contact & Lead Ingestion (`action: "submitLead"`)
- **Method**: `POST`
- **Protection**: Honeypot detection (`_hp`), length constraints, formula escaping (`=+@-`), rate limiting (max 10/10 min).
- **Request Payload**:
```json
{
  "action": "submitLead",
  "fullName": "Sharabu Manoj Kumar",
  "email": "contact@shaivikagroups.com",
  "phone": "+91 7981431094",
  "company": "Shaivika Groups",
  "service": "AI Automations Suite",
  "message": "Project requirement details...",
  "_hp": "",
  "source": "contact.html"
}
```
- **Success Response (200 OK)**:
```json
{ "status": "success", "message": "Thank you! Your inquiry has been recorded." }
```

### 2.3 Public: Career Job Application (`action: "submitApplication"`)
- **Method**: `POST`
- **Payload Limits**: Max 5MB attachment, validated MIME types (`pdf`, `doc`, `docx`).
- **Request Payload**:
```json
{
  "action": "submitApplication",
  "jobId": "job_dev_1",
  "jobTitle": "Full Stack Engineer",
  "name": "Candidate Name",
  "email": "candidate@example.com",
  "phone": "+91 9876543210",
  "experience": "2 Years",
  "portfolio": "https://github.com/candidate",
  "message": "Cover note...",
  "resumeFileName": "resume.pdf",
  "resumeBase64": "data:application/pdf;base64,...",
  "_hp": ""
}
```
- **Success Response (200 OK)**:
```json
{ "status": "success", "message": "Application submitted successfully." }
```

### 2.4 Public: AI Chatbot Assistant (`action: "chatMessage"`)
- **Method**: `POST`
- **URL**: `/.netlify/functions/api?action=chatMessage`
- **Protection**: IP-based rate limiting (max 10 requests / 10 minutes), formula injection sanitization, maximum message length enforcement (1,000 characters).
- **Security Guarantee**: OpenRouter credentials and n8n private configs remain 100% server-side. Dual transport gracefully connects via Netlify serverless proxy or direct n8n webhook.
- **Request Payload**:
```json
{
  "action": "chatMessage",
  "message": "What are your services and pricing?",
  "sessionId": "session_visitor_12345"
}
```
- **Success Response (200 OK)**:
```json
{
  "status": "success",
  "reply": "Welcome to Shaivika IT Technologies! We offer AI chatbots, web and app development, lead generation, and business automation systems. Our advertised packages start at ₹5,000 for Starter, ₹15,000 for Growth, and ₹25,000 for Business.",
  "sessionId": "session_visitor_12345",
  "source": "n8n_workflow"
}
```
- **Error Responses**:
  - `400 Bad Request` (Empty or oversized input):
    ```json
    { "status": "error", "error": "Message cannot be empty.", "message": "Message cannot be empty." }
    ```
  - `429 Too Many Requests` (Rate limit exceeded):
    ```json
    { "status": "error", "code": "RATE_LIMITED", "message": "Too many messages sent. Please wait a moment before sending another message." }
    ```

### 2.5 Privileged Operations (Requires `Authorization: Bearer <token>`)

| Action | HTTP Method | Payload Parameters | Purpose |
| :--- | :--- | :--- | :--- |
| `getInvoices` | POST | `{ action: "getInvoices" }` | Fetch complete customer invoices list |
| `saveInvoice` | POST | `{ action: "saveInvoice", invoice: { ... } }` | Create or update invoice record |
| `sendInvoiceEmail` | POST | `{ action: "sendInvoiceEmail", invoice: { ... } }` | Dispatch automated invoice notification email |
| `getProjects` | POST | `{ action: "getProjects" }` | Retrieve all portfolio projects (draft & active) |
| `addProject` | POST | `{ action: "addProject", project: { ... } }` | Create new showcase project |
| `updateProject` | POST | `{ action: "updateProject", project: { ... } }` | Modify existing showcase project |
| `deleteProject` | POST | `{ action: "deleteProject", id: "proj_..." }` | Delete showcase project |
| `getJobs` | POST | `{ action: "getJobs" }` | Retrieve all job openings |
| `addJob` | POST | `{ action: "addJob", job: { ... } }` | Create new job posting |
| `getApplications` | POST | `{ action: "getApplications" }` | Retrieve candidate submissions |
| `getLeads` | POST | `{ action: "getLeads" }` | Retrieve contact inquiry submissions |

- **Unauthenticated Failure (401 Unauthorized)**:
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Access denied: Valid administrator authentication session required."
}
```

---

## 3. Hardened Google Apps Script Backend (`google-apps-script/Code.gs`)

The Google Apps Script acts as an authenticated private storage tier.

- **Authentication**: Validated via `ScriptProperties.getProperty('API_KEY')` matching `APPS_SCRIPT_SECRET`.
- **Public Whitelist**: Only `verifyInvoice`, `submitLead`, `submitApplication`, `getPublicProjects`, and `getPublicJobs` are executable anonymously.
- **Formula Injection Mitigation**: All cells prefixed with `=`, `+`, `-`, or `@` are converted with a leading single quote (`'`).
- **Audit Log Sheet (`AuditLog`)**: Records timestamp, actor, action, and status.

---

## 4. Live Google Sheets & Dedicated WebApp Deployments

The Shaivika IT Technologies ecosystem connects to dedicated live Google Spreadsheets mediated securely by the Netlify API Gateway:

| Service | Google Spreadsheet ID & Link | Deployed WebApp URL | Purpose & Integration |
| :--- | :--- | :--- | :--- |
| **Contact Form** | [`19Sa9Bh6_cEs-oTUEPRRgQURpC5BaOwYfhaoF6nFBCMU`](https://docs.google.com/spreadsheets/d/19Sa9Bh6_cEs-oTUEPRRgQURpC5BaOwYfhaoF6nFBCMU/edit) | `https://script.google.com/macros/s/AKfycbz2ryEdo__YgiFBkps9pj4kLw5vFW3Uhvv0lSGJ1SNP3uW3n6YXv5sJe077GPvWM4gVAA/exec` | Ingests validated inquiries from `contact.html` via `ShaivikaAPI.submitLead()`. Rate limited with honeypot bot trap. |
| **Portfolio Projects** | [`1Z59x7O4SRh42SWDO-HWuMmcT5lRXZZ-A3rR95C9ZeHc`](https://docs.google.com/spreadsheets/d/1Z59x7O4SRh42SWDO-HWuMmcT5lRXZZ-A3rR95C9ZeHc/edit) | `https://script.google.com/macros/s/AKfycbwBnqwzKd77hBm3Ij8AtoXRnChjQrTgVv_wu3VFIXPKG8vtkNQ81A7TlarM67Kzl76t/exec` | Feeds the dynamic portfolio projects to `portfolio.html` and enables authenticated 2-way sync with the Admin Portal. |
| **Subscribers (Newsletter)** | [`1GXysNjTgxd1BiDluP7OVkL2YmAUBVBzm0-ZNXEzNmAA`](https://docs.google.com/spreadsheets/d/1GXysNjTgxd1BiDluP7OVkL2YmAUBVBzm0-ZNXEzNmAA/edit) | `https://script.google.com/macros/s/AKfycbygI-tj94XyLqm8Lp5q-JU5_TVhbFVnRCtF-DAN1QOQHGrinCqj7ba_hyo4urKoXIw-qg/exec` | Captures newsletter subscriptions across all website footers. Script in `google-apps-script/SubscribersCode.gs` handles duplicate prevention and formula escaping. |
| **Invoices & Billing** | [`1cDSJw5WeiaQeZ2jLERTTu4YycYVpwoceo65BCYz3N1Y`](https://docs.google.com/spreadsheets/d/1cDSJw5WeiaQeZ2jLERTTu4YycYVpwoceo65BCYz3N1Y/edit?gid=998665391#gid=998665391) | `https://script.google.com/macros/s/AKfycbyoSibvTqZNQbmm5AhtYZVUYiy8zUYoToPeQGzY6je3MUPqFJAZO9mk_xa9vT73Fx186w/exec` | Stores 24-column invoice records from Invoice Builder (`/invoice/`) and powers QR code scanning verification (`/verify.html`) via Netlify serverless proxy. |


