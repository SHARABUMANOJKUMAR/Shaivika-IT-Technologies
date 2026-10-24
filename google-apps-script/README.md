# Google Apps Script Setup & Hardened Architecture Guide
## Shaivika IT Technologies Unified Enterprise Backend

This Google Apps Script project provides a secure, unified backend for Shaivika IT Technologies, managing all five critical areas of the system:
1. **Invoice Management** (`Invoices` sheet)
2. **Portfolio Projects & CMS** (`Portfolio` sheet)
3. **Job Postings** (`Jobs` sheet)
4. **Candidate Job Applications** (`Applications` sheet)
5. **Contact Leads & Form Submissions** (`Leads` sheet)
6. **Audit Trail** (`AuditLog` sheet)

---

## 1. Security Architecture

- **Server-Side API Key Requirement**: All privileged operations (`getInvoices`, `saveInvoice`, `deleteInvoice`, `addProject`, `deleteProject`, `getApplications`, `getLeads`, etc.) require an `API_KEY` validated on the server side.
- **Privacy-Preserving Invoice Verification**: Anonymous users querying `verifyInvoice` receive ONLY masked customer records (`M**** K****`) and non-sensitive confirmation details. Anonymous database dumping is strictly blocked.
- **Formula Injection Defense**: All user-supplied inputs starting with `=`, `+`, `-`, or `@` are escaped automatically before writing to cells.
- **Audit Logging**: All write and administrative operations are recorded in the `AuditLog` sheet with timestamps, actor IDs, actions, and status.

---

## 2. Deploying the Google Apps Script

1. Open your master Google Sheet (or create one at [https://sheets.new](https://sheets.new)).
2. In the top menu, navigate to **Extensions** -> **Apps Script**.
3. Replace all contents in `Code.gs` with the code in `google-apps-script/Code.gs`.
4. Click **Project Settings** (gear icon ⚙️ on the left menu).
5. Scroll down to **Script Properties** and click **Add script property**:
   - **Property**: `API_KEY`
   - **Value**: Your secure secret key (matches `APPS_SCRIPT_SECRET` in Netlify environment variables, e.g. `shaivika-gas-backend-secret-2026`).
6. Click **Save script properties**.
7. In the top-right corner, click **Deploy** -> **New deployment**.
8. Select type: **Web app**:
   - **Description**: `Shaivika Hardened Enterprise Backend`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
9. Click **Deploy**, authorize permissions when prompted, and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

---

## 3. Netlify Environment Configuration

In your Netlify Dashboard under **Site configuration** -> **Environment variables**, set:
- `APPS_SCRIPT_URL`: Your deployed Google Apps Script Web App URL.
- `APPS_SCRIPT_SECRET`: The secret key matching your `API_KEY` script property.
- `ADMIN_USERNAME`: Desired admin username.
- `ADMIN_PASSWORD_HASH`: SHA-256 / PBKDF2 hash of your admin password.
- `ADMIN_PASSWORD_SALT`: Cryptographic salt for your admin password.
- `JWT_SECRET`: Random 64-character secret for signing admin session tokens.

The Netlify serverless functions (`/.netlify/functions/admin-auth` and `/.netlify/functions/api`) will automatically authenticate administrators and mediate all requests securely to Google Apps Script.
