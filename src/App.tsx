import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import "./App.css";

// Create query client for React Query
const queryClient = new QueryClient();

// Determine if the app is running on GitHub Pages
const isGitHubPages = window.location.hostname.includes('github.io');
const basename = isGitHubPages ? `/${window.location.pathname.split('/')[1]}` : '/';

// Custom CSS injection to fix background issues
const BackgroundFixStyleInjector = () => {
  useEffect(() => {
    // Create a style element
    const styleEl = document.createElement('style');
    styleEl.setAttribute('id', 'bg-fix-styles');
    
    // Add styles that forcefully enable backgrounds on elements with force-bg class
    styleEl.innerHTML = `
      /* Force backgrounds to work in all contexts */
      .force-bg {
        background-color: rgba(255, 255, 255, 0.4) !important;
        background-image: initial !important;
      }
      
      /* Specific color overrides with opacity */
      body .force-bg.bg-white {
        background-color: rgba(255, 255, 255, 0.4) !important;
        background-image: initial !important;
      }
      
      /* Update button overrides */
      body button.force-bg,
      body .button.force-bg,
      body .btn.force-bg {
        background-color: rgba(255, 255, 255, 0.4) !important;
      }
      
      /* Specific color overrides with higher specificity */
      body .force-bg.bg-gray-50 { background-color: #f9fafb !important; }
      body .force-bg.bg-gray-100 { background-color: #f3f4f6 !important; }
      body .force-bg.bg-blue-50 { background-color: #eff6ff !important; }
      body .force-bg.bg-red-50 { background-color: #fef2f2 !important; }
      
      /* Force backgrounds on hover with higher specificity */
      body .force-bg.hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
      body .force-bg.hover\\:bg-red-50:hover { background-color: #fef2f2 !important; }
      body .force-bg.hover\\:bg-blue-50:hover { background-color: #eff6ff !important; }
      
      /* Ultra-specific component overrides */
      div[class*="panel"].force-bg { background-color: white !important; }
      div[class*="card"].force-bg { background-color: white !important; }
      button[class*="button"].force-bg { background-color: white !important; }
      [class*="alert"].force-bg { background-color: white !important; }
      
      /* Fix transparent root but allow backgrounds in children */
      .notion-container, .notion-transparent, .notion-embed {
        background: none !important;
        background-color: transparent !important;
      }
      
      /* Override any inline styles */
      .force-bg[style*="background"] {
        background-color: initial !important;
        background-image: initial !important;
      }
    `;
    
    // Add the style element to the head - High priority
    document.head.appendChild(styleEl);
    
    // Additional approach: MutationObserver to catch dynamic elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const element = mutation.target as HTMLElement;
          if (element.classList.contains('force-bg')) {
            // Force override inline styles
            if (element.style.background) {
              element.style.setProperty('background', 'initial', 'important');
            }
            if (element.style.backgroundColor) {
              element.style.setProperty('background-color', 'initial', 'important');
            }
          }
        }
      });
    });
    
    // Observe the entire document for style attribute changes
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['style'], 
      subtree: true 
    });
    
    // Cleanup on component unmount
    return () => {
      const styleElement = document.getElementById('bg-fix-styles');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
      observer.disconnect();
    };
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BackgroundFixStyleInjector />
      <Toaster />
      <SonnerToaster />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
