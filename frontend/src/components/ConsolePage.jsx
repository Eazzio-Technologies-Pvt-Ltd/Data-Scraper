import { useState } from "react";
import { Check, Download, ArrowLeft, Loader2, Search, MapPin, ExternalLink, RotateCcw, RotateCw } from "lucide-react";
import { searchBusinesses, exportCSV } from "../services/api";
import { useAuth } from '../context/AuthContext';

export default function ConsolePage({ onBackToLanding }) {
  const { user, signOut } = useAuth();
  // Console state management
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uiState, setUiState] = useState("IDLE"); // IDLE, LOADING, RESULTS, EMPTY, ERROR
  const [selectedCities, setSelectedCities] = useState(new Set());
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [lastSearch, setLastSearch] = useState({ keyword: "", location: "" });

  // Input validation errors
  const [errors, setErrors] = useState({ keyword: false, location: false });

  // Sorting state
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Column visibility state with history
  const [history, setHistory] = useState([
    { name: true, city: true, rating: true, type: true, phone: true, address: true, link: true }
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const uniqueCities = [...new Set(results.map((r) => r.city).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(results.map((r) => r.type).filter(Boolean))].sort();

  const applyFilters = (data, cities, types) => {
    let filtered = data;
    if (cities.size) filtered = filtered.filter((r) => cities.has(r.city));
    if (types.size) filtered = filtered.filter((r) => types.has(r.type));
    return filtered;
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    // Reset error states
    const hasKeywordErr = !keyword.trim();
    const hasLocationErr = !location.trim();
    setErrors({ keyword: hasKeywordErr, location: hasLocationErr });

    if (hasKeywordErr || hasLocationErr) {
      return;
    }

    setIsLoading(true);
    setUiState("LOADING");
    setSelectedCities(new Set());
    setSelectedTypes(new Set());
    setLastSearch({ keyword, location });
    setSortField(null);
    setSortOrder("asc");

    // Reset column visibility history on new search
    setHistory([
      { name: true, city: true, rating: true, type: true, phone: true, address: true, link: true }
    ]);
    setHistoryIndex(0);

    try {
      const data = await searchBusinesses(keyword, location);
      setResults(data.results || []);
      setFilteredResults(data.results || []);
      setUiState(data.results?.length ? "RESULTS" : "EMPTY");
    } catch (err) {
      console.error(err);
      setUiState("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCity = (city) => {
    const next = new Set(selectedCities);
    next.has(city) ? next.delete(city) : next.add(city);
    setSelectedCities(next);
    const filtered = applyFilters(results, next, selectedTypes);
    setFilteredResults(filtered);
    setUiState(filtered.length ? "RESULTS" : "EMPTY");
  };

  const handleClearCities = () => {
    setSelectedCities(new Set());
    const filtered = applyFilters(results, new Set(), selectedTypes);
    setFilteredResults(filtered);
    setUiState(filtered.length ? "RESULTS" : "EMPTY");
  };

  const handleToggleType = (type) => {
    const next = new Set(selectedTypes);
    next.has(type) ? next.delete(type) : next.add(type);
    setSelectedTypes(next);
    const filtered = applyFilters(results, selectedCities, next);
    setFilteredResults(filtered);
    setUiState(filtered.length ? "RESULTS" : "EMPTY");
  };

  const handleClearTypes = () => {
    setSelectedTypes(new Set());
    const filtered = applyFilters(results, selectedCities, new Set());
    setFilteredResults(filtered);
    setUiState(filtered.length ? "RESULTS" : "EMPTY");
  };

  const handleExport = () => {
    exportCSV(
      lastSearch.keyword,
      lastSearch.location,
      [...selectedCities],
      [...selectedTypes]
    );
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortedResults = (data) => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "rating") {
        const aNum = aVal !== null && aVal !== undefined ? parseFloat(aVal) : -1;
        const bNum = bVal !== null && bVal !== undefined ? parseFloat(bVal) : -1;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      } else {
        const aStr = (aVal || "").toString().toLowerCase();
        const bStr = (bVal || "").toString().toLowerCase();
        if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
        if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
        return 0;
      }
    });
  };

  const toggleColumn = (colName) => {
    const current = history[historyIndex];
    const nextState = { ...current, [colName]: !current[colName] };

    // Push new state to history and truncate any future redo items
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const activeColumns = history[historyIndex];

  // Restrained palette badge styles
  const getTypeBadgeStyles = (type) => {
    return "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]";
  };

  return (
    <div className="min-h-screen bg-white text-[#475569] px-12 py-12 flex flex-col justify-between" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Header Zone */}
      <header className="flex items-start justify-between pb-4 border-b border-[#CBD5E1]">
        <div style={{ display:'flex', justifyContent:'flex-end', 
                      alignItems:'center', gap:'12px', padding:'8px 16px',
                      borderBottom:'1px solid #2a2a2a' }}>
          <span style={{ color:'#888', fontSize:'13px' }}>{user?.email}</span>
          <button onClick={signOut}
            style={{ padding:'6px 14px', background:'#ff4444', color:'#fff',
                     border:'none', borderRadius:'6px', cursor:'pointer',
                     fontSize:'13px' }}>
            Sign Out
          </button>
        </div>
        <div className="space-y-1">
          <h1 
            className="text-[29px] font-medium text-[#0f172a] leading-none tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Biz<span className="text-[#1A56DB]">Scraper</span> Pro
          </h1>
          <p 
            className="text-[10px] font-semibold uppercase tracking-wider text-[#475569]"
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}
          >
            Local Business Data Extractor
          </p>
        </div>
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] hover:bg-[#EFF6FF]/50 hover:text-[#1A56DB] hover:border-[#1A56DB]/50 text-xs font-medium text-[#475569] transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={13} />
          Back to Landing
        </button>
      </header>

      <main className="flex-1 py-8 space-y-8">
        
        {/* Search Directory Utility Row */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full text-[10px] uppercase tracking-wider text-[#475569] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span className="whitespace-nowrap font-bold text-[#0F172A]">SEARCH DIRECTORY</span>
          <div className="hidden sm:block flex-1 border-t border-[#CBD5E1] mx-2"></div>
          <span className="text-[10px] normal-case text-slate-500 text-center sm:text-right">
            Search any business category across cities and regions in India.
          </span>
        </div>

        {/* 2. Search Zone */}
        <section aria-label="Search inputs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 w-full">
            {/* Location Input */}
            <div className="flex-1 w-full space-y-1">
              <label 
                className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1.5 ml-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]/60" />
                <input
                  type="text"
                  placeholder="e.g. Jharkhand"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full h-[42px] pl-9 pr-3 rounded-[6px] border bg-[#F8FAFC] text-[#0f172a] text-[13px] outline-none transition-all
                    ${errors.location 
                      ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[3px] focus:ring-red-50" 
                      : "border-[#CBD5E1] focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#EFF6FF] focus:bg-white"}`}
                />
              </div>
              {errors.location && (
                <p className="text-[11px] text-[#DC2626] font-medium ml-1">This field is required</p>
              )}
            </div>

            {/* Keyword Input */}
            <div className="flex-1 w-full space-y-1">
              <label 
                className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1.5 ml-0.5"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Keyword
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]/60" />
                <input
                  type="text"
                  placeholder="e.g. institute/ cafes/ resturants/ gym"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className={`w-full h-[42px] pl-9 pr-3 rounded-[6px] border bg-[#F8FAFC] text-[#0f172a] text-[13px] outline-none transition-all
                    ${errors.keyword 
                      ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-[3px] focus:ring-red-50" 
                      : "border-[#CBD5E1] focus:border-[#1a56db] focus:ring-[3px] focus:ring-[#EFF6FF] focus:bg-white"}`}
                />
              </div>
              {errors.keyword && (
                <p className="text-[11px] text-[#DC2626] font-medium ml-1">This field is required</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-[160px] h-[42px] rounded-[6px] bg-[#1a56db] text-white text-[13px] font-medium hover:bg-[#1e40af] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 mb-[1px] focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  Search businesses
                </>
              )}
            </button>
          </form>
        </section>

        {/* 3. Filters & Sorting Zone */}
        {results.length > 0 && (
          <section className="pt-2" aria-label="Filter and Sort results">
            <div className="flex flex-col md:flex-row items-stretch gap-6">
              
              {/* Left Side: Filter Options */}
              <div className="flex-1 space-y-4">
                {/* City Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="text-[10px] font-bold text-[#475569] uppercase tracking-wider w-[55px] text-left shrink-0"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    CITY:
                  </span>
                  <button
                    onClick={handleClearCities}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                      ${selectedCities.size === 0
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                        : "border-dashed border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    All
                  </button>
                  {uniqueCities.map((city) => {
                    const active = selectedCities.has(city);
                    return (
                      <button
                        key={city}
                        onClick={() => handleToggleCity(city)}
                        className={`text-[12px] px-3 py-1 rounded-[6px] border flex items-center gap-1.5 transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                          ${active
                            ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                            : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {active && <Check size={11} />} {city}
                      </button>
                    );
                  })}
                </div>

                {/* Type Row */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span 
                    className="text-[10px] font-bold text-[#475569] uppercase tracking-wider w-[55px] text-left shrink-0"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    TYPE:
                  </span>
                  <button
                    onClick={handleClearTypes}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                      ${selectedTypes.size === 0
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                        : "border-dashed border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F8FAFC]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    All
                  </button>
                  {uniqueTypes.map((type) => {
                    const active = selectedTypes.has(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleToggleType(type)}
                        className={`text-[12px] px-3 py-1 rounded-[6px] border flex items-center gap-1.5 transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                          ${active
                            ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                            : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"}`}
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {active && <Check size={11} />} {type}
                      </button>
                    );
                  })}

                  {/* Clear filters action */}
                  {(selectedCities.size > 0 || selectedTypes.size > 0) && (
                    <button
                      onClick={() => {
                        handleClearCities();
                        handleClearTypes();
                      }}
                      className="text-[11px] font-medium text-[#1A56DB] hover:text-[#1e40af] hover:underline transition-colors ml-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#EFF6FF] px-2 py-1 rounded"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Middle line separator (not very dark) */}
              <div className="hidden md:block w-px bg-[#CBD5E1]/60 self-stretch my-1"></div>

              {/* Right Side: Sorting Options */}
              <div className="w-full md:w-auto min-w-[240px] flex flex-col justify-start gap-3 pl-0 md:pl-2">
                <span 
                  className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mt-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  SORT BY:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (sortField === "name" && sortOrder === "asc") {
                        setSortField(null);
                      } else {
                        setSortField("name");
                        setSortOrder("asc");
                      }
                    }}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                      ${sortField === "name" && sortOrder === "asc"
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                        : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Name (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      if (sortField === "name" && sortOrder === "desc") {
                        setSortField(null);
                      } else {
                        setSortField("name");
                        setSortOrder("desc");
                      }
                    }}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                      ${sortField === "name" && sortOrder === "desc"
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                        : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Name (Z-A)
                  </button>
                  <button
                    onClick={() => {
                      if (sortField === "rating" && sortOrder === "desc") {
                        setSortField(null);
                      } else {
                        setSortField("rating");
                        setSortOrder("desc");
                      }
                    }}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                      ${sortField === "rating" && sortOrder === "desc"
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                        : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Rating (High-Low)
                  </button>
                  <button
                    onClick={() => {
                      if (sortField === "rating" && sortOrder === "asc") {
                        setSortField(null);
                      } else {
                        setSortField("rating");
                        setSortOrder("asc");
                      }
                    }}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none
                      ${sortField === "rating" && sortOrder === "asc"
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db] font-medium"
                        : "bg-white border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Rating (Low-High)
                  </button>
                </div>
              </div>

            </div>

            {/* Active Filter Summary */}
            <div 
              className="text-[12px] text-[#475569]/80 flex items-center gap-1.5 pt-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <span className="font-semibold text-[#0F172A]">{lastSearch.location || location || "All Regions"}</span>
              <span className="text-[#CBD5E1]">·</span>
              <span className="font-medium text-[#475569]">
                {selectedTypes.size > 0 ? [...selectedTypes].join(", ") : "All Types"}
              </span>
              <span className="text-[#CBD5E1]">·</span>
              {sortField && (
                <>
                  <span className="font-medium text-[#1A56DB]">
                    Sorted by {sortField === "name" ? "Name" : "Rating"} ({sortOrder === "asc" ? "Asc" : "Desc"})
                  </span>
                  <span className="text-[#CBD5E1]">·</span>
                </>
              )}
              <span className="font-semibold text-[#0F172A]">{filteredResults.length} results</span>
            </div>
          </section>
        )}

        {/* Horizontal Divider */}
        <hr className="border-[#CBD5E1]" />

        {/* 4. Table Zone */}
        <section className="pt-2" aria-live="polite">
          {uiState === "LOADING" && (
            <div className="flex flex-col items-center gap-2 py-16">
              <Loader2 className="w-8 h-8 text-[#1a56db] animate-spin" />
              <p className="text-[13px] text-[#475569] font-medium">Extracting records from location indexes...</p>
            </div>
          )}

          {uiState === "RESULTS" && (
            <div className="space-y-4">
              {/* Table Action Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <div 
                    className="text-[10px] font-bold uppercase tracking-wider text-[#475569]"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    RESULTS
                  </div>
                  <div className="text-[13px] text-[#475569]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <span className="font-bold text-[#0F172A]">{filteredResults.length} businesses found</span>
                    {" for "}
                    <span className="font-medium text-[#0F172A]">“{lastSearch.keyword}”</span>
                    {" in "}
                    <span className="font-medium text-[#0F172A]">{lastSearch.location}</span>
                  </div>

                  {/* Undo & Redo buttons row */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] border border-[#CBD5E1] bg-white text-[11px] font-medium text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      title="Undo column visibility change"
                    >
                      <RotateCcw size={10} />
                      Undo
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex === history.length - 1}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] border border-[#CBD5E1] bg-white text-[11px] font-medium text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      title="Redo column visibility change"
                    >
                      <RotateCw size={10} />
                      Redo
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[#1A56DB] text-[#1A56DB] bg-transparent hover:bg-[#EFF6FF] text-[13px] font-medium transition-colors cursor-pointer shrink-0 focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Download size={13} />
                  Download CSV
                </button>
              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto border border-[#CBD5E1] rounded-[6px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a56db] text-white">
                      {activeColumns.name && (
                        <th 
                          scope="col" 
                          onClick={() => handleSort('name')}
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white cursor-pointer select-none group border-b border-[#CBD5E1]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              Business Name
                              <span className="text-[9px] text-white/60 group-hover:text-white transition-colors">
                                {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={activeColumns.name}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("name");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                      {activeColumns.city && (
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#CBD5E1]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>City</span>
                            <input
                              type="checkbox"
                              checked={activeColumns.city}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("city");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                      {activeColumns.rating && (
                        <th 
                          scope="col" 
                          onClick={() => handleSort('rating')}
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white w-28 cursor-pointer select-none group border-b border-[#CBD5E1]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                              Rating
                              <span className="text-[9px] text-white/60 group-hover:text-white transition-colors">
                                {sortField === 'rating' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={activeColumns.rating}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("rating");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                      {activeColumns.type && (
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#CBD5E1]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Type</span>
                            <input
                              type="checkbox"
                              checked={activeColumns.type}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("type");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                      {activeColumns.phone && (
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#CBD5E1]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Phone</span>
                            <input
                              type="checkbox"
                              checked={activeColumns.phone}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("phone");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                      {activeColumns.address && (
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#CBD5E1]"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>Address</span>
                            <input
                              type="checkbox"
                              checked={activeColumns.address}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("address");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                      {activeColumns.link && (
                        <th 
                          scope="col" 
                          className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-white border-b border-[#CBD5E1] w-12 text-center"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span>Link</span>
                            <input
                              type="checkbox"
                              checked={activeColumns.link}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleColumn("link");
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#1A56DB] focus:ring-[#EFF6FF] cursor-pointer"
                              title="Hide column"
                            />
                          </div>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CBD5E1]">
                    {getSortedResults(filteredResults).map((r, idx) => (
                      <tr
                        key={idx}
                        className={`h-[52px] hover:bg-[#EFF6FF]/40 transition-colors text-[13px] text-[#475569]
                          ${idx % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"}`}
                      >
                        {activeColumns.name && (
                          <td className="px-6 py-2 font-medium text-[#0f172a] whitespace-nowrap truncate max-w-[200px]" title={r.name}>
                            {r.name}
                          </td>
                        )}
                        {activeColumns.city && (
                          <td className="px-6 py-2">{r.city || "—"}</td>
                        )}
                        {activeColumns.rating && (
                          <td className="px-6 py-2 font-medium text-[#0f172a]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {r.rating ? (
                              <span className="inline-flex items-center gap-0.5">
                                {r.rating} <span className="text-[#eab308] text-[11px]">★</span>
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        )}
                        {activeColumns.type && (
                          <td className="px-6 py-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getTypeBadgeStyles(r.type)}`}>
                              {r.type || "Other"}
                            </span>
                          </td>
                        )}
                        {activeColumns.phone && (
                          <td className="px-6 py-2 font-mono text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {r.phone || "—"}
                          </td>
                        )}
                        {activeColumns.address && (
                          <td className="px-6 py-2 truncate max-w-[250px]" title={r.address}>
                            {r.address || "—"}
                          </td>
                        )}
                        {activeColumns.link && (
                          <td className="px-6 py-2 text-center">
                            {r.maps_link ? (
                              <a 
                                href={r.maps_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] border border-[#CBD5E1] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#1A56DB] hover:border-[#1A56DB] transition-all focus:ring-2 focus:ring-[#EFF6FF] focus:outline-none"
                                title="View on Google Maps"
                              >
                                <ExternalLink size={12} />
                              </a>
                            ) : "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {uiState === "EMPTY" && (
            <div className="text-center py-16 border border-dashed border-[#CBD5E1] rounded-[6px] bg-[#F8FAFC]">
              <p className="text-[14px] font-medium text-[#0f172a]">No results match your filters.</p>
              <p className="text-[12px] text-[#475569] mt-1">Try removing a filter or adjusting keywords.</p>
            </div>
          )}

          {uiState === "IDLE" && (
            <div className="text-center py-16 border border-dashed border-[#CBD5E1] rounded-[6px] bg-[#F8FAFC]">
              <p className="text-[13px] text-[#475569] uppercase tracking-wider font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Workspace Idle</p>
              <p className="text-[12px] text-slate-400 mt-1">Enter search criteria above to trigger business data parser extraction.</p>
            </div>
          )}

          {uiState === "ERROR" && (
            <div className="text-center py-16 border border-dashed border-[#CBD5E1] rounded-[6px] bg-red-50">
              <p className="text-[14px] font-semibold text-[#DC2626]">Extraction process aborted.</p>
              <p className="text-[12px] text-red-700/80 mt-1">Could not contact local scraping server. Verify backend configurations.</p>
            </div>
          )}
        </section>

      </main>

      {/* 5. Footer Zone */}
      <footer className="pt-8 border-t border-[#CBD5E1] flex justify-between items-center text-[11px] text-[#475569]">
        <span>BizScraper Pro · v1.0.0</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>Confidential Workspace</span>
      </footer>

    </div>
  );
}
