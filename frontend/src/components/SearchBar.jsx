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
    `h-11 w-full border rounded-xl px-4 text-sm font-sans outline-none transition-all duration-200 bg-white/[0.02] text-white placeholder-violet-200/30
     ${errors[field]
       ? "border-red-500/50 focus:border-red-500 focus:shadow-[0_0_12px_rgba(239,68,68,0.2)]"
       : "border-white/10 focus:border-[#7c3aed]/50 focus:bg-white/[0.04] focus:shadow-[0_0_12px_rgba(124,58,237,0.2)]"}`;

  return (
    <section aria-label="Search businesses" className="w-full">
      <div className="flex gap-4 items-end flex-wrap w-full">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[10px] font-bold text-violet-300/60 uppercase tracking-widest mb-2 font-mono ml-1">Location</label>
          <input
            type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Jharkhand"
            className={inputClass("location")}
            aria-label="Location"
            aria-describedby={errors.location ? "loc-err" : undefined}
          />
          {errors.location && <p id="loc-err" className="text-red-400 text-xs mt-1.5 font-mono ml-1">{errors.location}</p>}
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[10px] font-bold text-violet-300/60 uppercase tracking-widest mb-2 font-mono ml-1">Business Keyword</label>
          <input
            type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder="e.g. institute"
            className={inputClass("keyword")}
            aria-label="Keyword"
            aria-describedby={errors.keyword ? "kw-err" : undefined}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          {errors.keyword && <p id="kw-err" className="text-red-400 text-xs mt-1.5 font-mono ml-1">{errors.keyword}</p>}
        </div>
        <button
          onClick={handleSearch} disabled={isLoading}
          aria-label="Search for businesses"
          className="h-11 px-6 bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:from-[#6d28d9] hover:to-[#9333ea] text-white text-xs font-bold uppercase tracking-wider rounded-xl
                     disabled:opacity-60 hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(124,58,237,0.3)]"
        >
          <Search size={13} className="stroke-[2.5]" /> Search
        </button>
      </div>
    </section>
  );
}
