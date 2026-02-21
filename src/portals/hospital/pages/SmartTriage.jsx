import React, { useState, useEffect, useMemo } from 'react';
import {
    Activity, Clock, AlertTriangle, TrendingUp, Users,
    Zap, Shield, Plus, Filter, Heart, Thermometer, Droplets,
    CheckCircle2, ChevronRight, MoreHorizontal, Bed, Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTriageQueue, updateVitals, updateTriageStatus } from '../../../services/api';

const SmartTriage = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalId, setHospitalId] = useState('65d4b5a1f234567890abcdef'); // Mock ID
    const [filter, setFilter] = useState('All');
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Mock Data Initializer (If backend queue is empty/connecting)
    const mockPatients = [
        { id: '1', name: 'James Wilson', age: 68, arrival: '4m ago', status: 'Waiting', score: 88, urgency: 'Critical', vitals: { hr: 112, bp: '158/95', o2: 89, temp: 101.4 }, symptoms: ['Chest Pain', 'Shortness of Breath'] },
        { id: '2', name: ' Sarah Miller', age: 34, arrival: '12m ago', status: 'Waiting', score: 42, urgency: 'Moderate', vitals: { hr: 78, bp: '122/80', o2: 98, temp: 98.6 }, symptoms: ['Severe Abdominal Pain'] },
        { id: '3', name: 'Robert Chen', age: 72, arrival: '22m ago', status: 'Triage', score: 76, urgency: 'High', vitals: { hr: 95, bp: '145/88', o2: 92, temp: 100.2 }, symptoms: ['Fever', 'Dizziness'] },
        { id: '4', name: 'Emma Davis', age: 8, arrival: '45m ago', status: 'Waiting', score: 25, urgency: 'Low', vitals: { hr: 85, bp: '110/70', o2: 99, temp: 99.1 }, symptoms: ['Minor Laceration'] }
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
                    status: p.triageStatus || 'Waiting'
                })));
            } else {
                setQueue(mockPatients);
            }
            setIsLoading(false);
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Polling for updates
        return () => clearInterval(interval);
    }, [hospitalId]);

    // Real-time Vitals Simulation
    useEffect(() => {
        const simInterval = setInterval(() => {
            setQueue(prev => prev.map(p => {
                if (Math.random() > 0.7) { // Small chance to fluctuate
                    const hrVar = Math.floor(Math.random() * 5) - 2;
                    const o2Var = Math.random() > 0.9 ? -1 : (Math.random() > 0.9 ? 1 : 0);
                    return {
                        ...p,
                        vitals: {
                            ...p.vitals,
                            hr: Math.max(40, Math.min(180, p.vitals.hr + hrVar)),
                            o2: Math.max(80, Math.min(100, p.vitals.o2 + o2Var))
                        }
                    };
                }
                return p;
            }));
        }, 3000);
        return () => clearInterval(simInterval);
    }, []);

    const sortedQueue = useMemo(() => {
        return [...queue].sort((a, b) => b.score - a.score);
    }, [queue]);

    const stats = useMemo(() => {
        return {
            critical: queue.filter(p => p.urgency === 'Critical').length,
            waiting: queue.filter(p => p.status === 'Waiting').length,
            avgWait: '18m'
        };
    }, [queue]);

    const handleAction = async (id, status) => {
        await updateTriageStatus(id, status);
        setQueue(prev => prev.filter(p => p.id !== id));
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return '#ef4444';
            case 'High': return '#f97316';
            case 'Moderate': return '#eab308';
            case 'Low': return '#22c55e';
            default: return 'var(--text-muted)';
        }
    };

    if (isLoading) return <div className="loading-container">Synchronizing Clinical Data...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', height: '100%' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}>
                        <AlertTriangle color="#ef4444" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CRITICAL TRAPS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.critical}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}>
                        <Users color="#3b82f6" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL QUEUE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{queue.length}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}>
                        <Clock color="#22c55e" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG WAIT TIME</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.avgWait}</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}>
                        <Zap color="#a855f7" size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AUTO-TRIAGE ACTIVE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>V.4.2</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-lg)', flex: 1, minHeight: 0 }}>
                {/* Main Queue List */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Activity color="var(--primary)" size={20} /> SMART PRIORITY QUEUE
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button className="btn btn-secondary btn-sm"><Filter size={14} /> FILTER</button>
                            <button className="btn btn-primary btn-sm"><Plus size={14} /> ADD PATIENT</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingRight: '8px' }}>
                        <AnimatePresence initial={false}>
                            {sortedQueue.map((patient, index) => (
                                <motion.div
                                    key={patient.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card glass"
                                    style={{
                                        padding: 'var(--space-md)',
                                        borderLeft: `6px solid ${getUrgencyColor(patient.urgency)}`,
                                        background: 'rgba(255, 255, 255, 0.7)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedPatient(patient)}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', alignItems: 'center', gap: 'var(--space-lg)' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{patient.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age {patient.age} • {patient.arrival}</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Heart size={14} color={patient.vitals.hr > 100 || patient.vitals.hr < 60 ? '#ef4444' : '#64748b'} style={{ marginBottom: '4px' }} />
                                                <div style={{ fontWeight: 800 }}>{patient.vitals.hr}</div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>BPM</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <Droplets size={14} color={patient.vitals.o2 < 92 ? '#ef4444' : '#64748b'} style={{ marginBottom: '4px' }} />
                                                <div style={{ fontWeight: 800 }}>{patient.vitals.o2}%</div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>SpO2</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <Thermometer size={14} color={patient.vitals.temp > 100 ? '#ef4444' : '#64748b'} style={{ marginBottom: '4px' }} />
                                                <div style={{ fontWeight: 800 }}>{patient.vitals.temp}°F</div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>TEMP</div>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                background: `${getUrgencyColor(patient.urgency)}20`,
                                                color: getUrgencyColor(patient.urgency),
                                                fontWeight: 800,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase'
                                            }}>
                                                {patient.urgency}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{patient.score}</div>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Smart Score</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Patient Case View / Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ flex: 1, padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
                        {!selectedPatient ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Navigation size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                                <div style={{ fontWeight: 700 }}>Select a patient for clinical orchestration</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>CASE PROFILE</div>
                                    <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedPatient.name}</h4>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
                                        {selectedPatient.symptoms.map(s => (
                                            <span key={s} style={{ background: 'var(--surface)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="card glass" style={{ border: 'none', background: 'var(--background)' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>CLINICAL ACTIONS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ justifyContent: 'space-between', width: '100%', padding: '14px' }}
                                            onClick={() => handleAction(selectedPatient.id, 'Bed Assigned')}
                                        >
                                            ASSIGN BEDSIDE <Bed size={18} />
                                        </button>
                                        <button
                                            className="btn glass"
                                            style={{ justifyContent: 'space-between', width: '100%', padding: '14px', border: '1px solid #a855f7', color: '#a855f7' }}
                                            onClick={() => handleAction(selectedPatient.id, 'Fast-Track')}
                                        >
                                            FAST-TRACK LABS <Zap size={18} />
                                        </button>
                                        <button
                                            className="btn glass"
                                            style={{ justifyContent: 'space-between', width: '100%', padding: '14px', border: '1px solid #ef4444', color: '#ef4444' }}
                                            onClick={() => handleAction(selectedPatient.id, 'Admitted')}
                                        >
                                            DIRECT ADMIT <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>AI PREDICTION (98% Conf.)</div>
                                    <div className="card" style={{ background: '#f8fafc', padding: 'var(--space-md)', fontSize: '0.85rem' }}>
                                        <TrendingUp size={16} color="var(--primary)" style={{ marginBottom: '8px' }} />
                                        <p style={{ margin: 0, lineHeight: 1.5, color: '#334155' }}>
                                            High probability of <strong>Inflammatory Response</strong>. Recommended protocol: Immediate fluid resuscitation and sepsis screen.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTriage;
