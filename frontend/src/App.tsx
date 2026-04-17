import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FleetProvider } from "@/context/FleetContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import TruckListPage from "./pages/Trucks";
import TruckDetailPage from "./pages/TruckDetail";
import DriverListPage from "./pages/Drivers";
import DriverProfilePage from "./pages/DriverProfile";
import JobsPage from "./pages/Jobs";
import CreateJobPage from "./pages/CreateJob";
import JobDetailPage from "./pages/JobDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FleetProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trucks" element={<TruckListPage />} />
              <Route path="/trucks/:id" element={<TruckDetailPage />} />
              <Route path="/drivers" element={<DriverListPage />} />
              <Route path="/drivers/:id" element={<DriverProfilePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/new" element={<CreateJobPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </FleetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
