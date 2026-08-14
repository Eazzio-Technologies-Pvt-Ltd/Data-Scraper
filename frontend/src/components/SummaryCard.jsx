import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_BASE_URL;

export default function SummaryCard({ keyword, location, results, resetKey }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // Reset all state whenever a new search fires (resetKey increments)
  useEffect(() => {
    setIsOpen(false);
    setIsLoading(false);
    setSummary(null);
  }, [resetKey]);

  const handleClick = async () => {
    // Case 1: summary cached, card is open → collapse
    if (summary !== null && isOpen) {
      setIsOpen(false);
      return;
    }

    // Case 2: summary cached, card is closed → expand (no API call)
    if (summary !== null && !isOpen) {
      setIsOpen(true);
      return;
    }

    // Case 3: no cached summary → fetch from backend
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/ai/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, location, results }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setIsOpen(true);
    } catch (err) {
      console.error("[SummaryCard] Failed to fetch AI summary:", err);
      setSummary(null);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      {/* Button — always visible */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 bg-transparent border-none p-0"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {isLoading ? (
          <>
            <span
              className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full inline-block animate-spin"
              aria-hidden="true"
            />
            Generating summary...
          </>
        ) : isOpen ? (
          <>
            <span aria-hidden="true">✦</span>
            AI Summary
            <span aria-hidden="true">▲</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">✦</span>
            Generate AI Summary
            <span aria-hidden="true">▼</span>
          </>
        )}
      </button>

      {/* Expandable card — only rendered when open and summary exists */}
      {isOpen && summary !== null && (
        <div className="mt-2 p-4 border border-blue-100 bg-blue-50 rounded-lg">
          <p
            className="text-sm text-gray-700 leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
