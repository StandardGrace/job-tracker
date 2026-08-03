# Job Application Tracker

A personal tool for tracking job applications through the hiring pipeline — from application submitted through to offer or rejection — with quick links to related documents (resumes, cover letters, job postings) stored in Google Drive.

Built primarily as a hands-on project to learn Angular (services, reactive forms, CDK drag-and-drop) while producing something genuinely useful day-to-day.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular (standalone components, Angular CLI) + Angular CDK (drag-and-drop) |
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
- ✅ **Phase 2 — Angular reads the list:** `ApplicationData` service (HttpClient wrapper) and a plain unstyled list view, confirmed end-to-end against the live API.
- ✅ **Phase 3 — Create/edit form:** Reactive form for creating applications, plus edit mode wired to `PUT` via component `@Input`/`@Output` communication.
- ✅ **Phase 4 — Kanban board:** Applications grouped into status columns with Angular CDK drag-and-drop, firing a `PUT` status update on drop. Later redesigned as the app's sole primary view — the standalone list was dropped in favor of enriching board cards directly (company, role, date applied, Edit button); see Engineering Decisions for the reasoning. A zoneless Angular change-detection bug affecting initial render was also found and fixed here.
- ⬜ **Phase 5 onward:** Document links (folder link + FormArray), status history tracking, polish, and deployment not yet built.

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

## Planned Enhancement: Board Sort, Search & Card Detail Modal

Not yet built — logged here so the reasoning isn't lost before it's picked up:

- **Sort each column by `dateApplied`, newest first** — rather than whatever order MongoDB happens to return.
- **A search box to filter the board down** ("drill-down by search"), most likely by company name.
- **Technical note for whoever builds this (probably future-me):** Angular CDK's drag-and-drop is sensitive to the exact array reference passed via `[cdkDropListData]`. Filtering should hide non-matching cards for *display* rather than generating a new filtered array on every keystroke — regenerating the underlying array mid-drag can break CDK's drag mechanics. The `columns` data structure driving drag-and-drop should stay untouched; search should only affect what's visible.
- **Card detail modal** — clicking a card (distinct from the Edit button) should open a read-only modal showing the full picture: status change timeline and associated documents/folder link. Decided to hold off building this until Phase 5 (documents/folder link) is done, so the modal shows both status history and documents together rather than being built twice. Chosen interaction: a modal popup, not an inline-expanding card — Angular CDK's Dialog module (`@angular/cdk/dialog`) is already installed via the CDK package and is a natural fit, since it avoids pulling in the larger Angular Material library just for one dialog.
- **Depends on Phase 6's status history work actually populating `statusHistory`** — right now that field still sits empty on every application, since nothing yet appends to it when status changes. The modal has nothing to show until that's built.

## Roadmap

- **Phase 2:** Angular service + basic list view
- **Phase 3:** Create/edit form (reactive forms)
- **Phase 4:** Kanban board with drag-and-drop status updates
- **Phase 5:** Document links (Drive folder + additional links)
- **Phase 6:** Automatic status history tracking, empty/loading/error states
- **Phase 7:** Dockerized deployment for personal home server use
- **Phase 8 (stretch):** Auth, analytics view, stale-application reminders, and packaging for public self-hosted distribution

## Future Integration Idea: Automated Application Ingestion

A separate homelab project is planned that uses an LLM to automatically generate a tailored CV and cover letter for a given job posting, then uploads the resulting documents to a Google Drive folder. Once built, that pipeline could feed applications into this tracker automatically, rather than requiring manual entry:

- The ingestion system already has everything needed at generation time (company, role, source, and the Drive folder it just created) — no PDF-parsing or text-extraction step required on this end.
- It would call this project's existing REST API directly (`POST /api/applications`), passing `folderLink` as the Drive folder URL. No changes needed to this API to support it — the two systems stay fully decoupled.
- Worth deciding before building it: how to avoid duplicate tracker entries if the pipeline ever re-runs on the same posting (e.g. matching on company + role + source, or storing the original job posting URL); and confirming this API stays private-network-only if a second automated caller is added, rather than assuming "no auth needed" indefinitely.
- `status` should likely still default via the schema (`Applied`) rather than being set explicitly by the ingestion pipeline, to keep one consistent source of truth for initial status.

Not scheduled yet — noted here so the reasoning isn't lost before it's picked up.

## Engineering Decisions & Notes

A running log of choices made along the way, and why — mainly for future-me, since some of these aren't obvious from the code alone.

