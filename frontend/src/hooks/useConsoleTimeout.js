import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function useConsoleTimeout(getSearchState) {
  const navigate = useNavigate();
  const getSearchStateRef = useRef(getSearchState);

  // Keep ref up to date with the latest getSearchState callback
  useEffect(() => {
    getSearchStateRef.current = getSearchState;
  }, [getSearchState]);

  const [showWarning, setShowWarning] = useState(() => {
    const lastActiveTimeStr = sessionStorage.getItem("lastActiveTime");
    if (!lastActiveTimeStr) return false;
    const lastActiveTime = parseInt(lastActiveTimeStr, 10);
    const initialElapsed = Date.now() - lastActiveTime;
    return initialElapsed >= 6900000 && initialElapsed < 7200000;
  });

  useEffect(() => {
    let lastActiveTimeStr = sessionStorage.getItem("lastActiveTime");
    if (!lastActiveTimeStr) {
      lastActiveTimeStr = Date.now().toString();
      sessionStorage.setItem("lastActiveTime", lastActiveTimeStr);
    }

    const handleActivity = () => {
      const stored = sessionStorage.getItem("lastActiveTime");
      if (stored) {
        const elapsed = Date.now() - parseInt(stored, 10);
        if (elapsed >= 6900000) return;
      }
      sessionStorage.setItem("lastActiveTime", Date.now().toString());
    };

    const eventOptions = { passive: true };
    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];

    events.forEach(event => {
      window.addEventListener(event, handleActivity, eventOptions);
    });

    const interval = setInterval(() => {
      const stored = sessionStorage.getItem("lastActiveTime");
      if (!stored) {
        clearInterval(interval);
        navigate("/");
        return;
      }

      const elapsed = Date.now() - parseInt(stored, 10);

      if (elapsed >= 7200000) {
        clearInterval(interval);
        
        if (getSearchStateRef.current) {
          const state = getSearchStateRef.current();
          if (state?.results?.length > 0) {
            sessionStorage.setItem("lastSearchState", JSON.stringify(state));
          }
        }

        sessionStorage.removeItem("lastActiveTime");
        navigate("/");
        return;
      }

      if (elapsed >= 6900000) {
        setShowWarning(true);
      }
    }, 30000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity, eventOptions);
      });
      clearInterval(interval);
    };
  }, [navigate]);

  return { showWarning };
}

export default useConsoleTimeout;
