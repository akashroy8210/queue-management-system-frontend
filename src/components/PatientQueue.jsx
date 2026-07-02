import React from 'react';
import { useSocket } from '../context/PatientContext';
import { Users } from 'lucide-react';

function PatientQueue() {
  const { waitingPatients, consultedPatients } = useSocket();

  const statusStyle = (status) => {
    if (status === "CONSULTING") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    } else if (status === "WAITING") {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    } else if (status === "COMPLETED") {
      return "bg-slate-50 text-slate-500 border border-slate-200";
    }
    return "bg-slate-100 text-slate-700";
  };

  const formatGender = (gender) => {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Filter list to get actual waiting count (excluding consulting patient if included)
  const waitingCount = waitingPatients ? waitingPatients.filter(p => p.status === 'WAITING').length : 0;

  return (
    <div className="bg-slate-50 border-r border-slate-200 h-screen flex flex-col">
      {/* Sidebar Header */}
      <div className="border-b border-slate-200 py-6 text-slate-800 flex justify-between items-center px-4">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Patient Queue</h1>
        <h2 className="gap-1.5 bg-white py-1.5 px-3 border border-slate-200 rounded-xl flex items-center text-sm font-bold text-slate-500 shadow-sm select-none">
          <Users size={18} className="text-emerald-600" />
          Waiting: <span className="text-emerald-600 font-black ml-0.5">{waitingCount}</span>
        </h2>
      </div>

      {/* Queue Body */}
      <div className="overflow-y-auto flex-1 py-3">
        {waitingPatients.length === 0 && consultedPatients.length === 0 && (
          <div className="flex justify-center items-center h-48 text-slate-400 text-base font-semibold italic">
            No Patients in the Queue
          </div>
        )}

        {/* Waiting/Consulting Patients */}
        {waitingPatients.map((patient) => (
          <div
            key={patient._id}
            className="mx-3 my-3 rounded-2xl bg-white border border-slate-100 shadow-sm p-4 flex gap-4 items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Left: Token Box */}
            <div className="bg-emerald-50/50 text-emerald-700 w-16 h-16 flex-shrink-0 flex flex-col items-center justify-center rounded-xl border border-emerald-100/60 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider leading-none">Token</span>
              <span className="text-2xl font-black leading-none mt-1">{patient.tokenNo}</span>
            </div>

            {/* Right: Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-black text-slate-800 truncate leading-none">{patient.name}</h3>
                <span className={`px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 uppercase tracking-wide flex-shrink-0 ${statusStyle(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-2.5 font-semibold">
                <span>{patient.age} Yrs</span>
                <span className="text-slate-300 font-bold">•</span>
                <span>{formatGender(patient.gender)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Consulted Patients */}
        {consultedPatients.map((patient) => (
          <div
            key={patient._id || patient.id}
            className="mx-3 my-3 rounded-2xl bg-white/60 border border-slate-100 shadow-sm p-4 flex gap-4 items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Left: Token Box */}
            <div className="bg-slate-50 text-slate-500 w-16 h-16 flex-shrink-0 flex flex-col items-center justify-center rounded-xl border border-slate-200/60 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Token</span>
              <span className="text-2xl font-black leading-none mt-1">{patient.tokenNo}</span>
            </div>

            {/* Right: Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-black text-slate-500 truncate leading-none">{patient.name}</h3>
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide flex-shrink-0 ${statusStyle(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-400 mt-2.5 font-semibold">
                <span>{patient.age} Yrs</span>
                <span className="text-slate-200 font-bold">•</span>
                <span>{formatGender(patient.gender)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PatientQueue;
