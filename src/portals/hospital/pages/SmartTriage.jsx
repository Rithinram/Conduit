import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity, Clock, AlertTriangle, TrendingUp, Users,
    Zap, Shield, Plus, Filter, Heart, Thermometer, Droplets,
    CheckCircle2, ChevronRight, MoreHorizontal, Bed, Navigation,
    Database, Network, Globe, AlertOctagon, BarChart3, Pill, Microscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTriageQueue, updateTriageStatus } from '../../../services/api';

const SmartTriage = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalId] = useState('65d4b5a1f234567890abcdef'); // Mock ID
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeAlerts, setActiveAlerts] = useState([
        "SYSTEM ALERT: REGIONAL SURGE IN RED ZONE (+42%)",
        "BLOCK B ICU AT 98% CAPACITY - DIVERTING NON-CRITICAL",
        "PROTOCOL UPDATE: NEW SEPSIS SCREENING GUIDELINES ACTIVE"
    ]);

    // Mock Patients for Initial Load/Fallback
    const mockPatients = [
        { id: '1', name: 'James Wilson', age: 68, arrival: '4m ago', status: 'Waiting', score: 92, urgency: 'Critical', vitals: { hr: 118, bp: '158/95', o2: 88, temp: 102.1 }, symptoms: ['Chest Pain', 'Shortness of Breath'], chronic: ['Diabetes', 'Hypertension'] },
        { id: '2', name: 'Sarah Miller', age: 34, arrival: '12m ago', status: 'Waiting', score: 42, urgency: 'Moderate', vitals: { hr: 78, bp: '122/80', o2: 98, temp: 98.6 }, symptoms: ['Severe Abdominal Pain'], chronic: [] },
        { id: '3', name: 'Robert Chen', age: 72, arrival: '22m ago', status: 'Triage', score: 78, urgency: 'High', vitals: { hr: 95, bp: '145/88', o2: 91, temp: 100.8 }, symptoms: ['Fever', 'Dizziness'], chronic: ['COPD'] },
        { id: '4', name: 'Emma Davis', age: 8, arrival: '45m ago', status: 'Waiting', score: 25, urgency: 'Low', vitals: { hr: 85, bp: '110/70', o2: 99, temp: 99.1 }, symptoms: ['Minor Laceration'], chronic: ['Asthma'] },
        { id: '5', name: 'Linda Thompson', age: 52, arrival: '1h ago', status: 'Waiting', score: 65, urgency: 'High', vitals: { hr: 105, bp: '140/90', o2: 94, temp: 101.2 }, symptoms: ['Severe Cough', 'Confusion'], chronic: ['Autoimmune'] }
    ];

    useEffect(() => {
        const fetchQueue = async () => {
            const data = await getTriageQueue(hospitalId);
            if (data && data.length > 0) {
                setQueue(data.map(p => ({
                    ...p,
                    id: p._id,
                    arrival: 'Just now',
                    score: p.smartScore || 50,
                    urgency: p.urgencyLevel || 'Moderate',
                    vitals: {
                        hr: p.vitals?.heartRate || 75,
                        bp: p.vitals?.bloodPressure || '120/80',
                        o2: p.vitals?.oxygenLevel || 98,
                        temp: p.vitals?.temperature || 98.6
                    },
                    status: p.triageStatus || 'Waiting',
                    chronic: p.chronicConditions || []
                })));
            } else {
                setQueue(mockPatients);
            }
            setIsLoading(false);
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, [hospitalId]);

    // Real-time Vitals & Alerts Simulation
    useEffect(() => {
        const simInterval = setInterval(() => {
            setQueue(prev => prev.map(p => {
                if (Math.random() > 0.6) {
                    const hrVar = Math.floor(Math.random() * 7) - 3;
                    const o2Var = Math.random() > 0.9 ? -1 : (Math.random() > 0.95 ? 1 : 0);
                    return {
                        ...p,
                        vitals: {
                            ...p.vitals,
                            hr: Math.max(40, Math.min(190, p.vitals.hr + hrVar)),
                            o2: Math.max(75, Math.min(100, p.vitals.o2 + o2Var))
                        }
                    };
                }
                return p;
            }));

            // Rotate Alerts
            setActiveAlerts(prev => {
                const next = [...prev];
                const first = next.shift();
                next.push(first);
                return next;
            });
        }, 3000);
        return () => clearInterval(simInterval);
    }, []);

    const sortedQueue = useMemo(() => {
        return [...queue].sort((a, b) => b.score - a.score);
    }, [queue]);

    const stats = useMemo(() => ({
        critical: queue.filter(p => p.urgency === 'Critical').length,
        waiting: queue.filter(p => p.status === 'Waiting').length,
        icuOccupancy: 94,
        avgWait: '14m'
    }), [queue]);

    const handleAction = async (id, status) => {
        // Optimistic UI update
        setQueue(prev => prev.filter(p => p.id !== id));
        if (selectedPatient?.id === id) setSelectedPatient(null);
        await updateTriageStatus(id, status);
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f97316';
            case 'Moderate': return '#eab308';
            case 'Low': return '#22c55e';
            default: return '#94a3b8';
        }
    };

    if (isLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>SYNCHRONIZING CLINICAL MISSION CONTROL...</div>;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            padding: 'var(--space-xs)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>

            {/* Top Critical Alert Ticker */}
            <div style={{
                background: '#ef4444',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                overflow: 'hidden',
                fontWeight: 800,
                fontSize: '0.8rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
                <AlertOctagon size={18} className="pulse" />
                <motion.div
                    animate={{ x: [0, -100] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ whiteSpace: 'nowrap', display: 'flex', gap: '40px' }}
                >
                    <span>{activeAlerts[0]}</span>
                    <span>{activeAlerts[1]}</span>
                    <span>{activeAlerts[2]}</span>
                </motion.div>
            </div>

            {/* Main Orchestration Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '320px 1fr 360px',
                gap: 'var(--space-lg)',
                flex: 1,
                minHeight: 0
            }}>

                {/* Left Column: Network & Hospital Resources */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card glass" style={{ padding: 'var(--space-lg)', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', color: 'var(--primary)' }}>
                            <Network size={20} /> <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>HOSPITAL SNAPSHOT</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                            {/* ICU Gauge */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
                                    <span>ICU CAPACITY</span>
                                    <span style={{ color: '#ef4444' }}>{stats.icuOccupancy}% (CRITICAL)</span>
                                </div>
                                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.icuOccupancy}%` }}
                                        style={{ height: '100%', background: '#ef4444' }}
                                    />
                                </div>
                            </div>

                            {/* Staff Load */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                    <Users size={16} color="var(--primary)" style={{ marginBottom: '4px' }} />
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>42</div>
                                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>ON-DUTY STAFF</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                    <Clock size={16} color="#eab308" style={{ marginBottom: '4px' }} />
                                    <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{stats.avgWait}</div>
                                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVG DISPO TIME</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></div> MRI-1</div>
                                    <span style={{ color: '#64748b' }}>AVAILABLE</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div> CT-SCAN</div>
                                    <span style={{ color: '#ef4444' }}>BUSY (18m wait)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass" style={{ flex: 1, padding: 'var(--space-lg)', background: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', color: 'var(--primary)' }}>
                            <Globe size={20} /> <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>REGIONAL STRESS INDEX</span>
                        </div>
                        <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '12px' }}>
                            {[45, 62, 78, 92, 84, 76, 95].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    style={{
                                        flex: 1,
                                        background: h > 80 ? '#ef4444' : 'var(--primary)',
                                        borderRadius: '4px 4px 0 0',
                                        opacity: 0.6 + (i * 0.05)
                                    }}
                                />
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            LAST 12HRS ACTIVITY TREND
                        </div>
                    </div>
                </div>

                {/* Middle Column: Dynamic Priority Queue */}
                <div className="card glass" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)',
                    background: 'rgba(255, 255, 255, 0.6)',
                    padding: 'var(--space-lg)',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontWeight: 900 }}>
                            <Activity color="var(--primary)" size={24} /> LIVE TRIAGE STREAM
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <div style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                {queue.length} PATIENTS
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingRight: '8px' }}>
                        <AnimatePresence mode="popLayout">
                            {sortedQueue.map((patient) => (
                                <motion.div
                                    key={patient.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    whileHover={{ scale: 1.01, x: 4 }}
                                    onClick={() => setSelectedPatient(patient)}
                                    style={{
                                        padding: '16px',
                                        background: selectedPatient?.id === patient.id ? 'white' : 'white',
                                        borderRadius: '16px',
                                        borderLeft: `8px solid ${getUrgencyColor(patient.urgency)}`,
                                        boxShadow: selectedPatient?.id === patient.id ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 6px rgba(0,0,0,0.02)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {patient.urgency === 'Critical' && (
                                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 900 }}>CRITICAL TRAP</div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div>
                                            <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#1e293b' }}>{patient.name}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {patient.arrival} • {patient.age}Y
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: patient.vitals.hr > 110 ? '#ef4444' : '#1e293b' }}>{patient.vitals.hr}</div>
                                                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)' }}>BPM</div>
                                            </div>
                                            <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: patient.vitals.o2 < 90 ? '#ef4444' : '#1e293b' }}>{patient.vitals.o2}%</div>
                                                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)' }}>SpO2</div>
                                            </div>
                                            <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', paddingLeft: '12px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{patient.vitals.temp}</div>
                                                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)' }}>TEMP</div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 950, color: getUrgencyColor(patient.urgency), letterSpacing: '-1px' }}>
                                                {patient.score}
                                            </div>
                                            <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SMART SCORE</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column: Orchestration Hub */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card glass" style={{ flex: 1, padding: 'var(--space-xl)', background: '#1e293b', color: 'white', position: 'relative' }}>
                        {!selectedPatient ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
                                <Navigation size={64} style={{ marginBottom: 'var(--space-md)' }} />
                                <div style={{ fontSize: '1rem', fontWeight: 800 }}>ORCHESTRATION HUB</div>
                                <div style={{ fontSize: '0.75rem' }}>Select a node for priority routing</div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', height: '100%' }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#38bdf8', letterSpacing: '1px' }}>ACTIVE CASE PROFILE</div>
                                        <div style={{ padding: '4px 12px', background: `${getUrgencyColor(selectedPatient.urgency)}`, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>{(selectedPatient?.urgency || 'MODERATE').toUpperCase()}</div>
                                    </div>
                                    <h2 style={{ margin: '8px 0 0 0', fontSize: '1.8rem', fontWeight: 900 }}>{selectedPatient.name}</h2>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>CR: {selectedPatient.id?.toString()?.slice(-8).toUpperCase() || 'ID-REF'} • {selectedPatient.age || '??'} Y/O Male</div>
                                </div>

                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: '12px', color: '#94a3b8' }}>PRIMARY COMPLAINTS</div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {selectedPatient.symptoms.map(s => (
                                            <span key={s} style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#38bdf8' }}>
                                        <Zap size={16} /> <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>AI PREDICTION: {selectedPatient.score > 80 ? 'HIGH RISK' : 'STABLE'}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0, lineHeight: 1.4 }}>
                                        Patient exhibits {selectedPatient.vitals.o2 < 90 ? 'critical hypoxemia' : 'deviated biomarkers'}. Immediate <strong>Sepsis-3 Protocol</strong> recommended. {selectedPatient.chronic.length > 0 ? `Comorbidities [${selectedPatient.chronic.join(', ')}] increase risk profile.` : ''}
                                    </p>
                                </div>

                                <div style={{ flex: 1 }}></div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                    <button
                                        className="btn"
                                        style={{ background: 'var(--primary)', color: 'white', fontWeight: 900, padding: '16px', fontSize: '0.9rem' }}
                                        onClick={() => handleAction(selectedPatient.id, 'Bed Assigned')}
                                    >
                                        <Bed size={18} style={{ marginRight: '12px' }} /> EXECUTE BED ASSIGNMENT
                                    </button>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <button
                                            className="btn"
                                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 900, padding: '14px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.2)' }}
                                            onClick={() => handleAction(selectedPatient.id, 'Triage')}
                                        >
                                            <Microscope size={16} style={{ marginRight: '8px' }} /> RE-SCAN LABS
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 900, padding: '14px', fontSize: '0.75rem', border: '1px solid #ef4444' }}
                                            onClick={() => handleAction(selectedPatient.id, 'Admitted')}
                                        >
                                            <Shield size={16} style={{ marginRight: '8px' }} /> DIRECT ADMIT
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="card glass" style={{ height: '140px', padding: 'var(--space-lg)', background: 'white' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '12px' }}>UPCOMING ADMISSIONS (24H)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{ position: 'relative', width: 60, height: 60 }}>
                                <svg width="60" height="60" viewBox="0 0 60 60">
                                    <circle cx="30" cy="30" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                                    <circle cx="30" cy="30" r="26" fill="none" stroke="var(--primary)" strokeWidth="6" strokeDasharray="163" strokeDashoffset="110" />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 900, fontSize: '0.8rem' }}>12</div>
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>SURGICAL LOAD</div>
                                <div style={{ fontSize: '0.7rem', color: '#22c55e' }}>+18% ABOVE AVG</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTriage;
