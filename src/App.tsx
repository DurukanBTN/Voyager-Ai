
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import TripPlanner from "./pages/TripPlanner";
import Itinerary from "./pages/Itinerary";
import NotFound from "./pages/NotFound";
import AnimatedTransition from "./components/AnimatedTransition";
import GumloopApiTest from "./components/GumloopApiTest";

const queryClient = new QueryClient();

const App = () => {
  // Initialize theme on app load
  useEffect(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    
    if (storedTheme) {
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      // If no stored preference, check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      localStorage.setItem("theme", prefersDark ? "dark" : "light");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <AnimatedTransition>
                <Index />
              </AnimatedTransition>
            } />
            <Route path="/plan" element={
              <AnimatedTransition>
                <TripPlanner />
              </AnimatedTransition>
            } />
            <Route path="/itinerary" element={
              <AnimatedTransition>
                <Itinerary />
              </AnimatedTransition>
            } />
            <Route path="/gumloop-test" element={
              <AnimatedTransition>
                <div className="container mx-auto px-4 pt-32 pb-20">
                  <h1 className="text-3xl font-bold mb-8 text-center">Gumloop API Integration Test</h1>
                  <div className="max-w-md mx-auto">
                    <GumloopApiTest />
                  </div>
                </div>
              </AnimatedTransition>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
