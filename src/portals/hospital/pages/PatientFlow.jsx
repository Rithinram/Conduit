import React, { useState, useEffect } from 'react';
import {
    Activity, Clock, AlertCircle, TrendingUp, Users,
    ChevronRight, CheckCircle2, XCircle, MoreHorizontal,
    ArrowRight, Activity as FlowIcon, BarChart3, Info,
    UserCircle, Search, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PatientFlow = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Pipeline Stages
    const stages = [
        { id: 'arrival', label: 'Arrival', color: '#6366f1', icon: Users },
        { id: 'triage', label: 'Triage', color: '#8b5cf6', icon: Activity },
        { id: 'waiting', label: 'Waiting', color: '#f59e0b', icon: Clock },
        { id: 'consult', label: 'Consult', color: '#3b82f6', icon: UserCircle },
        { id: 'lab', label: 'Lab/Img', color: '#a855f7', icon: Activity },
        { id: 'discharge', label: 'Discharge', color: '#10b981', icon: CheckCircle2 }
    ];

    // Mock Patient Data with Stages
    const [patients, setPatients] = useState([
        { id: 'P001', name: 'James Wilson', stage: 'triage', delay: '8m', risk: 'High', symptoms: ['Chest Pain'] },
        { id: 'P002', name: 'Sarah Miller', stage: 'waiting', delay: '24m', risk: 'Moderate', symptoms: ['Fever', 'Cough'] },
        { id: 'P003', name: 'Robert Chen', stage: 'consult', delay: '12m', risk: 'High', symptoms: ['Shortness of Breath'] },
        { id: 'P004', name: 'Emma Davis', stage: 'lab', delay: '45m', risk: 'Medium', symptoms: ['Abdominal Pain'] },
        { id: 'P005', name: 'Michael Brown', stage: 'arrival', delay: '2m', risk: 'Low', symptoms: ['Minor Laceration'] },
        { id: 'P006', name: 'Linda White', stage: 'waiting', delay: '32m', risk: 'Critical', symptoms: ['Dizziness'] },
        { id: 'P007', name: 'David Jones', stage: 'consult', delay: '5m', risk: 'Low', symptoms: ['Follow-up'] },
        { id: 'P008', name: 'Karen Taylor', stage: 'triage', delay: '12m', risk: 'Medium', symptoms: ['Persistent Headache'] }
    ]);

    // Mock Flow Metrics
    const metrics = {
        arrival: { count: 3, delay: '4m', status: 'Optimal' },
        triage: { count: 5, delay: '12m', status: 'Warning' },
        waiting: { count: 12, delay: '38m', status: 'Critical' },
        consult: { count: 4, delay: '15m', status: 'Optimal' },
        lab: { count: 6, delay: '42m', status: 'Warning' },
        discharge: { count: 8, delay: '10m', status: 'Optimal' }
    };

    // Chart Data
    const chartData = [
        { time: '08:00', load: 45 },
        { time: '10:00', load: 52 },
        { time: '12:00', load: 88 },
        { time: '14:00', load: 65 },
        { time: '16:00', load: 48 },
        { time: '18:00', load: 72 },
        { time: '20:00', load: 95 },
        { time: '22:00', load: 82 },
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulation: Move patients randomly
    useEffect(() => {
        const interval = setInterval(() => {
            setPatients(prev => {
                const next = [...prev];
                const randomIndex = Math.floor(Math.random() * next.length);
                const currentStageIndex = stages.findIndex(s => s.id === next[randomIndex].stage);
                if (currentStageIndex < stages.length - 1 && Math.random() > 0.7) {
                    next[randomIndex].stage = stages[currentStageIndex + 1].id;
                }
                return next;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Critical': return '#ef4444';
            case 'Warning': return '#f59e0b';
            case 'Optimal': return '#10b981';
            default: return 'var(--primary)';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', height: '100%', overflow: 'hidden' }}>
            {/* Top Stats & Graph */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-lg)', minHeight: '220px' }}>
                <div className="card" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <BarChart3 size={18} color="var(--primary)" /> REGIONAL INFLOW PIPELINE (24H)
                        </h4>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE UPDATES ACTIVE</div>
                    </div>
                    <div style={{ flex: 1, height: '160px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="time" hide />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="load" stroke="var(--primary)" fillOpacity={1} fill="url(#colorLoad)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-sm)' }}>
                    <div style={{ opacity: 0.8, fontSize: '0.85rem', fontWeight: 600 }}>NETWORK EFFICIENCY</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>88.4%</div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={14} /> 4.2% IMPROVEMENT VS LAST SHIFT
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: 'var(--space-sm)' }}>
                        LAST SYNC: {currentTime.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Pipeline Stage Visualization */}
            <div className="card" style={{ flex: 1, padding: 'var(--space-lg)', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <FlowIcon color="var(--primary)" size={22} /> LIVE PIPELINE ORCHESTRATION
                    </h3>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <div className="glass" style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--surface-border)' }}>
                            <span style={{ color: '#ef4444' }}>●</span> CRITICAL NODES DETECTED
                        </div>
                    </div>
                </div>

                {/* Pipeline Flow */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-lg)',
                    height: 'calc(100% - 80px)',
                    overflowX: 'auto',
                    paddingBottom: 'var(--space-md)',
                    scrollbarWidth: 'thin'
                }}>
                    {stages.map((stage, sIdx) => {
                        const stagePatients = patients.filter(p => p.stage === stage.id);
                        const metric = metrics[stage.id];

                        return (
                            <div key={stage.id} style={{ minWidth: '220px', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {/* Stage Header */}
                                <div style={{
                                    padding: 'var(--space-md)',
                                    background: 'white',
                                    borderRadius: '16px',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: '1px solid var(--surface-border)',
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: stage.color }}>
                                            <stage.icon size={16} /> {stage.label}
                                        </div>
                                        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{stagePatients.length}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600 }}>
                                        <span style={{ color: 'var(--text-muted)' }}>AVG DELAY</span>
                                        <span style={{ color: getStatusColor(metric.status) }}>{metric.delay}</span>
                                    </div>
                                    {metric.status === 'Critical' && (
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 900 }}
                                        >
                                            BOTTLENECK
                                        </motion.div>
                                    )}
                                </div>

                                {/* Patient Cards In Stage */}
                                <div style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '16px',
                                    padding: 'var(--space-sm)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 'var(--space-sm)',
                                    overflowY: 'auto',
                                    border: stagePatients.length > 5 ? '1px solid #ef4444' : '1px dashed var(--surface-border)'
                                }}>
                                    <AnimatePresence>
                                        {stagePatients.map((patient) => (
                                            <motion.div
                                                key={patient.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                style={{
                                                    padding: '12px',
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    boxShadow: 'var(--shadow-sm)',
                                                    cursor: 'pointer',
                                                    border: patient.risk === 'Critical' ? '1px solid #ef4444' : '1px solid transparent'
                                                }}
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>{patient.name}</div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>DLY: {patient.delay}</div>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: patient.risk === 'Critical' ? '#ef4444' : (patient.risk === 'High' ? '#f97316' : '#64748b')
                                                    }} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {sIdx < stages.length - 1 && (
                                    <div style={{ position: 'relative', height: 0, width: 0 }}>
                                        <ChevronRight size={24} color="var(--surface-border)" style={{ position: 'absolute', top: -160, right: -40 }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Patient Action Dialog */}
            <AnimatePresence>
                {selectedPatient && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            backdropFilter: 'blur(4px)'
                        }}
                        onClick={() => setSelectedPatient(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                width: '450px',
                                background: 'white',
                                borderRadius: '24px',
                                padding: 'var(--space-xl)',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--surface-border)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>PATIENT FLOW ORCHESTRATION</div>
                                    <h3 style={{ margin: 0 }}>{selectedPatient.name}</h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Case ID: {selectedPatient.id} • Current: {selectedPatient.stage.toUpperCase()}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                                    <Info size={20} color="var(--primary)" />
                                </div>
                            </div>

                            <div className="card glass" style={{ border: 'none', background: '#f1f5f9', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: 'var(--space-sm)', opacity: 0.6 }}>CLINICAL SUMMARY</div>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                                    Patient presenting with <strong>{selectedPatient.symptoms.join(', ')}</strong>. Delay at {selectedPatient.stage} is currently {selectedPatient.delay}. Flow redirection recommended to bypass bottleneck.
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '14px', border: '1px solid #ef4444', color: '#ef4444', gap: '8px' }}
                                    onClick={() => setSelectedPatient(null)}
                                >
                                    <XCircle size={18} /> DISAPPROVE
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '14px', gap: '8px' }}
                                    onClick={() => {
                                        setPatients(prev => prev.map(p =>
                                            p.id === selectedPatient.id ? { ...p, stage: 'consult' } : p
                                        ));
                                        setSelectedPatient(null);
                                    }}
                                >
                                    <CheckCircle2 size={18} /> APPROVE MOVE
                                </button>
                            </div>

                            <button
                                className="btn glass"
                                style={{ width: '100%', marginTop: 'var(--space-md)', padding: '14px', gap: '8px', color: 'var(--primary)' }}
                            >
                                <ArrowRight size={18} /> TRANSFER TO REGIONAL HUB
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="card glass" style={{ background: 'rgba(37, 99, 235, 0.05)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <TrendingUp size={20} color="var(--primary)" />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                    <strong>Network Insight:</strong> Predicted bottleneck at <strong>Waiting</strong> stage in 45 mins. Consider proactive staff reallocation.
                </p>
            </div>
        </div>
    );
};

export default PatientFlow;
