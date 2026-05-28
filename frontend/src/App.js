import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";

import LandingPage from "@/pages/LandingPage";
import AuthCallback from "@/pages/AuthCallback";
import RoleSelectPage from "@/pages/RoleSelectPage";
import IntakeWizard from "@/pages/IntakeWizard";
import MatchesPage from "@/pages/MatchesPage";
import ArtistProfilePage from "@/pages/ArtistProfilePage";
import ArtistsBrowsePage from "@/pages/ArtistsBrowsePage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ArtistOnboardingPage from "@/pages/ArtistOnboardingPage";

function AppRouter() {
  const location = useLocation();
  // Synchronous detection of session_id - process FIRST before any other route
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/artists" element={<ArtistsBrowsePage />} />
      <Route path="/artist/:userId" element={<ArtistProfilePage />} />
      <Route path="/intake" element={<IntakeWizard />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/onboard-role" element={<RoleSelectPage />} />
      <Route path="/onboard-artist" element={<ArtistOnboardingPage />} />
      <Route path="/project/:id" element={<ProjectDetailPage />} />
      <Route path="/project/:id/matches" element={<MatchesPage />} />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
