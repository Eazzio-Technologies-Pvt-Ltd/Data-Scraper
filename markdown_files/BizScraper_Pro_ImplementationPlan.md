**BizScraper Pro**

Implementation Plan

Version 1.0  ·  July 2025

| **Document** | Implementation Plan — Step-by-Step Build Guide |
| --- | --- |

| **Product** | BizScraper Pro — Local Business Data Extractor |
| --- | --- |

| **Stack** | React.js · Python FastAPI · Google Places API · SQLite |
| --- | --- |

| **Total Time** | ~10–14 working days (solo developer) |
| --- | --- |

| **Phases** | 6 phases: Setup → Backend → Frontend → Integration → Polish → Deploy |
| --- | --- |

| **Status** | Not Started |
| --- | --- |

# **1. Overview**

This document is the step-by-step build guide for BizScraper Pro. It breaks the full project into 6 phases with individual tasks, time estimates, who does what, and how to verify each step is done correctly before moving to the next.

Rule: never start a new phase until every task in the previous phase is verified. Each verification step tells you exactly what to check.

| **Phase** | **Name** | **Est. Duration** |
| --- | --- | --- |
| **Phase 1** | Environment Setup | 1 day |
| **Phase 2** | Backend Core | 3–4 days |
| **Phase 3** | Frontend Core | 3 days |
| **Phase 4** | Integration & Testing | 2 days |
| **Phase 5** | Polish & Edge Cases | 1–2 days |
| **Phase 6** | Deployment | 1 day |

# **2. Phase 1  —  Environment Setup**

Before writing a single line of application code, every tool must be installed and verified. Do not skip this phase.

***Phase 1  —  Environment Setup**   (1 day)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **1.1** | Install Node.js v18+ from nodejs.org | Dev | 10 min | Run: `node --version` → must show v18+ |
| **1.2** | Install Python 3.11+ from python.org | Dev | 10 min | Run: `python --version` → must show 3.11+ |
| **1.3** | Install Git from git-scm.com | Dev | 5 min | Run: `git --version` → shows version number |
| **1.4** | Install VS Code + Python + ESLint extensions | Dev | 10 min | Open VS Code → Extensions tab shows both installed |
| **1.5** | Install Postman from postman.com | Dev | 5 min | Postman opens without error |
| **1.6** | Create GitHub repo: bizscraper-pro (private) | Dev | 5 min | Repo visible at github.com/thecodingAdi/bizscraper-pro |
| **1.7** | Create Google Cloud account and enable Places API | Dev | 20 min | Places API shows "Enabled" in Google Cloud Console |
| **1.8** | Generate Google Places API key | Dev | 5 min | API key string visible in Credentials page |
| **1.9** | Test API key in browser: `maps.googleapis.com/maps/api/place/textsearch/json?query=cafes+in+Jamshedpur&key=YOUR_KEY` | Dev | 5 min | Browser returns JSON with results array — not an error |
| **1.10** | Create project folder structure (`frontend/` and `backend/`) | Dev | 10 min | Both folders exist with README.md in root |
| **1.11** | Create `.gitignore` — add `.env`, __pycache__, node_modules, *.db | Dev | 5 min | Run: `cat .gitignore` — all four entries present |
| **1.12** | Initial git commit: "chore: project scaffold" | Dev | 5 min | `git log` shows first commit on main branch |

# **3. Phase 2  —  Backend Core**

Build the entire Python FastAPI backend. Test every endpoint in Postman before touching the frontend. Backend must work independently first.

All backend work happens inside the `backend/` folder.

## **3.1  Backend Project Setup**

