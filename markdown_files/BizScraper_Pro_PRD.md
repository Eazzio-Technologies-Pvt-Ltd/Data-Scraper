**BizScraper Pro**
Product Requirements Document
Version 1.0  ·  July 2025

| Attribute | Details |
| --- | --- |
| **Product** | BizScraper Pro — Local Business Data Extractor |
| **Author** | Development Team |
| **Status** | Draft — Pending Review |
| **Stack** | React.js · Python FastAPI · Google Places API |

# **1. Product Overview**

BizScraper Pro is a web-based business data extraction tool that allows users to search for local businesses across any city or region in India by entering a location and a keyword. The tool fetches real business data from Google Places API, displays results in a clean interactive table, and allows users to filter and export the data.

The tool is designed to save hours of manual research for sales teams, marketing professionals, and business analysts who need structured lists of local businesses — such as institutes, cafes, hospitals, or tech companies — in any given area.

## **1.1  Problem Statement**
Currently, collecting business data from Google Maps is a manual, time-consuming process. Existing desktop tools like G-Business Extractor are outdated, not web-based, and not customised for Indian markets. Teams waste hours copying business names, phone numbers, and addresses one by one.

## **1.2  Proposed Solution**
A modern, web-based tool where a user types a location and a keyword, instantly gets a clean table of all matching businesses with their full details, and can filter and download the data in one click.

# **2. Goals & Objectives**

## **2.1  Primary Goals**
**•** **Automate:**  Replace manual Google Maps research with an automated tool.
**•** **Accuracy:**  Deliver accurate business data including name, address, phone, rating, and category.
**•** **Usability:**  Present results in a table that can be filtered and downloaded instantly.
**•** **Flexibility:**  Work for any Indian city and any business keyword without preset limitations.

## **2.2  Business Objectives**
**•** Reduce business data collection time from hours to under 2 minutes.
**•** Provide a client-ready, professional UI suitable for team use.
**•** Support any keyword — institutes, cafes, hospitals, tech companies, etc.
**•** Export clean CSV data that can be used directly in Excel or CRM tools.

## **2.3  Out of Scope (Version 1.0)**
**•** User login and authentication system.
**•** Saving search history to a database.
**•** Scraping social media profiles or Instagram pages.
**•** Automated email outreach to businesses.
**•** Paid subscription or billing system.

# **3. Requirements**

## **3.1  Functional Requirements**

### **Search**

| Requirement ID | Description |
| --- | --- |
| **FR-01** | User can type any location (city, state, region) as free text input. |
| **FR-02** | User can type any keyword (institute, cafe, hospital, gym, etc.) as free text. |
| **FR-03** | On clicking Search, the tool queries Google Places API with the given inputs. |
| **FR-04** | Search must return up to 60 results (Google Places pagination — 3 pages of 20). |
| **FR-05** | A loading indicator must appear while data is being fetched. |

### **Results Table**

| Requirement ID | Description |
| --- | --- |
| **FR-06** | Results display in a table with columns: Name, Address, City, Phone, Email, Website, Rating, Type. |
| **FR-07** | Table must be sortable by Name and Rating columns. |
| **FR-08** | Each row shows the business category tag (e.g. Coaching Centre, College). |
| **FR-09** | Total result count is displayed above the table. |
| **FR-10** | If no results are found, a clear empty state message is shown. |

### **Filters**

| Requirement ID | Description |
| --- | --- |
| **FR-11** | After results load, filter chips appear automatically — built from the real data returned. |
| **FR-12** | City filter: user can select one or multiple cities simultaneously. |
| **FR-13** | Type filter: user can select one or multiple business types simultaneously. |
| **FR-14** | Clicking "All" on any filter row resets that filter only. |
| **FR-15** | "Clear all filters" button resets all active filters at once. |
| **FR-16** | Filters update the table instantly without a new API call. |
| **FR-17** | Active filter summary is shown below the filter chips (e.g. "Jamshedpur · Coaching Centre · 12 results"). |

### **Export**

| Requirement ID | Description |
| --- | --- |
| **FR-18** | A "Download CSV" button is available above the results table. |
| **FR-19** | CSV export includes only the currently filtered results, not all results. |
| **FR-20** | CSV file is named automatically: keyword_location_date.csv (e.g. institute_jharkhand_2025-07-10.csv). |
| **FR-21** | CSV columns: Name, Address, City, Phone, Email, Website, Rating, Type, Google Maps Link. |

## **3.2  Non-Functional Requirements**

