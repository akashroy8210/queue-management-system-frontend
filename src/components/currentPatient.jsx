import React from 'react';
import { useSocket } from '../context/PatientContext';
import patientIllustration from '../assets/patient_wheelchair.png';
import api from '../api/api';
import {
  User,
  VenusAndMars,
  Clock3,
  Activity,
  Users,
  ArrowRight
} from 'lucide-react';

function CurrentPatient() {
  const { currentPatient, avgConsultingTime, waitingPatients } = useSocket();

  const handleCallNextPatient = async () => {
    try {
      await api.get('/receptionist/next/patient');
    } catch (err) {
      console.error('Error calling next patient:', err);
    }
  };

  if (!currentPatient || Object.keys(currentPatient).length === 0 || !currentPatient.name) {
    return null;
  }

  // Format gender to Title Case
  const formatGender = (gender) => {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'N/A';
    }
  };

  // Calculate actual waiting queue size
  const queueSize = waitingPatients ? waitingPatients.filter(p => p.status === 'WAITING').length : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#eef5f0] shadow-[0_6px_25px_rgba(0,0,0,0.02)] p-6 lg:py-6 lg:px-8 pb-0 lg:pb-0 relative overflow-hidden w-full flex-1 flex flex-col justify-between min-h-[380px] transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.04)]">

      {/* Content Area (Left Side) */}
      <div className="w-full lg:w-[50%] flex flex-col gap-4 pb-4 z-10">

        {/* Header Banner */}
        <div className="flex">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#15803d] text-white font-bold text-[9px] uppercase tracking-wider shadow-sm shadow-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            Currently Consulting
          </div>
        </div>

        {/* Name and Token Row */}
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a2e24] tracking-tight leading-none mt-1">
            {currentPatient.name}
          </h1>

          {/* Token Card */}
          <div className="border border-[#e2efe6] bg-[#f5fbf7] rounded-2xl p-2.5 flex flex-col items-center justify-center min-w-[85px] h-[85px] lg:min-w-[90px] lg:h-[90px] text-center flex-shrink-0 shadow-sm">
            <span className="text-[8px] font-bold text-[#668875] tracking-widest uppercase">Token No.</span>
            <span className="text-3xl lg:text-4xl font-black text-[#15803d] mt-0.5">{currentPatient.tokenNo}</span>
          </div>
        </div>

        {/* Details Vertical List (Spacious & Compact sizes) */}
        <div className="flex flex-col border-t border-[#eef5f0] pt-2 mt-1">

          {/* Age */}
          <div className="flex items-center gap-3.5 py-2 border-b border-[#eef5f0]">
            <div className="w-9.5 h-9.5 rounded-full bg-[#f0f7f3] flex items-center justify-center text-[#15803d] flex-shrink-0 shadow-sm">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-semibold text-[#668875] leading-none mb-1">Age</span>
              <span className="text-sm lg:text-base font-extrabold text-[#1a2e24]">{currentPatient.age} Years</span>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-center gap-3.5 py-2 border-b border-[#eef5f0]">
            <div className="w-9.5 h-9.5 rounded-full bg-[#f0f7f3] flex items-center justify-center text-[#15803d] flex-shrink-0 shadow-sm">
              <VenusAndMars size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-semibold text-[#668875] leading-none mb-1">Gender</span>
              <span className="text-sm lg:text-base font-extrabold text-[#1a2e24]">{formatGender(currentPatient.gender)}</span>
            </div>
          </div>

          {/* Consultation Started */}
          <div className="flex items-center gap-3.5 py-2 border-b border-[#eef5f0]">
            <div className="w-9.5 h-9.5 rounded-full bg-[#f0f7f3] flex items-center justify-center text-[#15803d] flex-shrink-0 shadow-sm">
              <Clock3 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-semibold text-[#668875] leading-none mb-1">Consultation Started</span>
              <span className="text-sm lg:text-base font-extrabold text-[#1a2e24]">{formatTime(currentPatient.consultationStartedAt)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3.5 py-2">
            <div className="w-9.5 h-9.5 rounded-full bg-[#f0f7f3] flex items-center justify-center text-[#15803d] flex-shrink-0 shadow-sm">
              <Activity size={18} />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] lg:text-xs font-semibold text-[#668875] leading-none mb-0.5">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#15803d] border border-[#d0edd8]">
                {currentPatient.status || 'IN CONSULTATION'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Call Next Button */}
        <div className="mt-1">
          <button
            onClick={handleCallNextPatient}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs tracking-wide"
          >
            <span>Call Next Patient</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* Connected Illustration: Shifted and scaled to blend organic blob behind the details text container */}
      <div className="lg:absolute lg:inset-0 lg:bottom-[48px] flex justify-center lg:justify-end items-center lg:items-end z-0 pointer-events-none py-4 lg:py-0 overflow-hidden">
        <img
          src={patientIllustration}
          alt="Patient Wheelchair Illustration"
          className="h-auto w-full max-w-[280px] lg:max-w-none lg:h-[110%] lg:w-auto object-contain object-bottom-right mix-blend-multiply lg:translate-x-8 lg:translate-y-2 scale-105"
        />
      </div>

      {/* Footer statistics (Average consulting time & people in queue) */}
      <div className="grid grid-cols-2 gap-4 bg-[#f5fbf7] border-t border-[#e2efe6] py-3.5 px-6 lg:px-8 -mx-6 lg:-mx-8 rounded-b-3xl z-10">
        {/* Avg consultation time */}
        <div className="flex items-center gap-2 justify-center">
          <div className="text-[#15803d]">
            <Clock3 size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[#668875] leading-none">Average Consultation Time</span>
            <span className="text-xs font-bold text-[#1a2e24] mt-0.5">{Math.round(avgConsultingTime || 12)} min</span>
          </div>
        </div>

        {/* People in Queue */}
        <div className="flex items-center gap-2 justify-center border-l border-[#e2efe6]">
          <div className="text-[#15803d]">
            <Users size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[#668875] leading-none">People in Queue</span>
            <span className="text-xs font-bold text-[#1a2e24] mt-0.5">{queueSize}</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CurrentPatient;
