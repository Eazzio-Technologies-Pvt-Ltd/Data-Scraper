import { useState } from "react";
import { Check, Download, ArrowLeft, Loader2 } from "lucide-react";
import { searchBusinesses, exportCSV } from "../services/api";

export default function ConsolePage({ onBackToLanding }) {
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

  // Badge background colors based on UX spec
  const getTypeBadgeStyles = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("coaching")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (t.includes("college")) return "bg-green-100 text-green-800 border-green-200";
    if (t.includes("university")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (t.includes("school")) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-white text-[#475569] px-12 py-12 flex flex-col justify-between" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* 1. Header Zone */}
      <header className="flex items-start justify-between pb-8 border-b border-[#CBD5E1]">
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold text-[#0f172a] leading-none tracking-tight">
            BizScraper Pro
          </h1>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#475569]">
            Local Business Data Extractor
          </p>
        </div>
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#CBD5E1] hover:bg-[#F8FAFC] text-xs font-medium text-[#475569] transition-all cursor-pointer"
        >
          <ArrowLeft size={13} />
          Back to Landing
        </button>
      </header>

      <main className="flex-1 py-8 space-y-8">
        
        {/* 2. Search Zone */}
        <section aria-label="Search inputs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-start gap-4 w-full">
            {/* Keyword Input */}
            <div className="flex-1 w-full space-y-1">
              <input
                type="text"
                placeholder="e.g. institute"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={`w-full h-10 px-3 rounded-[6px] border bg-[#F8FAFC] text-[#0f172a] text-[13px] outline-none transition-all
                  ${errors.keyword ? "border-[#DC2626]" : "border-[#CBD5E1] focus:border-[#1a56db]"}`}
              />
              {errors.keyword && (
                <p className="text-[11px] text-[#DC2626] font-medium ml-1">This field is required</p>
              )}
            </div>

            {/* Location Input */}
            <div className="flex-1 w-full space-y-1">
              <input
                type="text"
                placeholder="e.g. Jharkhand"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full h-10 px-3 rounded-[6px] border bg-[#F8FAFC] text-[#0f172a] text-[13px] outline-none transition-all
                  ${errors.location ? "border-[#DC2626]" : "border-[#CBD5E1] focus:border-[#1a56db]"}`}
              />
              {errors.location && (
                <p className="text-[11px] text-[#DC2626] font-medium ml-1">This field is required</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-[120px] h-10 rounded-[6px] bg-[#1a56db] text-white text-[13px] font-medium hover:opacity-88 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Running
                </>
              ) : (
                "Search"
              )}
            </button>
          </form>
        </section>

        {/* 3. Filters Zone */}
        {results.length > 0 && (
          <section className="space-y-4 pt-2" aria-label="Filter results">
            {/* City Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-[#475569] uppercase tracking-wider min-w-[50px] text-right pr-2">City:</span>
              <button
                onClick={handleClearCities}
                className={`text-[12px] px-3 py-1 rounded-[6px] border transition-colors cursor-pointer
                  ${selectedCities.size === 0
                    ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db]"
                    : "border-dashed border-[#CBD5E1] bg-white text-[#475569]"}`}
              >
                All
              </button>
              {uniqueCities.map((city) => {
                const active = selectedCities.has(city);
                return (
                  <button
                    key={city}
                    onClick={() => handleToggleCity(city)}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border flex items-center gap-1 transition-colors cursor-pointer
                      ${active
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db]"
                        : "bg-white border-[#CBD5E1] text-[#475569]"}`}
                  >
                    {active && <Check size={11} />} {city}
                  </button>
                );
              })}
            </div>

            {/* Type Row */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-[13px] font-semibold text-[#475569] uppercase tracking-wider min-w-[50px] text-right pr-2">Type:</span>
              <button
                onClick={handleClearTypes}
                className={`text-[12px] px-3 py-1 rounded-[6px] border transition-colors cursor-pointer
                  ${selectedTypes.size === 0
                    ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db]"
                    : "border-dashed border-[#CBD5E1] bg-white text-[#475569]"}`}
              >
                All
              </button>
              {uniqueTypes.map((type) => {
                const active = selectedTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleToggleType(type)}
                    className={`text-[12px] px-3 py-1 rounded-[6px] border flex items-center gap-1 transition-colors cursor-pointer
                      ${active
                        ? "bg-[#EFF6FF] border-[#1a56db] text-[#1a56db]"
                        : "bg-white border-[#CBD5E1] text-[#475569]"}`}
                  >
                    {active && <Check size={11} />} {type}
                  </button>
                );
              })}
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
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#475569]">
                  Showing <span className="font-semibold text-[#0f172a]">{filteredResults.length}</span> results
                </span>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] border border-[#1a56db] text-[#1a56db] bg-transparent hover:bg-[#EFF6FF] text-[13px] font-medium transition-colors cursor-pointer"
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
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">Business Name</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">City</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider w-24">Rating</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">Phone</th>
                      <th scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CBD5E1]">
                    {filteredResults.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`h-[44px] hover:bg-slate-50 transition-colors text-[13px] text-[#475569]
                          ${idx % 2 === 0 ? "bg-[#F8FAFC]" : "bg-white"}`}
                      >
                        <td className="px-4 py-2 font-medium text-[#0f172a] whitespace-nowrap truncate max-w-[200px]" title={r.name}>
                          {r.name}
                        </td>
                        <td className="px-4 py-2">{r.city || "—"}</td>
                        <td className="px-4 py-2 font-medium text-[#0f172a]">
                          {r.rating ? `${r.rating} ★` : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getTypeBadgeStyles(r.type)}`}>
                            {r.type || "Other"}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-[12px]" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {r.phone || "—"}
                        </td>
                        <td className="px-4 py-2 truncate max-w-[250px]" title={r.address}>
                          {r.address || "—"}
                        </td>
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
              <p className="text-[13px] text-[#475569] uppercase tracking-wider font-semibold">Workspace Idle</p>
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
        <span className="font-mono">Confidential Workspace</span>
      </footer>

    </div>
  );
}
