"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, Users, Activity, Settings, 
  ShieldCheck, AlertTriangle, TrendingUp, Search, Mail, LogOut,
  Zap, Clock, Globe, Terminal, Key, Save, X
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const router = useRouter();

  // Auth Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userRole = localStorage.getItem("userRole");
      if (isLoggedIn !== "true" || userRole !== "admin") {
        router.push("/login");
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const fetchData = async () => {
    try {
      const [usersRes, statsRes, activityRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/activity`)
      ]);
      
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      setUsers(usersData.users || []);
      setStats(statsData);
      setActivity(activityData.activity || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const displayStats = [
    { 
      label: "Total Users", 
      val: users.length.toString(), 
      change: "Active", 
      icon: Users, 
      color: "text-blue-400" 
    },
    { 
      label: "Total Credits Used", 
      val: stats?.usage?.creditsUsed?.toString() || "0", 
      change: "System-wide", 
      icon: Zap, 
      color: "text-purple-400" 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">

      {/* User Search History Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <Users className="w-6 h-6 text-blue-400" />
                    Search History
                  </h3>
                  <p className="text-slate-400 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {selectedUser.email}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {selectedUser.searches && selectedUser.searches.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.searches.map((search: any, i: number) => (
                      <div key={i} className="p-6 bg-slate-950/50 border border-slate-800 rounded-2xl relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {search.keywords.map((kw: string, j: number) => (
                                <span key={j} className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-black uppercase tracking-widest">
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {search.location}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(search.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-2xl font-black text-white">{search.resultsCount}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Leads Found</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                    <Search className="w-12 h-12 opacity-20 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">No searches recorded yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar/TopNav Wrapper */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">LeadsPro</span>
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden md:block" />
            <div className="hidden md:flex items-center gap-1">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">Admin Console</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-tighter">Live Monitor</span>
             </div>
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-tighter">System Admin</span>
             </div>
             <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">System Overview</h1>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">v1.2.4</span>
            </div>
            <p className="text-slate-500 text-sm">Real-time diagnostics and global lead generation metrics • Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => fetchData()} className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
               <Activity className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
               Sync
             </button>
             <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20">Deploy Node</button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayStats.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem] hover:border-slate-700 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 ${s.color}`}>
                   <s.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${s.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {s.change}
                </span>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-2xl font-black">{s.val}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* User Directory Table */}
          <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl shadow-blue-900/5">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
               <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                 <Users className="w-5 h-5 text-blue-400" />
                 User Directory
               </h3>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live</span>
               </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead>
                   <tr className="bg-slate-950/30">
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-500 tracking-widest text-center w-16">#</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-500 tracking-widest">Email Identity</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-500 tracking-widest text-center">Total Searches</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-500 tracking-widest text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/40">
                    <AnimatePresence mode="popLayout">
                    {loading && users.length === 0 ? (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <Activity className="w-10 h-10 text-slate-800 animate-pulse" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Loading User Data...</p>
                          </div>
                        </td>
                      </motion.tr>
                    ) : users.map((user, i) => (
                      <motion.tr 
                        key={user.email} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-slate-800/20 transition-colors group cursor-pointer"
                        onClick={() => setSelectedUser(user)}
                      >
                        <td className="px-8 py-5 text-center text-[10px] font-black text-slate-700">{i + 1}</td>
                        <td className="px-8 py-5 font-bold text-sm text-slate-200">{user.email}</td>
                        <td className="px-8 py-5 text-center text-blue-400 font-black">{user.searches?.length || 0}</td>
                        <td className="px-8 py-5 text-right">
                          <button className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-end gap-2 ml-auto">
                            <Search className="w-3 h-3" /> History
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                 </tbody>
               </table>
            </div>
          </div>

          {/* System Health & Activity Feed */}
          <div className="lg:col-span-4 space-y-8 text-xs">
             
             {/* Live Activity Feed */}
             <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex flex-col h-[600px] overflow-hidden shadow-2xl shadow-blue-900/5">
                <div className="p-8 border-b border-slate-800">
                   <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                     <Zap className="w-4 h-4 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]" />
                     Live Activity
                   </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                   <AnimatePresence mode="popLayout">
                   {activity.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2 opacity-50">
                        <Globe className="w-8 h-8 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-center">Standby for incoming signals...</p>
                     </div>
                   ) : activity.map((act, i) => (
                     <motion.div 
                        key={act.id}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        layout
                        className={`p-4 rounded-2xl border ${act.type === 'ERROR' ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : act.type === 'CONFIG_CHANGE' ? 'bg-blue-500/5 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)]' : 'bg-slate-950 border-slate-800'} relative group overflow-hidden`}
                     >
                        <div className="flex items-start gap-3 relative z-10">
                           <div className={`mt-1 1.5 w-1.5 h-1.5 rounded-full shrink-0 ${act.type === 'ERROR' ? 'bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]' : act.type === 'CONFIG_CHANGE' ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]'}`} />
                           <div className="space-y-1 overflow-hidden">
                              <p className="font-bold text-slate-200 leading-tight">{act.summary}</p>
                              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-tighter">
                                 <Clock className="w-3 h-3" />
                                 {new Date(act.timestamp).toLocaleTimeString()}
                                 <span>•</span>
                                 <span className={act.type === 'ERROR' ? 'text-red-400' : act.type === 'CONFIG_CHANGE' ? 'text-blue-400' : 'text-slate-400'}>{act.type}</span>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                   </AnimatePresence>
                </div>
             </div>

             {/* System Pro Tip */}
             <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2rem] p-6 flex items-start gap-4 ring-1 ring-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
                <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest">Security Protocol</h4>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">System monitoring is active. All scraper nodes are currently reporting stable egress latency across 12 global regions.</p>
                </div>
             </div>
          </div>

        </div>
      </main>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
