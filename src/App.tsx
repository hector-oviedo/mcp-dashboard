/** /src/App.tsx
 * App shell with routing.
 */
import { StrictMode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "@/providers/StoreProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Explorer from "@/pages/Explorer";
import Blueprint from "@/pages/Blueprint";
import Agent from "@/pages/Agent";
import Connector from "@/pages/Connector";

export default function App() {
  return (
    <StrictMode>
      <StoreProvider>
        <ThemeProvider defaultTheme="dark">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/explorer" replace />} />
              <Route path="/explorer" element={<Explorer />} />
              <Route path="/blueprint" element={<Blueprint />} />
              <Route path="/agent" element={<Agent />} />
              <Route path="/connector" element={<Connector />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </StoreProvider>
    </StrictMode>
  );
}