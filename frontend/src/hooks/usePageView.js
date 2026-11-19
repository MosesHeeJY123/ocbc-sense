import { useEffect } from "react";
import { useJourney } from "../context/JourneyContext";
import { logEvent } from "../api/client";

// Remembers the last journey page, so Settings can say which page a change was made on.
let lastPage = null;
// Session + page last sent, so React's StrictMode double-run in dev doesn't send it twice.
let lastLogged = null;

export function getLastPage() {
  return lastPage;
}

export default function usePageView(pageId) {
  const { sessionId } = useJourney();
  useEffect(() => {
    lastPage = pageId;
    const key = `${sessionId}|${pageId}`;
    if (sessionId && lastLogged !== key) {
      lastLogged = key;
      logEvent(sessionId, pageId, "page_view");
    }
  }, [sessionId, pageId]);
}
