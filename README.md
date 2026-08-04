# RatTracer

*Tracing your place in the rat race.*

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
- ✅ **Phase 5 — Documents (MVP scope):** `folderLink` on each application, a read-only detail modal (`@angular/cdk/dialog`) showing the status history timeline and a folder-link button, and backend logic so `PUT` actually appends to `statusHistory` when a drag-and-drop status change happens. The `documents` FormArray (individually-labeled résumé/cover-letter/job-posting links) was descoped from this phase — the shared Drive folder link already covers that need for now; moved to its own backlog ticket for a post-MVP pass.
- ✅ **Phase 6 — Error handling (partial):** deliberately prioritized over loading/empty-state polish, given real dependency on an unreliable connection. Covers all three network-dependent actions: initial board load (error banner + Retry), create/edit (error banner inside the modal, modal stays open so nothing typed is lost), and drag-and-drop status updates (failed request automatically reverts the card to its original column, with a dismissible error banner). Loading and empty states intentionally left as-is for now — lower priority than correctness under a bad connection.
- ✅ **Visual styling & branding:** dark theme via CSS custom properties defined once in the global stylesheet, sans-serif font stack, a header/footer bar ("RatTracer" title, copyright), and consistent card/modal surface coloring for contrast.
- ✅ **Phase 7 — Docker deployment, complete:** both services containerized — the Express API, and the Angular app built via a multi-stage Docker build and served by nginx. `docker-compose.yml` ties them together with a `restart: unless-stopped` policy on both. Nginx reverse-proxies `/api/` requests internally to the API container over Docker's own network, so the Angular app calls a relative path rather than a hardcoded host/port. Deployed and running on the homelab box (SRV-LAB), confirmed reachable from other devices on the home network. **Reboot survival actually tested, not just assumed** — SRV-LAB was rebooted and both containers came back up on their own, no manual relaunch needed, satisfying the exact checkpoint the original build order named for this phase.
- ⬜ **Remaining (nice-to-haves, not blockers):** board sort/search, loading/empty state polish.

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

## Running Locally (Quick Reference)

Already set up? Two terminals:

```bash
# Terminal 1 — API
cd job-tracker-api
npm run dev
```

```bash
# Terminal 2 — Angular
cd job-tracker
ng serve
```

Then open `http://localhost:4200`. First-time setup (installing dependencies, creating `.env`) is below under Getting Started.

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

## Planned Enhancement: Board Sort & Search

Create/edit and the read-only card detail view (status history + folder link) both now happen through modals (`@angular/cdk/dialog`) — see Engineering Decisions for the architecture. Not yet built:

- **Sort each column by `dateApplied`, newest first** — rather than whatever order MongoDB happens to return.
- **A search box to filter the board down** ("drill-down by search"), most likely by company name.
- **Technical note for whoever builds this (probably future-me):** Angular CDK's drag-and-drop is sensitive to the exact array reference passed via `[cdkDropListData]`. Filtering should hide non-matching cards for *display* rather than generating a new filtered array on every keystroke — regenerating the underlying array mid-drag can break CDK's drag mechanics. The `columns` data structure driving drag-and-drop should stay untouched; search should only affect what's visible.

## Planned Enhancement: Archive / Remove Applications

Not yet built. Motivated by the realistic ghosting rate on job applications (informal observation: roughly 95% of applications never get a response) — without a way to clear these out, the Applied column becomes a graveyard of dead entries over time.

- **Lean toward archive over hard delete**, even though `DELETE /api/applications/:id` already exists on the backend (unused in the UI so far). Reasoning: the backlog already includes an Analytics View (response rate, time-in-stage) — a permanently deleted application can never contribute to that number, so "applied to 100, heard back from 5" only stays computable if the 95 that ghosted still exist somewhere, just hidden from daily view. Deleting now would quietly undermine a feature already planned for later.
- Likely needs: an `archived` (or similar) flag on the schema, board filtering to hide archived cards by default, and some way to still view/un-archive them when wanted.
- No urgency — logging this now so the reasoning isn't lost before it's picked up; tickets to be written later.

## Roadmap

- **Phase 2:** Angular service + basic list view
- **Phase 3:** Create/edit form (reactive forms)
- **Phase 4:** Kanban board with drag-and-drop status updates
- **Phase 5:** Document links (Drive folder + additional links)
- **Phase 6:** Automatic status history tracking, empty/loading/error states
- **Phase 7:** Dockerized deployment for personal home server use
- **Phase 8 (stretch) — packaging for public self-hosted distribution:** not started; broken down below so the actual size of the gap is clear, not just "auth and some polish."

### Phase 8 breakdown

