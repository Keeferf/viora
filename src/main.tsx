import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getTheme } from "./lib/theme";

// Apply the persisted theme before first paint (dark is the default).
document.documentElement.dataset.theme = getTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