***Phase 2  —  Backend Project Setup**   (Day 2 morning)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **2.1** | Navigate to `backend/` folder. Create virtual environment: `python -m venv venv` | Dev | 3 min | `venv/` folder appears inside `backend/` |
| **2.2** | Activate venv: `.\venv\Scripts\activate` (Windows PowerShell) | Dev | 2 min | Terminal prompt shows (venv) prefix |
| **2.3** | Create `requirements.txt` with all dependencies | Dev | 5 min | File contains: fastapi, uvicorn[standard], requests, httpx, pandas, python-dotenv, beautifulsoup4, sqlalchemy, pydantic, `slowapi` |
| **2.4** | Install all dependencies: `pip install -r requirements.txt` | Dev | 5 min | No red error lines — all packages install successfully |
| **2.5** | Create `backend/.env` file with `GOOGLE_API_KEY`, `CACHE_EXPIRY_HOURS`=24, `MAX_RESULTS`=60, `ALLOWED_ORIGIN`=`http://localhost:5173` | Dev | 3 min | File exists. cat `.env` shows all four keys. |
| **2.6** | Create `main.py` with basic FastAPI app and CORS middleware | Dev | 15 min | Run: `uvicorn main:app --reload` → Terminal shows "Application startup complete" |
| **2.7** | Visit `http://localhost:8000/docs` in browser | Dev | 2 min | FastAPI auto-generated Swagger UI is visible |

## **3.2  Database Setup**

***Phase 2  —  Database Setup**   (Day 2 afternoon)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **2.8** | Create `database/models.py` — define SQLAlchemy models for `search_cache` and `businesses` tables | Dev | 30 min | File has both class definitions with all columns from Schema doc |
| **2.9** | Create `database/db.py` — SQLite engine, session factory, `create_all()` | Dev | 15 min | Run app → bizscraper.db file appears in `backend/` folder |
| **2.10** | Create `database/cache.py` — `get_cached_result`() and `save_to_cache`() functions | Dev | 30 min | No import errors when imported in `main.py` |
| **2.11** | Test cache functions manually in Python shell — insert a fake row, read it back | Dev | 10 min | Fake row readable from bizscraper.db using DB Browser for SQLite or Python shell |

## **3.3  Google Places Service**

***Phase 2  —  Google Places Service**   (Day 3 morning)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **2.12** | Create `services/google_places.py` — `search_places`(keyword, location) function that calls Text Search API Page 1 | Dev | 45 min | Call function directly in Python shell → returns list of 20 raw results |
| **2.13** | Add pagination to `search_places`() — loop through `next_page_token`, 2-second delay, collect up to 60 results | Dev | 30 min | Test with "institute in Jharkhand" → function returns 40–60 results |
| **2.14** | Create `get_place_details`(place_id) function — calls Place Details API, returns phone and website | Dev | 30 min | Test with a real place_id → returns dict with phone and website keys |

## **3.4  Data Processor**

***Phase 2  —  Data Processor**   (Day 3 afternoon)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **2.15** | Create `services/data_processor.py` — `process_results`(raw_results) function | Dev | 45 min | Function takes raw Google JSON, returns list of clean `BusinessModel` dicts |
| **2.16** | Implement city extraction from address_components array | Dev | 20 min | Test: pass a raw Google result → city field correctly populated |
| **2.17** | Implement TYPE_MAP and `map_type`() function | Dev | 15 min | Test: `map_type`(["tutoring_service"]) returns "Coaching Centre" |
| **2.18** | Implement `maps_link` builder from place_id | Dev | 10 min | Output URL opens correct business in Google Maps |
| **2.19** | Implement null safety — all Optional fields default to None, not empty string | Dev | 10 min | Test with a result missing phone → phone field is None not "" |

## **3.5  API Endpoints**

