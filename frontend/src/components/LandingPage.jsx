import { useState } from "react";
import { X } from "lucide-react";
import "./LandingPage.css";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onLaunchApp }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLaunchConsole = () => {
    if (user) {
      navigate('/console');
    } else {
      navigate('/login');
    }
  };

  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [showPopup, setShowPopup] = useState(true);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    setWaitlistEmail("Thanks — you are on the list.");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Thanks for reaching out. We will get back to you shortly.");
    e.target.reset();
  };

  const sources = [
    { id: "ecom", label: "E-Commerce", symbol: "⌑", x: 200, y: 50, color: "#60a5fa" },
    { id: "search", label: "Search Engines", symbol: "⌕", x: 340, y: 130, color: "#a855f7" },
    { id: "social", label: "Directories", symbol: "◎", x: 290, y: 270, color: "#ec4899" },
    { id: "db", label: "APIs", symbol: "▦", x: 110, y: 270, color: "#34d399" },
    { id: "code", label: "Web Portals", symbol: "⌘", x: 60, y: 130, color: "#fbbf24" }
  ];

  return (
    <div className="landing-wrapper">
      {/* HERO SECTION */}
      <header className="hero">
        {/* Nav element */}
        <nav className="shell nav">
          <div className="brand" aria-label="BizScraper Pro Brand Logo">
            Biz<span>Scraper</span> Pro
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="button button-outline"
              style={{ borderColor: "rgba(255, 255, 255, 0.3)", cursor: "pointer" }}
              onClick={handleLaunchConsole}
              aria-label="Launch Scraper Console Workspace"
            >
              Launch Console
            </button>
            {user ? (
              <button 
                className="button button-outline" 
                onClick={signOut} 
                aria-label="Sign Out"
                style={{ borderColor: "rgba(239, 68, 68, 0.35)", color: "#f87171", cursor: "pointer" }}
              >
                Sign Out
              </button>
            ) : (
              <button 
                className="button button-outline" 
                onClick={() => navigate('/login')} 
                aria-label="Sign In / Create Account"
                style={{ cursor: "pointer" }}
              >
                Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Hero Grid */}
        <div className="shell hero-grid">
          <div>
            <p className="eyebrow">LOCAL BUSINESS DATA, REFINED</p>
            <h1>
              Find  businesses.
              <br />
              <strong>Build better  lists.</strong>
            </h1>
            <p className="hero-copy">
              Search any Indian city and turn the businesses around you into clear, ready-to-use data in seconds.
            </p>
            <a className="button button-light" href="#waitlist" aria-label="Join the waiting list">
              Join the waitlist <span>→</span>
            </a>
            <div className="app-icons" aria-label="Available business data types">
              {/* Document Icon */}
              <svg className="mini-icon" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4zM8 8h8v2H8zm0 4h8v2H8zm0 4h5v2H8z" />
              </svg>
              {/* Spreadsheet Icon */}
              <svg className="mini-icon" viewBox="0 0 24 24">
                <path d="M3 5h18v14H3zM6 8h7v2H6zm0 4h12v2H6z" />
              </svg>
              {/* Pin Icon */}
              <svg className="mini-icon" viewBox="0 0 24 24">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
              {/* Database Cylinder Icon */}
              <svg className="mini-icon" viewBox="0 0 24 24">
                <path d="M5 3h14v18H5zM8 7h8v2H8zm0 4h8v2H8zm0 4h5v2H8z" />
              </svg>
            </div>
          </div>

          {/* Map Scene */}
          <div className="map-scene" aria-hidden="true">
            <div className="route"></div>
            <div className="route two"></div>
            <div className="location-card">
              <div className="map-top">
                <span className="pin"></span> SEARCH RESULT · JAMSHEDPUR
              </div>
              <h3>Business data, at a glance.</h3>
              <p>Names, numbers, ratings and locations — organised for your next move.</p>
              <div className="result-lines">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
            <i className="map-dot d1"></i>
            <i className="map-dot d2"></i>
            <i className="map-dot d3"></i>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main>
        {/* INTRO SECTION */}
        <section className="intro" aria-label="Product introduction">
          <i className="scribble s1" aria-hidden="true"></i>
          <div className="shell">
            <h2>
              Get ready for a faster way to build <strong>business lists that work.</strong>
            </h2>
            <div className="intro-grid">
              <p>
                Stop losing hours to manual Google Maps research. BizScraper Pro brings the useful details
                together: names, addresses, phones, ratings and more.
              </p>
              <p>
                Tell us the business type and location. We do the searching, sorting and shaping, so you can focus
                on the work that happens next.
              </p>
              <a className="button" href="#waitlist">
                Join the waitlist
              </a>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features" aria-label="Product features">
          <svg className="scribble-svg s2-svg" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M -50,120 C 150,60 300,240 550,150 C 800,60 1000,220 1250,80" stroke="#c0baf6" strokeWidth="1.3" />
          </svg>
          <div className="shell">
            <div className="feature-heading section-title">
              <div className="accent-line"></div>
              <h2>About BizScraper Pro</h2>
              <p>
                A clear, dependable workspace for sales teams, analysts and agencies who need local business
                intelligence without the busywork.
              </p>
            </div>
            <div className="feature-grid">
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">⌕</div>
                <h3>Local business search</h3>
                <p>Search Google Places by keyword and location. Get relevant businesses from any city or region in India.</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">⌘</div>
                <h3>Clean, useful details</h3>
                <p>Work with the information that matters: address, phone, website, category and Google rating in one view.</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">↗</div>
                <h3>Smart filters</h3>
                <p>Refine results by city or business type, with multi-select filters built from your actual search data.</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">▦</div>
                <h3>Structured exports</h3>
                <p>Download the exact filtered rows you need as a clean CSV, ready for Excel, a CRM or client delivery.</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">★</div>
                <h3>Data you can trust</h3>
                <p>Ratings and categories are sourced directly from Google Places to keep every list grounded in real data.</p>
              </article>
              <article className="feature">
                <div className="icon-wrap" aria-hidden="true">⌁</div>
                <h3>Made for teams</h3>
                <p>A focused interface that makes local market research feel less like a task and more like momentum.</p>
              </article>
            </div>
          </div>
        </section>

        {/* SPLIT / NETWORK SECTION */}
        <section className="split" aria-label="Interactive network visualization">
          <div className="shell split-grid">
            <div>
              <h2>An all-in-one app that makes it easier.</h2>
              <p>
                One streamlined workspace brings searching, filtering and exporting together. No scattered tabs,
                no copy-paste routine.
              </p>
              <a className="button" href="#waitlist">
                Join the waitlist
              </a>
            </div>

            {/* Interactive Spider Web Node Map */}
            <div className="network" aria-label="Interactive map of BizScraper Pro data sources">
              {/* Concentric radar rings */}
              <div className="radar" aria-hidden="true">
                <i></i>
                <i></i>
                <i></i>
              </div>

              {/* Connected SVG node graph */}
              <svg viewBox="0 0 400 340" role="img" aria-label="Business data sources connected to a central BizScraper hub">
                <defs>
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* SVG connection lines linking outer polygon nodes */}
                <g id="web-lines">
                  {sources.map((n, i) => {
                    const next = sources[(i + 1) % sources.length];
                    const isHighlighted = hoveredNodeId === n.id || hoveredNodeId === next.id;
                    return (
                      <line
                        key={`outer-${n.id}`}
                        x1={n.x}
                        y1={n.y}
                        x2={next.x}
                        y2={next.y}
                        className={`web-link ${isHighlighted ? "active" : ""}`}
                        style={{ stroke: isHighlighted ? "#7c3aed" : undefined }}
                      />
                    );
                  })}

                  {/* Radial lines from center to nodes */}
                  {sources.map((n) => {
                    const isHighlighted = hoveredNodeId === n.id;
                    return (
                      <line
                        key={`radial-${n.id}`}
                        x1={200}
                        y1={170}
                        x2={n.x}
                        y2={n.y}
                        className={`web-link radial ${isHighlighted ? "active" : ""}`}
                        style={{ stroke: isHighlighted ? n.color : undefined }}
                      />
                    );
                  })}
                </g>

                {/* Moving data packets along lines */}
                <g id="web-packets">
                  {sources.map((n, i) => (
                    <circle key={`packet-${n.id}`} r="3" fill={n.color} className="packet">
                      <animateMotion
                        path={`M ${n.x},${n.y} L 200,170`}
                        dur={`${2 + i * 0.22}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  ))}
                </g>

                {/* Central hub - BizScraper Core */}
                <circle
                  cx="200"
                  cy="170"
                  r="16"
                  fill="rgba(52, 89, 219, 0.1)"
                  stroke="#3459db"
                  strokeWidth="1.5"
                >
                  <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="170" r="6" fill="#3459db" filter="url(#neonGlow)" />

                {/* Outer Web Nodes */}
                <g id="web-nodes">
                  {sources.map((n) => {
                    return (
                      <g
                        key={`node-${n.id}`}
                        className="web-node"
                        tabIndex="0"
                        role="button"
                        aria-label={n.label}
                        style={{ "--node": n.color }}
                        onMouseEnter={() => setHoveredNodeId(n.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        onFocus={() => setHoveredNodeId(n.id)}
                        onBlur={() => setHoveredNodeId(null)}
                      >
                        {/* Outer hover ring */}
                        <circle cx={n.x} cy={n.y} r="20" className="halo" />

                        {/* Symbol icon character */}
                        <text
                          x={n.x}
                          y={n.y + 5}
                          textAnchor="middle"
                          fontSize="17"
                          className="node-icon"
                          fontFamily="JetBrains Mono"
                        >
                          {n.symbol}
                        </text>

                        {/* Node Label Tooltip */}
                        <g transform={`translate(${n.x}, ${n.y - 34})`} className="web-label">
                          <rect x="-50" y="-12" width="100" height="22" rx="6" fill="#0f172a" />
                          <text
                            x="0"
                            y="3"
                            fill="#fff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="JetBrains Mono"
                          >
                            {n.label}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        </section>

        {/* TOOLS LIST SECTION */}
        <section className="tools" aria-label="Workspace tools summary">
          <i className="scribble s3" aria-hidden="true"></i>
          <div className="shell tools-grid">
            <div>
              <h2>All the tools that you need</h2>
              <p>See the right businesses, narrow the list, and send data exactly where it needs to go.</p>
            </div>
            <div className="tool-list">
              <article className="tool">
                <span className="tool-number">01</span>
                <div>
                  <h3>Unified workspace</h3>
                  <p>
                    Search, review results, apply filters and prepare an export without jumping between
                    disconnected tools.
                  </p>
                </div>
              </article>
              <article className="tool">
                <span className="tool-number">02</span>
                <div>
                  <h3>Effortless collaboration</h3>
                  <p>
                    Consistent, client-ready CSVs mean every sales rep, analyst and partner receives the same
                    clear data.
                  </p>
                </div>
              </article>
              <article className="tool">
                <span className="tool-number">03</span>
                <div>
                  <h3>Streamlined efficiency</h3>
                  <p>
                    Spend less time collecting basic information and more time turning qualified businesses into
                    opportunities.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* TEAM / COLLABORATION SECTION */}
        <section className="team" aria-label="Team collaboration info">
          <div className="shell team-grid">
            <div>
              <h2>Work with your team. Work faster.</h2>
              <p>
                Give your sales and research teams a dependable foundation for every outreach list, territory scan
                and market review.
              </p>
            </div>
            <div className="team-visual" role="img" aria-label="Abstract visual of a business search workspace"></div>
          </div>
        </section>

        {/* WAITLIST SECTION */}
        <section id="waitlist" className="waitlist" aria-label="Waitlist sign up form">
          <div className="shell">
            <h2>
              Join <strong>our waitlist now</strong> and be the first to experience faster local research.
            </h2>
            <form className="signup" onSubmit={handleWaitlistSubmit} aria-label="Waitlist signup">
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Email address"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
              />
              <button className="button" type="submit">
                Join
              </button>
            </form>

            <div className="benefits">
              <article className="benefit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 3v18M3 12h18" />
                </svg>
                <h3>Early access</h3>
                <p>Be among the first to build polished local-business lists with BizScraper Pro.</p>
              </article>
              <article className="benefit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M4 19V5l16 7-16 7z" />
                </svg>
                <h3>Exclusive offers</h3>
                <p>Receive founder-only pricing and product updates before the public launch.</p>
              </article>
              <article className="benefit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 3a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7z" />
                </svg>
                <h3>Privacy first</h3>
                <p>We only use your email for launch news. No spam, no unnecessary noise.</p>
              </article>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section className="contact" aria-label="Contact form">
          <div className="shell contact-grid">
            <div>
              <h2>
                Do you have <strong>any questions?</strong>
              </h2>
              <p>Tell us how your team currently builds business lists. We would love to hear from you.</p>
            </div>
            <form className="contact-form" onSubmit={handleContactSubmit} aria-label="Contact form">
              <input required aria-label="Your name" placeholder="Your name" />
              <input required type="email" aria-label="Your email" placeholder="Your email" />
              <textarea required aria-label="Your message" placeholder="Your message"></textarea>
              <button className="button" type="submit">
                Contact us
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="shell">
          <span>BizScraper Pro</span>
          <span>Privacy policy</span>
          <span>© 2025 All rights reserved</span>
        </div>
      </footer>

      {/* Helper Popup to guide users to Launch Console */}
      {showPopup && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-[90%] sm:w-[380px] bg-[#1a1b31]/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl guide-popup flex items-start gap-3 text-white"
          style={{ 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="flex-1 space-y-1">
            <p className="text-[12px] font-bold text-violet-400 flex items-center gap-1.5 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span>💡</span> Workspace Explorer
            </p>
            <p className="text-[12px] text-slate-300 leading-relaxed font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
              Ready to extract local business data? Click the <strong className="text-white font-semibold">"Launch Console"</strong> button in the top-right corner to get started!
            </p>
          </div>
          <button 
            onClick={() => setShowPopup(false)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer focus:outline-none p-1 hover:bg-white/5 rounded-md self-center"
            title="Dismiss guide"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