- **Angular file naming (no `.service`/`.component` suffix):** As of Angular 20+, the CLI generates files like `application.ts` (class `Application`) instead of the older `application.service.ts` (class `ApplicationService`). This project keeps the new default rather than restoring the legacy suffix behavior. One side effect worth knowing: the Angular service class (`Application`) and the backend Mongoose model (`Application` in `job-tracker-api/models/Application.js`) now share the same name. This isn't a real conflict — they live in separate projects/folders and are never imported into the same file — but it's worth remembering when reading code or discussing "the Application class," since the name alone doesn't say which one you mean.
- **Board kept as the sole primary view; standalone list dropped.** Originally built both a list view (Phase 2) and a Kanban board (Phase 4). After using both, questioned whether drag-and-drop earned its place at all — for a solo, mouse-and-keyboard user, dragging a card isn't meaningfully faster than picking a status from a dropdown; drag-and-drop mainly solves a touchscreen problem this project doesn't have. Considered replacing the board with a sortable/filterable list instead. Landed on keeping the board anyway, for two reasons: (1) once each card shows company, role, and date applied, a list adds nothing the board doesn't already communicate for free via column position — the "status column" a list would show is redundant; (2) the board still gives a faster at-a-glance read of overall pipeline shape (how many applications sit in each stage) than scanning a sorted list. The CDK drag-and-drop work itself was also a genuine, already-completed Angular learning rep worth keeping regardless of daily-use value. Net result: the list component stays in the codebase (unused on the main page, still a valid service/HttpClient rep) and board cards were enriched with the data the list used to show (company, role, date applied, Edit button) minus status, since the column already conveys it.
- **Zoneless Angular change detection — `HttpClient.subscribe()` doesn't auto-update the view.** Angular v21+ defaults new projects to zoneless change detection (no Zone.js), which this project inherited automatically via `ng new` without explicitly choosing it. Practical consequence discovered firsthand: setting a component property inside an `HttpClient` `.subscribe()` callback does *not* automatically trigger a re-render — data was correctly fetched and stored, but the board/list only visibly updated after an unrelated Angular-recognized event (e.g. typing in the form) incidentally triggered a re-check elsewhere in the app. Fixed in both the list and board components by injecting `ChangeDetectorRef` and calling `this.cdr.detectChanges()` immediately after setting fetched data inside `subscribe()`. Worth remembering: any future component that fetches data via a manual `.subscribe()` (rather than the `async` pipe or `toSignal()`, both of which handle this automatically) will need the same fix.
- **MongoDB Atlas over a local instance:** chosen for zero local infrastructure to maintain, at the cost of needing internet access to reach the database during development.
- **Scoped database user, not admin:** the Atlas database user for this app has `readWrite` access to the `job-tracker` database only — not an admin-level role. Deliberate security hygiene even for a personal project, since it limits the damage if the credential ever leaks (e.g. accidentally committed, or the homelab box is compromised).
- **DNS override in `server.js`:** `dns.setServers(['1.1.1.1', '8.8.8.8'])` was added because a local AdGuard DNS resolver doesn't reliably handle the SRV DNS record lookups that `mongodb+srv://` connection strings depend on, causing `querySrv ECONNREFUSED` errors. Scoped to this Node process only — doesn't change any system-wide network settings.
- **Single monorepo, not two GitHub repos:** `job-tracker` (Angular) and `job-tracker-api` (Express) live in one repository rather than being split up, since they'll eventually be built and deployed together via a single `docker-compose.yml` (Phase 7).
- **Explicit `rootDir` in `tsconfig.app.json`:** added `"rootDir": "./src"` to silence a TypeScript editor warning (`aka.ms/ts6`) caused by a known Angular CLI 22 regression — TypeScript is moving toward requiring `rootDir` to be set explicitly rather than inferring it, and Angular's generated config hadn't caught up yet. Editor-only diagnostic, never affected `ng serve`/`ng build`, but setting it explicitly matches the project's real folder layout and clears the warning.
- **Running on Node.js 24 (LTS), not an odd-numbered "Current" release:** development originally started on Node 25, which turned out to already be end-of-life. Switched to Node 24 (active LTS support through April 2028) via nvm-windows. No dependencies in this project use native/compiled bindings, so the switch required no code changes — just reinstalling `node_modules` in both projects as a precaution.
- **Port conflicts deferred to Docker, not app code:** the homelab deployment box already has something running on port 3000. Rather than changing the app's default port in code, this will be resolved with a host-to-container port mapping in `docker-compose.yml` (e.g. `"3050:3000"`) when Phase 7 is built — the app itself stays unaware of what port it's exposed as externally.
- **`returnDocument: 'after'` instead of `new: true`:** Mongoose deprecated the `new` option on `findOneAndUpdate`/`findByIdAndUpdate` in favor of `returnDocument: 'after'`, matching the underlying MongoDB driver's own option naming. Updated the `PUT` route in `routes/applications.js` accordingly. Purely a deprecation fix, not a behavior change — `runValidators: true` and everything else about the route stayed the same.

## Deployment Notes

This project is designed to run privately on a personal home server — it is not intended to be publicly hosted. If it's ever packaged for others to self-host, that would take the form of a distributable Docker image, not a public-facing site.
