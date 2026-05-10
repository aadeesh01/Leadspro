"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Search, MapPin, Mail, Hash, Loader2, Download, 
  AlertCircle, Upload, FileText, CheckCircle2, User as UserIcon, LogOut,
  X, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const [hasSearched, setHasSearched] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  
  // Email Template State
  const [emailTemplateLead, setEmailTemplateLead] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auth Check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const userRole = localStorage.getItem("userRole");
      const userEmail = localStorage.getItem("userEmail");
      
      if (isLoggedIn !== "true" || userRole !== "user") {
        router.push("/login");
        return;
      }

      if (userEmail) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me?email=${userEmail}`)
          .then(res => res.json())
          .then(data => {
            if (data.credits !== undefined) setCredits(data.credits);
          })
          .catch(console.error);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.split(",").map(k => k.trim()).filter(k => k),
          location: location.trim(),
          customDomains: customDomains.split(",").map(d => d.trim()).filter(d => d),
          maxEmails: parseInt(maxEmails) || 50,
          userEmail: localStorage.getItem("userEmail")
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Scraping failed");
      
      if (data.remainingCredits !== undefined) {
        setCredits(data.remainingCredits);
      }
      
      setResults(data.results || []);
      setHasSearched(true);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parse-resume`, {
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

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateEmailTemplate = (lead: any) => {
    return `Subject: Application for ${lead.title || "Open Position"} - ${lead.company}

Dear Hiring Manager at ${lead.company},

I hope this email finds you well.

I am writing to express my interest in the ${lead.title || "open"} position at ${lead.company}, as recently advertised. With a strong background in my field and a proven track record of delivering results, I am confident in my ability to contribute effectively to your team.

I have attached my resume for your review, which further details my experience and qualifications. I would welcome the opportunity to discuss how my skills align with the needs of ${lead.company}.

Thank you for your time and consideration.

Best regards,

[Your Name]
[Your Phone Number]
[Your LinkedIn Profile]`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      
      {/* Email Template Modal */}
      <AnimatePresence>
        {emailTemplateLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEmailTemplateLead(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    Cold Outreach Draft
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Generated template for {emailTemplateLead.company}</p>
                </div>
                <button 
                  onClick={() => setEmailTemplateLead(null)}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950/50 border border-slate-800 rounded-xl p-6 text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed custom-scrollbar mb-6">
                {generateEmailTemplate(emailTemplateLead)}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyEmail(generateEmailTemplate(emailTemplateLead))}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied to Clipboard!" : "Copy Template"}
                </button>
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
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3">User Panel</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {credits !== null && (
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-pulse">
                  <span className="text-xs font-bold text-cyan-400">⚡ {credits} Credits</span>
               </div>
             )}
             <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                <UserIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium">User Dashboard</span>
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

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="xl:col-span-4 space-y-6 flex flex-col h-full">
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_40px_rgba(139,92,246,0.1)] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-bl-full -z-10" />
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Configure Search
            </h2>

            {/* Tabs */}
            <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5 mb-8">
              <button 
                onClick={() => setActiveTab("manual")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "manual" ? "bg-white/10 text-white shadow-lg backdrop-blur-md" : "text-slate-500 hover:text-slate-300"}`}
              >
                Manual Input
              </button>
              <button 
                onClick={() => setActiveTab("resume")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "resume" ? "bg-white/10 text-white shadow-lg backdrop-blur-md" : "text-slate-500 hover:text-slate-300"}`}
              >
                AI Resume Match
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

              <motion.button 
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || isParsing || !keywords}
                className="mt-8 w-full py-4 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Extracting Leads...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Run Search (-5 Credits)
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-8 flex flex-col h-full">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_40px_rgba(139,92,246,0.1)] flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-cyan-500/5 to-violet-500/5 rounded-tl-full -z-10" />
            
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
                      <p className="font-bold text-white uppercase tracking-widest text-xs">Processing Local Engine</p>
                      <p className="text-[10px] text-slate-500 italic">This usually takes 15-30 seconds...</p>
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
                            <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-500 tracking-widest">Prospect / Title</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-500 tracking-widest">Contact Identity</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-black text-slate-500 tracking-widest text-right">Verification</th>
                         </tr>
                       </thead>
                       <tbody>
                          {results.map((lead, idx) => (
                            <tr key={idx} className="group bg-slate-900/50 hover:bg-slate-800/80 transition-all rounded-2xl">
                               <td className="px-4 py-4 rounded-l-2xl">
                                  <div className="font-bold text-white mb-0.5 max-w-[180px] lg:max-w-[220px] truncate">{lead.title || "Unknown Professional"}</div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-[180px] lg:max-w-[220px]">{lead.company} • {lead.location}</div>
                               </td>
                               <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                     <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                                     </div>
                                     <span className="font-medium text-blue-100 text-[13px] truncate max-w-[150px] lg:max-w-[200px]">{lead.email || `contact@${(lead.company || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}</span>
                                  </div>
                               </td>
                               <td className="px-4 py-4 rounded-r-2xl text-right whitespace-nowrap">
                                  {lead.url ? (
                                    <a href={lead.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/[0.15] transition-colors">
                                      Verify
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Internal DB</span>
                                  )}
                                  <button
                                     onClick={() => setEmailTemplateLead(lead)}
                                     className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/[0.15] transition-colors ml-1.5"
                                  >
                                    <Mail className="w-3 h-3" /> Draft
                                  </button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </motion.div>
                ) : hasSearched ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-red-500/5 rounded-3xl blur-md" />
                      <Search className="w-10 h-10 opacity-20" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">0 Results Found</p>
                      <p className="text-[11px] opacity-50 mt-1 max-w-[200px]">Try adjusting your keywords or location to find more matches.</p>
                    </div>
                  </div>
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
