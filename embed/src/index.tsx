import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Detect the API base URL from this script's own src (e.g. https://keysherpa.io)
// so callers don't have to configure anything.
function getApiBase(): string {
  const el = document.currentScript as HTMLScriptElement | null;
  if (el?.src) {
    try {
      const origin = new URL(el.src).origin;
      // Normalize to www to avoid Vercel's apex→www redirect (which strips CORS headers)
      return origin.replace("://keysherpa.io", "://www.keysherpa.io");
    } catch {
      // ignore
    }
  }
  return "https://www.keysherpa.io";
}

const API_BASE = getApiBase();

function mountAll() {
  document.querySelectorAll<HTMLElement>("[data-keysherpa]").forEach((el) => {
    if (el.dataset.mounted) return;
    el.dataset.mounted = "true";

    const orgSlug = el.dataset.org ?? "";
    const propertyId = el.dataset.property || undefined;
    const colorOverride = el.dataset.color || undefined;

    if (!orgSlug) {
      console.warn("[KeySherpa] Missing data-org on embed element.", el);
      return;
    }

    // Ensure the host element has a predictable display
    if (!el.style.display) el.style.display = "block";

    createRoot(el).render(
      <StrictMode>
        <App
          orgSlug={orgSlug}
          propertyId={propertyId}
          colorOverride={colorOverride}
          apiBase={API_BASE}
        />
      </StrictMode>
    );
  });
}

// Mount immediately if DOM is ready, otherwise wait
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAll);
} else {
  mountAll();
}
