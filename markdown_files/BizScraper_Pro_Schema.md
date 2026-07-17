**BizScraper Pro**
Backend Schema Document
Version 1.0  ·  July 2025

| Attribute | Details |
| --- | --- |
| **Document** | Backend Schema & Data Models |

| Actor | Role |
| --- | --- |
| **Backend** | Python FastAPI + SQLite + SQLAlchemy |

| Attribute | Details |
| --- | --- |
| **Covers** | Database tables, Pydantic models, API request/response schemas, data processing rules |
| **Audience** | Backend developers, QA engineers |

# **1. Overview**

The BizScraper Pro backend has two responsibilities: (1) fetch and clean business data from Google Places API, and (2) cache results in SQLite to avoid repeat API calls. This document defines every data model, database table, and schema used across the system.

# **2. Database Schema  (SQLite)**

Two tables in SQLite. One stores search results. One tracks cache metadata.

## **2.1  Table: search_cache**
Stores the raw result of each unique search (keyword + location combination).

| **Column** | **Type** | **Nullable** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| keyword | TEXT | NO | — | Search keyword e.g. "institute" |
| location | TEXT | NO | — | Search location e.g. "Jharkhand" |
| cache_key | TEXT | NO | — | MD5 hash of keyword+location — used as lookup key |
| result_json | TEXT | NO | — | Full JSON array of business results stored as string |
| result_count | INTEGER | NO | 0 | Number of businesses returned |
| created_at | DATETIME | NO | NOW() | When this cache entry was created |
| expires_at | DATETIME | NO | NOW()+24hrs | When this cache entry becomes stale |
| is_expired | BOOLEAN | NO | FALSE | Computed flag — TRUE if current time > expires_at |

```text
-- SQLite DDL
CREATE TABLE search_cache (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword      TEXT    NOT NULL,
    location     TEXT    NOT NULL,
    cache_key    TEXT    NOT NULL UNIQUE,
    result_json  TEXT    NOT NULL,
    result_count INTEGER NOT NULL DEFAULT 0,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME NOT NULL
);

CREATE INDEX idx_cache_key ON search_cache(cache_key);
```

## **2.2  Table: businesses**
Stores individual business records linked to a search_cache entry. Enables filtering on the backend without re-parsing JSON.

| **Column** | **Type** | **Nullable** | **Default** | **Description** |
| --- | --- | --- | --- | --- |
| id | INTEGER | NO | AUTOINCREMENT | Primary key |
| cache_id | INTEGER | NO | — | Foreign key → search_cache.id |
| place_id | TEXT | NO | — | Google place_id — unique per business |
| name | TEXT | NO | — | Business name |
| address | TEXT | YES | NULL | Full formatted address |
| city | TEXT | YES | NULL | City parsed from address |
| state | TEXT | YES | NULL | State from Google address components |
| pincode | TEXT | YES | NULL | 6-digit pincode parsed from address |
| phone | TEXT | YES | NULL | Phone number from Place Details API |
| email | TEXT | YES | NULL | Email — rarely available |
| website | TEXT | YES | NULL | Website URL from Place Details API |
| rating | REAL | YES | NULL | Google rating out of 5.0 |
| type | TEXT | YES | NULL | Business category from Google types[] |
| maps_link | TEXT | YES | NULL | Full Google Maps URL built from place_id |
| created_at | DATETIME | NO | NOW() | Row insert timestamp |

```text
-- SQLite DDL
CREATE TABLE businesses (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_id   INTEGER NOT NULL REFERENCES search_cache(id) ON DELETE CASCADE,
    place_id   TEXT    NOT NULL,
    name       TEXT    NOT NULL,
    address    TEXT,
    city       TEXT,
    state      TEXT,
    pincode    TEXT,
    phone      TEXT,
    email      TEXT,
    website    TEXT,
    rating     REAL,
    type       TEXT,
    maps_link  TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_businesses_cache ON businesses(cache_id);
CREATE INDEX idx_businesses_city  ON businesses(city);
CREATE INDEX idx_businesses_type  ON businesses(type);
```