**Already close to public-ready, little to no extra work:** the container setup itself has no hardcoded personal values — `apiUrl` is a relative path, the Mongo connection string is externalized via `.env`, nothing is baked into the images that would need to change for someone else running this.

**Small — an evening or two each:**
- `.env.example` — a template showing which environment variables are needed, without real values. Doesn't exist yet.
- Configurable host port — `3050` is currently hardcoded in `docker-compose.yml`, chosen specifically to avoid conflicts with *this* homelab's other containers. Should become an env var with a sensible default.
- A `LICENSE` file — currently none; non-negotiable for anything meant to be genuinely cloneable.
- Docker `HEALTHCHECK` directives on both services, reusing `/api/ping` for the API. Solves a real gap: a container can be "running" while functionally broken (e.g. Mongo connection silently dead) — `restart: unless-stopped` alone can't catch that, since the process never actually exits. Also unlocks changing `depends_on` to the `condition: service_healthy` form, so `web` genuinely waits for `api` to report healthy (not just started) before coming up — plugging a gap noted when `docker-compose.yml` was first written.
- A public-facing README pass — the current one is written for future-me (the Engineering Decisions log is a diary, not onboarding); a stranger needs a zero-context Quick Start plus explicit warnings about what security work hasn't been done yet.

**The real one — authentication.** Currently zero auth anywhere; anyone who can reach the API can read, edit, or delete everything. Acceptable only because this instance sits on a private homelab network. Touches real surface area on both sides: user model + password hashing on the backend, protecting every existing route, a login screen + token handling in Angular, route guards. Comparable in size to the Kanban board phase, maybe larger.

**Medium — a real focused push:**
- CI to build and publish images automatically (GitHub Actions → Docker Hub/GHCR). Worth doing as **multi-architecture** builds (amd64 + arm64) if this is meant to be genuinely useful to the self-hosting community, since a lot of that crowd runs Raspberry Pi-class hardware.
- A security hardening pass — rate limiting (currently none), and tightening CORS (currently wide open, harmless today since browser and API share an origin via the nginx proxy, but worth revisiting for unknown deployments).

**A real design decision, not just effort:** setup currently assumes an existing MongoDB Atlas account. Bundling an optional local MongoDB container into `docker-compose.yml` would let `docker compose up` alone produce a fully working instance with zero external signups — a genuine adoption win, at the cost of maintaining two deployment paths and a persistent volume.

