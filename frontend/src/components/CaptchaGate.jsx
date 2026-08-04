import ReCAPTCHA from "react-google-recaptcha";

export default function CaptchaGate({ onVerified }) {
  const handleRecaptchaChange = (token) => {
    if (token) {
      onVerified();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-100 flex flex-col items-center text-center space-y-6">
        {/* Branding matching Console Page header */}
        <div className="space-y-1">
          <h2
            className="text-2xl sm:text-[29px] font-medium text-[#0f172a] leading-none tracking-tight select-none"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Biz<span className="text-[#1A56DB]">Scraper</span> Pro
          </h2>
          <p
            className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#475569]"
            style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}
          >
            Local Business Data Extractor
          </p>
        </div>

        <div className="w-full h-px bg-slate-200" />

        <div className="space-y-2">
          <h3 className="text-base font-semibold text-[#0F172A]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Security Check
          </h3>
          <p className="text-xs text-[#475569]" style={{ fontFamily: "'Inter', sans-serif" }}>
            Verify you're human to access the console
          </p>
        </div>

        {/* reCAPTCHA widget */}
        <div className="flex justify-center w-full py-2">
          <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
          />
        </div>
      </div>
    </div>
  );
}
