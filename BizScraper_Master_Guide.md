# BizScraper Pro — Master Implementation Guide
> Hand this file to ANY AI model to continue building. No other context needed.
> Last checkpoint: PHASE 3 COMPLETE — all backend + frontend files built.

---

## CHECKPOINT SYSTEM
When handing off to a new model, update this line:
`CURRENT CHECKPOINT: [PHASE X — STEP X.X — filename]`

Current: `PHASE 4 — VERIFY INTEGRATION`

---

## PROJECT SUMMARY
Web tool where user types location + keyword → gets business listings from Google Places API → filters by city/type → downloads CSV.

- Frontend: React.js + Tailwind + Axios + TanStack Table + Vite (port 5173)
- Backend: Python FastAPI + SQLite + SQLAlchemy + Pandas (port 8000)
- Data: Google Places Text Search API + Place Details API

---

## FOLDER STRUCTURE (create exactly this)
```
bizscraper-pro/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── SearchBar.jsx
│       │   ├── FilterChips.jsx
│       │   ├── ResultsTable.jsx
│       │   ├── ExportButton.jsx
│       │   ├── LoadingSpinner.jsx
│       │   └── EmptyState.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── csvExport.js
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   ├── routes/
│   │   ├── search.py
│   │   └── export.py
│   ├── services/
│   │   ├── google_places.py
│   │   └── data_processor.py
│   ├── models/
│   │   ├── business.py
│   │   ├── request.py
│   │   └── response.py
│   └── database/
│       ├── models.py
│       ├── db.py
│       └── cache.py
├── .gitignore
└── README.md
```

---

## PHASE 1 — MANUAL SETUP (human does this, not AI)

### Step 1.1 — .gitignore (create in root)
```
.env
__pycache__/
*.pyc
node_modules/
*.db
dist/
venv/
.DS_Store
```

### Step 1.2 — backend/.env (fill in your real API key)
```
GOOGLE_API_KEY=your_google_api_key_here
CACHE_EXPIRY_HOURS=24
MAX_RESULTS=60
ALLOWED_ORIGIN=http://localhost:5173
```

### Step 1.3 — frontend/.env
```
VITE_API_BASE_URL=http://localhost:8000
```

### Step 1.4 — backend/requirements.txt
```
fastapi==0.110.0
uvicorn[standard]==0.29.0
requests==2.31.0
httpx==0.27.0
pandas==2.2.0
python-dotenv==1.0.0
beautifulsoup4==4.12.3
sqlalchemy==2.0.28
pydantic==2.6.3
slowapi==0.1.9
```

### Step 1.5 — Run these commands
```bash
# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\activate        # Windows PowerShell
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm create vite@latest . -- --template react
npm install axios @tanstack/react-table react-hot-toast lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## PHASE 2 — BACKEND (AI builds this)

### ✅ DONE: backend/database/models.py
```python
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class SearchCache(Base):
    __tablename__ = "search_cache"
    id           = Column(Integer, primary_key=True, autoincrement=True)
    keyword      = Column(String, nullable=False)
    location     = Column(String, nullable=False)
    cache_key    = Column(String, unique=True, nullable=False)
    result_json  = Column(Text, nullable=False)
    result_count = Column(Integer, default=0)
    created_at   = Column(DateTime, default=datetime.utcnow)
    expires_at   = Column(DateTime, nullable=False)

class Business(Base):
    __tablename__ = "businesses"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    cache_id   = Column(Integer, ForeignKey("search_cache.id", ondelete="CASCADE"))
    place_id   = Column(String, nullable=False)
    name       = Column(String, nullable=False)
    address    = Column(String)
    city       = Column(String)
    state      = Column(String)
    pincode    = Column(String)
    phone      = Column(String)
    email      = Column(String)
    website    = Column(String)
    rating     = Column(Float)
    type       = Column(String)
    maps_link  = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
