"use client";

import { useState, useRef } from "react";
import { 
  Search, MapPin, Mail, Hash, Loader2, Download, 
  AlertCircle, Upload, FileText, CheckCircle2, User as UserIcon, LogOut 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<"manual" | "resume">("manual");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [customDomains, setCustomDomains] = useState("");
  const [maxEmails, setMaxEmails] = useState("50");

  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch("http://localhost:8000/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.split(",").map(k => k.trim()).filter(k => k),
          location: location.trim(),
          customDomains: customDomains.split(",").map(d => d.trim()).filter(d => d),
          maxEmails: parseInt(maxEmails) || 50
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scraping failed");
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:8000/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Parsing failed");

      if (data.keywords && data.keywords.length > 0) {
        setKeywords(data.keywords.join(", "));
        setUploadSuccess(true);
      } else {
        setError("No relevant technical keywords found in your resume. Please enter keywords manually.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownload = () => {
    if (results.length === 0) return;
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(results, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "indeed-leads.json";
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
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
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">User Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium">User Dashboard</span>
             </div>
             <Link href="/login" className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
             </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="xl:col-span-4 space-y-6 flex flex-col h-full">
          
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-[2rem] p-8 shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Configure Search
            </h2>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-8">
              <button 
                onClick={() => setActiveTab("manual")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "manual" ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >
                Manual Search
              </button>
              <button 
                onClick={() => setActiveTab("resume")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "resume" ? "bg-slate-800 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >
                Resume Match
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "resume" ? (
                <motion.div 
                  key="resume"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6 mb-8"
                >
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${uploadSuccess ? "border-green-500/30 bg-green-500/5" : "border-slate-800 hover:border-blue-500/30 hover:bg-blue-500/5"}`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={handleResumeUpload} 
                    />
                    {isParsing ? (
                      <div className="space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto" />
                        <p className="text-sm text-slate-400 font-medium">Analyzing your experience...</p>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="space-y-4">
                        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                        <p className="text-sm font-bold text-slate-200">Resume Parsed Successfully!</p>
                        <p className="text-[10px] text-slate-500">Keywords extracted: {keywords.slice(0, 50)}...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-slate-200">Upload your Resume</p>
                           <p className="text-xs text-slate-500">PDF format • Max 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                   key="manual"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="mb-4"
                />
              )}
            </AnimatePresence>

            <form onSubmit={handleScrape} className="space-y-5 flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. React Developer, Manager"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, USA"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Domains</label>
                  <input
                    type="text"
                    value={customDomains}
                    onChange={(e) => setCustomDomains(e.target.value)}
                    placeholder="@gmail.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Count</label>
                  <input
                    type="number"
                    value={maxEmails}
                    onChange={(e) => setMaxEmails(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Initiate Search"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-8 flex flex-col h-full">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-[2rem] shadow-2xl flex-1 flex flex-col">
            
            <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="space-y-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Extracted Leads
                  {results.length > 0 && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">{results.length} Found</span>}
                </h2>
                <p className="text-xs text-slate-500">Insights and contact nodes extracted from search query</p>
              </div>

              <button
                onClick={handleDownload}
                disabled={results.length === 0}
                className="flex items-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700 px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest"
              >
                <Download className="w-4 h-4" /> Export JSON
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative">
              <AnimatePresence>
                {error ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center p-8">
                     <div className="max-w-md w-full bg-red-500/5 border border-red-500/20 rounded-3xl p-6 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <h3 className="font-bold text-lg">Analysis Encountered an Error</h3>
                        <p className="text-sm text-slate-400">{error}</p>
                     </div>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-6">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                      <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse rounded-full" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-white uppercase tracking-widest text-xs">Processing Apify Engine</p>
                      <p className="text-[10px] text-slate-500 italic">This usually takes 45-90 seconds...</p>
                    </div>
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="h-full p-4"
                  >
                    <table className="w-full text-left border-separate border-spacing-y-2">
                       <thead className="bg-slate-900 sticky top-0 z-10">
                         <tr>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">Prospect / Title</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-500 tracking-widest">Contact Identity</th>
                            <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-500 tracking-widest text-right">Verification</th>
                         </tr>
                       </thead>
                       <tbody>
                          {results.map((lead, idx) => (
                            <tr key={idx} className="group bg-slate-900/50 hover:bg-slate-800/80 transition-all rounded-2xl">
                               <td className="px-6 py-5 rounded-l-2xl">
                                  <div className="font-bold text-white mb-0.5 max-w-[300px] truncate">{lead.title || "Unknown Professional"}</div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-[300px]">{lead.keyword || "General Search"}</div>
                               </td>
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-blue-400" />
                                     </div>
                                     <span className="font-medium text-blue-100">{lead.email}</span>
                                  </div>
                               </td>
                               <td className="px-6 py-5 rounded-r-2xl text-right">
                                  {lead.url ? (
                                    <a href={lead.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/[0.15] transition-colors">
                                      Verify Profile
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Internal DB</span>
                                  )}
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-md" />
                      <FileText className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">System Idle</p>
                      <p className="text-[11px] opacity-50 mt-1 max-w-[200px]">Waiting for keyword or resume signals to start extraction.</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
