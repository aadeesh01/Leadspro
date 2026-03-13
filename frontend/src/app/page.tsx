"use client";

import { motion } from "framer-motion";
import { Search, Mail, ArrowRight, Shield, Zap, Target, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">LeadsPro</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-blue-400 transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3.5 h-3.5" /> Next Gen Lead Generation
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]">
              Find Leads. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Scale Faster.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Stop manual searching. Extract verified emails from Indeed profiles in seconds. Upload your resume and find matching jobs and recruiters automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/signup" className="group w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              See How it Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-12 border-y border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Users", val: "10K+" },
            { label: "Leads Found", val: "2M+" },
            { label: "Verification Rate", val: "99.8%" },
            { label: "Hours Saved", val: "50K+" },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-3xl font-black text-white">{stat.val}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 md:py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Powerful Lead Intelligence</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to automate your outreach and landing your next big deal or job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Indeed Email Extractor",
                desc: "Directly scrape verified contact info from Indeed job listings and recruiter profiles with one click.",
                icon: Mail,
                color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
              },
              {
                title: "Resume Semantic Match",
                desc: "Upload your resume and let our AI extract keywords to find the most relevant hiring leads for you.",
                icon: Zap,
                color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
              },
              {
                title: "Advanced Filters",
                desc: "Filter by location, domain extensions, and keywords to target exactly the people you need.",
                icon: Target,
                color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">LeadsPro</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 LeadsPro Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-blue-400">Privacy</a>
            <a href="#" className="hover:text-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-400">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
