import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/noto-sans-arabic";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/app/app";
import "@/app/i18n/i18n";
import "@/app/styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
