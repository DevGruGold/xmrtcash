import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Core XMRT functionality pages
import WrapXMRPage from "@/pages/WrapXMRPage";
import UnwrapXMRPage from "@/pages/UnwrapXMRPage";
import OnRampFiatPage from "@/pages/OnRampFiatPage";
import OffRampFiatPage from "@/pages/OffRampFiatPage";
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
          <Route path="/wrap-xmr" element={<WrapXMRPage />} />
          <Route path="/unwrap-xmr" element={<UnwrapXMRPage />} />
          <Route path="/onramp-fiat" element={<OnRampFiatPage />} />
          <Route path="/offramp-fiat" element={<OffRampFiatPage />} />
          <Route path="/meshnet" element={<MeshnetPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;