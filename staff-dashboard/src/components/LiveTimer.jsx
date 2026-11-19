// Counts up every second from a start time (e.g. when the user opened the current step).
import { useEffect, useState } from "react";

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function LiveTimer({ since, fallback = "—" }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!since) return undefined;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [since]);

  if (!since || now === null) return fallback;
  return mmss(Math.max(0, Math.round((now - new Date(since).getTime()) / 1000)));
}

export default LiveTimer;
