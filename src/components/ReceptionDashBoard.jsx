import {
  User,
  VenusAndMars,
  Clock3,
  Activity,
  Users,
  X,
  UserPlus,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "../context/PatientContext";
import CurrentPatient from "../components/currentPatient"
import NextPatient from "../components/NextPatient"
import PreviousPatient from "../components/PreviousPatient"
import patientIllustration from "../assets/patient_wheelchair.png"
import api from "../api/api";
function ReceptionDashboard() {
  const [loading,setLoading]=useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState("")
  const [successData, setSuccessData] = useState(null)
  const { patientDetails, setPatientDetails, avgConsultingTime, waitingPatients, socket, setWaitingPatients, setCurrentPatient, currentPatient, setConsultedPatients, completedPatients, toasts, showToast } = useSocket()
  
  const handleChange = (e) => {
    setPatientDetails({ ...patientDetails, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const handleSubmit =async () => {
      try{
        if (!patientDetails.name || patientDetails.name.trim() === "") {
          setError("Patient name is required.")
          return
        }
        if (!patientDetails.age || Number(patientDetails.age) <= 0) {
          setError("Please enter a valid age greater than 0.")
          return
        }
        if (!patientDetails.gender || patientDetails.gender === "") {
          setError("Please select a gender.")
          return
        }
        if (!patientDetails.phone || patientDetails.phone.trim() === "") {
          setError("Phone number is required.")
          return
        }
        setLoading(true)
        setError("")
        const res=await api.post('/api/receptionist/add/patient', patientDetails)
        setPatientDetails({
          name: "",
          age: 0,
          gender: "",
          phone: ""
        })
        setSuccessData(res.data.patient)
      }catch(err){
        setError(err.response?.data?.message || "Failed to add patient. Please check server connection.")
      }finally{
        setLoading(false)
      }
  }

  const handleCallNextPatient = async () => {
    try {
      await api.get('/api/receptionist/next/patient')
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <div className='bg-[#f9fbf9] relative h-screen overflow-hidden'>

      {isOpen && (
        <div className='bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 fixed inset-0'>
          {successData ? (
            <div className='flex flex-col gap-4 bg-white rounded-3xl shadow-2xl p-8 w-[480px] animate-in fade-in zoom-in duration-200 border border-[#eef5f0] items-center text-center'>
              <div className='w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-1 animate-bounce'>
                <CheckCircle2 size={36} />
              </div>
              <h2 className='text-2xl font-black text-[#1a2e24]'>Registration Successful!</h2>
              <p className='text-sm font-semibold text-slate-500 max-w-sm'>
                Patient <span className="text-[#15803d] font-black">{successData.name}</span> has been added to the queue with Token <span className="text-[#15803d] font-black">#{successData.tokenNo}</span>.
              </p>
              
              <div className='w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-1 flex flex-col gap-2'>
                <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left'>Share Tracking Link</span>
                <div className='flex gap-2 items-center bg-white border border-slate-200 rounded-xl p-2.5 w-full justify-between'>
                  <a
                    href={successData.trackingLink || `http://localhost:5173/patient?id=${successData.cryptoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className='text-xs font-bold text-[#15803d] hover:text-[#166534] hover:underline flex items-center gap-1 truncate flex-1'
                  >
                    <span className="truncate">{successData.trackingLink || `http://localhost:5173/patient?id=${successData.cryptoId}`}</span>
                    <ExternalLink size={12} className="flex-shrink-0" />
                  </a>
                  <button
                    type='button'
                    onClick={() => {
                      const link = successData.trackingLink || `http://localhost:5173/patient?id=${successData.cryptoId}`;
                      navigator.clipboard.writeText(link);
                      alert("Link copied to clipboard!");
                    }}
                    className='bg-[#15803d] hover:bg-[#166534] text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-all flex-shrink-0'
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* WhatsApp Notification action */}
              <a
                href={successData.whatsappLink || `https://api.whatsapp.com/send?phone=${successData.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent('Welcome ' + successData.name + '! Your token number is #' + successData.tokenNo + '. Track live queue: ' + (successData.trackingLink || 'http://localhost:5173/patient?id=' + successData.cryptoId))}`}
                target="_blank"
                rel="noopener noreferrer"
                className='w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2.5 rounded-xl mt-1 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-xs flex items-center justify-center gap-2'
              >
                Send via WhatsApp
              </a>

              <button
                type='button'
                onClick={() => {
                  setSuccessData(null);
                  setIsOpen(false);
                }}
                className='w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl mt-2 cursor-pointer transition-all duration-200 text-xs'
              >
                Close
              </button>
            </div>
          ) : (
            <form action="" className='flex gap-5 flex-col bg-white rounded-3xl shadow-2xl p-8 w-[480px] animate-in fade-in zoom-in duration-200 border border-[#eef5f0]'>
              <div className='pb-3 border-b border-[#eef5f0] flex justify-between items-center'>
                <h1 className='text-2xl font-black text-[#1a2e24]'>Add Patient</h1>
                <button
                  type='button'
                  onClick={() => { 
                    setError("")
                    setIsOpen(false) 
                  }}
                  className='cursor-pointer rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 flex items-center p-1.5 transition-all duration-200'
                >
                  <X size="20px" />
                </button>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label
                  className='text-xs font-bold text-[#668875] uppercase tracking-wider'
                  htmlFor="name">Name</label>
                <input
                  value={patientDetails.name}
                  onChange={handleChange}
                  className='bg-[#f5fbf7]/50 py-2.5 px-4 border border-[#e2efe6] rounded-xl outline-none focus:border-[#15803d] focus:ring-1 focus:ring-[#15803d] text-sm text-[#1a2e24] transition-all'
                  type="text" name="name" id="name" placeholder="Enter patient name" />
              </div>

              <div className='flex flex-col gap-1.5'>
                <label
                  className='text-xs font-bold text-[#668875] uppercase tracking-wider'
                  htmlFor="phone">Phone Number</label>
                <input
                  value={patientDetails.phone || ''}
                  onChange={handleChange}
                  className='bg-[#f5fbf7]/50 py-2.5 px-4 border border-[#e2efe6] rounded-xl outline-none focus:border-[#15803d] focus:ring-1 focus:ring-[#15803d] text-sm text-[#1a2e24] transition-all'
                  type="tel" name="phone" id="phone" placeholder="Enter patient phone (e.g. 9876543210)" />
              </div>

              <div className='flex gap-4 w-full'>
                <div className='flex flex-col gap-1.5 w-full'>
                  <label
                    className='text-xs font-bold text-[#668875] uppercase tracking-wider'
                    htmlFor="age">Age</label>
                  <input
                    value={patientDetails.age === 0 ? '' : patientDetails.age}
                    onChange={handleChange}
                    className='bg-[#f5fbf7]/50 py-2.5 px-4 border border-[#e2efe6] rounded-xl outline-none focus:border-[#15803d] focus:ring-1 focus:ring-[#15803d] text-sm text-[#1a2e24] transition-all w-full'
                    type="number" name="age" id="age" placeholder="Age" />
                </div>
                <div className='flex flex-col gap-1.5 w-full'>
                  <label
                    className='text-xs font-bold text-[#668875] uppercase tracking-wider'
                    htmlFor="gender">Gender</label>
                  <select
                    value={patientDetails.gender}
                    onChange={handleChange}
                    className='bg-[#f5fbf7]/50 py-2.5 px-4 border border-[#e2efe6] rounded-xl outline-none focus:border-[#15803d] focus:ring-1 focus:ring-[#15803d] text-sm text-[#1a2e24] transition-all w-full'
                    name="gender" id="gender">
                    <option value="">Select Gender</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
              {error && <p className='bg-rose-100 text-rose-600 border border-rose-200 py-2 px-4 rounded-xl text-xs font-bold text-center leading-normal'>{error}</p>}
              <div className='flex justify-end gap-3 mt-4 pt-3 border-t border-[#eef5f0]'>
                <button
                  type='button'
                  onClick={() => { 
                    setError("")
                    setIsOpen(false) 
                  }}
                  className='px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all text-sm cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={()=>{handleSubmit()}}
                  className='bg-[#15803d] hover:bg-[#166534] text-white font-bold py-2.5 px-6 rounded-xl shadow-md shadow-emerald-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm'
                >
                  {loading ? "Adding..." : "Add Patient"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <div className='px-6 lg:px-10 py-4 flex flex-col gap-3.5 h-full max-h-screen overflow-hidden justify-between'>
        
        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 z-10 relative">
          {/* Card 1: Total Completed */}
          <div className="bg-white border border-[#eef5f0] shadow-[0_4px_15px_rgba(0,0,0,0.01)] rounded-3xl p-5 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Users size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Consults</span>
              <span className="text-xl lg:text-2xl font-black text-slate-800 mt-1 leading-none">{completedPatients || 0}</span>
            </div>
          </div>

          {/* Card 2: Waiting Patients */}
          <div className="bg-white border border-[#eef5f0] shadow-[0_4px_15px_rgba(0,0,0,0.01)] rounded-3xl p-5 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Users size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-wider">Waiting in Queue</span>
              <span className="text-xl lg:text-2xl font-black text-slate-800 mt-1 leading-none">{waitingPatients ? waitingPatients.filter(p => p.status === 'WAITING').length : 0}</span>
            </div>
          </div>

          {/* Card 3: Avg Consultation Time */}
          <div className="bg-white border border-[#eef5f0] shadow-[0_4px_15px_rgba(0,0,0,0.01)] rounded-3xl p-5 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#15803d] flex-shrink-0">
              <Clock3 size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Consultation Time</span>
              <span className="text-xl lg:text-2xl font-black text-slate-800 mt-1 leading-none">{Math.round(avgConsultingTime || 12)} min</span>
            </div>
          </div>

          {/* Card 4: Add Patient Button */}
          <button
            type="button"
            onClick={() => {
              setError("")
              setIsOpen(true)
            }}
            className="bg-[#15803d] hover:bg-[#166534] text-white border border-[#15803d] shadow-md shadow-emerald-100 rounded-3xl p-5 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-left w-full group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white flex-shrink-0 group-hover:bg-white/20 transition-all duration-200 animate-pulse">
              <UserPlus size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] lg:text-xs font-bold text-emerald-100 uppercase tracking-wider">Quick Action</span>
              <span className="text-xl lg:text-2xl font-black mt-1 leading-none">Add Patient</span>
            </div>
          </button>
        </div>

        {currentPatient && Object.keys(currentPatient).length > 0 && currentPatient.name ? (
          <CurrentPatient />
        ) : (
          <div className="bg-white rounded-3xl border border-[#eef5f0] shadow-[0_6px_25px_rgba(0,0,0,0.02)] p-6 lg:py-6 lg:px-8 pb-0 lg:pb-0 relative overflow-hidden w-full flex-1 flex flex-col justify-between min-h-[380px] transition-all duration-300 hover:shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
            
            {/* Content Area (Left Side) */}
            <div className="w-full lg:w-[50%] flex flex-col gap-3 pb-4 z-10">
              {/* Header Banner */}
              <div className="flex">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500 text-white font-bold text-[9px] uppercase tracking-wider shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                  No Active Consultation
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-400 tracking-tight leading-none mt-2">
                No Patient In Consultation
              </h1>

              {/* Message */}
              <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md">
                The queue is currently empty or there is no patient undergoing active consultation. Use the quick action above to register a patient.
              </p>

              {/* Details placeholder showing idle fields */}
              <div className="flex flex-col border-t border-[#eef5f0] pt-2 mt-4">
                {/* Status */}
                <div className="flex items-center gap-3.5 py-2">
                  <div className="w-9.5 h-9.5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 animate-pulse">
                    <Activity size={18} />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] lg:text-xs font-semibold text-slate-400 leading-none mb-0.5">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase">
                      Idle
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Connected Illustration */}
            <div className="lg:absolute lg:inset-0 lg:bottom-[48px] flex justify-center lg:justify-end items-center lg:items-end z-0 pointer-events-none py-4 lg:py-0 overflow-hidden opacity-60">
              <img
                src={patientIllustration}
                alt="Patient Wheelchair Illustration"
                className="h-auto w-full max-w-[280px] lg:max-w-none lg:h-[110%] lg:w-auto object-contain object-bottom-right mix-blend-multiply lg:translate-x-8 lg:translate-y-2 scale-105"
              />
            </div>

            {/* Footer statistics (Average consulting time & people in queue) */}
            <div className="grid grid-cols-2 gap-4 bg-[#f5fbf7] border-t border-[#e2efe6] py-3.5 px-6 lg:px-8 -mx-6 lg:-mx-8 rounded-b-3xl z-10 text-slate-500">
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
                  <span className="text-xs font-bold text-[#1a2e24] mt-0.5">{waitingPatients ? waitingPatients.filter(p => p.status === 'WAITING').length : 0}</span>
                </div>
              </div>
            </div>
            
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 w-full">
          <PreviousPatient />
          <NextPatient />
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
  )
}

export default ReceptionDashboard
