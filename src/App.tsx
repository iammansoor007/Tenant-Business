import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TenantProvider } from "./context/TenantContext";

const PlatformDashboard = lazy(() => import("./pages/Platform"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Agency Management Platform */}
          <Route
            path="/platform/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-sans text-sm">Loading Platform...</div>}>
                <PlatformDashboard />
              </Suspense>
            }
          />
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-sans text-sm">Loading Platform...</div>}>
                <PlatformDashboard />
              </Suspense>
            }
          />

          {/* Flagship Root Domain */}
          <Route
            path="/"
            element={
              <TenantProvider forcedSlug="max-quality-roofing">
                <Index />
              </TenantProvider>
            }
          />

          {/* Dynamic Client Pitch: domain.com/:clientId */}
          <Route
            path="/:clientId"
            element={
              <TenantProvider>
                <Index />
              </TenantProvider>
            }
          />

          {/* Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
