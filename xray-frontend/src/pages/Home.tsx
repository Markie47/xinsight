import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, Shield, Activity, FileText, Sparkles, Brain } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-200">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/40 via-indigo-50/20 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/40 to-transparent blur-3xl rounded-full -translate-x-1/3 translate-y-1/4 pointer-events-none" />
      
      {/* Dynamic Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 relative z-10 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center flex-1">
          {/* Left Column: Copy & Actions */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left animate-fade-in-up">
            
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-blue-600 font-bold text-sm mb-8 hover:shadow-md transition-shadow">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Gen Diagnostics
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-indigo-950 tracking-tight leading-[1.1] mb-6">
              AI-Powered <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                Medical X-ray
              </span>
              <br/>
              Interpretation <span className="text-blue-600">&</span> Reporting
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed mb-10">
              Fast, accurate, and explainable AI technology that assists healthcare
              professionals in diagnosing medical conditions from X-ray images.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/upload"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center">
                  <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />
                  Upload an X-ray
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase (Built with purely modern Tailwind layers) */}
          <div className="relative w-full max-w-lg mx-auto lg:max-w-none hidden sm:block delay-200 select-none pointer-events-none">
            {/* Soft backdrop glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[3rem] rotate-3 opacity-10 scale-105 blur-2xl" />
            
            <div className="relative bg-white/40 backdrop-blur-2xl border-2 border-white/60 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden">
              
              {/* Internal Mock Dashboard Frame */}
              <div className="bg-[#0b1120] rounded-3xl p-6 overflow-hidden relative shadow-inner h-[400px]">
                
                {/* Scanner Laser Animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_4px_rgba(96,165,250,0.6)] z-20" style={{ animation: 'scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes scan {
                    0%, 100% { transform: translateY(0); opacity: 0; }
                    10%, 90% { opacity: 1; }
                    50% { transform: translateY(380px); }
                  }
                `}} />

                {/* Top bar */}
                <div className="flex items-center justify-between mb-8 border-b border-slate-700/50 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg text-blue-400 text-[10px] font-mono font-bold tracking-widest border border-slate-700">
                    DIAGNOSTICS_ENGINE.EXE
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                   <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 h-36 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                     <Activity className="absolute right-[-15px] bottom-[-15px] w-24 h-24 text-blue-500/10 transition-transform duration-700 group-hover:scale-110" />
                     <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">AI Confidence</span>
                     <div className="text-4xl font-extrabold text-[#38bdf8] mb-2 tracking-tight">98.5%</div>
                     <div className="w-full bg-slate-700 rounded-full h-1.5 mt-auto">
                        <div className="bg-[#38bdf8] h-1.5 rounded-full w-[98.5%] shadow-[0_0_10px_#38bdf8]" />
                     </div>
                   </div>
                   
                   <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 h-36 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                     <Brain className="absolute right-[-15px] bottom-[-15px] w-24 h-24 text-emerald-500/10 transition-transform duration-700 group-hover:scale-110" />
                     <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Status</span>
                     <div className="text-3xl font-extrabold text-[#34d399] tracking-tight">Processed</div>
                     <div className="flex items-center space-x-2 mt-auto pt-3">
                       <span className="relative flex h-3 w-3">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                       </span>
                       <span className="text-xs text-slate-300 font-medium">Real-time sync</span>
                     </div>
                   </div>
                </div>

                {/* Processing bar */}
                <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/50 flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7 text-[#38bdf8]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300 text-sm font-bold">Scanning Chest X-Ray</span>
                      <span className="text-blue-400 text-sm font-bold">In progress...</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-[#38bdf8] w-2/3 shadow-[0_0_15px_#38bdf8] animate-pulse" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer / Why Choose Section mapped cleanly at the bottom but overlapping nicely */}
      <div className="relative z-20 w-full mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          
          <div className="sm:-translate-y-12 bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgb(0,0,0,0.06)] p-10 sm:p-14 rounded-[2.5rem] sm:rounded-[3rem] text-center">
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-blue-100/50">
               <Shield className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-indigo-950 mb-5 tracking-tight">
              Why Choose X-Insight?
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Our advanced AI system provides comprehensive analysis with transparency,
              security, and accuracy at its core.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}