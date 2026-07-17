**BizScraper Pro**
App Flow Document
Version 1.0  ·  July 2025

| Attribute | Details |
| --- | --- |
| **Document** | Application Flow & User Journey |
| **Product** | BizScraper Pro — Local Business Data Extractor |
| **Covers** | User flows, system flows, error flows, edge cases |
| **Audience** | Developers, QA, product reviewers |

# **1. Overview**

This document maps every possible journey a user can take through BizScraper Pro — from opening the tool to downloading a CSV. It covers the happy path (everything works), error paths (API fails, no results), and edge cases (empty inputs, quota exceeded).

Each flow is broken into numbered steps with the actor (User, Frontend, Backend, Google API) clearly labelled.

# **2. Actors & Their Roles**

| Actor | Role |
| --- | --- |
| **User** | The person using the tool in the browser — types inputs, clicks buttons, reads results. |
| **Frontend** | React.js app — renders UI, validates input, calls backend, displays results and filters. |
| **Backend** | Python FastAPI server — receives requests, checks cache, calls Google API, returns clean JSON. |
| **Google API** | Google Places API — the actual data source — returns business listings for any keyword + location. |
| **SQLite Cache** | Local database on the backend — stores previous search results to avoid repeat API calls. |

# **3. Main Flow  —  Happy Path**

This is the standard journey when everything works correctly. User searches, gets results, filters, and downloads.

## **3.1  Page Load**

| Step | Actor | Description | Notes |
| --- | --- | --- | --- |
| **1** | **Frontend** | Page loads in browser. Shows tool name, two empty text inputs (Location, Keyword), and Search button. | No data fetched on load |
| **2** | **User** | Sees the clean search interface. No results table yet — just the inputs. | First impression of the tool |

## **3.2  Search**

| Step | Actor | Description | Notes |
| --- | --- | --- | --- |
| **3** | **User** | Types "Jharkhand" in Location field and "institute" in Keyword field. Clicks Search button. | Both fields required |
| **4** | **Frontend** | Validates inputs — both non-empty. Disables Search button. Shows loading spinner. Sends GET /api/search?keyword=institute&location=Jharkhand to backend. | Button disabled during load |
| **5** | **Backend** | Receives request. Checks SQLite cache for matching keyword + location. Cache miss → proceeds to Google API. | Cache key = keyword+location |
| **6** | **Backend** | Calls Google Places Text Search API — Page 1. Gets 20 results + next_page_token. Waits 2 seconds (Google requirement). Calls Page 2. Waits 2 seconds. Calls Page 3. Total = up to 60 results. | ~4-6 sec total fetch time |
| **7** | **Google API** | Returns JSON with business listings — name, address, place_id, types, rating for each result. | 20 results per page max |
| **8** | **Backend** | For each result, calls Google Place Details API to get phone, website. Extracts city from address. Builds maps_link from place_id. Cleans all fields. Saves to SQLite cache. | 60 detail calls = ~10-15 sec |
| **9** | **Backend** | Returns cleaned JSON array of business objects to Frontend. | HTTP 200 + JSON array |
| **10** | **Frontend** | Receives JSON. Enables Search button. Hides spinner. Renders results table. Builds City and Type filter chips automatically from unique values in the data. Shows result count above table. | Filters built from real data |

## **3.3  Filter**

| Step | Actor | Description | Notes |
| --- | --- | --- | --- |
| **11** | **User** | Sees full results table with filter chips above. Clicks "Jamshedpur" chip in City row. | Multi-select supported |
| **12** | **Frontend** | Marks "Jamshedpur" chip as active. Filters the in-memory results array — shows only rows where city === "Jamshedpur". Updates result count. No new API call. | Client-side filter only |
| **13** | **User** | Also clicks "Coaching Centre" in Type row. Both filters now active. | City + Type combined |
| **14** | **Frontend** | Applies both filters simultaneously. Shows rows matching Jamshedpur AND Coaching Centre. Updates active filter summary text. | AND logic between filters |

## **3.4  Download**

| Step | Actor | Description | Notes |
| --- | --- | --- | --- |
| **15** | **User** | Clicks "Download CSV" button above the table. | Downloads filtered data only |
| **16** | **Frontend** | Sends GET /api/export?keyword=institute&location=Jharkhand&cities=Jamshedpur&types=Coaching Centre to backend. | Passes active filter params |
| **17** | **Backend** | Reads matching results from cache. Applies city and type filters. Uses Pandas to generate CSV. Returns file with Content-Disposition: attachment header. | Filename: institute_jharkhand_2025-07-17.csv |
| **18** | **User** | Browser downloads the CSV file. Opens in Excel. Data is clean and ready to use. | End of happy path ✓ |

