import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Infos from "./pages/Infos";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Controle from "./pages/Controle";
import OAuthSuccess from "./pages/OAuthSuccess";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import ConfirmationPage from "./pages/ConfirmationPage";
import DronesPage from "./pages/DronesPage";
import EmergencyRequestsPage from "./pages/EmergencyRequestsPage";
import RequestPage from "./pages/RequestPage";
import RequestAssistancePage from "@/pages/RequestAssistancePage";
import UsersPage from "./pages/UsersPage";
import MissionsPage from "./pages/MissionsPage";
import UsersMission from "./pages/users'smission"; 
import Forgot from "./pages/forgot";
import AdminRoute from "./components/AdminRoute";
import EditDrone from "./pages/EditDrone";
import EditMission from "./pages/EditMission";
import RequestDetails from "./pages/RequestDetails";
import MyRequestsPage from "./pages/MyRequestsPage";
import DisabledItemsPage from "./pages/DisabledItemsPage";
import DroneHistory from "./pages/DroneHistory";
import MissionHistory from "./pages/MissionHistory";
import MissionIntelligencePage from "./pages/MissionIntelligencePage";
import DisabledDronesPage from "./pages/DisabledDrones"; 
import DisabledMissionsPage from "./pages/DisabledMissions"; 
import Reset from "./pages/Reset";
import { CriticalAlertPopup } from "@/components/CriticalAlertPopup";

import MissionReportsDirectory from "@/pages/MissionReportsDirectory";
import MissionReport from "@/pages/MissionReport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/confirmatiopage" element={<ConfirmationPage />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/infos" element={<Infos />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Core App / Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-requests" element={<ProtectedRoute><MyRequestsPage /></ProtectedRoute>} />
          
          {/* User Specific Mission & Log Routes */}
          <Route path="/requestpage" element={<ProtectedRoute><RequestPage /></ProtectedRoute>} /> 
          <Route path="/request-assistance" element={<ProtectedRoute><RequestAssistancePage /></ProtectedRoute>} />
          <Route path="/usersmission" element={<ProtectedRoute><UsersMission /></ProtectedRoute>} />
          <Route path="/missions/:id/report" element={<ProtectedRoute><div>Full Report Coming Soon...</div></ProtectedRoute>} />

          {/* Admin Managed Infrastructure Routes */}
          <Route path="/userspage" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/controle" element={<AdminRoute><Controle /></AdminRoute>} />
          <Route path="/dronespage" element={<AdminRoute><DronesPage /></AdminRoute>} />
          <Route path="/missionsPage" element={<AdminRoute><MissionsPage /></AdminRoute>} />
          <Route path="/emergencyrequestspage" element={<AdminRoute><EmergencyRequestsPage /></AdminRoute>} />
          
          {/* Core Management & Operational Utilities */}
          <Route path="/drones/edit/:id" element={<ProtectedRoute><EditDrone /></ProtectedRoute>} />
          <Route path="/missions/edit/:id" element={<ProtectedRoute><EditMission /></ProtectedRoute>} />
          <Route path="/requests/:id" element={<ProtectedRoute><RequestDetails /></ProtectedRoute>} />
          <Route path="/requests/:id/intelligence" element={<ProtectedRoute><MissionIntelligencePage /></ProtectedRoute>} />
          <Route path="/disabled" element={<ProtectedRoute><DisabledItemsPage /></ProtectedRoute>} />
          
          {/* Historical Logs & Disabled Asset Sub-routes */}
          <Route path="/missions/:id/history" element={<ProtectedRoute><MissionHistory /></ProtectedRoute>} />
          <Route path="/drones/:id/history" element={<ProtectedRoute><DroneHistory /></ProtectedRoute>} />
          <Route path="/disabled/drones" element={<ProtectedRoute><DisabledDronesPage /></ProtectedRoute>} />
          <Route path="/disabled/missions" element={<ProtectedRoute><DisabledMissionsPage /></ProtectedRoute>} />

          {/* CATCH-ALL NOT FOUND */}
          <Route path="*" element={<NotFound />} />

          <Route path="/mission-reports" element={<MissionReportsDirectory />} />
<Route path="/mission-report/:id" element={<MissionReport />} />
        </Routes>

        {/* FIXED: Placed inside BrowserRouter context so hooks like useNavigate run seamlessly */}
        <CriticalAlertPopup />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;