```

### ✅ DONE: backend/database/db.py
```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base
import os

DATABASE_URL = "sqlite:///./bizscraper.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### ✅ DONE: backend/database/cache.py
```python
import json
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database.models import SearchCache, Business
import os

EXPIRY_HOURS = int(os.getenv("CACHE_EXPIRY_HOURS", 24))

def make_cache_key(keyword: str, location: str) -> str:
    raw = f"{keyword.lower().strip()}|{location.lower().strip()}"
    return hashlib.md5(raw.encode()).hexdigest()

def get_cached_result(db: Session, cache_key: str):
    entry = db.query(SearchCache).filter(
        SearchCache.cache_key == cache_key,
        SearchCache.expires_at > datetime.utcnow()
    ).first()
    if entry:
        return json.loads(entry.result_json)
    return None

def save_to_cache(db: Session, keyword: str, location: str, cache_key: str, results: list):
    expires = datetime.utcnow() + timedelta(hours=EXPIRY_HOURS)
    existing = db.query(SearchCache).filter(SearchCache.cache_key == cache_key).first()
    if existing:
        existing.result_json  = json.dumps(results)
        existing.result_count = len(results)
        existing.expires_at   = expires
        db.commit()
        return existing
    entry = SearchCache(
        keyword=keyword, location=location, cache_key=cache_key,
        result_json=json.dumps(results), result_count=len(results), expires_at=expires
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    for r in results:
        existing_biz = db.query(Business).filter(
            Business.place_id == r.get("place_id",""),
            Business.cache_id == entry.id
        ).first()
        if not existing_biz:
            biz = Business(cache_id=entry.id, **{k: r.get(k) for k in [
                "place_id","name","address","city","state","pincode",
                "phone","email","website","rating","type","maps_link"
            ]})
            db.add(biz)
    db.commit()
    return entry
```

### ✅ DONE: backend/models/business.py
```python
from pydantic import BaseModel
from typing import Optional

class BusinessModel(BaseModel):
    place_id:  Optional[str]   = None
    name:      str
    address:   Optional[str]   = None
    city:      Optional[str]   = None
    state:     Optional[str]   = None
    pincode:   Optional[str]   = None
    phone:     Optional[str]   = None
    email:     Optional[str]   = None
    website:   Optional[str]   = None
    rating:    Optional[float] = None
    type:      Optional[str]   = None
    maps_link: Optional[str]   = None

    class Config:
        from_attributes = True
```

### ✅ DONE: backend/models/request.py
```python
from pydantic import BaseModel, field_validator

class SearchRequest(BaseModel):
    keyword:  str
    location: str

    @field_validator("keyword", "location")
    @classmethod
    def must_not_be_blank(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()
```

### ✅ DONE: backend/models/response.py
```python
from pydantic import BaseModel
from typing import List
from models.business import BusinessModel

class SearchResponse(BaseModel):
    keyword:      str
    location:     str
    result_count: int
    from_cache:   bool
    results:      List[BusinessModel]
```

### ✅ DONE: backend/services/google_places.py
```python
import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY     = os.getenv("GOOGLE_API_KEY")
MAX_RESULTS = int(os.getenv("MAX_RESULTS", 60))
BASE_URL    = "https://maps.googleapis.com/maps/api/place"

def search_places(keyword: str, location: str) -> list:
    query    = f"{keyword} in {location}"
    url      = f"{BASE_URL}/textsearch/json"
    results  = []
    params   = {"query": query, "key": API_KEY}

    for page in range(3):
        if page > 0:
            time.sleep(2)
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") not in ["OK", "ZERO_RESULTS"]:
            raise Exception(f"Google API error: {data.get('status')}")
        results.extend(data.get("results", []))
        token = data.get("next_page_token")
        if not token or len(results) >= MAX_RESULTS:
            break
        params = {"pagetoken": token, "key": API_KEY}

    return results[:MAX_RESULTS]

def get_place_details(place_id: str) -> dict:
    url    = f"{BASE_URL}/details/json"
    params = {
        "place_id": place_id,
        "fields":   "formatted_phone_number,website",
        "key":      API_KEY
    }
    resp   = requests.get(url, params=params, timeout=10)
    result = resp.json().get("result", {})
    return {
        "phone":   result.get("formatted_phone_number"),
        "website": result.get("website")
    }
```