| Requirement Type | Specification |
| --- | --- |
| **Performance** | Search results must load within 5 seconds for up to 60 results. |
| **Reliability** | Tool must handle Google API errors gracefully with a user-friendly error message. |
| **Responsiveness** | UI must work on desktop browsers (Chrome, Firefox, Edge). Mobile is a nice-to-have. |
| **Security** | Google API key must be stored in a .env file — never exposed in frontend code. |
| **Scalability** | Backend must be structured to support additional data sources in future versions. |
| **Maintainability** | Code must be modular — separate files for API calls, data processing, and routes. |

# **4. User Experience**

## **4.1  Target Users**
**•** Sales and marketing teams looking for business leads in specific cities.
**•** Business analysts collecting competitor or market data.
**•** Researchers needing structured lists of local businesses.
**•** Small agency teams who present data to clients.

## **4.2  User Flow**

| Step | Action |
| --- | --- |
| **Step 1** | User opens the tool in a browser. |
| **Step 2** | User types a location (e.g. "Jharkhand") in the Location field. |
| **Step 3** | User types a keyword (e.g. "institute") in the Keyword field. |
| **Step 4** | User clicks the Search button. |
| **Step 5** | A loading spinner appears while Google Places API is queried. |
| **Step 6** | Results table appears with all matching businesses. |
| **Step 7** | Filter chips for City and Type appear automatically above the table. |
| **Step 8** | User selects one or more cities and/or types to narrow results. |
| **Step 9** | Table updates instantly showing filtered results. |
| **Step 10** | User clicks "Download CSV" to export the filtered data. |

## **4.3  UI Design Principles**
**•** Clean, minimal, and professional — suitable for client presentations.
**•** No dropdowns for search — both inputs are free text only.
**•** Filters appear only after search — not before, to avoid confusion.
**•** Multi-select chips for filters — not single-select.
**•** Active filter state is always visible to the user.
**•** Error states and empty states must be clear and helpful, never technical.

## **4.4  Data Fields Extracted per Business**

| Field Name | Description |
| --- | --- |
| **Name** | Full business name as listed on Google Maps. |
| **Address** | Full street address. |
| **City** | City extracted from the address or Google Places data. |
| **State** | State (e.g. Jharkhand). |
| **Pincode** | Postal code if available. |
| **Phone** | Primary contact phone number. |
| **Email** | Business email if publicly available. |
| **Website** | Business website URL if available. |
| **Rating** | Google rating out of 5. |
| **Type / Category** | Business category as tagged by Google (e.g. Coaching Centre, College). |
| **Google Maps Link** | Direct link to the business on Google Maps. |

# **5. Success Metrics**

The following metrics will be used to evaluate whether BizScraper Pro is working correctly and delivering value to its users.

## **5.1  Performance Metrics**

| **Metric** | **Target** | **Measurement Method** |
| --- | --- | --- |
| Search response time | Under 5 seconds for 60 results | Browser DevTools / API logs |
| API success rate | Above 95% of searches return results | Backend error logs |
| Filter response time | Instant (under 100ms) | Browser performance tab |
| CSV download time | Under 2 seconds | Manual QA testing |

## **5.2  Quality Metrics**

| **Metric** | **Target** | **Measurement Method** |
| --- | --- | --- |
| Data accuracy | 95%+ of returned results match the search keyword | Manual spot-check of 20 results |
| Phone number availability | 70%+ of results include a phone number | Count non-empty phone fields in CSV |
| Category tagging accuracy | 90%+ results have correct type tags | Manual review of 20 random results |
| Empty state handling | 100% of failed searches show a helpful message | QA test with invalid inputs |

## **5.3  Usability Metrics**

| **Metric** | **Target** | **Measurement Method** |
| --- | --- | --- |
| Time to first result | User gets results within 30 seconds of opening the tool | User testing session |
| Filter usability | User can apply multi-select filter without guidance | User testing — observation |
| CSV usability | Exported CSV opens correctly in Excel without reformatting | QA test on Excel |
| Error recovery | User understands what to do after an error message | User testing — observation |

## **5.4  Definition of Done**
**•** User can search any keyword + location and receive real Google data.
**•** Results display in a sortable table with all defined fields.
**•** Multi-select city and type filters work correctly.
**•** CSV export downloads correctly with filtered data only.
**•** Tool handles API errors without crashing.
**•** UI is clean, professional, and client-presentable.
**•** Google API key is secured and not exposed in frontend.

BizScraper Pro · PRD v1.0 · Confidential