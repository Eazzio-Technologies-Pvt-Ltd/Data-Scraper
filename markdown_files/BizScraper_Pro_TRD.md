**BizScraper Pro**
Technical Requirements Document (TRD)
Version 1.0  ·  July 2025

| Attribute | Details |
| --- | --- |
| **Document** | Technical Requirements Document |
| **Product** | BizScraper Pro — Local Business Data Extractor |
| **Author** | Development Team |
| **Status** | Draft — Pending Review |
| **Stack** | React.js · Python FastAPI · Google Places API |
| **Version** | 1.0 — Initial Release |

# **1. Document Overview**

This Technical Requirements Document (TRD) defines the complete technical blueprint for BizScraper Pro. It covers the finalized tech stack, all tools and libraries, third-party APIs, system architecture, data flow, and technical constraints. This document is the reference for all development decisions made during the build.

Every technology choice in this document has been made based on three criteria: speed of development, reliability in production, and ease of maintenance for the team.

# **2. Tech Stack**

BizScraper Pro uses a decoupled architecture — a React frontend communicates with a Python FastAPI backend via REST API. The backend handles all scraping and data processing; the frontend handles display and interaction only.

## **2.1  Frontend**

| **Technology** | **Version** | **Purpose** |
| --- | --- | --- |
| React.js | v18+ | Core UI framework — component-based, fast, widely supported |
| Tailwind CSS | v3+ | Utility-first styling — fast to build professional UI without custom CSS |
| Axios | v1+ | HTTP client — makes API calls from frontend to backend cleanly |
| TanStack Table | v8+ | Powerful headless table — handles sort, filter, and pagination |
| React Hot Toast | v2+ | Clean toast notifications for success, error, and loading states |
| Vite | v5+ | Build tool — faster than Create React App, modern and lightweight |

## **2.2  Backend**

| **Technology** | **Version** | **Purpose** |
| --- | --- | --- |
| Python | 3.11+ | Core backend language — clean syntax, best scraping ecosystem |
| FastAPI | v0.110+ | Web framework — modern, async, auto-generates API docs |
| Uvicorn | v0.29+ | ASGI server — runs FastAPI in production and development |
| Requests | v2.31+ | HTTP library — calls Google Places API from the backend |
| Pandas | v2+ | Data processing — cleans results and exports to CSV in one line |
| python-dotenv | v1+ | Loads .env variables — keeps API keys out of source code |
| BeautifulSoup4 | v4.12+ | Backup HTML parser — used if direct scraping is needed |
| HTTPX | v0.27+ | Async HTTP client — faster than Requests for concurrent calls |

## **2.3  Scraping Layer**

| **Method** | **Type** | **When Used** |
| --- | --- | --- |
| Google Places Text Search API | Primary | All standard searches — keyword + location queries |
| Google Place Details API | Primary | Fetching phone, website, email per business place_id |
| BeautifulSoup4 | Backup | If API quota is hit — parses publicly available HTML data |
| Playwright (Python) | Future v2 | Deep scraping of dynamic Google Maps pages if needed |

## **2.4  Database**

| **Technology** | **Type** | **Purpose** |
| --- | --- | --- |
| SQLite | File-based DB | Stores recent search results locally — no server setup needed |
| SQLAlchemy | ORM | Python ORM to interact with SQLite cleanly without raw SQL |

Note: Database is optional for Version 1.0. It is included to cache results so repeated searches do not re-call the Google API unnecessarily.

## **2.5  Dev Tools**

| Tool | Purpose / Usage |
| --- | --- |
| **VS Code** | Primary code editor — best extension support for Python and React |
| **Postman** | API testing — test backend endpoints before connecting to frontend |
| **Git + GitHub** | Version control — save and track all code changes |
| **.env file** | Environment variables — store API keys securely, never in code |
| **ESLint + Prettier** | Code formatting and linting for the React frontend |
| **Black** | Python code formatter — keeps backend code clean and consistent |

## **2.6  Deployment**

