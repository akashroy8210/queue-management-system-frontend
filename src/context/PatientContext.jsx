import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [waitingPatients, setWaitingPatients] = useState([]);
    const [consultedPatients, setConsultedPatients] = useState([]);
    const [currentPatient, setCurrentPatient] = useState({});
    const [currentTokenNo, setCurrentTokenNo] = useState(100);
    const [avgConsultingTime, setAvgConsultingTime] = useState(0);
    const [totalConsultationTime, setTotalConsultationTime] = useState(0);
    const [completedPatients, setCompletedPatients] = useState(0);
    const [patientDetails, setPatientDetails] = useState({
        name: "",
        age: 0,
        gender: "",
        phone: ""
    });

    useEffect(() => {
        const socketInstance = io(import.meta.env.VITE_API_BASE_URL);
        setSocket(socketInstance);

        return () => socketInstance.disconnect();
    }, []);

    useEffect(() => {
        const fetchQueueData = async () => {
            try {
                const res = await api.get('/api/receptionist/dashboard');
                const data = res.data;
                const currentPat = data.queue.waitingPatients.find((patient) => patient.tokenNo === data.queue.currentTokenNo);
                setCurrentTokenNo(data.queue.currentTokenNo);
                setAvgConsultingTime(data.queue.avgConsultingTime);
                setTotalConsultationTime(data.queue.totalConsultationTime);
                setCompletedPatients(data.queue.completedPatients);
                setWaitingPatients(data.queue.waitingPatients);
                setConsultedPatients(data.consultedPatient);
                setCurrentPatient(currentPat || {});
            } catch (err) {
                console.log(err);
            }
        };
        fetchQueueData();
    }, []);

    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    useEffect(() => {
        if (!socket) return;

        const handleAddPatient = (data) => {
            setWaitingPatients(prev => {
                if (prev.some(p => p._id === data._id)) return prev;
                return [...prev, data];
            });
            showToast(`New Patient Registered: ${data.name} (Token #${data.tokenNo})`, 'success');
        };

        const handleQueueUpdate = (data) => {
            setWaitingPatients(data.waitingPatients || []);
            setConsultedPatients(data.consultedPatient || []);
            if (data.currentTokenNo) setCurrentTokenNo(data.currentTokenNo);
            if (data.avgConsultingTime !== undefined) setAvgConsultingTime(data.avgConsultingTime);
        };

        const handleTokenUpdate = (data) => {
            setCurrentPatient(data.currentPatient || {});
            if (data.currentTokenNo) setCurrentTokenNo(data.currentTokenNo);
            if (data.currentPatient && data.currentPatient.name) {
                showToast(`Now Calling: Token #${data.currentTokenNo} (${data.currentPatient.name})`, 'info');
            } else {
                showToast(`Clinic consultation cleared.`, 'info');
            }
        };

        socket.on('add-patient', handleAddPatient);
        socket.on("queue-updated", handleQueueUpdate);
        socket.on("token-updated", handleTokenUpdate);

        return () => {
            socket.off('add-patient', handleAddPatient);
            socket.off("queue-updated", handleQueueUpdate);
            socket.off("token-updated", handleTokenUpdate);
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{
            socket,
            waitingPatients,
            consultedPatients,
            currentPatient,
            currentTokenNo,
            avgConsultingTime,
            totalConsultationTime,
            completedPatients,
            patientDetails,
            toasts,

            setPatientDetails,
            setWaitingPatients,
            setCurrentTokenNo,
            setAvgConsultingTime,
            setTotalConsultationTime,
            setCompletedPatients,
            setCurrentPatient,
            setConsultedPatients,
            showToast
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