# **4. Error Flows**

Every error has three parts: what triggered it, what the user sees, and how they recover.

## **4.1  Input Validation Errors  (before API call)**

| **#** | **Trigger** | **What User Sees** | **Recovery** |
| --- | --- | --- | --- |
| E1 | Location field is empty on Search click | Red border on Location input. Text below: "Please enter a location." | User types a location and clicks Search again. |
| E2 | Keyword field is empty on Search click | Red border on Keyword input. Text below: "Please enter a keyword." | User types a keyword and clicks Search again. |
| E3 | Input is only spaces or special characters | Same red border treatment. Text: "Please enter a valid search term." | User types a meaningful keyword. |

## **4.2  API & Network Errors  (after search is sent)**

| **#** | **Trigger** | **What User Sees** | **Recovery** |
| --- | --- | --- | --- |
| E4 | Google API key is invalid or missing | Toast error: "Search failed. Please try again later." Spinner hidden. | Dev fixes API key in .env and restarts backend. |
| E5 | Google API quota exceeded for the day | Toast error: "Daily search limit reached. Try again tomorrow." | Wait for quota reset at midnight Pacific time. |
| E6 | No internet connection on user's device | Toast error: "Connection failed. Check your internet and try again." | User reconnects and retries search. |
| E7 | Backend server is down or unreachable | Toast error: "Server unavailable. Please try again in a moment." | Dev restarts backend on Render. |
| E8 | Search returns 0 results from Google | Empty state shown below filters: "No businesses found for your search. Try a different keyword or location." | User modifies search and tries again. |
| E9 | Google API returns partial data (some fields null) | Row still shown in table. Empty fields show "—" placeholder. No crash. | No action needed — handled gracefully. |

# **5. Edge Cases**

| **Scenario** | **Expected Behaviour** | **Handled By** |
| --- | --- | --- |
| User clicks Search while a search is already loading | Search button stays disabled. Second request not fired. | Frontend — button disabled state |
| User clears both filters after applying them | Full unfiltered result set shown. Result count resets to total. | Frontend — "Clear filters" resets selectedCities and selectedTypes to empty Set |
| Same search run twice in a row | Second search returns instantly from SQLite cache. No Google API call. | Backend — cache hit check |
| Cache is 25 hours old (expired) | Backend detects stale cache. Makes fresh Google API call. Updates cache. | Backend — cache TTL check |
| Only one result returned | Table shows single row. Filter chips still generated from that one result. | Frontend — handles array of length 1 |
| Business name has special characters (& < >) | Rendered correctly in table and CSV. Not escaped or broken. | Frontend — React handles encoding; Pandas handles CSV |
| User types city name in keyword (e.g. "cafes Ranchi") | Google API still returns results — it handles location context in keyword. | Google API — tolerant of mixed input |
| Phone number not available for a business | Phone cell shows "—". Does not break the row or CSV. | Backend — null check in data_processor.py |
| CSV downloaded with 0 rows (all filtered out) | CSV downloads with headers only. No rows. Valid file. | Backend — Pandas to_csv works on empty DataFrame |
| Very long business name (50+ chars) | Truncated in table with ellipsis. Full name in CSV. Full name on hover. | CSS text-overflow: ellipsis + title attribute |

# **6. Frontend State Diagram**

The React frontend has five distinct UI states. Only one state is visible at a time.

| State | Description |
| --- | --- |
| **IDLE** | Initial state on page load. Search bar visible. No results, no filters, no spinner. |
| **LOADING** | Triggered when Search is clicked. Spinner shown. Search button disabled. Inputs still editable. |
| **RESULTS** | Triggered when backend returns data. Table + filter chips rendered. Download button visible. |
| **EMPTY** | Triggered when backend returns 0 results OR all rows filtered out. Empty state message shown. |
| **ERROR** | Triggered on network or API failure. Toast notification shown. Spinner hidden. Button re-enabled. |

```text
  IDLE
   │
   │ User clicks Search (both fields valid)
   ▼
  LOADING
   │                    │
   │ API returns data   │ API returns error
   ▼                    ▼
  RESULTS             ERROR
   │                    │
   │ All rows filtered  │ User retries
   ▼                    ▼
  EMPTY               LOADING → ...
   │
   │ User clears filters
   ▼
  RESULTS
```

BizScraper Pro  ·  App Flow Document v1.0  ·  Confidential