| **Service** | **What it hosts** | **Plan** |
| --- | --- | --- |
| Vercel | React frontend | Free tier — auto-deploys from GitHub on every push |
| Render | Python FastAPI backend | Free tier — spins up on request, sleeps when idle |
| GitHub | Full codebase | Free — private repository for the team |

# **3. Third-Party APIs**

## **3.1  Google Places API  (Primary Data Source)**

| Attribute / Field | Description / Details |
| --- | --- |
| **Provider** | Google Cloud Platform |
| **Console** | console.cloud.google.com |
| **Authentication** | API Key — stored in backend .env file only |
| **Cost** | Free $200 credit/month — enough for ~5,000–10,000 searches |
| **Rate Limit** | 10 requests/second, 100,000 requests/day |
| **Data Format** | JSON response |

### **Endpoints Used**

| **Endpoint** | **Method** | **Purpose** |
| --- | --- | --- |
| places/textsearch/json | GET | Search businesses by keyword + location — returns up to 20 results per page |
| places/details/json | GET | Get full details for one business by place_id (phone, website, hours) |
| places/textsearch/json?pagetoken= | GET | Fetch next page of results — up to 3 pages = 60 total results |

### **Sample API Call**

GET https://maps.googleapis.com/maps/api/place/textsearch/json
    ?query=institute+in+Jharkhand
    &key=YOUR_API_KEY

### **Response Fields Used**

| **API Field** | **Mapped To** | **Notes** |
| --- | --- | --- |
| name | Business Name | Direct mapping |
| formatted_address | Address + City + Pincode | Parsed to extract city and pincode separately |
| formatted_phone_number | Phone | From Place Details call |
| website | Website | From Place Details call |
| rating | Rating | Out of 5.0 |
| types[ ] | Category / Type | First relevant type used as display category |
| place_id | Google Maps Link | Used to construct maps.google.com/?place_id= link |
| geometry.location | Lat / Long | Stored for future map view feature |

# **4. System Architecture**

BizScraper Pro follows a clean 3-layer architecture. Each layer has one responsibility and communicates only with the layer directly next to it.

## **4.1  Architecture Layers**

| **Layer** | **Technology** | **Responsibility** |
| --- | --- | --- |
| Presentation Layer | React.js + Tailwind CSS | Renders the UI, handles user input, displays results and filters |
| Application Layer | Python FastAPI | Receives requests, calls Google API, processes and returns data |
| Data Layer | Google Places API + SQLite | Source of truth for business data, caches results locally |

## **4.2  Data Flow**

| Step | Action |
| --- | --- |
| **Step 1** | User types location + keyword in the React frontend and clicks Search |
| **Step 2** | React sends a GET request to the FastAPI backend: /api/search?keyword=institute&location=Jharkhand |
| **Step 3** | FastAPI checks SQLite cache — if result exists and is fresh (under 24hrs), return it immediately |
| **Step 4** | If not cached, FastAPI calls Google Places Text Search API with the keyword + location |
| **Step 5** | Google returns up to 20 results — FastAPI paginates to get all 3 pages (60 results total) |
| **Step 6** | For each result, FastAPI calls Google Place Details API to get phone, website, and email |
| **Step 7** | FastAPI processes the data — extracts city from address, builds Maps link, cleans fields |
| **Step 8** | Cleaned data is saved to SQLite cache and returned to React as a JSON array |
| **Step 9** | React displays results in a table — filter chips built automatically from the data |
| **Step 10** | User applies filters — React filters the array client-side (no new API call) |
| **Step 11** | User clicks Download CSV — Pandas generates CSV from currently filtered data only |

# **5. Project Folder Structure**

The codebase is split into two separate folders — frontend and backend. This keeps concerns fully separated and makes each part independently deployable.

## **5.1  Full Structure**