***Phase 2  —  API Endpoints**   (Day 4)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **2.20** | Create `models/business.py` — `BusinessModel` Pydantic class | Dev | 15 min | No import error. Fields match Schema doc exactly. |
| **2.21** | Create `models/response.py` — `SearchResponse` Pydantic class | Dev | 10 min | No import error. |
| **2.22** | Create `routes/search.py` — GET `/api/search` endpoint: validate input → check cache → call Google → process → save cache → return `SearchResponse` | Dev | 60 min | Postman GET `/api/search`?keyword=institute&location=Jharkhand → HTTP 200 with results array |
| **2.23** | Add rate limiting to `/api/search` — max 30 requests/minute per IP using `slowapi` | Dev | 15 min | Send 31 rapid requests in Postman → 31st returns HTTP 429 |
| **2.24** | Create `routes/export.py` — GET `/api/export` endpoint: read from cache → apply city/type filters → Pandas CSV → return file | Dev | 45 min | Postman GET `/api/export` → Downloads a valid .csv file with correct headers |
| **2.25** | Add error handlers — 400 for bad input, 500 for Google API failure, 503 for quota exceeded | Dev | 20 min | Test: send empty keyword → HTTP 400 with clean error message |
| **2.26** | Register both routes in `main.py`. Add `/api/health` endpoint returning {"status":"ok"} | Dev | 10 min | Postman GET `/api/health` → {"status":"ok"} |
| **2.27** | Full backend test in Postman: search → verify 60 results → export → open CSV in Excel | Dev | 20 min | CSV opens in Excel with correct columns and real data. No broken fields. |
| **2.28** | Git commit: "feat: backend core complete" | Dev | 5 min | `git log` shows commit on main |

# **4. Phase 3  —  Frontend Core**

Build the React frontend. Use mock/hardcoded data first — connect to real backend only in Phase 4. This keeps frontend development fast and independent.

All frontend work happens inside the `frontend/` folder.

## **4.1  React Project Setup**

***Phase 3  —  React Project Setup**   (Day 5 morning)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **3.1** | Inside `frontend/` run: `npm create vite@latest . -- --template react` | Dev | 5 min | `src/` folder appears with `App.jsx` and `main.jsx` |
| **3.2** | Install dependencies: `npm install axios @tanstack/react-table `react-hot-toast` lucide-react` | Dev | 5 min | node_modules/ created. No red errors. |
| **3.3** | Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p` | Dev | 10 min | tailwind.config.js and postcss.config.js appear |
| **3.4** | Configure tailwind.config.js content paths. Add Tailwind directives to index.css | Dev | 5 min | Run: `npm run dev` → app loads at localhost:5173 without errors |
| **3.5** | Add Google Fonts import in index.html: DM Sans + DM Mono | Dev | 5 min | Inspect browser → Network tab shows fonts loading from fonts.googleapis.com |
| **3.6** | Create `frontend/.env` with `VITE_API_BASE_URL`=`http://localhost:8000` | Dev | 3 min | File exists with correct URL |
| **3.7** | Clean up `App.jsx` — remove Vite boilerplate. Set up basic page structure with header zone and main zone. | Dev | 10 min | Browser shows blank page with tool name "BizScraper Pro" in DM Sans font |

## **4.2  Components**

***Phase 3  —  Components**   (Day 5 afternoon + Day 6)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **3.8** | Create `components/SearchBar.jsx` — two text inputs + Search button. Controlled inputs with `useState`. Calls `onSearch`(keyword, location) prop on button click. | Dev | 45 min | Typing in inputs updates state. Button click fires `onSearch` with correct values. Red border appears if field is empty. |
| **3.9** | Create `components/LoadingSpinner.jsx` — centered spinner with "Searching..." text below | Dev | 15 min | Spinner renders correctly when visible prop is true |
| **3.10** | Create `components/FilterChips.jsx` — receives cities[] and types[] arrays as props. Renders multi-select chips for each. Calls `onFilterChange`(selectedCities, selectedTypes) on every chip click. | Dev | 60 min | Click multiple city chips → all selected chips show active state. "All" chip deselects others. |
| **3.11** | Create `components/ResultsTable.jsx` — receives results[] array as prop. Renders table with all columns from UI/UX doc. Phone/PIN in DM Mono. Type badge with correct colour per type. Long text truncated with title attribute. | Dev | 90 min | Pass mock data array → table renders all rows correctly. Badges show correct colours. Long names truncated. |
| **3.12** | Create `components/ExportButton.jsx` — ghost button. Calls `onExport`() prop on click. Shows download icon from `lucide-react`. | Dev | 15 min | Button renders with correct ghost style. Click fires `onExport`. |
| **3.13** | Create `components/EmptyState.jsx` — centered message for no results | Dev | 10 min | Renders correctly when passed visible prop |

## **4.3  App State & Logic**

