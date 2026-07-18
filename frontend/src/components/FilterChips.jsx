import { Check } from "lucide-react";

function ChipRow({ label, values, selected, onToggle, onClearAll }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-violet-300/60 font-mono uppercase tracking-wider min-w-10">{label}:</span>
      <button
        onClick={onClearAll}
        className={`text-xs px-3.5 py-1.2 rounded-full border transition-all duration-200 cursor-pointer
          ${selected.size === 0
            ? "border-violet-500 bg-violet-600/20 text-white shadow-[0_0_10px_rgba(124,58,237,0.2)]"
            : "border-white/5 bg-white/[0.02] text-violet-200/50 hover:bg-white/10 hover:text-white"}`}
      >
        All
      </button>
      {values.map(v => {
        const active = selected.has(v);
        return (
          <button key={v} onClick={() => onToggle(v)}
            role="checkbox" aria-checked={active}
            className={`text-xs px-3.5 py-1.2 rounded-full border flex items-center gap-1.5 transition-all duration-200 cursor-pointer
              ${active
                ? "bg-violet-600/30 border-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                : "bg-white/[0.02] border-white/5 text-violet-200/60 hover:bg-white/10 hover:text-white"}`}
          >
            {active && <Check size={10} className="stroke-[3]" />} {v}
          </button>
        );
      })}
    </div>
  );
}

export default function FilterChips({ cities, types, selectedCities, selectedTypes, onFilterChange, resultCount }) {
  return (
    <section className="space-y-3.5 bg-white/[0.01] border border-white/5 p-5 rounded-2xl backdrop-blur-md" aria-label="Filter results">
      <ChipRow label="City" values={cities} selected={selectedCities}
        onToggle={v => onFilterChange(
          (() => { const s = new Set(selectedCities); s.has(v)?s.delete(v):s.add(v); return s; })(),
          selectedTypes
        )}
        onClearAll={() => onFilterChange(new Set(), selectedTypes)}
      />
      <ChipRow label="Type" values={types} selected={selectedTypes}
        onToggle={v => onFilterChange(
          selectedCities,
          (() => { const s = new Set(selectedTypes); s.has(v)?s.delete(v):s.add(v); return s; })()
        )}
        onClearAll={() => onFilterChange(selectedCities, new Set())}
      />
      <p className="text-xs text-violet-200/40 font-mono tracking-wide mt-2">
        Active Filters: <span className="text-violet-300 font-semibold">{selectedCities.size ? [...selectedCities].join(", ") : "All cities"}</span> · <span className="text-violet-300 font-semibold">{selectedTypes.size ? [...selectedTypes].join(", ") : "All types"}</span> · <span className="text-white font-bold">{resultCount} items matched</span>
      </p>
    </section>
  );
}