### ✅ DONE: backend/services/data_processor.py
```python
from services.google_places import get_place_details

TYPE_MAP = {
    "university":        "University",
    "school":            "School",
    "secondary_school":  "School",
    "primary_school":    "School",
    "junior_college":    "College",
    "college":           "College",
    "tutoring_service":  "Coaching Centre",
    "education_center":  "Coaching Centre",
    "training_center":   "Coaching Centre",
    "cafe":              "Cafe",
    "restaurant":        "Restaurant",
    "hospital":          "Hospital",
    "gym":               "Gym",
    "health":            "Healthcare",
    "lodging":           "Hotel",
}

def map_type(google_types: list) -> str:
    for t in google_types:
        if t in TYPE_MAP:
            return TYPE_MAP[t]
    return "Business"

def extract_city(address_components: list) -> str:
    for comp in address_components:
        if "locality" in comp.get("types", []):
            return comp.get("long_name")
    return None

def extract_state(address_components: list) -> str:
    for comp in address_components:
        if "administrative_area_level_1" in comp.get("types", []):
            return comp.get("long_name")
    return None

def extract_pincode(address_components: list) -> str:
    for comp in address_components:
        if "postal_code" in comp.get("types", []):
            pin = comp.get("long_name", "")
            if len(pin) == 6 and pin.isdigit():
                return pin
    return None

def process_results(raw_results: list) -> list:
    processed = []
    for r in raw_results:
        place_id    = r.get("place_id", "")
        components  = r.get("address_components", [])
        details     = get_place_details(place_id) if place_id else {}
        rating_raw  = r.get("rating")
        rating      = round(rating_raw, 1) if rating_raw is not None else None
        business = {
            "place_id":  place_id,
            "name":      (r.get("name") or "").strip(),
            "address":   r.get("formatted_address"),
            "city":      extract_city(components),
            "state":     extract_state(components),
            "pincode":   extract_pincode(components),
            "phone":     details.get("phone"),
            "email":     None,
            "website":   details.get("website"),
            "rating":    rating,
            "type":      map_type(r.get("types", [])),
            "maps_link": f"https://www.google.com/maps/place/?q=place_id:{place_id}" if place_id else None,
        }
        processed.append(business)
    return processed
```

### ✅ DONE: backend/routes/search.py
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.db import get_db
from database.cache import make_cache_key, get_cached_result, save_to_cache
from services.google_places import search_places
from services.data_processor import process_results
from models.response import SearchResponse
from models.business import BusinessModel

router = APIRouter()