# **3. Pydantic Models  (Python)**

Pydantic models define the shape of data flowing through FastAPI — request validation, response serialization, and internal processing.

## **3.1  SearchRequest  (incoming query params)**

```text
# models/request.py

from pydantic import BaseModel, validator

class SearchRequest(BaseModel):
    keyword:  str   # e.g. "institute"
    location: str   # e.g. "Jharkhand"

    @validator("keyword", "location")
    def must_not_be_blank(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()
```

## **3.2  BusinessModel  (single business record)**

```text
# models/business.py

from pydantic import BaseModel
from typing import Optional

class BusinessModel(BaseModel):
    name:      str
    address:   Optional[str] = None
    city:      Optional[str] = None
    state:     Optional[str] = None
    pincode:   Optional[str] = None
    phone:     Optional[str] = None
    email:     Optional[str] = None
    website:   Optional[str] = None
    rating:    Optional[float] = None
    type:      Optional[str] = None
    maps_link: Optional[str] = None

    class Config:
        from_attributes = True   # allows SQLAlchemy model → Pydantic
```

## **3.3  SearchResponse  (what the API returns)**

```text
# models/response.py

from pydantic import BaseModel
from typing import List
from .business import BusinessModel

class SearchResponse(BaseModel):
    keyword:      str
    location:     str
    result_count: int
    from_cache:   bool          # True if result came from SQLite cache
    results:      List[BusinessModel]
```

## **3.4  ExportRequest  (CSV export params)**

```text
# models/export.py

from pydantic import BaseModel
from typing import List, Optional

class ExportRequest(BaseModel):
    keyword:  str
    location: str
    cities:   Optional[List[str]] = []   # e.g. ["Jamshedpur", "Ranchi"]
    types:    Optional[List[str]] = []   # e.g. ["Coaching Centre"]
```

# **4. Google API Response → Business Model Mapping**

This table shows exactly how raw Google Places API fields are transformed into the BusinessModel fields used in the app.

| **BusinessModel Field** | **Google API Source** | **Transformation** |
| --- | --- | --- |
| name | result.name | Direct mapping — no transformation |
| address | result.formatted_address | Direct mapping |
| city | result.address_components[] | Find component where types includes "locality" → long_name |
| state | result.address_components[] | Find component where types includes "administrative_area_level_1" → long_name |
| pincode | result.address_components[] | Find component where types includes "postal_code" → long_name |
| phone | details.formatted_phone_number | From separate Place Details API call using place_id |
| email | Not provided by Google Places API | Always null — not available from this API |
| website | details.website | From Place Details API call |
| rating | result.rating | Direct mapping — float value |
| type | result.types[0] | First entry in types array — mapped to readable label (see Section 5) |
| maps_link | result.place_id | Built as: "https://www.google.com/maps/place/?q=place_id:{place_id}" |

# **5. Google Type → Display Label Mapping**

Google Places returns machine-readable type strings (e.g. "point_of_interest"). These are mapped to human-readable display labels shown in the Type badge and filter chips.

| **Google Type String** | Display Label Shown in UI |
| --- | --- |
| **university** | University |
| **school** | School |
| **secondary_school** | School |
| **primary_school** | School |
| **junior_college** | College |
| **college** | College |
| **library** | Library |
| **tutoring_service** | Coaching Centre |
| **education_center** | Coaching Centre |
| **training_center** | Coaching Centre |
| **cafe** | Cafe |
| **restaurant** | Restaurant |
| **hospital** | Hospital |
| **gym** | Gym |
| **health** | Healthcare |
| **lodging** | Hotel |
| **point_of_interest** | Business |
| **establishment** | Business |
| **(any unmapped type)** | Business  ← fallback label |

