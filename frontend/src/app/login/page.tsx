"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({ email: "", role: "" });

  // Check for existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");
      
      if (isLoggedIn === "true") {
         setSessionInfo({ email: userEmail || "", role: userRole || "" });
         setShowWelcome(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setShowWelcome(false);
  };

  const handleContinue = () => {
    if (sessionInfo.role === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard/user");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userEmail", data.user.email);

      if (data.user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/user");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-2">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your lead pipelines</p>
        </div>

        {showWelcome ? (
          <div className="space-y-8 py-4">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-10 h-10 text-blue-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-slate-400 text-sm">Signed in as <span className="text-blue-400 font-medium">{sessionInfo.email}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleContinue}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 group"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full py-4 px-6 bg-slate-950/50 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2"
              >
                Sign out & use different account
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/20 transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/20 transition-all text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Continue to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-400 font-semibold hover:text-blue-300">Create one free</Link>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col gap-2">
           <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold text-center">Demo Accounts</p>
           <div className="flex justify-center gap-4 text-[11px] text-slate-400">
             <span>Admin: <code className="text-blue-400/70">admin@pro.com</code></span>
             <span>User: <code className="text-blue-400/70">user@pro.com</code></span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
