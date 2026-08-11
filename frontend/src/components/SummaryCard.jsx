export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-2">
        <span
          className="text-base leading-none mt-0.5 select-none"
          style={{ color: "#1a56db" }}
          aria-hidden="true"
        >
          ✦
        </span>
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: "#1a56db", fontFamily: "'JetBrains Mono', monospace" }}
          >
            AI Summary
          </p>
          <p
            className="text-sm text-gray-700 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
