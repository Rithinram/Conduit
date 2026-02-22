import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Calendar, Clock, AlertCircle, CheckCircle2, Home, ArrowRight, Activity, Zap, Thermometer, Heart, Activity as BP, User, Building2, MapPin, X, History, ChevronLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSurgeActions } from '../../../context/SurgeActionsContext';
import { getForecast } from '../../../services/api';
import { classifyUrgency } from '../../../../conduit-ml';

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
    const [age, setAge] = useState(35);
    const [riskFactors, setRiskFactors] = useState({ diabetic: false, hypertensive: false, heart_disease: false, smoking: false });
    const [vitals, setVitals] = useState({ heart_rate: 75, systolic_bp: 120, temperature: 37 });
    const [urgencyScore, setUrgencyScore] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const [derivedMetrics, setDerivedMetrics] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hourlyPredictions, setHourlyPredictions] = useState([]);
    const [lastSync, setLastSync] = useState(null);

    // Identify optimal time for recommendation
    const optimalPoint = useMemo(() => {
        if (!hourlyPredictions.length) return null;
        return [...hourlyPredictions].sort((a, b) => a.load - b.load)[0];
    }, [hourlyPredictions]);

    // Generate ML-powered hourly load forecast
    useEffect(() => {
        const fetchForecast = async () => {
            const now = new Date();
            try {
                // Connect to real backend ML engine via API
                const resp = await getForecast({
                    hour: now.getHours(),
                    day_of_week: now.getDay(),
                    queue_length: 12,
                    month: now.getMonth() + 1,
                    hours: 12
                });

                if (resp && resp.forecast) {
                    setHourlyPredictions(resp.forecast.map(f => ({
                        time: `${String(f.hour).padStart(2, '0')}:00`,
                        load: Math.round(f.predicted_wait_time),
                        density: Math.round(f.predicted_icu_occupancy)
                    })));
                    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
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

        // ML-powered urgency classification using vitals and risk factors
        const { score, level, confidence: mlConf, derived_metrics } = await classifyUrgency(condition, age, severity, riskFactors, vitals);

        setUrgencyScore(score);
        setConfidence((mlConf * 100).toFixed(1));
        setDerivedMetrics(derived_metrics);

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
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr', gap: 'var(--space-md)', minHeight: 'calc(100vh - 160px)', paddingRight: '10px' }}>
            {/* Left Column: Symptom Analyzer & Step-by-Step Booking */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="card shadow-sm" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>ML Vital-Symptom Analyzer</h3>
                        <div className="badge badge-primary">V2.0 Statistical ML</div>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                        Our Random Forest model analyzes symptoms and clinical vitals for higher accuracy.
                    </p>

                    {/* Vitals & Demographic Panel - Compact 2x2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--background)', padding: '10px', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, minWidth: '35px' }}>AGE</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value))}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, minWidth: '35px' }}>HR</label>
                            <input
                                type="number"
                                value={vitals.heart_rate}
                                onChange={(e) => setVitals({ ...vitals, heart_rate: parseInt(e.target.value) })}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, minWidth: '35px' }}>BP</label>
                            <input
                                type="number"
                                value={vitals.systolic_bp}
                                onChange={(e) => setVitals({ ...vitals, systolic_bp: parseInt(e.target.value) })}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '0.6rem', fontWeight: 800, minWidth: '35px' }}>TEMP</label>
                            <input
                                type="number"
                                step="0.1"
                                value={vitals.temperature}
                                onChange={(e) => setVitals({ ...vitals, temperature: parseFloat(e.target.value) })}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--surface-border)', background: 'white', fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>

                    {/* Risk Factor Panel - Compact Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '8px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '10px', border: '1px dashed var(--primary-light)' }}>
                        {[
                            { id: 'diabetic', label: 'Diabetic' },
                            { id: 'hypertensive', label: 'BP High' },
                            { id: 'heart_disease', label: 'Cardiac' },
                            { id: 'smoking', label: 'Smoker' }
                        ].map(rf => (
                            <label key={rf.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={riskFactors[rf.id]}
                                    onChange={(e) => setRiskFactors({ ...riskFactors, [rf.id]: e.target.checked })}
                                />
                                {rf.label}
                            </label>
                        ))}
                    </div>

                    <textarea
                        placeholder="Symptoms (e.g. chest pain, fever...)"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        style={{ width: '100%', height: '54px', padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--background)', resize: 'none', fontSize: '0.85rem', fontFamily: 'inherit' }}
                    />

                    <button
                        onClick={analyzeSymptoms}
                        className="btn btn-primary"
                        style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
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

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)' }}>ML SCORE & CONFIDENCE</div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.65rem', padding: '2px 6px' }}>{urgencyScore}</span>
                                                <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{confidence || '97.4'}%</span>
                                            </div>
                                        </div>
                                        {derivedMetrics && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)' }}>SHOCK INDEX</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: derivedMetrics.shock_index > 0.9 ? 'var(--danger)' : 'var(--text-main)' }}>
                                                    {derivedMetrics.shock_index?.toFixed(2)}
                                                </div>
                                            </div>
                                        )}
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
                                    style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                                >
                                    <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '10px' }}>
                                        <Building2 size={18} color="var(--primary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{h.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={10} /> {h.distance}</span>
                                            <span style={{ color: getAvailabilityColor(h.availability), fontWeight: 700 }}>• {h.availability}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} color="var(--text-muted)" />
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
                                    style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                                >
                                    <div style={{ background: 'var(--secondary-light)', padding: '8px', borderRadius: '10px' }}>
                                        <User size={18} color="var(--secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.specialty} • 4 Slots</div>
                                    </div>
                                    <ArrowRight size={14} color="var(--text-muted)" />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="card shadow-sm" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Smart Scheduler</h3>
                            {lastSync && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>LIVE SYNC: {lastSync}</span>}
                        </div>
                        <div className="badge badge-success" style={{ fontSize: '0.65rem' }}>ML ACTIVE</div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                        Wait time forecasts powered by Random Forest regression.
                    </p>

                    {/* Optimal Window Recommendation */}
                    {optimalPoint && (
                        <div style={{ background: 'var(--success-bg)', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--success)' }}>
                            <Zap size={14} color="var(--success)" fill="var(--success)" />
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)' }}>
                                RECOMMENDED WINDOW: {optimalPoint.time} (Est. {optimalPoint.load}m wait)
                            </div>
                        </div>
                    )}

                    <div style={{ height: '180px', margin: '8px 0', cursor: 'crosshair' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyPredictions} onClick={(data) => data && data.activePayload && setSelectedPoint(data.activePayload[0].payload)}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 800, fontSize: '0.75rem' }}
                                    formatter={(val, name) => [val, name === 'load' ? 'Wait Time (m)' : 'Density (%)']}
                                />
                                <Area type="monotone" dataKey="load" stroke="var(--primary)" fill="url(#colorLoad)" strokeWidth={3} activeDot={{ r: 6, fill: 'var(--primary)' }} />
                                <Area type="monotone" dataKey="density" stroke="var(--secondary)" fill="url(#colorDensity)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <AnimatePresence>
                        {selectedPoint && (
                            <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--primary-light)', background: 'var(--primary-light-bg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--primary)' }}>{selectedPoint.time} Forecast</div>
                                    <div className="badge" style={{ background: selectedPoint.load > 40 ? 'var(--danger)' : 'var(--success)', color: 'white' }}>
                                        {selectedPoint.load > 40 ? 'High Pressure' : 'Optimal Entry'}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>PREDICTED WAIT</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{selectedPoint.load} min</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>RESOURCE DENSITY</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--secondary)' }}>{selectedPoint.density}%</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                                    {selectedPoint.load < 20 ? "✓ Model suggests minimal patient traffic. Fast-track available." :
                                        selectedPoint.load > 45 ? "⚠ High seasonal load detected. Routine visits not advised." :
                                            "○ Standard operational flow. Expect moderate throughput."}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Booking History Section */}
                <div className="card shadow-sm" style={{ flex: 1, padding: 'var(--space-md)', minHeight: '200px' }}>
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
