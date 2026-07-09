import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl as string) : null;

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    convex ? (
      <ConvexAuthProvider client={convex}>
        <App />
      </ConvexAuthProvider>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-xl text-center space-y-4">
          <h1 className="text-3xl font-bold">Backend not configured</h1>
          <p className="text-sm text-slate-300">
            The app requires a Convex backend URL but none was provided at build time.
            Add <code className="bg-slate-800 px-2 py-1 rounded">VITE_CONVEX_URL</code> as a repository variable or secret.
          </p>
          <p className="text-sm text-slate-400">
            If you already set it, make sure the workflow passes it during build.
          </p>
        </div>
      </div>
    )
  );
}
