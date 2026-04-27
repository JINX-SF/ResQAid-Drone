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
import RequestAssistancePage from "@/pages/RequestAssistancePage"
import UsersPage from "./pages/UsersPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/confirmatiopage" element={<ConfirmationPage />} />

          <Route path="/dronespage" element={<DronesPage />} />
          <Route path="/emergencyrequestspage" element={<EmergencyRequestsPage />} />
          <Route path="/requestpage" element={<RequestPage />} /> 
          <Route path="/request-assistance" element={<RequestAssistancePage />} />

          <Route path="/userspage" element={<UsersPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/infos" element={<Infos />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          <Route path="/controle" element={<ProtectedRoute><Controle /></ProtectedRoute> }/>
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