***Phase 3  —  App State & Logic**   (Day 7)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **3.14** | In `App.jsx` — define state: results[], filteredResults[], isLoading, error, selectedCities Set, selectedTypes Set, uiState (IDLE/LOADING/RESULTS/EMPTY/ERROR) | Dev | 30 min | All state variables defined with `useState`. No errors in console. |
| **3.15** | Create services/api.js — `searchBusinesses`(keyword, location) and `exportCSV`(keyword, location, cities, types) functions using Axios. Read base URL from import.meta`.env`.`VITE_API_BASE_URL` | Dev | 30 min | File exists with both functions. No import errors. |
| **3.16** | Wire `handleSearch`() in `App.jsx` — sets LOADING state, calls api.`searchBusinesses`(), on success sets results and RESULTS state, on error sets ERROR state and shows toast | Dev | 30 min | Use mock data first: setTimeout 1.5s then set fake results → table appears after delay |
| **3.17** | Wire `handleFilterChange`() in `App.jsx` — receives selectedCities and selectedTypes from FilterChips, filters results array client-side, updates filteredResults | Dev | 20 min | Clicking chips in FilterChips → ResultsTable re-renders with correct filtered rows |
| **3.18** | Wire `handleExport`() in `App.jsx` — calls api.`exportCSV`() with active filters. Browser triggers file download. | Dev | 15 min | Click Export with mock data → CSV file downloads (test with blob URL first) |
| **3.19** | Add `react-hot-toast` for error/success notifications. Style toast to match app theme. | Dev | 15 min | Simulate error state → toast appears in correct position with correct message |
| **3.20** | Git commit: "feat: frontend core complete" | Dev | 5 min | `git log` shows commit |

# **5. Phase 4  —  Integration & Testing**

Connect the frontend to the real backend. Both must be running simultaneously. Test every user flow from the App Flow document end-to-end.

***Phase 4  —  Integration & Testing**   (2 days)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **4.1** | Start backend: cd backend && `uvicorn main:app --reload` (port 8000). Start frontend: cd frontend && `npm run dev` (port 5173). Both running in separate terminals. | Dev | 5 min | Both terminals show no errors. localhost:5173 and localhost:8000/docs both open in browser. |
| **4.2** | Replace mock data in `handleSearch`() with real api.`searchBusinesses`() call. | Dev | 15 min | Search "institute" in "Jharkhand" → real results appear in table after loading spinner |
| **4.3** | Verify filter chips auto-generate from real data — cities and types come from actual API response. | Dev | 10 min | Filter chips show real city names (Jamshedpur, Ranchi, Dhanbad etc) — not hardcoded |
| **4.4** | Test multi-select city filter — select 2+ cities simultaneously → table filters correctly. | Dev | 10 min | Selecting Jamshedpur + Ranchi shows rows from both cities only |
| **4.5** | Test multi-select type filter — select 2+ types → table filters correctly. | Dev | 10 min | Selecting Coaching Centre + College shows only those rows |
| **4.6** | Test combined city + type filter — results match both conditions simultaneously. | Dev | 10 min | Jamshedpur + Coaching Centre → only Jamshedpur coaching centres shown |
| **4.7** | Test CSV export — click Download with active filters → CSV downloads → open in Excel → verify filtered rows only. | Dev | 10 min | CSV has correct headers. Only filtered rows present. Opens without formatting errors in Excel. |
| **4.8** | Test "Clear filters" — all chips deselect → full result set restored → count resets to total. | Dev | 5 min | Table shows all rows after clearing filters |
| **4.9** | Test cache — run same search twice → second search returns faster (from SQLite cache). | Dev | 5 min | Second search visibly faster. Backend terminal shows "cache hit" log. |
| **4.10** | Test empty inputs — click Search with blank fields → red borders + error text appear. No API call made. | Dev | 5 min | No network request fires in browser DevTools when inputs are empty |
| **4.11** | Test with a keyword that returns 0 results — e.g. "zxqw" in "Jharkhand". | Dev | 5 min | Empty state message appears. No crash. No spinner stuck. |
| **4.12** | Test rapid double-click on Search button — only one API call fires. | Dev | 5 min | Browser DevTools Network tab shows only one request per search |
| **4.13** | Test API down scenario — stop backend, try search → error toast appears. Restart backend → search works again. | Dev | 5 min | Toast shows user-friendly error. App does not crash or show blank screen. |
| **4.14** | Test different keywords — "cafes", "hospital", "gym", "hotel" in different cities. Verify results and type badges correct. | Dev | 15 min | All keywords return results. Type badges match correct categories for each. |
| **4.15** | Fix any bugs found in 4.2–4.14. Re-test each fixed item. | Dev | Variable | All items 4.2–4.14 pass without issues. |
| **4.16** | Git commit: "feat: integration complete — all flows tested" | Dev | 5 min | `git log` shows commit |

