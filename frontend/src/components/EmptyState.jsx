export default function EmptyState() {
  return (
    <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-2xl backdrop-blur-md">
      <p className="text-sm font-semibold text-white tracking-wide">No matching data crawled.</p>
      <p className="text-xs text-violet-200/50 mt-1 font-mono">Try adjusting location or keyword constraints.</p>
    </div>
  );
}
