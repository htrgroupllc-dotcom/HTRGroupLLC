import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import AdminPage from "@/pages/admin";
import BackButton from "@/components/BackButton";
import PromoPopup from "@/components/PromoPopup";
import AuthGate from "@/components/AuthGate";
import { Component, ReactNode, useState, useEffect } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif", textAlign: "center" }}>
          <h2 style={{ color: "#c00" }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, color: "#555", whiteSpace: "pre-wrap" }}>
            {(this.state.error as Error).message}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "8px 20px" }}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const WA_ICON = (
  <svg viewBox="0 0 32 32" width="26" height="26" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.648 4.83 1.78 6.867L2 30l7.363-1.754A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 0 1-5.89-1.607l-.422-.25-4.37 1.042 1.072-4.26-.276-.438A11.554 11.554 0 0 1 4.4 16C4.4 9.594 9.594 4.4 16 4.4S27.6 9.594 27.6 16 22.406 27.6 16 27.6zm6.34-8.674c-.348-.174-2.058-1.016-2.378-1.131-.32-.116-.552-.174-.785.174-.232.348-.9 1.131-1.102 1.363-.203.232-.406.26-.754.086-.348-.174-1.47-.542-2.8-1.726-1.034-.924-1.733-2.065-1.936-2.413-.203-.348-.022-.536.152-.71.157-.156.348-.406.522-.61.174-.202.232-.348.348-.58.116-.232.058-.434-.029-.61-.087-.174-.785-1.893-1.075-2.59-.283-.681-.57-.588-.785-.6-.203-.01-.435-.012-.667-.012s-.61.087-.928.434c-.32.348-1.218 1.19-1.218 2.9s1.247 3.365 1.421 3.597c.174.232 2.453 3.745 5.942 5.25.831.358 1.48.572 1.986.732.834.265 1.594.228 2.194.138.669-.1 2.058-.841 2.348-1.654.29-.812.29-1.508.203-1.654-.087-.145-.32-.232-.667-.406z"/>
  </svg>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery">
        <AuthGate title="Our Work — Gallery">
          <Gallery />
        </AuthGate>
      </Route>
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/admin">
        <AuthGate title="Admin Panel">
          <AdminPage />
        </AuthGate>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

const WA_HREF = "https://wa.me/15559554342?text=Hello%21%20I%20need%20appliance%20repair%20help.";
const WA_HREF_ES = "https://wa.me/15559554342?text=%C2%A1Hola%21%20Necesito%20ayuda%20con%20reparaci%C3%B3n%20de%20electrodom%C3%A9sticos.";

function GlobalUI() {
  const [location] = useLocation();
  const isAdmin   = location === "/admin";
  const isGallery = location === "/gallery";
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isEs = typeof window !== "undefined" &&
    (document.documentElement.lang === "es" || localStorage.getItem("lang") === "es");
  const waHref = isEs ? WA_HREF_ES : WA_HREF;

  const bubbleLine1 = isEs ? "¡Escríbenos en WhatsApp!" : "Chat with us on WhatsApp!";
  const bubbleLine2 = isEs ? "Toca Enviar → reserva al instante" : "Tap Send → instant booking";

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isAdmin || isGallery) return;
    const t = setTimeout(() => setBubbleVisible(true), 3000);
    const t2 = setTimeout(() => setBubbleVisible(false), 10000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [isAdmin, isGallery]);

  if (isAdmin || isGallery) return null;

  // Desktop: WA stacked above chat with enough gap so chat bubble doesn't reach WA button
  // Mobile:  WA at bottom-right corner, chat at bottom-left
  const waBottom = isMobile ? "24px" : "160px";
  const waRight  = "24px";

  return (
    <>
      <style>{`
        @keyframes wa-bubble-in {
          from { opacity:0; transform:translateY(8px) scale(0.92); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes wa-pulse {
          0%,100% { box-shadow: 0 4px 16px rgba(37,211,102,0.5); }
          50%      { box-shadow: 0 4px 24px rgba(37,211,102,0.9), 0 0 0 8px rgba(37,211,102,0.15); }
        }
      `}</style>

      <div style={{ position: "fixed", bottom: waBottom, right: waRight, zIndex: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
        {(bubbleVisible || hovered) && (
          <div
            onClick={() => setBubbleVisible(false)}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "10px 14px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              maxWidth: "220px",
              animation: "wa-bubble-in 0.25s ease",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "13px", color: "#111", marginBottom: "3px" }}>{bubbleLine1}</div>
            <div style={{ fontSize: "12px", color: "#444" }}>{bubbleLine2}</div>
            <div style={{
              position: "absolute", bottom: "-7px", right: "20px",
              width: 0, height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
            }} />
          </div>
        )}

        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          onMouseEnter={() => { if (!isMobile) { setHovered(true); setBubbleVisible(true); } }}
          onMouseLeave={() => { if (!isMobile) setHovered(false); }}
          onClick={() => setBubbleVisible(false)}
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "9999px",
            background: "#25D366",
            animation: bubbleVisible ? "wa-pulse 1.8s ease-in-out infinite" : "none",
            boxShadow: "0 4px 16px rgba(37,211,102,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            transition: "transform 0.2s",
          }}
        >
          {WA_ICON}
        </a>
      </div>
      <PromoPopup />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <BackButton />
          <GlobalUI />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
