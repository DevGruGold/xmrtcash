import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Import new pages
import WrapXMRPage from "@/pages/WrapXMRPage";
import UnwrapXMRPage from "@/pages/UnwrapXMRPage";
import OnRampFiatPage from "@/pages/OnRampFiatPage";
import OffRampFiatPage from "@/pages/OffRampFiatPage";
import CashDappPage from "@/pages/CashDappPage";
import AdminPage from "@/pages/AdminPage";
import DeployPage from "@/pages/DeployPage";
import TestingPage from "@/pages/TestingPage";
import SimulationPage from "@/pages/SimulationPage";
import AutonomousPage from "@/pages/AutonomousPage";
import MeshnetPage from "@/pages/MeshnetPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/deploy" element={<DeployPage />} />
          <Route path="/testing" element={<TestingPage />} />
          <Route path="/wrap-xmr" element={<WrapXMRPage />} />
          <Route path="/unwrap-xmr" element={<UnwrapXMRPage />} />
          <Route path="/onramp-fiat" element={<OnRampFiatPage />} />
          <Route path="/offramp-fiat" element={<OffRampFiatPage />} />
          <Route path="/cashdapp" element={<CashDappPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/simulation" element={<SimulationPage />} />
          <Route path="/autonomous" element={<AutonomousPage />} />
          <Route path="/meshnet" element={<MeshnetPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;