# **6. Phase 5  —  Polish & Edge Cases**

Apply the UI/UX design doc rules. Eliminate every AI-generated pattern. Handle all edge cases from the App Flow document.

## **6.1  UI Polish**

***Phase 5  —  UI Polish**   (Day 9)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **5.1** | Audit every colour in the app — remove any purple, gradient, glow, or shadow. Only 5 palette colours allowed. | Dev | 20 min | Inspect → Styles panel shows only palette hex values. No box-shadow anywhere. |
| **5.2** | Verify DM Sans loads for all text. DM Mono loads for phone and pincode cells only. | Dev | 10 min | DevTools Computed styles shows DM Sans on body text, DM Mono on phone/pincode cells |
| **5.3** | Check all HTML is semantic — main, section, article, thead, tbody, th[scope=col] used correctly. Remove unnecessary wrapper divs. | Dev | 20 min | DevTools Elements panel shows semantic structure. No div soup. |
| **5.4** | Add fade-in animation on results table only — CSS opacity 0 → 1 over 200ms on mount. Remove any other animations. | Dev | 10 min | Table fades in smoothly. Nothing else animates. |
| **5.5** | Replace any emoji in UI with Lucide React icons. Verify Search button has search icon, Export button has download icon. | Dev | 10 min | No emoji visible anywhere in the UI. |
| **5.6** | Check spacing: 48px page padding, 32px between zones, 40px input height, 44px table row height, 8px chip gap. Adjust as needed. | Dev | 20 min | DevTools box model matches specified values for each element |
| **5.7** | Verify type badge colours: Coaching=blue, College=green, University=purple, School=amber, Business=grey. | Dev | 10 min | Each badge type shows correct colour in real search results |
| **5.8** | Check active filter summary text updates correctly on every filter change. | Dev | 5 min | Summary shows correct city + type + count after every chip click |

## **6.2  Accessibility**

***Phase 5  —  Accessibility**   (Day 9 afternoon)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **5.9** | Add `aria-label` to Search button: `aria-label`="Search for `businesses`" | Dev | 5 min | Inspect button → `aria-label` attribute present with correct value |
| **5.10** | Add `aria-label` to Export button: `aria-label`="Download filtered results as CSV" | Dev | 5 min | Inspect button → `aria-label` attribute present |
| **5.11** | Add `role`="checkbox" `aria-checked`={isActive} to each filter chip | Dev | 10 min | Inspect chip → `role` and `aria-checked` attributes present and toggle correctly |
| **5.12** | Add `aria-live`="polite" to results container — screen reader announces new results | Dev | 5 min | Attribute visible on results wrapper div in DevTools |
| **5.13** | Add `aria-describedby` to empty inputs linking to error message paragraph | Dev | 10 min | Inspect input → `aria-describedby` points to correct error element id |
| **5.14** | Verify keyboard tab order: Location → Keyword → Search → first chip → table rows | Dev | 10 min | Tab through entire UI without mouse — focus moves in correct order with visible ring |
| **5.15** | Check colour contrast on all text using browser DevTools Accessibility panel — all must pass WCAG AA (4.5:1) | Dev | 10 min | DevTools shows no contrast failures |

## **6.3  Edge Case Handling**

