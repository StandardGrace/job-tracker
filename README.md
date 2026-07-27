# Job Application Tracker

A personal tool for tracking job applications through the hiring pipeline — from application submitted through to offer or rejection — with quick links to related documents (resumes, cover letters, job postings) stored in Google Drive.

Built primarily as a hands-on project to learn Angular (services, reactive forms, CDK drag-and-drop) while producing something genuinely useful day-to-day.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular (standalone components, Angular CLI) |
| Backend | Express (Node.js) |
| ODM | Mongoose |
| Database | MongoDB (Atlas) |

The frontend and backend are two independent applications that communicate over HTTP — Angular never talks to MongoDB directly.

## How It Works

```
job-tracker/          Angular SPA (client)
     |
     |  HTTP requests (HttpClient)
     v
job-tracker-api/       Express REST API (server)
     |
     |  Mongoose queries
     v
MongoDB Atlas           Document storage
```

Each job application is stored as a single MongoDB document containing the company, role, status, source, notes, a link to its Google Drive folder, and a running history of status changes over time.

## Current Status

- ✅ **Phase 0 — Scaffolding:** Angular app and Express/Mongoose API running side by side, confirmed end-to-end with a `/api/ping` round trip.
- ✅ **Phase 1 — Data layer:** `Application` schema defined; full REST API built and independently tested via curl/Postman.
- ⬜ **Phase 2 onward:** Angular UI (list view, forms, Kanban board, document links) not yet built.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/applications` | List all applications |
| `POST` | `/api/applications` | Create a new application |
| `GET` | `/api/applications/:id` | Get a single application |
| `PUT` | `/api/applications/:id` | Update an application (partial updates supported) |
| `DELETE` | `/api/applications/:id` | Delete an application |

### Application Schema

```js
{
  company: String,          // required
  role: String,             // required
  status: String,           // Applied | Screening | Interview | Offer | Rejected
  dateApplied: Date,
  source: String,
  notes: String,
  statusHistory: [{ status, date }],
  folderLink: String,       // Google Drive folder for this application
  documents: [{
    type: String,           // resume | cover_letter | job_posting | other
    label: String,
    url: String,
    snapshotText: String,
    dateAdded: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Getting Started

### Backend

```bash
cd job-tracker-api
npm install
```

Create a `.env` file in `job-tracker-api/` with:

```
MONGO_URI=your-mongodb-connection-string
PORT=3000
```

Then run:

```bash
npm run dev
```

The API starts on `http://localhost:3000`. Confirm it's working with:

```bash
curl http://localhost:3000/api/ping
```

### Frontend

```bash
cd job-tracker
npm install
ng serve
```

The app runs on `http://localhost:4200`.

> **Note:** `.env` is intentionally excluded from version control (see `.gitignore`). It contains database credentials and should never be committed. If you're setting this up fresh, you'll need your own MongoDB Atlas connection string.

## Roadmap

- **Phase 2:** Angular service + basic list view
- **Phase 3:** Create/edit form (reactive forms)
- **Phase 4:** Kanban board with drag-and-drop status updates
- **Phase 5:** Document links (Drive folder + additional links)
- **Phase 6:** Automatic status history tracking, empty/loading/error states
- **Phase 7:** Dockerized deployment for personal home server use
- **Phase 8 (stretch):** Auth, analytics view, stale-application reminders, and packaging for public self-hosted distribution

## Deployment Notes

This project is designed to run privately on a personal home server — it is not intended to be publicly hosted. If it's ever packaged for others to self-host, that would take the form of a distributable Docker image, not a public-facing site.
