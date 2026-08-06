# Google Apps Script Setup Guide - Shaivika Portfolio & CMS

This guide walks you through connecting your **Google Sheet** with your **Shaivika Admin Dashboard** and **Main Website** so that adding a project in the Admin dashboard automatically syncs to Google Sheets and displays live on your website!

---

## 1. Google Sheet Column Structure

When you create your Google Sheet, rename the sheet tab at the bottom to **`Portfolio`**.

The script will automatically format and create the headers for you if it is blank, but here are the exact 10 columns for reference:

| Column | Header Name | Description | Example Value |
| :--- | :--- | :--- | :--- |
| **A** | `ID` | Unique Project ID | `proj_1786021234567` or `p1` |
| **B** | `Title` | Project Title | `Manspharshcare Platform` |
| **C** | `Description` | Project Summary & Features | `Comprehensive healthcare web platform...` |
| **D** | `Categories` | Comma-separated category slugs | `webapp, ui` |
| **E** | `Link` | Live URL or target action | `https://mansparshcare.xyz/` |
| **F** | `Emoji` | Icon / Emoji fallback | `🏥` |
| **G** | `Image` | Thumbnail image URL / Path | `https://your-domain.com/img.jpg` |
| **H** | `ModalID` | Optional modal popup target | `#modal-manspharsh` |
| **I** | `Status` | Active status | `active` |
| **J** | `CreatedAt` | Timestamp created | `8/6/2026, 6:30:00 PM` |

---

## 2. Deploying the Google Apps Script

1. Open your Google Sheet in your browser.
2. In the top menu, click **Extensions** -> **Apps Script**.
3. Delete any default code in `Code.gs`.
4. Copy and paste the entire code from [Code.gs](file:///c:/Users/shara/OneDrive%20-%20SIDDHARTH%20GROUP%20OF%20INSTITUTIONS/Desktop/shivashakthi%20IT%20Solutions/Shaivika-IT-Technologies/google-apps-script/Code.gs) into the editor.
5. Click **Save** (disk icon or `Ctrl + S`).
6. Click the blue **Deploy** button (top right) -> choose **New deployment**.
7. Click the gear icon ⚙️ next to *Select type* and choose **Web app**.
8. Set the settings:
   - **Description**: `Shaivika Portfolio CMS API`
   - **Execute as**: `Me (your Google email)`
   - **Who has access**: **`Anyone`** *(This is mandatory so your admin dashboard and website can communicate with Google Sheets)*.
9. Click **Deploy**.
10. Click **Authorize access**, choose your Google account, click **Advanced**, then **Go to Untitled project (unsafe)**, and click **Allow**.
11. Copy the generated **Web app URL** (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 3. Connecting to Admin Portal

1. Open your Shaivika Admin Dashboard at `admin/index.html`.
2. Navigate to **Settings & Backup** (or the Portfolio tab).
3. Under **Google Sheet Portfolio Sync**, paste your **Web App URL** and click **Save URL & Test Connection**.
4. You can also click **"Push All Local Projects to Google Sheet"** to instantly sync all 18 existing projects to your Google Sheet with one click!
5. Now, whenever you click **"➕ Add Project"** or edit/delete a project in the Admin dashboard, it will automatically update in your Google Sheet and show on your main website!
