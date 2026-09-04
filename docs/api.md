# Shaivika IT Technologies - API & Data Services Documentation

## Overview
This document outlines the API endpoints, form interceptor services, and data management interfaces powering Shaivika IT Technologies.

---

### 1. Lead & Contact Ingestion Endpoint

#### Description
Captures contact inquiries, consultation requests, and project leads from website contact forms and modal dialogues.

- **Primary URL**: Google Apps Script Webhook / Internal Interceptor (`js/lead-interceptor.js`)
- **Fallback URL / Local Cache**: LocalStorage Key: `shaivika_leads`
- **Method**: `POST`
- **Content-Type**: `application/json` or `application/x-www-form-urlencoded`

#### Request Payload
```json
{
  "id": "lead_1786021111436",
  "name": "Sharabu Manoj Kumar",
  "email": "contact@shaivikagroups.com",
  "phone": "+91 7013550760",
  "subject": "Web Development & AI Automation",
  "service": "AI Automations Suite",
  "message": "Project requirement details...",
  "source": "contact.html",
  "timestamp": "2026-08-06T13:00:00.000Z",
  "status": "new"
}
```

#### Response (Success: 200 OK)
```json
{
  "status": "success",
  "message": "Inquiry recorded successfully. We will connect with you shortly."
}
```

#### Error Handling (400 Bad Request / Network Offline)
- **Response**:
```json
{
  "status": "error",
  "message": "Validation failed: required fields missing."
}
```
- **Offline Behavior**: Automatically persisted to LocalStorage queue with automatic retry upon online event restoration.

---

### 2. Career Application Ingestion Endpoint

#### Description
Handles candidate job applications, resume file attachments (base64 encoded data URI), and candidate profile details.

- **Storage Key**: `shaivika_job_applications`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Payload
```json
{
  "id": "app_1786021200000",
  "jobId": "job_fullstack",
  "jobTitle": "Full-Stack Web Developer",
  "name": "Candidate Name",
  "email": "candidate@example.com",
  "phone": "+91 9876543210",
  "experience": "1-2 Years",
  "portfolio": "https://github.com/candidate",
  "resumeFileName": "resume.pdf",
  "resumeBase64": "data:application/pdf;base64,...",
  "submittedDate": "2026-08-06T13:00:00.000Z",
  "status": "Under Review"
}
```

---

### 3. Google Sheet Portfolio & CMS API (`google-apps-script/Code.gs`)

#### Description
Provides dynamic bi-directional synchronization between Google Sheets, Admin Dashboard, and the live Website.

- **Deployment**: Google Apps Script Web App (Executes as "Me", Access: "Anyone")
- **Spreadsheet Sheet Name**: `Portfolio`

#### Google Sheet Column Layout
1. `A: ID` - Unique ID string (e.g. `p1`, `proj_1786021234567`)
2. `B: Title` - Project title (e.g. `Manspharshcare Platform`)
3. `C: Description` - Detailed description
4. `D: Categories` - Comma-separated category slugs (e.g. `webapp, ui`)
5. `E: Link` - Target URL or `contact.html`
6. `F: Emoji` - Icon / Emoji fallback (e.g. `🏥`)
7. `G: Image` - Optional image thumbnail URL
8. `H: ModalID` - Modal identifier (e.g. `#modal-manspharsh`)
9. `I: Status` - `active` or `draft`
10. `J: CreatedAt` - Timestamp string

#### GET / Endpoint
- **URL**: `https://script.google.com/macros/s/.../exec?action=getProjects`
- **Response**:
```json
{
  "status": "success",
  "count": 18,
  "projects": [
    {
      "id": "p1",
      "title": "Manspharshcare Platform",
      "description": "Comprehensive healthcare web platform...",
      "categories": ["webapp", "ui"],
      "link": "https://mansparshcare.xyz/",
      "emoji": "🏥",
      "image": "",
      "modalId": "#modal-manspharsh",
      "status": "active",
      "created_at": "8/6/2026, 6:30:00 PM"
    }
  ]
}
```

#### POST / Endpoint Actions
- **Add Project (`action: "addProject"`)**:
```json
{
  "action": "addProject",
  "project": {
    "id": "proj_1786021234567",
    "title": "New Web Application",
    "description": "Project overview...",
    "categories": ["webapp", "saas"],
    "link": "https://example.com",
    "emoji": "🚀",
    "image": "",
    "status": "active"
  }
}
```
- **Update Project (`action: "updateProject"`)**:
```json
{
  "action": "updateProject",
  "project": {
    "id": "proj_1786021234567",
    "title": "Updated Title",
    ...
  }
}
```
- **Delete Project (`action: "deleteProject"`)**:
```json
{
  "action": "deleteProject",
  "id": "proj_1786021234567"
}
```
- **Bulk Sync (`action: "bulkSync"`)**:
```json
{
  "action": "bulkSync",
  "projects": [ ... ]
}
```
