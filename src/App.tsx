import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BatchEdit from "./pages/BatchEdit";
import EditLabel from "./pages/EditLabel";
import NotFound from "./pages/NotFound";
import BatchUpload from "@/pages/BatchUpload";
import WineUpload from "@/pages/WineUpload";
import Winemass from "@/pages/Winemass";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/batch" element={<BatchEdit />} />
          <Route path="/edit/:id" element={<EditLabel />} />
          <Route path="/upload" element={<BatchUpload />} />
          <Route path="/wineupload" element={<WineUpload />} />
          <Route path="/winemass" element={<Winemass />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