***Phase 5  —  Edge Cases**   (Day 10)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **5.16** | Handle business name with special characters (&, <, >) — verify renders correctly in table and CSV | Dev | 10 min | Name with & shows correctly. Not escaped as &amp; in table. |
| **5.17** | Handle very long business names — verify ellipsis truncation in table + full name in title attribute + full name in CSV | Dev | 10 min | Hover over truncated name → tooltip shows full name |
| **5.18** | Handle null phone/email/website — verify "—" placeholder shown, not blank or "null" | Dev | 10 min | Search returns a result with no phone → cell shows "—" |
| **5.19** | Handle CSV download with 0 filtered rows — file downloads with headers only, no crash | Dev | 5 min | CSV file opens in Excel with headers. Empty body. No error. |
| **5.20** | Remove all console.log statements from frontend code | Dev | 10 min | Browser console shows no logs during normal use |
| **5.21** | Verify `.env` values never appear in browser — open DevTools → Sources → check no API key visible | Dev | 5 min | No `GOOGLE_API_KEY` string visible anywhere in frontend source |
| **5.22** | Git commit: "feat: polish + edge cases complete" | Dev | 5 min | `git log` shows commit |

# **7. Phase 6  —  Deployment**

Deploy backend to Render and frontend to Vercel. Update environment variables for production. Final end-to-end test on live URLs.

## **7.1  Backend Deploy (Render)**

***Phase 6  —  Backend Deploy — Render**   (Day 11 morning)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **6.1** | Create `Procfile` in `backend/`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT` | Dev | 5 min | File exists with correct content |
| **6.2** | Push all code to GitHub: `git add . && git commit -m "chore: ready for deploy" && git push` | Dev | 5 min | GitHub repo shows all latest files |
| **6.3** | Go to render.com → New Web Service → connect GitHub repo → select `backend/` as root directory | Dev | 10 min | Render dashboard shows service being created |
| **6.4** | Set environment variables in Render dashboard: `GOOGLE_API_KEY`, `CACHE_EXPIRY_HOURS`, `MAX_RESULTS`, `ALLOWED_ORIGIN` (set to Vercel URL — update after frontend deploy) | Dev | 10 min | All 4 env vars visible in Render Environment tab |
| **6.5** | Wait for Render deploy to complete. Check deploy logs for errors. | Dev | 5 min | Render logs show "Application startup complete". No errors. |
| **6.6** | Test live backend in Postman: GET `https://your-app.onrender.com`/api/health`` → {"status":"ok"} | Dev | 5 min | Health endpoint returns 200 OK |
| **6.7** | Test search endpoint on live backend: GET `https://your-app.onrender.com`/api/search`?keyword=cafe&location=Jamshedpur` | Dev | 10 min | Returns real results JSON. No 500 errors. |

## **7.2  Frontend Deploy (Vercel)**

***Phase 6  —  Frontend Deploy — Vercel**   (Day 11 afternoon)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **6.8** | Update frontend/`.env.production`: `VITE_API_BASE_URL`=`https://your-app.onrender.com` | Dev | 3 min | File updated with live Render URL |
| **6.9** | Go to vercel.com → New Project → Import GitHub repo → set `frontend/` as root directory | Dev | 10 min | Vercel dashboard shows project being built |
| **6.10** | Add env variable in Vercel dashboard: `VITE_API_BASE_URL` = live Render backend URL | Dev | 5 min | Variable visible in Vercel Environment Variables tab |
| **6.11** | Wait for Vercel deploy. Check build logs for errors. | Dev | 5 min | Build log shows "Build Completed". Deployment URL generated. |
| **6.12** | Update `ALLOWED_ORIGIN` in Render env vars to the Vercel production URL. Trigger Render redeploy. | Dev | 5 min | Render redeployed with correct CORS origin |

## **7.3  Final Production Testing**

***Phase 6  —  Final Production Testing**   (Day 11 evening)*

