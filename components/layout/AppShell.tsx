import { disclaimer } from "@/lib/constants/messages";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="border-b border-amber-300/20 bg-amber-300/10 px-4 py-2 text-center text-sm text-amber-100">
        {disclaimer}
      </div>
      {children}
    </div>
  );
}