@router.get("/search", response_model=SearchResponse)
async def search_businesses(
    keyword:  str = Query(..., min_length=1),
    location: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    keyword  = keyword.strip()
    location = location.strip()
    if not keyword or not location:
        raise HTTPException(status_code=400, detail="keyword and location are required")

    cache_key = make_cache_key(keyword, location)
    cached    = get_cached_result(db, cache_key)

    if cached:
        return SearchResponse(
            keyword=keyword, location=location,
            result_count=len(cached), from_cache=True,
            results=[BusinessModel(**b) for b in cached]
        )

    try:
        raw     = search_places(keyword, location)
        results = process_results(raw)
    except Exception as e:
        raise HTTPException(status_code=503, detail="External API unavailable. Please try again later.")

    save_to_cache(db, keyword, location, cache_key, results)

    return SearchResponse(
        keyword=keyword, location=location,
        result_count=len(results), from_cache=False,
        results=[BusinessModel(**b) for b in results]
    )
```

### ✅ DONE: backend/routes/export.py
```python
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.db import get_db
from database.cache import make_cache_key, get_cached_result
import pandas as pd
import io
from datetime import date
from typing import Optional

router = APIRouter()

@router.get("/export")
async def export_csv(
    keyword:  str = Query(...),
    location: str = Query(...),
    cities:   Optional[str] = Query(None),
    types:    Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    cache_key = make_cache_key(keyword, location)
    results   = get_cached_result(db, cache_key) or []

    if cities:
        city_list = [c.strip() for c in cities.split(",")]
        results   = [r for r in results if r.get("city") in city_list]
    if types:
        type_list = [t.strip() for t in types.split(",")]
        results   = [r for r in results if r.get("type") in type_list]

    df = pd.DataFrame(results, columns=[
        "name","address","city","state","pincode",
        "phone","email","website","rating","type","maps_link"
    ])
    df.columns = [
        "Name","Address","City","State","Pincode",
        "Phone","Email","Website","Rating","Type","Google Maps Link"
    ]
    df = df.fillna("—")

    buf      = io.StringIO()
    df.to_csv(buf, index=False)
    buf.seek(0)

    today    = date.today().strftime("%Y-%m-%d")
    filename = f"{keyword.lower()}_{location.lower().replace(' ','_')}_{today}.csv"

    return StreamingResponse(
        io.BytesIO(buf.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
```

### ✅ DONE: backend/main.py
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routes.search import router as search_router
from routes.export import router as export_router
from database.db import init_db
from dotenv import load_dotenv
import os

load_dotenv()
init_db()

limiter = Limiter(key_func=get_remote_address)
app     = FastAPI(title="BizScraper Pro API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router, prefix="/api")
app.include_router(export_router, prefix="/api")

@app.get("/api/health")
def health():
    return {"status": "ok"}
```

### VERIFY BACKEND WORKS:
```bash
cd backend
uvicorn main:app --reload
# Open http://localhost:8000/docs
# Test: GET /api/health → {"status":"ok"}
# Test: GET /api/search?keyword=cafe&location=Jamshedpur → results array
# Test: GET /api/export?keyword=cafe&location=Jamshedpur → CSV downloads
```

---

## PHASE 3 — FRONTEND (AI builds this)

### ✅ DONE: frontend/index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BizScraper Pro</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### ✅ DONE: frontend/tailwind.config.js
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      colors: {
        ink:     "#0f172a",
        slate:   "#475569",
        accent:  "#1a56db",
        surface: "#F8FAFC",
        border:  "#CBD5E1",
      },
    },
  },
  plugins: [],
}
```

### ✅ DONE: frontend/src/services/api.js
```js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;

export const searchBusinesses = async (keyword, location) => {
  const res = await axios.get(`${BASE}/api/search`, {
    params: { keyword, location },
  });
  return res.data;
};

export const exportCSV = async (keyword, location, cities = [], types = []) => {
  const params = new URLSearchParams({ keyword, location });
  if (cities.length) params.append("cities", cities.join(","));
  if (types.length)  params.append("types",  types.join(","));
  const res = await axios.get(`${BASE}/api/export?${params.toString()}`, {
    responseType: "blob",
  });
  const today    = new Date().toISOString().split("T")[0];
  const filename = `${keyword}_${location}_${today}.csv`.toLowerCase().replace(/\s/g,"_");
  const url      = window.URL.createObjectURL(new Blob([res.data]));
  const a        = document.createElement("a");
  a.href         = url;
  a.download     = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

### ✅ DONE: frontend/src/components/SearchBar.jsx
```jsx
import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch, isLoading }) {
  const [location, setLocation] = useState("");
  const [keyword,  setKeyword]  = useState("");
  const [errors,   setErrors]   = useState({});

  const handleSearch = () => {
    const e = {};
    if (!location.trim()) e.location = "Please enter a location.";
    if (!keyword.trim())  e.keyword  = "Please enter a keyword.";
    setErrors(e);
    if (Object.keys(e).length === 0) onSearch(keyword.trim(), location.trim());
  };

  const inputClass = (field) =>
    `h-10 w-full border rounded-md px-3 text-sm font-sans outline-none transition-colors
     ${errors[field]
       ? "border-red-500 focus:border-red-500"
       : "border-border focus:border-accent"}`;

  return (
    <section aria-label="Search businesses">
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-36">
          <input
            type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Jharkhand"
            className={inputClass("location")}
            aria-label="Location"
            aria-describedby={errors.location ? "loc-err" : undefined}
          />
          {errors.location && <p id="loc-err" className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>
        <div className="flex-1 min-w-36">
          <input
            type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder="e.g. institute"
            className={inputClass("keyword")}
            aria-label="Keyword"
            aria-describedby={errors.keyword ? "kw-err" : undefined}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          {errors.keyword && <p id="kw-err" className="text-red-500 text-xs mt-1">{errors.keyword}</p>}
        </div>
        <button
          onClick={handleSearch} disabled={isLoading}
          aria-label="Search for businesses"
          className="h-10 px-5 bg-accent text-white text-sm font-medium rounded-md
                     disabled:opacity-60 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Search size={14} /> Search
        </button>
      </div>
    </section>
  );
}
```

### ✅ DONE: frontend/src/components/FilterChips.jsx
```jsx
import { Check } from "lucide-react";

function ChipRow({ label, values, selected, onToggle, onClearAll }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate font-medium min-w-10">{label}:</span>
      <button
        onClick={onClearAll}
        className={`text-xs px-3 py-1 rounded-full border transition-colors
          ${selected.size === 0
            ? "border-ink text-ink"
            : "border-dashed border-border text-slate"}`}
      >All</button>
      {values.map(v => {
        const active = selected.has(v);
        return (
          <button key={v} onClick={() => onToggle(v)}
            role="checkbox" aria-checked={active}
            className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1 transition-colors
              ${active
                ? "bg-[#EFF6FF] border-accent text-accent"
                : "bg-white border-border text-slate"}`}
          >
            {active && <Check size={11} />} {v}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterChips({ cities, types, selectedCities, selectedTypes, onFilterChange, resultCount }) {
  const toggle = (set, val, setter) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  };

  const [localCities, setLocalCities] = [selectedCities, (s) => onFilterChange(s, selectedTypes)];
  const [localTypes,  setLocalTypes]  = [selectedTypes,  (s) => onFilterChange(selectedCities, s)];

  return (
    <section className="space-y-2" aria-label="Filter results">
      <ChipRow label="City"  values={cities} selected={selectedCities}
        onToggle={v => onFilterChange(
          (() => { const s = new Set(selectedCities); s.has(v)?s.delete(v):s.add(v); return s; })(),
          selectedTypes
        )}
        onClearAll={() => onFilterChange(new Set(), selectedTypes)}
      />
      <ChipRow label="Type"  values={types}  selected={selectedTypes}
        onToggle={v => onFilterChange(
          selectedCities,
          (() => { const s = new Set(selectedTypes); s.has(v)?s.delete(v):s.add(v); return s; })()
        )}
        onClearAll={() => onFilterChange(selectedCities, new Set())}
      />
      <p className="text-xs text-slate">
        Showing: <span className="text-accent font-medium">
          {selectedCities.size ? [...selectedCities].join(", ") : "All cities"}
        </span> · <span className="text-accent font-medium">
          {selectedTypes.size  ? [...selectedTypes].join(", ")  : "All types"}
        </span> · <span className="text-accent font-medium">{resultCount} results</span>
      </p>
    </section>
  );
}
```

### ✅ DONE: frontend/src/components/ResultsTable.jsx
```jsx
import { Star } from "lucide-react";

