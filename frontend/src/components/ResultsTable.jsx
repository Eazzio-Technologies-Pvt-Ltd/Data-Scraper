import { Star } from "lucide-react";

const BADGE = {
  "Coaching Centre": "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  "College":         "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  "University":      "bg-purple-500/10 text-purple-300 border border-purple-500/20",
  "School":          "bg-amber-500/10 text-amber-300 border border-amber-500/20",
};

export default function ResultsTable({ results, onExport }) {
  if (!results.length) return null;
  return (
    <section aria-live="polite" style={{ animation: "fadeIn 200ms ease" }}>
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
      <div className="flex justify-between items-center mb-3.5">
        <span className="text-xs text-violet-200/50 font-mono tracking-wide">
          Found <span className="font-bold text-white text-sm">{results.length}</span> businesses
        </span>
        <button onClick={onExport} aria-label="Download filtered results as CSV"
          className="text-xs px-3.5 py-1.8 rounded-xl border border-violet-500/30 text-violet-200 bg-white/[0.02] hover:bg-violet-600 hover:text-white hover:border-violet-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(124,58,237,0.1)] active:scale-[0.98]">
          ↓ Download CSV
        </button>
      </div>
      <div className="border border-white/5 bg-white/[0.01] rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" style={{ tableLayout: "fixed", minWidth: "640px" }}>
            <thead>
              <tr className="bg-white/[0.03] text-violet-300 font-mono uppercase tracking-wider border-b border-white/5">
                {["Name","Address","City","Phone","Rating","Type"].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.map((r, i) => (
                <tr key={r.place_id || i} className="hover:bg-white/[0.03] transition-colors bg-white/[0.005]">
                  <td className="px-4 py-3.5 truncate text-white font-medium" title={r.name}>{r.name || "—"}</td>
                  <td className="px-4 py-3.5 truncate text-violet-200/70" title={r.address}>{r.address || "—"}</td>
                  <td className="px-4 py-3.5 text-violet-200/70">{r.city || "—"}</td>
                  <td className="px-4 py-3.5 font-mono text-violet-300">{r.phone || "—"}</td>
                  <td className="px-4 py-3.5">
                    {r.rating
                      ? <span className="flex items-center gap-1 text-amber-400 font-bold">{r.rating} <Star size={11} className="text-amber-400 fill-amber-400" /></span>
                      : <span className="text-violet-200/30">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide ${BADGE[r.type] || "bg-white/5 text-violet-300 border border-white/10"}`}>
                      {r.type || "Business"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