| Path / File | Description |
| --- | --- |
| **bizscraper-pro/** | Root project folder |
| **├── frontend/** | React.js application |
| **│   ├── src/** | All source files |
| **│   │   ├── components/** | Reusable UI components |
| **│   │   │   ├── SearchBar.jsx** | Location + keyword input + search button |
| **│   │   │   ├── ResultsTable.jsx** | Main data table with sort support |
| **│   │   │   ├── FilterChips.jsx** | Multi-select city and type filter chips |
| **│   │   │   ├── ExportButton.jsx** | Download CSV button logic |
| **│   │   │   └── LoadingSpinner.jsx** | Loading state UI |
| **│   │   ├── services/** | API call functions |
| **│   │   │   └── api.js** | Axios calls to FastAPI backend |
| **│   │   ├── utils/** | Helper functions |
| **│   │   │   └── csvExport.js** | CSV generation logic |
| **│   │   ├── App.jsx** | Root component — manages global state |
| **│   │   └── main.jsx** | React entry point |
| **│   ├── .env** | Frontend env variables (backend URL only) |
| **│   └── vite.config.js** | Vite build configuration |
| **├── backend/** | Python FastAPI application |
| **│   ├── routes/** | API route definitions |
| **│   │   └── search.py** | GET /api/search endpoint |
| **│   ├── services/** | Business logic |
| **│   │   ├── google_places.py** | All Google API calls |
| **│   │   └── data_processor.py** | Cleans and formats API response |
| **│   ├── models/** | Data models |
| **│   │   └── business.py** | Business data schema (Pydantic) |
| **│   ├── database/** | SQLite cache layer |
| **│   │   └── cache.py** | Read and write search cache |
| **│   ├── main.py** | FastAPI app entry point |
| **│   ├── .env** | Backend env — stores GOOGLE_API_KEY |
| **│   └── requirements.txt** | All Python dependencies |
| **└── README.md** | Setup and run instructions |

# **6. Backend API Endpoints**

The FastAPI backend exposes two endpoints to the React frontend. All responses are in JSON format.

## **6.1  Search Endpoint**

| Attribute / Field | Description / Details |
| --- | --- |
| **Method** | GET |
| **URL** | /api/search |
| **Parameters** | keyword (string, required) · location (string, required) |
| **Example** | /api/search?keyword=institute&location=Jharkhand |
| **Response** | JSON array of business objects |
| **Cache** | Results cached in SQLite for 24 hours |
| **Error** | Returns { error: "message" } with HTTP 400 or 500 status |

## **6.2  Export Endpoint**

| Attribute / Field | Description / Details |
| --- | --- |
| **Method** | GET |
| **URL** | /api/export |
| **Parameters** | keyword, location, cities (optional), types (optional) |
| **Example** | /api/export?keyword=institute&location=Jharkhand&cities=Jamshedpur |
| **Response** | CSV file download (Content-Disposition: attachment) |
| **Filename** | keyword_location_YYYY-MM-DD.csv — e.g. institute_jharkhand_2025-07-10.csv |

## **6.3  Business Object Schema**

| Step | Actor | Description | Notes |
| --- | --- | --- | --- |
| **Field** | **Type** | **Source** | **Notes** |
| name | string | Google Places | Full business name |
| address | string | Google Places | Full formatted address |
| city | string | Parsed from address | Extracted using address components |
| state | string | Google Places | e.g. Jharkhand |
| pincode | string | Parsed from address | Last 6-digit number in address |
| phone | string | Place Details API | May be null if not listed |
| email | string | Place Details API | May be null — not always available |
| website | string | Place Details API | May be null if not listed |
| rating | float | Google Places | Out of 5.0, null if no ratings |
| type | string | Google Places types[] | First relevant category tag |
| maps_link | string | Built from place_id | Direct Google Maps URL |

# **7. Technical Constraints**

## **7.1  Google API Constraints**

| **Constraint** | **Limit** | **How We Handle It** |
| --- | --- | --- |
| Results per page | 20 results max | Paginate 3 times using next_page_token to get 60 total |
| Total results per search | 60 results max | Documented limitation — shown to user in UI |
| Place Details calls | 1 call per business | Batched carefully — 60 results = 60 detail calls |
| API rate limit | 10 requests/second | Add 2-second delay between page fetches as required by Google |
| Free credit | $200/month | SQLite cache prevents re-calling API for same search |
| Email availability | Rarely provided | Email field shown as empty if not available — not scraped illegally |
| Data freshness | Real-time from Google | Cache expires after 24 hours to keep data fresh |

## **7.2  Technical Constraints**

| **Constraint** | **Type** | **Detail** |
| --- | --- | --- |
| API key exposure | Security | Google API key must NEVER appear in frontend code — backend only, .env file |
| CORS policy | Security | FastAPI must whitelist only the frontend domain to prevent unauthorized API use |
| Browser only | Platform | Tool runs in desktop browser — Chrome, Firefox, Edge — mobile is nice-to-have |
| No auth in v1 | Scope | No login system — tool is open to anyone with the URL in v1 |
| CSV only export | Scope | Only CSV export in v1 — Excel (.xlsx) export is a future enhancement |
| India-focused | Scope | Optimised for Indian cities and business types in v1 |
| Internet required | Dependency | Tool requires active internet — no offline mode |
| Python 3.11+ | Environment | Backend requires Python 3.11 or higher for full async support |
| Node 18+ | Environment | Frontend build requires Node.js 18 or higher |

## **7.3  Known Limitations**

**•** Google Places does not always return email addresses — this field will often be empty.
**•** Maximum 60 results per search — this is a hard Google API limitation, not a tool limitation.
**•** Business data accuracy depends entirely on how up-to-date Google Maps data is.
**•** The 2-second delay between API pages means searches may take 4–6 seconds for full 60 results.
**•** Render free tier backend may take 30–50 seconds to wake up after being idle.
**•** SQLite is not suitable for multiple concurrent users — upgrade to PostgreSQL for team scaling.

# **8. Security Requirements**

## **8.1  API Key Management**

| Attribute / Field | Description / Details |
| --- | --- |
| **Storage** | Google API key stored in backend .env file only — never committed to GitHub |
| **.gitignore** | .env must be listed in .gitignore — confirmed before first commit |
| **Frontend** | Frontend has NO direct access to Google API — all calls go through FastAPI backend |
| **Rotation** | If API key is accidentally exposed, rotate it immediately in Google Cloud Console |

## **8.2  Backend Security**

| Security Aspect | Implementation Details |
| --- | --- |
| **CORS** | Only the frontend domain is whitelisted — blocks unauthorized API calls |
| **Rate limiting** | FastAPI middleware limits to 30 requests/minute per IP to prevent abuse |
| **Input validation** | All query parameters validated with Pydantic — rejects malformed input |
| **Error messages** | Stack traces never sent to frontend — only clean user-friendly error messages |

# **9. Environment Setup**

## **9.1  Prerequisites  (install before starting)**

| **Tool** | **Version** | **Download** |
| --- | --- | --- |
| Node.js | v18+ | nodejs.org |
| Python | 3.11+ | python.org |
| Git | Latest | git-scm.com |
| VS Code | Latest | code.visualstudio.com |
| Postman | Latest | postman.com |

## **9.2  Environment Variables**

### **Backend  (.env)**

| Attribute / Field | Description / Details |
| --- | --- |
| **GOOGLE_API_KEY** | Your Google Places API key from Google Cloud Console |
| **CACHE_EXPIRY_HOURS** | 24 — how long to cache search results before re-fetching |
| **MAX_RESULTS** | 60 — maximum results to fetch per search |
| **ALLOWED_ORIGIN** | http://localhost:5173 (dev) or your Vercel URL (production) |

### **Frontend  (.env)**

| Attribute / Field | Description / Details |
| --- | --- |
| **VITE_API_BASE_URL** | http://localhost:8000 (dev) or your Render backend URL (production) |

## **9.3  Python Dependencies  (requirements.txt)**

| Dependency | Description |
| --- | --- |
| **fastapi** | Web framework |
| **uvicorn[standard]** | ASGI server |
| **requests** | HTTP calls to Google API |
| **httpx** | Async HTTP client |
| **pandas** | Data processing and CSV export |
| **python-dotenv** | Load .env variables |
| **beautifulsoup4** | Backup HTML scraper |
| **sqlalchemy** | SQLite ORM |
| **pydantic** | Data validation and schemas |
| **slowapi** | Rate limiting middleware for FastAPI |

BizScraper Pro · TRD v1.0 · Confidential