| **Step** | **Task** | **Who** | **Est. Time** | **Verify By** |
| --- | --- | --- | --- | --- |
| **6.13** | Open live Vercel URL in browser. Verify page loads with correct fonts and styling. | Dev | 5 min | Page looks identical to localhost version. No broken styles. |
| **6.14** | Run full happy path on production: search "institute" in "Jharkhand" → results → filter → download CSV | Dev | 15 min | All steps work on live URL. CSV downloads correctly. |
| **6.15** | Test on Chrome, Firefox, and Edge browsers. | Dev | 15 min | Tool works correctly in all three browsers |
| **6.16** | Share Vercel URL with sir for review. | Dev | 2 min | Sir can open and use the tool from the link |
| **6.17** | Git tag the release: `git tag v1.0.0 && git push --tags` | Dev | 3 min | GitHub shows v1.0.0 tag in releases |

# **8. Pre-Coding Checklist**

Run through this checklist before writing the first line of code. Every item must be checked.

- [ ] Node.js v18+ installed and verified (`node --version`)

- [ ] Python 3.11+ installed and verified (`python --version`)

- [ ] Git installed (`git --version`)

- [ ] VS Code installed with Python and ESLint extensions

- [ ] Postman installed

- [ ] GitHub repo created: bizscraper-pro (private)

- [ ] Google Cloud account created

- [ ] Google Places API enabled in Cloud Console

- [ ] Google API key generated and tested in browser — returns real data

- [ ] Project folder structure created: `frontend/` and `backend/`

- [ ] `.gitignore` created — includes `.env`, __pycache__, node_modules, *.db

- [ ] Initial git commit pushed to GitHub

# **9. Definition of Done**

The project is complete only when every item below is checked. Nothing ships until all pass.

- [ ] User can search any keyword + location and receive real Google data

- [ ] Results appear in a sortable table with all defined columns

- [ ] Filter chips auto-generate from real data — no hardcoded values

- [ ] Multi-select city and type filters work correctly with AND logic

- [ ] "Clear filters" resets all active filters and restores full results

- [ ] Active filter summary text updates on every chip click

- [ ] CSV export downloads only currently filtered rows

- [ ] CSV filename is auto-generated: keyword_location_date.csv

- [ ] CSV opens correctly in Excel with no formatting errors

- [ ] Empty state message shown when 0 results returned or all rows filtered out

- [ ] All error states show user-friendly toast — no technical messages

- [ ] Null fields show "—" in table — no blank cells or "null" strings

- [ ] Search button disabled during loading — no double requests

- [ ] Google API key not visible anywhere in frontend source code

- [ ] No console.log statements in production build

- [ ] No box-shadow, gradient, or glassmorphism anywhere in UI

- [ ] All text passes WCAG AA contrast ratio (4.5:1)

- [ ] Keyboard navigation works through entire UI

- [ ] Tool works on Chrome, Firefox, and Edge

- [ ] Live URL shared with sir and working end-to-end

# **10. Recommended Daily Build Order**

Follow this exact order. Each day builds on the previous one.

| Day | Objective / Deliverable |
| --- | --- |
| **Day 1** | Phase 1 complete — all tools installed, Google API key tested, GitHub repo set up |
| **Day 2** | Phase 2.1–2.11 — FastAPI running, SQLite tables created, cache functions working |
| **Day 3** | Phase 2.12–2.19 — Google Places service and data processor complete, tested in Python shell |
| **Day 4** | Phase 2.20–2.28 — All API endpoints complete, tested in Postman, CSV downloads from backend |
| **Day 5** | Phase 3.1–3.13 — React project set up, all components built with mock data |
| **Day 6** | Continue Phase 3 if components need more time. No rushing — get components right first. |
| **Day 7** | Phase 3.14–3.20 — App state wired up, all mock flows working end-to-end in browser |
| **Day 8** | Phase 4.1–4.16 — Real backend connected, all integration tests passing |
| **Day 9** | Phase 5.1–5.22 — UI polished, accessibility added, edge cases handled |
| **Day 10** | Buffer day — fix anything from Phase 5 that needs extra time. Re-test everything. |
| **Day 11** | Phase 6.1–6.17 — Deploy backend to Render, frontend to Vercel. Final live test. Share link. |

BizScraper Pro  ·  Implementation Plan v1.0  ·  Confidential
