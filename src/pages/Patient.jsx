import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/PatientContext';
import api from '../api/api';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Smartphone, 
  HeartPulse, 
  ChevronRight,
  ShieldCheck,
  Activity
} from "lucide-react";

function Patient() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get("id");
  
  const { waitingPatients, consultedPatients, currentTokenNo, avgConsultingTime, toasts } = useSocket();
  
  const [localPatient, setLocalPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [inputId, setInputId] = useState("");

  // Fetch patient details on ID change
  useEffect(() => {
    if (!patientId) {
      setLocalPatient(null);
      return;
    }

    const fetchPatient = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const res = await api.get(`/receptionist/patient/${patientId}`);
        if (res.data.success) {
          setLocalPatient(res.data.patient);
        } else {
          setFetchError("Patient details not found.");
        }
      } catch (err) {
        console.error(err);
        setFetchError(err.response?.data?.message || "Invalid or expired tracking code.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  // Reactive lookup inside Socket Context
  const livePatient = useMemo(() => {
    if (!localPatient) return null;

    // Check waiting/consulting list
    const inWaiting = waitingPatients.find(p => p.cryptoId === localPatient.cryptoId || p._id === localPatient._id);
    if (inWaiting) return inWaiting;

    // Check completed/consulted list
    const inCompleted = consultedPatients.find(p => p.cryptoId === localPatient.cryptoId || p._id === localPatient._id);
    if (inCompleted) return inCompleted;

    return localPatient;
  }, [localPatient, waitingPatients, consultedPatients]);

  // Compute live queue statistics
  const queueStats = useMemo(() => {
    if (!livePatient) return { membersAhead: 0, waitTime: 0 };
    
    if (livePatient.status !== "WAITING") {
      return { membersAhead: 0, waitTime: 0 };
    }

    // Count waiting or consulting patients with lower token numbers
    const ahead = waitingPatients.filter(p => 
      p && 
      p.tokenNo < livePatient.tokenNo && 
      (p.status === "WAITING" || p.status === "CONSULTING")
    ).length;

    const actualAvgTime = avgConsultingTime || 10;
    
    return {
      membersAhead: ahead < 0 ? 0 : ahead,
      waitTime: (ahead < 0 ? 0 : ahead) * actualAvgTime
    };
  }, [livePatient, waitingPatients, avgConsultingTime]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputId.trim()) return;
    setSearchParams({ id: inputId.trim() });
  };

  const clearSearch = () => {
    setSearchParams({});
    setInputId("");
    setLocalPatient(null);
    setFetchError("");
  };

  // Render Form if no active patient loaded
  if (!livePatient) {
    return (
      <div className="min-h-screen bg-[#f5fbf7] flex items-center justify-center p-4">
        {/* Subtle decorative background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-12 -translate-y-12 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-12 translate-y-12 pointer-events-none" />

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-50/50 p-8 w-full max-w-[480px] z-10 transition-all">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-50">
              <HeartPulse size={36} className="animate-pulse" />
            </div>
            
            <div>
              <h1 className="text-2xl font-black text-[#1a2e24]">Live Queue Tracker</h1>
              <p className="text-sm font-semibold text-slate-500 mt-2 max-w-sm">
                Enter your secure Access Code or Token Number to view your live consultation status.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-xs font-bold text-[#668875] uppercase tracking-wider" htmlFor="trackingCode">
                  Access Code / Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="trackingCode"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder="e.g. abc123xyz or 105"
                    className="w-full bg-[#f8fbf9] py-3.5 pl-4 pr-12 border border-[#e2efe6] rounded-2xl outline-none focus:border-[#15803d] focus:ring-2 focus:ring-emerald-50 text-sm text-[#1a2e24] font-semibold transition-all placeholder:text-slate-400 placeholder:font-medium shadow-inner"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-400">
                    <Smartphone size={18} />
                  </div>
                </div>
              </div>

              {fetchError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 py-3 px-4 rounded-xl text-xs font-bold leading-normal">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{fetchError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#15803d] hover:bg-[#126630] disabled:bg-slate-400 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-100/50 hover:shadow-emerald-200/50 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Fetching status...
                  </>
                ) : (
                  <>
                    Track Queue Status
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Toast Notifications Container */}
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
          {toasts && toasts.map(toast => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${
                toast.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                  : 'bg-blue-50 text-blue-800 border-blue-100'
              }`}
            >
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-600" />
                ) : (
                  <Activity size={18} className="text-blue-600" />
                )}
              </div>
              <div className="text-xs font-bold leading-normal">{toast.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Visual status-dependent styling & settings
  const isWaiting = livePatient.status === "WAITING";
  const isConsulting = livePatient.status === "CONSULTING";
  const isCompleted = livePatient.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#1a2e24] flex flex-col font-sans">
      {/* Premium Top Bar */}
      <header className="bg-white border-b border-emerald-50/60 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex justify-between items-center shadow-sm">
        <button
          onClick={clearSearch}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-all cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Exit Tracker</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100/50 rounded-full px-3.5 py-1.5 shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {isCompleted ? 'Inactive' : 'Live Connected'}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6 justify-center">
        
        {/* Patient Profile Banner */}
        <section className="bg-white rounded-3xl border border-emerald-50/60 p-5 md:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">{livePatient.name}</h2>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold uppercase">
                  {livePatient.gender}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Age: {livePatient.age} years • Patient ID: <span className="font-mono text-slate-500 uppercase">{livePatient.cryptoId.slice(0, 8)}</span>
              </p>
            </div>
          </div>
          <div className="bg-[#f5fbf7] border border-[#e2efe6] rounded-2xl px-5 py-3 flex flex-col sm:items-end self-stretch sm:self-auto text-center sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Token Number</span>
            <span className="text-2xl font-black text-[#15803d] mt-1">#{livePatient.tokenNo}</span>
          </div>
        </section>

        {/* Core Status Block */}
        <section className="flex-1 flex flex-col justify-center">
          {isWaiting && (
            <div className="bg-white rounded-3xl border border-emerald-50/80 p-6 md:p-8 shadow-md flex flex-col items-center text-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
              
              <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                <Clock size={40} className="animate-spin duration-1000" style={{ animationDuration: '60s' }} />
              </div>

              <div>
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                  Waiting in Queue
                </span>
                
                {queueStats.membersAhead === 0 ? (
                  <h1 className="text-3xl md:text-4xl font-black text-[#1a2e24] mt-4 leading-tight">
                    You are Next in Line!
                  </h1>
                ) : (
                  <h1 className="text-4xl md:text-5xl font-black text-[#1a2e24] mt-4 tracking-tight">
                    ~{queueStats.waitTime} <span className="text-xl md:text-2xl font-bold text-slate-400">mins</span>
                  </h1>
                )}
                
                <p className="text-sm font-semibold text-slate-500 mt-2.5 max-w-md mx-auto">
                  {queueStats.membersAhead === 0 
                    ? "Please stay close to the doctor's room. You will be called in momentarily."
                    : `Estimated wait time based on average speed. Your token will be called shortly.`}
                </p>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md border-t border-[#f5fbf7] pt-6 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members Ahead</span>
                  <span className="text-2xl font-black text-slate-700 mt-1">
                    {queueStats.membersAhead === 0 ? "None (Next)" : queueStats.membersAhead}
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-[#eef5f0]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Now Consulting</span>
                  <span className="text-2xl font-black text-[#15803d] mt-1">
                    #{currentTokenNo}
                  </span>
                </div>
              </div>
            </div>
          )}

          {isConsulting && (
            <div className="bg-emerald-50/30 rounded-3xl border-2 border-emerald-500 p-8 shadow-lg shadow-emerald-50 flex flex-col items-center text-center gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] animate-pulse" />
              
              <div className="relative">
                {/* Double pulsing rings */}
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-25 scale-110" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-15 scale-125" style={{ animationDelay: '0.3s' }} />
                <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200 z-10 relative">
                  <HeartPulse size={40} className="animate-pulse" />
                </div>
              </div>

              <div className="z-10">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest">
                  Active Consulting
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-[#15803d] mt-4 tracking-tight animate-bounce">
                  Please Enter Cabin Now
                </h1>
                <p className="text-sm font-semibold text-[#1a2e24] max-w-sm mx-auto mt-2">
                  It's your turn! The doctor is waiting for you in the consultation room.
                </p>
              </div>

              <div className="w-full max-w-md bg-white border border-emerald-100 rounded-2xl p-4 z-10 flex items-center justify-center gap-3">
                <Sparkles size={18} className="text-emerald-500 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-xs font-bold text-[#15803d]">Consultation Started • Token #{livePatient.tokenNo}</span>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="bg-white rounded-3xl border border-emerald-50/80 p-8 shadow-md flex flex-col items-center text-center gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-400" />
              
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                <CheckCircle2 size={40} />
              </div>

              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                  Consultation Complete
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-800 mt-4 tracking-tight">
                  Thank You!
                </h1>
                <p className="text-sm font-semibold text-slate-500 max-w-sm mx-auto mt-2">
                  Your doctor's visit is completed. Wishing you a healthy and speedy recovery!
                </p>
              </div>

              <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3">
                <ShieldCheck size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Visit finalized. Have a great day!</span>
              </div>
            </div>
          )}
        </section>

        {/* Dynamic Queue Process Timeline */}
        <section className="bg-white rounded-3xl border border-emerald-50/60 p-5 md:p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
            Your Progress Stepper
          </h3>

          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-2 relative">
            {/* Visual connector line for desktop */}
            <div className="absolute left-6 md:left-0 md:top-5 right-auto md:right-0 bottom-6 md:bottom-auto top-6 md:h-0.5 md:w-full w-0.5 h-[80%] bg-[#eef5f0] -z-0" />

            {/* Stepper Steps */}
            {/* Step 1: Registered */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2.5 z-10 w-full md:w-1/4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-4 border-white">
                <CheckCircle2 size={16} />
              </div>
              <div className="text-left md:text-center flex-1 md:flex-none">
                <p className="text-xs font-black text-slate-800 leading-none">Registered</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">Patient info logged</p>
              </div>
            </div>

            {/* Step 2: Waiting */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2.5 z-10 w-full md:w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white transition-all ${
                isWaiting 
                  ? 'bg-amber-500 text-white ring-4 ring-amber-100' 
                  : (isConsulting || isCompleted) 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {isWaiting ? <Clock size={16} className="animate-spin" style={{ animationDuration: '10s' }} /> : (isConsulting || isCompleted) ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">2</span>}
              </div>
              <div className="text-left md:text-center flex-1 md:flex-none">
                <p className={`text-xs font-black leading-none ${isWaiting ? 'text-amber-600' : 'text-slate-800'}`}>In Queue</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  {isWaiting 
                    ? (queueStats.membersAhead === 0 ? "Next in line" : `${queueStats.membersAhead} ahead of you`) 
                    : (isConsulting || isCompleted) ? "Completed" : "Waiting for turn"}
                </p>
              </div>
            </div>

            {/* Step 3: Consulting */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2.5 z-10 w-full md:w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white transition-all ${
                isConsulting 
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' 
                  : isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-100 text-slate-400'
              }`}>
                {isConsulting ? <HeartPulse size={16} className="animate-pulse" /> : isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">3</span>}
              </div>
              <div className="text-left md:text-center flex-1 md:flex-none">
                <p className={`text-xs font-black leading-none ${isConsulting ? 'text-emerald-600' : 'text-slate-800'}`}>In Consultation</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  {isConsulting ? "Consulting now" : isCompleted ? "Completed" : "Pending call"}
                </p>
              </div>
            </div>

            {/* Step 4: Finished */}
            <div className="flex md:flex-col items-center gap-4 md:gap-2.5 z-10 w-full md:w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-white transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-100' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-xs font-bold">4</span>}
              </div>
              <div className="text-left md:text-center flex-1 md:flex-none">
                <p className={`text-xs font-black leading-none ${isCompleted ? 'text-emerald-600' : 'text-slate-800'}`}>Completed</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">
                  {isCompleted ? "Finished visit" : "Pending finalization"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Toast Notifications Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts && toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border border-slate-100/50 flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${
              toast.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-blue-50 text-blue-800 border-blue-100'
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600" />
              ) : (
                <Activity size={18} className="text-blue-600" />
              )}
            </div>
            <div className="text-xs font-bold leading-normal">{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Patient;
