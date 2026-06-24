import Link from "next/link";
import { GradientText } from "../effects/GradientText";
import { ClientHubLogo } from "../../icons";

export function LandingFooter() {
  return (
    <footer className="py-12 border-t border-white/5 bg-[#020617] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <ClientHubLogo className="h-10 w-auto text-emerald-500" />
          </div>

          <div className="flex gap-8">
            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#proof" className="text-sm text-slate-400 hover:text-white transition-colors">
              Tech Stack
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
          </div>

          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Client Hub. All rights reserved.
          </div>
          
        </div>
      </div>
    </footer>
  );
}
