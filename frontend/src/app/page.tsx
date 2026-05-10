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
        {/* Animated Background Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[150px]" 
        />

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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup" className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2">
                Get 50 Free Credits <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2">
              See How it Works
            </motion.a>
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
      <section id="features" className="py-24 md:py-32 bg-slate-950 relative">
        <div id="how-it-works" className="absolute -top-20" />
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
              <motion.div 
                whileHover={{ y: -10 }}
                key={i} 
                className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-violet-500/50 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -z-10" />
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 md:py-32 bg-slate-900 relative border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Pay Only For What You Use</h2>
            <p className="text-slate-400 text-lg">No monthly subscriptions. Buy credits when you need them.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all text-left space-y-6">
              <h3 className="text-xl font-bold">Free Tier</h3>
              <div className="text-4xl font-black text-white">$0</div>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> 50 Free Search Credits</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> Basic Lead Extraction</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500"/> Email Outreach Templates</li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">
                Start Free
              </Link>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-cyan-600 to-violet-700 border border-violet-400/50 text-left space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:shadow-[0_0_70px_rgba(139,92,246,0.5)] transition-all">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
              <h3 className="text-xl font-bold text-white relative z-10">Pro Credits</h3>
              <div className="text-4xl font-black text-white relative z-10">$10<span className="text-lg text-cyan-200 font-normal"> / 100 credits</span></div>
              <ul className="space-y-3 text-cyan-100 text-sm relative z-10">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"/> 100 Search Credits</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"/> Advanced Filtering</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white"/> Priority Support</li>
              </ul>
              <Link href="/signup" className="block w-full py-3 text-center bg-white text-violet-900 hover:bg-cyan-50 rounded-xl font-bold transition-colors relative z-10">
                Buy Credits
              </Link>
            </div>
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
