import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Clock, AlertCircle, CheckCircle2, Home, ArrowRight, Activity, Zap, Thermometer, Heart, Activity as BP, User, Building2, MapPin, X, History, ChevronLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurgeActions } from '../../../context/SurgeActionsContext';
import { classifyUrgency, forecastLoad } from '../../../../conduit-ml';

// Extract condition keywords from free-text symptoms
const CONDITION_KEYWORDS = [
    'cardiac', 'heart', 'chest pain', 'stroke', 'fracture', 'broken',
    'fever', 'cough', 'hypertension', 'diabetes', 'respiratory',
    'breathing', 'trauma', 'seizure', 'injury'
];
const CONDITION_MAP = {
    'heart': 'cardiac', 'chest pain': 'cardiac', 'broken': 'fracture',
    'breathing': 'respiratory', 'injury': 'trauma'
};

function parseCondition(text) {
    const lower = text.toLowerCase();
    for (const kw of CONDITION_KEYWORDS) {
        if (lower.includes(kw)) return CONDITION_MAP[kw] || kw;
    }
    return 'general';
}

function parseSeverity(text) {
    const lower = text.toLowerCase();
    if (lower.includes('severe') || lower.includes('extreme') || lower.includes('unbearable')) return 5;
    if (lower.includes('moderate') || lower.includes('significant')) return 3;
    if (lower.includes('mild') || lower.includes('slight') || lower.includes('minor')) return 1;
    return 2;
}

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

    // Get rescheduled appointments from Surge Protocol deferral
    const { rescheduledAppointment } = useSurgeActions() || {};
    const allBookings = rescheduledAppointment
        ? [rescheduledAppointment, ...bookedHistory]
        : bookedHistory;

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
    const [vitals, setVitals] = useState({ heart_rate: 75, systolic_bp: 120, temperature: 37 });
    const [urgencyScore, setUrgencyScore] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hourlyPredictions, setHourlyPredictions] = useState([]);

    // Generate ML-powered hourly load forecast
    useEffect(() => {
        const fetchForecast = async () => {
            const now = new Date();
            const startHour = now.getHours();
            const day = now.getDay();
            try {
                const data = await forecastLoad(startHour, day, 10, now.getMonth() + 1);
                setHourlyPredictions(data.map(f => ({
                    time: f.time,
                    load: f.predictedWaitTime
                })));
            } catch (err) {
                console.error("Forecast failed:", err);
            }
        };
        fetchForecast();
    }, []);

    const analyzeSymptoms = async () => {
        setIsAnalyzing(true);
        const condition = parseCondition(symptoms);
        const severity = parseSeverity(symptoms);

        // ML-powered urgency classification using vitals
        const { score, level } = await classifyUrgency(condition, 35, severity, {}, vitals);

        setUrgencyScore(score);

        if (level === 'low') {
            setRecommendation({
                type: 'HOME_CARE',
                title: 'Home Care Recommended',
                desc: `Detected condition: ${condition.toUpperCase()}. ML analysis suggests low-urgency based on stable vitals.`,
                icon: Home,
                color: 'var(--success)'
            });
        } else if (level === 'moderate') {
            setRecommendation({
                type: 'CLINIC',
                title: 'Community Clinic Visit',
                desc: `Detected condition: ${condition.toUpperCase()}. Elevated vitals/symptoms. Visit a local clinic within 24 hours.`,
                icon: Activity,
                color: 'var(--warning)'
            });
        } else {
            setRecommendation({
                type: 'HOSPITAL',
                title: 'Hospital Visit Necessary',
                desc: `CRITICAL ALERT: Detected ${condition.toUpperCase()}. ML model indicates high risk. Hospital attention required.`,
                icon: AlertCircle,
                color: 'var(--danger)'
            });
        }
        setIsAnalyzing(false);
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

    const getAvailabilityColor = (status) => {
        if (status === 'High') return 'var(--success)';
        if (status === 'Moderate') return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.15fr', gap: 'var(--space-lg)', height: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: '10px' }}>
            {/* Left Column: Symptom Analyzer & Step-by-Step Booking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="card shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>ML Vital-Symptom Analyzer</h3>
                        <div className="badge badge-primary">V2.0 Statistical ML</div>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                        Our Random Forest model analyzes symptoms and clinical vitals for higher accuracy.
                    </p>

                    {/* Vitals Input Panel */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)', background: 'var(--background)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Heart size={12} color="var(--danger)" /> HEART RATE
                            </label>
                            <input
                                type="number"
                                value={vitals.heart_rate}
                                onChange={(e) => setVitals({ ...vitals, heart_rate: parseInt(e.target.value) })}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Activity size={12} color="var(--primary)" /> SYSTOLIC BP
                            </label>
                            <input
                                type="number"
                                value={vitals.systolic_bp}
                                onChange={(e) => setVitals({ ...vitals, systolic_bp: parseInt(e.target.value) })}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Thermometer size={12} color="var(--warning)" /> TEMP (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={vitals.temperature}
                                onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) })}
                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>

                    <textarea
                        placeholder="Describe how you feel (e.g. 'I have a mild fever...')"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        style={{ width: '100%', height: '80px', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', background: 'var(--background)', resize: 'none', fontFamily: 'inherit' }}
                    />

                    <button
                        onClick={analyzeSymptoms}
                        className="btn btn-primary"
                        style={{ width: '100%', height: '44px' }}
                        disabled={!symptoms || isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                                <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                PROCESSING ML INFERENCE...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                <Zap size={18} fill="currentColor" /> ANALYZE URGENCY
                            </div>
                        )}
                    </button>

                    <AnimatePresence>
                        {recommendation && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden' }}>
                                <div style={{ background: 'var(--background)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${recommendation.color}`, marginTop: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
                                        <recommendation.icon color={recommendation.color} size={20} />
                                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{recommendation.title}</h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{recommendation.desc}</p>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                        <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>Score: {urgencyScore}</span>
                                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Confidence: 97.4%</span>
                                    </div>
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
                                {selectedDoctor.availableTimes.map(time => {
                                    const forecast = hourlyPredictions.find(p => p.time === time);
                                    const isOptimal = forecast && forecast.load < 30;
                                    return (
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setSelectedTime(time); setShowSummary(true); }}
                                            key={time}
                                            className="glass"
                                            style={{ padding: '16px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', border: isOptimal ? '2px solid var(--success)' : '1px solid var(--surface-border)' }}
                                        >
                                            <Clock size={16} style={{ marginBottom: '8px', color: isOptimal ? 'var(--success)' : 'var(--primary)' }} />
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{time}</div>
                                            {forecast && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Wait: {forecast.load}m</div>}
                                        </motion.div>
                                    );
                                })}
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
                        <div className="badge badge-success">ML ACTIVE</div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Wait time forecasts powered by Random Forest regression.
                    </p>

                    <div style={{ height: '200px', margin: '8px 0', cursor: 'crosshair' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyPredictions} onClick={(data) => data && data.activePayload && setSelectedPoint(data.activePayload[0].payload)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis hide domain={[0, 'auto']} />
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
                                    <div className="badge" style={{ background: selectedPoint.load > 60 ? 'var(--danger)' : 'var(--success)', color: 'white' }}>
                                        {selectedPoint.load > 60 ? 'High Load' : 'Optimal'}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>PREDICTED WAIT</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedPoint.load} min</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>CONFIDENCE</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>96%</div>
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

                    {allBookings.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                            <Calendar size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                            <p style={{ fontSize: '0.85rem' }}>No past appointments found.<br />Start the flow to book your first visit.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {allBookings.map((item) => (
                                <div key={item.id} className="glass" style={{ padding: '14px', borderRadius: '14px', borderLeft: `3px solid ${item.type === 'rescheduled' ? 'var(--warning)' : 'var(--success)'}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.doctor}</span>
                                        {item.type === 'rescheduled' ? (
                                            <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--warning-bg)', color: 'var(--warning)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <RefreshCw size={10} /> RESCHEDULED
                                            </span>
                                        ) : (
                                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>CONFIRMED</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.hospital}</div>
                                    {item.reason && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 600, marginTop: '4px' }}>{item.reason}</div>
                                    )}
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

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default SmartAppointment;