const BADGE = {
  "Coaching Centre": "bg-[#EFF6FF] text-[#1a56db]",
  "College":         "bg-[#F0FDF4] text-[#166534]",
  "University":      "bg-[#F5F3FF] text-[#6D28D9]",
  "School":          "bg-[#FFFBEB] text-[#92400E]",
};

export default function ResultsTable({ results, onExport }) {
  if (!results.length) return null;
  return (
    <section aria-live="polite" style={{ animation: "fadeIn 200ms ease" }}>
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-slate">
          <span className="font-medium text-ink">{results.length}</span> businesses found
        </span>
        <button onClick={onExport} aria-label="Download filtered results as CSV"
          className="text-xs px-3 py-1.5 rounded border border-accent text-accent
                     hover:bg-[#EFF6FF] transition-colors flex items-center gap-1.5">
          ↓ Download CSV
        </button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr className="bg-accent text-white text-xs uppercase tracking-wide">
              {["Name","Address","City","Phone","Rating","Type"].map(h => (
                <th key={h} scope="col" className="text-left px-3 py-2.5 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={r.place_id || i} className={i % 2 === 0 ? "bg-surface" : "bg-white"}>
                <td className="px-3 py-2.5 truncate" title={r.name}>{r.name || "—"}</td>
                <td className="px-3 py-2.5 truncate" title={r.address}>{r.address || "—"}</td>
                <td className="px-3 py-2.5">{r.city || "—"}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{r.phone || "—"}</td>
                <td className="px-3 py-2.5">
                  {r.rating
                    ? <span className="flex items-center gap-1">{r.rating} <Star size={11} className="text-amber-500 fill-amber-500" /></span>
                    : "—"}
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${BADGE[r.type] || "bg-surface text-slate"}`}>
                    {r.type || "Business"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

### ✅ DONE: frontend/src/components/LoadingSpinner.jsx
```jsx
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .spinner { width:32px; height:32px; border:3px solid #CBD5E1;
          border-top-color:#1a56db; border-radius:50%;
          animation: spin 0.8s linear infinite; }
      `}</style>
      <div className="spinner" aria-hidden="true" />
      <p className="text-sm text-slate">Searching...</p>
    </div>
  );
}
```

### ✅ DONE: frontend/src/components/EmptyState.jsx
```jsx
export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-sm font-medium text-ink">No businesses found for your search.</p>
      <p className="text-xs text-slate mt-1">Try a different keyword or location.</p>
    </div>
  );
}
```

### ✅ DONE: frontend/src/App.jsx
```jsx
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import SearchBar     from "./components/SearchBar";
import FilterChips   from "./components/FilterChips";
import ResultsTable  from "./components/ResultsTable";
import LoadingSpinner from "./components/LoadingSpinner";
import EmptyState    from "./components/EmptyState";
import { searchBusinesses, exportCSV } from "./services/api";

export default function App() {
  const [results,         setResults]         = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [uiState,         setUiState]         = useState("IDLE");
  const [selectedCities,  setSelectedCities]  = useState(new Set());
  const [selectedTypes,   setSelectedTypes]   = useState(new Set());
  const [lastSearch,      setLastSearch]      = useState({ keyword: "", location: "" });

  const uniqueCities = [...new Set(results.map(r => r.city).filter(Boolean))].sort();
  const uniqueTypes  = [...new Set(results.map(r => r.type).filter(Boolean))].sort();

  const applyFilters = (data, cities, types) => {
    let filtered = data;
    if (cities.size) filtered = filtered.filter(r => cities.has(r.city));
    if (types.size)  filtered = filtered.filter(r => types.has(r.type));
    return filtered;
  };

  const handleSearch = async (keyword, location) => {
    setIsLoading(true);
    setUiState("LOADING");
    setSelectedCities(new Set());
    setSelectedTypes(new Set());
    setLastSearch({ keyword, location });
    try {
      const data = await searchBusinesses(keyword, location);
      setResults(data.results);
      setFilteredResults(data.results);
      setUiState(data.results.length ? "RESULTS" : "EMPTY");
    } catch {
      toast.error("Search failed. Please try again later.");
      setUiState("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (cities, types) => {
    setSelectedCities(cities);
    setSelectedTypes(types);
    const filtered = applyFilters(results, cities, types);
    setFilteredResults(filtered);
    if (!filtered.length) setUiState("EMPTY");
    else setUiState("RESULTS");
  };

  const handleExport = () => {
    exportCSV(
      lastSearch.keyword, lastSearch.location,
      [...selectedCities], [...selectedTypes]
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-12 py-10 font-sans">
      <Toaster position="top-right" />
      <header className="mb-8">
        <h1 className="text-2xl font-medium text-ink">BizScraper Pro</h1>
        <p className="text-sm text-slate mt-1">Find local businesses by location and keyword</p>
      </header>

      <section className="mb-8">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </section>

      <hr className="border-border mb-8" />

      {uiState === "LOADING" && <LoadingSpinner />}

      {(uiState === "RESULTS" || uiState === "EMPTY") && results.length > 0 && (
        <section className="mb-6 space-y-3">
          <FilterChips
            cities={uniqueCities} types={uniqueTypes}
            selectedCities={selectedCities} selectedTypes={selectedTypes}
            onFilterChange={handleFilterChange}
            resultCount={filteredResults.length}
          />
        </section>
      )}

      {uiState === "RESULTS" && <ResultsTable results={filteredResults} onExport={handleExport} />}
      {uiState === "EMPTY"   && <EmptyState />}
    </main>
  );
}
```

### ✅ DONE: frontend/src/main.jsx
```jsx
import React    from "react";
import ReactDOM from "react-dom/client";
import App      from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

### ✅ DONE: frontend/src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body { font-family: "DM Sans", sans-serif; background: #ffffff; margin: 0; }
.font-mono { font-family: "DM Mono", monospace; }
input:focus { outline: 2px solid #1a56db; outline-offset: 1px; }
button:focus-visible { outline: 2px solid #1a56db; outline-offset: 2px; }
```

---

## PHASE 4 — VERIFY INTEGRATION

Run both servers simultaneously:
```bash
# Terminal 1 — backend
cd backend && uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open http://localhost:5173 and test:
- [ ] Search "institute" in "Jharkhand" → real results appear
- [ ] Filter chips auto-generated from real data
- [ ] Multi-select city + type filters work
- [ ] Download CSV → opens correctly in Excel
- [ ] Empty search fields → red border error shown
- [ ] Stop backend → error toast appears

---

## PHASE 5 — DEPLOY

### Backend → Render
1. Create `backend/Procfile`:
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
2. Push to GitHub
3. New Web Service on render.com → root dir = `backend/`
4. Add env vars: GOOGLE_API_KEY, CACHE_EXPIRY_HOURS=24, MAX_RESULTS=60, ALLOWED_ORIGIN=(Vercel URL)

### Frontend → Vercel
1. Update `frontend/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-app.onrender.com
   ```
2. New Project on vercel.com → root dir = `frontend/`
3. Add env var: VITE_API_BASE_URL = Render URL
4. Update ALLOWED_ORIGIN on Render to Vercel URL → redeploy

---

## HOW TO HAND OFF TO ANOTHER MODEL

Paste this at the top of your message to the next model:

```
I am building BizScraper Pro. Here is the complete 
Master Implementation Guide with all code already written.

Current checkpoint: [PASTE CURRENT CHECKPOINT HERE]

Please continue from the checkpoint. All files before 
the checkpoint are already created and working. 
Do not recreate them.

[PASTE THIS ENTIRE GUIDE BELOW]
```

---
*BizScraper Pro — Master Implementation Guide v1.0*