```text
# services/data_processor.py

TYPE_MAP = {
    "university":        "University",
    "school":            "School",
    "secondary_school":  "School",
    "tutoring_service":  "Coaching Centre",
    "training_center":   "Coaching Centre",
    "college":           "College",
    "cafe":              "Cafe",
    "restaurant":        "Restaurant",
    "hospital":          "Hospital",
    "gym":               "Gym",
    "lodging":           "Hotel",
}

def map_type(google_types: list) -> str:
    for t in google_types:
        if t in TYPE_MAP:
            return TYPE_MAP[t]
    return "Business"  # fallback
```

# **6. API Endpoint Request & Response Schemas**

## **6.1  GET /api/search**

### **Request**

```text
GET /api/search?keyword=institute&location=Jharkhand

Query Parameters:
  keyword   string  required   e.g. "institute"
  location  string  required   e.g. "Jharkhand"
```

### **Success Response  (HTTP 200)**

```text
{
  "keyword": "institute",
  "location": "Jharkhand",
  "result_count": 43,
  "from_cache": false,
  "results": [
    {
      "name": "FIITJEE Jamshedpur",
      "address": "Bistupur, Jamshedpur, Jharkhand 831001",
      "city": "Jamshedpur",
      "state": "Jharkhand",
      "pincode": "831001",
      "phone": "+91 96710 12345",
      "email": null,
      "website": "https://www.fiitjee.com",
      "rating": 4.5,
      "type": "Coaching Centre",
      "maps_link": "https://www.google.com/maps/place/?q=place_id:ChIJxxxx"
    },
    { ... }
  ]
}
```

### **Error Response  (HTTP 400 / 500)**

```text
// 400 — bad input
{ "error": "keyword cannot be empty" }

// 500 — Google API failure
{ "error": "External API unavailable. Please try again later." }

// 503 — quota exceeded
{ "error": "Daily search limit reached. Try again tomorrow." }
```

## **6.2  GET /api/export**

### **Request**

```text
GET /api/export
  ?keyword=institute
  &location=Jharkhand
  &cities=Jamshedpur,Ranchi      (optional — comma separated)
  &types=Coaching Centre         (optional — comma separated)
```

### **Success Response  (HTTP 200)**

```text
Content-Type: text/csv
Content-Disposition: attachment; filename="institute_jharkhand_2025-07-17.csv"

Name,Address,City,State,Pincode,Phone,Email,Website,Rating,Type,Google Maps Link
"FIITJEE Jamshedpur","Bistupur, Jamshedpur","Jamshedpur","Jharkhand","831001","+91 96710 12345","","https://www.fiitjee.com","4.5","Coaching Centre","https://www.google.com/maps/..."
"Narayana Academy","Lalpur, Ranchi","Ranchi","Jharkhand","834001","+91 91234 56789","","","4.3","Coaching Centre","https://www.google.com/maps/..."
```

# **7. Data Processing Rules**

These rules are applied in data_processor.py after Google API data is fetched and before it is saved to the database or returned to the frontend.

| Rule / Feature | Data Integrity Rule Details |
| --- | --- |
| **Null safety** | Every Optional field defaults to None if missing from Google response. Never throw on missing field. |
| **City extraction** | Parse address_components array. Find entry with type "locality". Use long_name. If missing, use "Unknown". |
| **Pincode extraction** | Find address_component with type "postal_code". Use long_name. Validate it is 6 digits. Else None. |
| **Phone formatting** | Use formatted_phone_number as-is from Google. No reformatting — Google already localizes it. |
| **Type mapping** | Iterate result.types[], return first match in TYPE_MAP. If no match, return "Business". |
| **Maps link build** | Concatenate: "https://www.google.com/maps/place/?q=place_id:" + place_id |
| **Rating rounding** | Keep as float with 1 decimal. 4.27 → 4.3. If None, store None — do not default to 0. |
| **Name cleaning** | Strip leading/trailing whitespace. No other transformation — preserve original Google name. |
| **Duplicate check** | Before inserting to businesses table, check if place_id already exists for this cache_id. Skip if duplicate. |
| **Cache key** | MD5 hash of (keyword.lower().strip() + "\|" + location.lower().strip()). Consistent across calls. |

BizScraper Pro  ·  Backend Schema v1.0  ·  Confidential