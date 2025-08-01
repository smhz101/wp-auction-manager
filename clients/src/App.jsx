import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AllAuctions from "./pages/AllAuctions.jsx";
import Bids from "./pages/Bids.jsx";
import Messages from "./pages/Messages.jsx";
import Logs from "./pages/Logs.jsx";
import FlaggedUsers from "./pages/FlaggedUsers.jsx";
import Settings from "./pages/Settings.jsx";

function AppRoutes() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("path") || "/all-auctions";
    navigate(path);
  }, [navigate]);
  return (
    <Routes>
      <Route path="/all-auctions" element={<AllAuctions />} />
      <Route path="/bids" element={<Bids />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/logs" element={<Logs />} />
      <Route path="/flagged-users" element={<FlaggedUsers />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
