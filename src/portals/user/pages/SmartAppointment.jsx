import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Clock, AlertCircle, CheckCircle2, Home, ArrowRight, Activity, User, Building2, MapPin, X, History, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const hourlyPredictions = [
    { time: '09:00', load: 85, occupancy: 78, prediction: 'Rising' },
    { time: '10:00', load: 92, occupancy: 88, prediction: 'Peak' },
    { time: '11:00', load: 78, occupancy: 70, prediction: 'High' },
    { time: '12:00', load: 60, occupancy: 55, prediction: 'Moderate' },
    { time: '13:00', load: 45, occupancy: 40, prediction: 'Optimal' },
    { time: '14:00', load: 42, occupancy: 35, prediction: 'Stable' },
    { time: '15:00', load: 55, occupancy: 50, prediction: 'Normal' },
    { time: '16:00', load: 70, occupancy: 65, prediction: 'Increasing' },
    { time: '17:00', load: 88, occupancy: 82, prediction: 'High' },
];

const mockHospitals = [
    { id: 'h1', name: 'City Central General', address: '123 Medical Dr', rating: 4.8, distance: '1.2 km', availability: 'Moderate' },
    { id: 'h2', name: 'Westside Community Hospital', address: '456 West Blvd', rating: 4.5, distance: '3.5 km', availability: 'High' },
    { id: 'h3', name: 'St. Marys Trauma Center', address: '789 Heritage Ln', rating: 4.9, distance: '0.8 km', availability: 'Critical' },
];

const mockDoctors = {
    h1: [
        { id: 'd1', name: 'Dr. Sarah Wilson', specialty: 'General Practitioner', availableTimes: ['09:00', '11:30', '14:00'] },
        { id: 'd2', name: 'Dr. James Chen', specialty: 'Dermatologist', availableTimes: ['10:00', '13:00', '15:30'] },
    ],
    h2: [
        { id: 'd3', name: 'Dr. Elena Rossi', specialty: 'Pediatrician', availableTimes: ['08:30', '12:00', '14:30'] },
        { id: 'd4', name: 'Dr. Marcus Thorne', specialty: 'Cardiologist', availableTimes: ['11:00', '16:00'] },
    ],
    h3: [
        { id: 'd5', name: 'Dr. Anika Gupta', specialty: 'Neurologist', availableTimes: ['09:30', '13:30', '15:00'] },
        { id: 'd6', name: 'Dr. Robert Miller', specialty: 'Orthopedic', availableTimes: ['10:30', '14:15'] },
    ],
};

