import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import App from "./App.tsx";
import "./App.css";
const queryClient = new QueryClient();
// window.addEventListener("unhandledrejection", (event) => {
//   console.error("Unhandled rejection:", event.reason);
//   window.location.href = "/#/error"; // hash router fallback
// });

// window.addEventListener("error", (event) => {
//   console.error("Global error:", event.error);
//   window.location.href = "/#/error";
// });
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