**Bottom line:** everything above except auth is roughly comparable in total size to the Docker deployment work already done — a handful of focused sessions. Auth alone is close to its own phase. The bundled-Mongo option and CI are genuinely optional polish, not blockers for a responsible public v1.

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
- **Create/edit moved from a standing on-page form to a modal (`@angular/cdk/dialog`).** The original design kept `ApplicationForm` permanently visible on the page, fed by `@Input()`/`@Output()` through the parent (`app.ts`). This surfaced a real bug: after editing an application, nothing ever reset the "currently editing" state back to null, so the form stayed stuck showing the just-edited application — a new company couldn't be entered without a full page refresh. Rather than patch that specific bug, moved to opening `ApplicationForm` dynamically via CDK's `Dialog` service instead: the board now injects `Dialog` directly and calls `dialog.open(ApplicationForm, { data })`, passing `null` for create or an `Application` for edit. The form reads that via the `DIALOG_DATA` injection token and closes itself with `DialogRef` on save/cancel. Because a fresh component instance is created every time the modal opens, there's no leftover state to reset — the bug class is eliminated by construction, not patched around. `app.ts` got simpler as a result: the form import, the `editingApplication` property, and the `onEditRequested()` handler were all removed, since the board now owns opening the modal itself rather than asking a parent to do it.
- **Cross-component "something changed" signal via a `Subject` in `ApplicationData`.** Once create/edit moved into a modal, the board needed to know when to refresh without a page reload — but the board and the modal don't have a parent/child relationship the way `@Input()`/`@Output()` requires. Added `refresh$` (a public, read-only `Observable`) and a private `Subject` backing it to the shared service, plus a `notifyChanged()` method. Any component can call `notifyChanged()` after a mutation; the board subscribes to `refresh$` in `ngOnInit` and re-fetches whenever it fires. This is a standard lightweight pattern for letting sibling components — with no direct relationship to each other — coordinate through a shared singleton service instead.
- **`POST` now seeds an initial `statusHistory` entry** using `application.status` and `application.dateApplied` (schema defaults already applied by that point, not `new Date()`), so every application's story starts at "Applied" on the date actually applied, not the date it happened to be typed into the tracker. The `PUT` route doesn't yet append further entries on subsequent status changes — that's the next piece of Phase 6, still pending.
- **Cancel button uses `(mousedown)` instead of `(click)`.** Clicking Cancel while a required field (e.g. Company) still had focus caused a validation error to flash before the modal closed, sometimes requiring a second click. Root cause: the browser fires events in the order `mousedown → blur → mouseup → click`; Angular's reactive forms mark a field `touched` on `blur`, and the resulting re-render can shift the button's layout between `mousedown` and `mouseup`, occasionally causing the two to land on different elements and `click` to never fire at all (a `click` event requires `mousedown` and `mouseup` on the same element). Binding to `mousedown` instead means Cancel fires and starts closing the modal before `blur` (and the validation it triggers) ever happens.
- **Error handling covers load, create/edit, and drag-and-drop — deliberately prioritized over loading/empty-state polish** given a genuinely unreliable connection and multiple points of failure (API server, Mongo, network). Same zoneless change-detection gotcha logged earlier for `HttpClient` `.subscribe()` showed up a third time here, in the *error* branch of the form's submit call specifically — the success path worked fine without a fix because `dialogRef.close()` triggers Angular's own dialog teardown machinery, which handles re-rendering correctly regardless; the error path is a plain property assignment with nothing built-in watching it, so it needed the same `ChangeDetectorRef`/`detectChanges()` treatment as the board and list before it. Drag-and-drop specifically uses an "optimistic update with rollback" pattern: the card moves visually the instant it's dropped (via `transferArrayItem`), before the `PUT` request resolves; if that request fails, `transferArrayItem` is called a second time with the arguments reversed, moving the card back to its original column, so a failed save never leaves the board silently showing something different from what's actually persisted.
- **Dark theme via CSS custom properties, defined once in the global `styles.scss`.** Colors (`--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, etc.) are declared once on `:root` and referenced everywhere with `var(--name)`, rather than repeating hex values across component stylesheets — a later palette tweak is a one-line change instead of a find-and-replace. Base element styling (inputs, buttons, links) is also set globally rather than per-component, so both modals inherit consistent theming automatically.
- **`.cdk-dialog-container` targeted directly in global styles** to give modals a themed background — Angular CDK's Dialog module ships zero default visual styling of its own (unlike Angular Material's `MatDialog`), so without this, both the form and detail modals would render as an unstyled, effectively transparent panel over the dark backdrop.
- **Cross-component layout consistency (header/footer/board alignment) achieved via `:host` in `application-board.scss`**, not by modifying `application-board.html`. `:host` styles the actual `<app-application-board>` element itself, the same way any other element can be styled — necessary here because the header/footer live in `app.html` while the board is a separate component with its own template; a margin rule on the header has no way to reach into a sibling component's content on its own.
- **Multi-stage Docker build for the Angular app.** Stage 1 (`node:24-alpine`) installs the full Angular toolchain and compiles the app; Stage 2 starts completely fresh from `nginx:alpine` and copies over *only* the compiled static output (`dist/job-tracker/browser`) — Node, the CLI, and every `node_modules` package are discarded entirely, never becoming part of the final image. `ng serve` is a dev-only tool and isn't meant for production use, which is the reason nginx (or an equivalent static file server) is required regardless of any other architectural choice made here.
- **Nginx reverse-proxies `/api/` internally to the API container, rather than the Angular app calling a hardcoded host/port.** The API container has no host port exposed at all — only nginx can reach it, over Docker Compose's automatic service-name networking (`http://api:3000`, where `api` must exactly match the service name in `docker-compose.yml`). `ApplicationData`'s `apiUrl` is a relative path (`/api/applications`), not a full URL — the browser resolves that against whatever origin served the page, so it never needs to know or care what host/port the API actually lives behind. This choice was made specifically to avoid conflicting with planned future homelab networking changes (a Cloudflare Tunnel for a separate project, plus a reverse-VPN setup) — both operate at a different layer (how external traffic reaches the homelab at all) and never interact with this internal, container-to-container proxy.
- **First real test of this setup caught a genuine leftover bug**, worth remembering as a lesson: `apiUrl` was still hardcoded to `http://localhost:3000` from local development when the containerized stack was first run, causing "could not load applications" — a direct, concrete demonstration of why the relative-path/proxy approach matters, since the fix was a one-line change and a rebuild, not a redeployment tied to some specific IP.
- **Host port `3050` chosen for the whole stack (nginx only — the API needs none).** Checked existing containers on the homelab box first (`docker ps`) and found 3000, 3001, 3002, 5678, 8090, 8888, 9000, and 25565 already in use by other services (Planka, n8n, Minecraft, Portainer, etc.). Since nginx is the only container that needs a host-facing port at all, RatTracer's entire footprint on the homelab box is one port, not two.

## Deployment Notes

This project is designed to run privately on a personal home server — it is not intended to be publicly hosted. If it's ever packaged for others to self-host, that would take the form of a distributable Docker image, not a public-facing site.