const SmartAppointment = () => {
    // Selection State
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // UI State
    const [showSummary, setShowSummary] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [bookedHistory, setBookedHistory] = useState([]);

    const handleGraphClick = (data) => {
        if (data && data.activePayload && data.activePayload.length) {
            setSelectedPoint(data.activePayload[0].payload);
        }
    };

    const handleBook = () => {
        const newBooking = {
            id: Date.now(),
            hospital: selectedHospital.name,
            doctor: selectedDoctor.name,
            date: selectedDate,
            time: selectedTime,
            timestamp: new Date().toLocaleString()
        };
        setBookedHistory([newBooking, ...bookedHistory]);
        setIsBooked(true);
        setShowSummary(false);
    };

    const resetFlow = () => {
        setSelectedHospital(null);
        setSelectedDoctor(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setIsBooked(false);
        setSymptoms('');
        setRecommendation(null);
    };

    // Original Symptom Logic preserved
    const [symptoms, setSymptoms] = useState('');
    const [urgencyScore, setUrgencyScore] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    const analyzeSymptoms = () => {
        const score = Math.floor(Math.random() * 100);
        setUrgencyScore(score);
        if (score < 30) {
            setRecommendation({ type: 'HOME_CARE', title: 'Home Care Recommended', desc: 'Symptoms suggest low-urgency. We recommend rest and tele-consultation.', icon: Home, color: 'var(--success)' });
        } else if (score < 70) {
            setRecommendation({ type: 'CLINIC', title: 'Community Clinic Visit', desc: 'Please visit a local clinic for a professional check-up within 24 hours.', icon: Activity, color: 'var(--warning)' });
        } else {
            setRecommendation({ type: 'HOSPITAL', title: 'Hospital Visit Necessary', desc: 'Your symptoms require ER attention. We have pre-notified Central Hospital.', icon: AlertCircle, color: 'var(--danger)' });
        }
    };

    const getAvailabilityColor = (status) => {
        if (status === 'High') return 'var(--success)';
        if (status === 'Moderate') return 'var(--warning)';
        return 'var(--danger)';
    };

    if (isBooked) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '500px', gap: 'var(--space-lg)' }}
            >
                <div style={{ background: 'var(--success-bg)', padding: 'var(--space-xl)', borderRadius: '50%' }}>
                    <CheckCircle2 size={80} color="var(--success)" />
                </div>
                <h2 style={{ margin: 0 }}>Appointment Booked!</h2>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
                    Your ticket for <strong>{selectedDate} at {selectedTime}</strong> with <strong>{selectedDoctor.name}</strong> at <strong>{selectedHospital.name}</strong> has been confirmed.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button onClick={resetFlow} className="btn btn-primary">BOOK ANOTHER</button>
                    <button onClick={resetFlow} className="btn glass">GO BACK</button>
                </div>
            </motion.div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.15fr', gap: 'var(--space-lg)' }}>
            {/* Left Column: Symptom Analyzer & Step-by-Step Booking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="card shadow-sm">
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1.25rem' }}>Avoidable Visit Analyzer</h3>
                    <textarea
                        placeholder="Describe how you feel (e.g. 'I have a mild fever...')"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        style={{ width: '100%', height: '80px', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', background: 'var(--background)', resize: 'none' }}
                    />
                    <button onClick={analyzeSymptoms} className="btn btn-primary" style={{ marginTop: 'var(--space-md)', width: '100%' }} disabled={!symptoms}>
                        ANALYZE URGENCY
                    </button>

                    <AnimatePresence>
                        {recommendation && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: 'var(--space-lg)', overflow: 'hidden' }}>
                                <div style={{ background: 'var(--background)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${recommendation.color}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                                        <recommendation.icon color={recommendation.color} size={24} />
                                        <h4 style={{ margin: 0 }}>{recommendation.title}</h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{recommendation.desc}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Selection UI */}
                <div className="card shadow-md" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Smart Booking Flow</h3>
                        <div className="badge badge-primary">{!selectedHospital ? 'Step 1' : !selectedDoctor ? 'Step 2' : !selectedDate ? 'Step 3' : 'Step 4'}</div>
                    </div>

                    {!selectedHospital ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>SELECT NEAREST HOSPITAL</div>
                            {mockHospitals.map(h => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedHospital(h)}
                                    key={h.id}
                                    className="glass"
                                    style={{ padding: '16px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                                >
                                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px' }}>
                                        <Building2 size={20} color="var(--primary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{h.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={12} /> {h.distance}</span>
                                            <span style={{ color: getAvailabilityColor(h.availability), fontWeight: 700 }}>• {h.availability} Capacity</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} color="var(--text-muted)" />
                                </motion.div>
                            ))}
                        </div>
                    ) : !selectedDoctor ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SELECT SPECIALIST</div>
                                <button onClick={() => setSelectedHospital(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                    <ChevronLeft size={14} /> CHANGE HOSPITAL
                                </button>
                            </div>
                            {mockDoctors[selectedHospital.id].map(d => (
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedDoctor(d)}
                                    key={d.id}
                                    className="glass"
                                    style={{ padding: '16px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                                >
                                    <div style={{ background: 'var(--secondary-light)', padding: '10px', borderRadius: '12px' }}>
                                        <User size={20} color="var(--secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700 }}>{d.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.specialty} • 4 Slots Available Today</div>
                                    </div>
                                    <ArrowRight size={16} color="var(--text-muted)" />
                                </motion.div>
                            ))}
                        </div>
                    ) : !selectedDate ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SELECT PREFERRED DATE</div>
                                <button onClick={() => setSelectedDoctor(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>BACK</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                {['Today', 'Tomorrow', '23 Feb'].map(date => (
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedDate(date)}
                                        key={date}
                                        className="glass"
                                        style={{ padding: '16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', border: '1px solid var(--surface-border)' }}
                                    >
                                        <Calendar size={18} style={{ marginBottom: '8px', color: 'var(--primary)' }} />
                                        <div style={{ fontWeight: 700 }}>{date}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>SELECT TIME SLOT FOR {selectedDate.toUpperCase()}</div>
                                <button onClick={() => setSelectedDate(null)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>BACK</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {selectedDoctor.availableTimes.map(time => (
                                    <motion.div
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setSelectedTime(time); setShowSummary(true); }}
                                        key={time}
                                        className="glass"
                                        style={{ padding: '16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', border: '1px solid var(--surface-border)' }}
                                    >
                                        <Clock size={16} style={{ marginBottom: '8px', color: 'var(--primary)' }} />
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{time}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Smart Scheduler & History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="card shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Smart Scheduler</h3>
                        <div className="badge badge-success">Optimized Load</div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Click on graph points to view occupancy and prediction forecasting.
                    </p>

                    <div style={{ height: '200px', margin: '8px 0', cursor: 'crosshair' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyPredictions} onClick={handleGraphClick}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis hide />
                                <Tooltip content={() => null} />
                                <Area type="monotone" dataKey="load" stroke="var(--primary)" fill="rgba(37, 99, 235, 0.1)" strokeWidth={3} activeDot={{ r: 6, fill: 'var(--primary)' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <AnimatePresence>
                        {selectedPoint && (
                            <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--primary-light)', background: 'var(--primary-light-bg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{selectedPoint.time} Statistics</div>
                                    <div className="badge" style={{ background: 'var(--primary)', color: 'white' }}>{selectedPoint.prediction}</div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>SYSTEM LOAD</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedPoint.load}%</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>OCCUPANCY</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedPoint.occupancy}%</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Booking History Section */}
                <div className="card shadow-sm" style={{ flex: 1, minHeight: '300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-md)' }}>
                        <History size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Your Booked Appointments</h3>
                    </div>

                    {bookedHistory.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                            <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p style={{ fontSize: '0.85rem' }}>No past appointments found.<br />Start the flow to book your first visit.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {bookedHistory.map((item) => (
                                <div key={item.id} className="glass" style={{ padding: '14px', borderRadius: '14px', borderLeft: '3px solid var(--success)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.doctor}</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>CONFIRMED</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.hospital}</div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '8px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {item.date}, {item.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Dialog */}
            <AnimatePresence>
                {showSummary && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card shadow-xl" style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-xl)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h3 style={{ margin: 0 }}>Review Your Booking</h3>
                                <button onClick={() => setShowSummary(false)} className="glass-btn" style={{ padding: '8px', borderRadius: '50%' }}><X size={18} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', background: 'var(--background)', borderRadius: '20px', border: '1px solid var(--surface-border)', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Building2 size={20} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>PROVIDER</div>
                                        <div style={{ fontWeight: 700 }}>{selectedHospital?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedHospital?.address}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <User size={20} color="var(--secondary)" />
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>DOCTOR</div>
                                        <div style={{ fontWeight: 700 }}>{selectedDoctor?.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedDoctor?.specialty}</div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--primary-light-bg)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>SCHEDULED FOR</div>
                                        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{selectedDate}, {selectedTime}</div>
                                    </div>
                                    <Clock size={28} color="var(--primary)" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setShowSummary(false)} className="btn glass" style={{ flex: 1 }}>CANCEL</button>
                                <button onClick={handleBook} className="btn btn-primary" style={{ flex: 2 }}>OK BOOK APPOINTMENT</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartAppointment;
