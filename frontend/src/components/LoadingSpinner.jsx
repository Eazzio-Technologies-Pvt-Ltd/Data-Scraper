export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 bg-white/[0.01] border border-white/5 rounded-2xl backdrop-blur-md">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .spinner { width:36px; height:36px; border:3.5px solid rgba(255,255,255,0.05);
          border-top-color:#a855f7; border-radius:50%;
          animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite; }
      `}</style>
      <div className="spinner shadow-[0_0_15px_rgba(168,85,247,0.3)]" aria-hidden="true" />
      <p className="text-xs text-violet-300/60 font-mono tracking-widest uppercase">Crawling & Extracting...</p>
    </div>
  );
}
