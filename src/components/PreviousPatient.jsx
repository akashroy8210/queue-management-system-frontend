import React from 'react';
import { useSocket } from '../context/PatientContext';
import { User, VenusAndMars } from 'lucide-react';

function PreviousPatient() {
  const { consultedPatients } = useSocket();
  
  // Find the last patient in the consultedPatients array
  const previousPatient = consultedPatients && consultedPatients.length > 0 
    ? consultedPatients[consultedPatients.length - 1] 
    : null;

  const formatGender = (gender) => {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  if (!previousPatient) {
    return (
      <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col justify-center items-center text-center min-h-[150px] w-full flex-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Previous Consulted</span>
        <p className="text-base font-semibold text-slate-400 italic">None completed yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-3xl p-6 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col justify-between min-h-[150px] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.03)] w-full flex-1">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
            Previous Consulted
          </span>
          <h3 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight mt-2 leading-tight">{previousPatient.name}</h3>
        </div>
        
        <div className="border border-slate-200 bg-slate-100 rounded-xl px-4 py-2 flex flex-col items-center justify-center min-w-[75px] text-center shadow-inner flex-shrink-0">
          <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Token</span>
          <span className="text-2xl lg:text-3xl font-black text-slate-600 mt-0.5">{previousPatient.tokenNo}</span>
        </div>
      </div>

      <div className="flex gap-6 border-t border-slate-200 pt-3 mt-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <User size={16} className="text-slate-500" />
          <span className="font-semibold">{previousPatient.age} Years</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
          <VenusAndMars size={16} className="text-slate-500" />
          <span className="font-semibold">{formatGender(previousPatient.gender)}</span>
        </div>
      </div>
    </div>
  );
}

export default PreviousPatient;
