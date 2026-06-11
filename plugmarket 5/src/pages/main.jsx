import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { theme } from "./styles/theme";
import { AuthProvider } from "./lib/auth";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import SellPage from "./pages/SellPage";
import FavouritesPage from "./pages/FavouritesPage";
import MessagesPage from "./pages/MessagesPage";
import AccountPage from "./pages/AccountPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import SellerPage from "./pages/SellerPage";
import AuthPage from "./pages/AuthPage";
import "./index.css";

function App() {
  // Default to DARK. Respect a saved choice if the user has toggled before.
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("pm_theme");
      if (saved === "light") return false;
      if (saved === "dark") return true;
    } catch {}
    return true; // dark by default
  });

  // Persist the user's choice
  useEffect(() => {
    try { localStorage.setItem("pm_theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const t = theme(dark);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout t={t} dark={dark} setDark={setDark} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/favourites" element={<FavouritesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/account/*" element={<AccountPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/seller/:id" element={<SellerPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
