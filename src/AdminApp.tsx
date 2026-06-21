import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminPage from "@/pages/admin";
import AuthGate from "@/components/AuthGate";
import { Component, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif", textAlign: "center" }}>
          <h2 style={{ color: "#c00" }}>Something went wrong</h2>
          <pre style={{ fontSize: 12, color: "#555", whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
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

/** Admin-only shell: no Home/ChatWidget — separate bundle for /admin/ */
export default function AdminApp() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthGate title="HTRGroup Admin">
            <AdminPage />
          </AuthGate>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
