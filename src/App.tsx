import React, { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { HomePage } from "./pages/HomePage";
import { TrainsPage } from "./pages/TrainsPage";
import { HotelsPage } from "./pages/HotelsPage";
import { PackagesPage } from "./pages/PackagesPage";
import { PlacesPage } from "./pages/PlacesPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BookTrainPage } from "./pages/BookTrainPage";
import { BookHotelPage } from "./pages/BookHotelPage";
import { BookPackagePage } from "./pages/BookPackagePage";
import { CancelTrainPage } from "./pages/CancelTrainPage";
import { CancelHotelPage } from "./pages/CancelHotelPage";
import { CancelPackagePage } from "./pages/CancelPackagePage";
import { TripBudgetPlannerPage } from "./pages/TripBudgetPlannerPage";
export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token")),
  );
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("logged_in_user");
    setIsLoggedIn(false);
  };
  return (
    <HashRouter>
      <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trains" element={<TrainsPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/budget-planner" element={<TripBudgetPlannerPage />} />

          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={isLoggedIn ? <DashboardPage /> : <Navigate to="/login" />}
          />

          <Route path="/book-train" element={<BookTrainPage />} />
          <Route path="/book-hotel" element={<BookHotelPage />} />
          <Route path="/book-package" element={<BookPackagePage />} />

          <Route path="/cancel-train" element={<CancelTrainPage />} />
          <Route path="/cancel-hotel" element={<CancelHotelPage />} />
          <Route path="/cancel-package" element={<CancelPackagePage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
