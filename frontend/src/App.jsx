import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Heart } from "lucide-react";

// Page Views
import LandingPage from "./components/LandingPage";

// Dedicated Light-Themed Console Page
import ConsolePage from "./components/ConsolePage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing"); // "landing" or "console"

  // Dynamically toggle dark/light theme classes on body & document element
  useEffect(() => {
    if (currentPage === "console") {
      document.documentElement.classList.remove("dark");
      document.body.className = "bg-white text-[#475569] font-sans selection:bg-blue-100 selection:text-blue-800";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.className = "bg-white text-[#0f172a] overflow-x-hidden selection:bg-[#3459db]/20 selection:text-[#3459db]";
    }
  }, [currentPage]);

  // Scroll handler for navbar links
  const handleScrollToSection = (id) => {
    if (currentPage !== "landing") {
      setCurrentPage("landing");
      // Wait for DOM to switch, then scroll
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLaunchConsole = () => {
    setCurrentPage("console");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLanding = () => {
    setCurrentPage("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* Toast notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: currentPage === "console" ? "#fff" : "rgba(17, 24, 39, 0.9)",
            color: currentPage === "console" ? "#0f172a" : "#fff",
            border: currentPage === "console" ? "1px solid #CBD5E1" : "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: currentPage === "console" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
            fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
          }
        }} 
      />

      {currentPage === "landing" ? (
        <LandingPage onLaunchApp={handleLaunchConsole} />
      ) : (
        <ConsolePage onBackToLanding={handleBackToLanding} />
      )}
    </div>
  );
}
