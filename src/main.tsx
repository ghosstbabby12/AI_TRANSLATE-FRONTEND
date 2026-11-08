import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { AuthProvider } from "./auth";
import { IdiomaProvider } from "./i18n";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IdiomaProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </IdiomaProvider>
  </StrictMode>,
);
