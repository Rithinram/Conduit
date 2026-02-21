import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock, AlertTriangle, ArrowRight,
    CheckCircle2, MoreVertical, Search, Filter, Play,
    User, Stethoscope, BriefcaseMedical, Microscope, LogOut,
    ChevronRight, Zap, ShieldAlert, BarChart2, Activity,
    ThumbsUp, ThumbsDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getFlowMetrics, approveMovement } from '../../../services/api';

const PatientFlow = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState([]);
    const [hospitalId] = useState('65d4b5a1f234567890abcdef'); // Mock ID
    const [isLoading, setIsLoading] = useState(true);
    const [approvingStage, setApprovingStage] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);

    // Mock Throughput Data
    const throughputData = [
        { time: '08:00', flow: 12 },
        { time: '10:00', flow: 18 },
        { time: '12:00', flow: 45 },
        { time: '14:00', flow: 32 },
        { time: '16:00', flow: 28 },
        { time: '18:00', flow: 15 },
    ];

    // Mock/Fallback data for initialization
    const mockMetrics = [
        { stage: 'Arrival', count: 8, avgDelay: 12, isBottleneck: false, patients: [1, 2, 3] },
        { stage: 'Triage', count: 18, avgDelay: 45, isBottleneck: true, patients: [4, 5, 6] },
        { stage: 'Waiting', count: 24, avgDelay: 18, isBottleneck: false, patients: [7, 8, 9] },
        { stage: 'Consultation', count: 12, avgDelay: 22, isBottleneck: false, patients: [10, 11] },
        { stage: 'Lab', count: 15, avgDelay: 85, isBottleneck: true, patients: [12, 13, 14] },
        { stage: 'Discharge', count: 2, avgDelay: 5, isBottleneck: false, patients: [15] }
    ];

    useEffect(() => {
        const fetchMetrics = async () => {
            const data = await getFlowMetrics(hospitalId);
            if (data && data.length > 0) {
                setMetrics(data);
            } else {
                setMetrics(mockMetrics);
            }
            setIsLoading(false);
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, [hospitalId]);

    const handleApprove = async (stage) => {
        setApprovingStage(stage);
        setTimeout(() => {
            setMetrics(prev => prev.map(m => {
                if (m.stage === stage) return { ...m, count: Math.max(0, m.count - 1) };
                const nextStages = ["Arrival", "Triage", "Waiting", "Consultation", "Lab", "Discharge"];
                const nextIdx = nextStages.indexOf(stage) + 1;
                if (nextIdx < nextStages.length && m.stage === nextStages[nextIdx]) {
                    return { ...m, count: m.count + 1 };
                }
                return m;
            }));
            setApprovingStage(null);
            setSelectedCase(null);
        }, 800);
    };

    const handleDisapprove = (stage) => {
        setSelectedCase(null);
    };

    const getStageIcon = (stage) => {
        switch (stage) {
            case 'Arrival': return <User size={18} />;
            case 'Triage': return <Stethoscope size={18} />;
            case 'Waiting': return <Clock size={18} />;
            case 'Consultation': return <BriefcaseMedical size={18} />;
            case 'Lab': return <Microscope size={18} />;
            case 'Discharge': return <LogOut size={18} />;
            default: return <Activity size={18} />;
        }
    };

    const getStageGradient = (stage, isBottleneck) => {
        if (isBottleneck) return 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
        switch (stage) {
            case 'Arrival': return 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
            case 'Triage': return 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)';
            case 'Waiting': return 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
            case 'Consultation': return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
            case 'Lab': return 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
            case 'Discharge': return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
            default: return 'white';
        }
    };

    if (isLoading) return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Synchronizing Flow Dynamics...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', height: '100%', padding: 'var(--space-xs)' }}>

            {/* Mission Critical Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-sm)' }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-1.5px', color: '#1e293b' }}>LIVE FLOW VISUALIZER</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Regional Institutional Throughput Monitoring</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div className="card glass" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>REAL-TIME SYNC: ACTIVE</span>
                    </div>
                </div>
            </div>

            {/* Pipeline Visualisation */}
            <div style={{
                display: 'flex',
                gap: '12px',
                flex: 1,
                minHeight: 0,
                paddingBottom: '20px',
                overflowX: 'auto',
                alignItems: 'stretch'
            }}>
                {metrics.map((m, i) => (
                    <React.Fragment key={m.stage}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                flex: 1,
                                minWidth: '220px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}
                        >
                            {/* Stage Header Card */}
                            <div className="card glass" style={{
                                padding: '20px',
                                background: getStageGradient(m.stage, m.isBottleneck),
                                border: m.isBottleneck ? '1px solid #fecaca' : '1px solid #e2e8f0',
                                boxShadow: m.isBottleneck ? '0 10px 25px rgba(239, 68, 68, 0.1)' : '0 4px 6px rgba(0,0,0,0.02)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ color: m.isBottleneck ? '#ef4444' : 'var(--primary)', background: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        {getStageIcon(m.stage)}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 950, color: '#1e293b', lineHeight: 1 }}>{m?.count || 0}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>PATIENTS</div>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '2px', color: '#1e293b' }}>{m?.stage?.toUpperCase() || 'STAGE'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', fontWeight: 700, color: m.isBottleneck ? '#ef4444' : '#64748b' }}>
                                    <Clock size={12} /> AVG: {m?.avgDelay || 0}m Delay
                                </div>

                                {m.isBottleneck && (
                                    <motion.div
                                        animate={{ opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        style={{ marginTop: '12px', padding: '6px 10px', background: '#ef4444', color: 'white', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 800, textAlign: 'center' }}
                                    >
                                        BOTTLENECK DETECTED
                                    </motion.div>
                                )}
                            </div>

                            {/* Patient Preview & Action */}
                            <div className="card" style={{ flex: 1, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', border: '1px dashed #cbd5e1', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {m.count > 0 ? (
                                    <>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>WAITING APPROVAL</div>
                                        {[...Array(Math.min(3, m.count))].map((_, idx) => {
                                            const caseId = Math.floor(Math.random() * 9000) + 1000;
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ scale: 1.02, x: 4 }}
                                                    onClick={() => setSelectedCase({ id: caseId, stage: m.stage, index: i })}
                                                    style={{ background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                                >
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.isBottleneck ? '#ef4444' : '#3b82f6' }}></div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 900 }}>CASE #{caseId}</div>
                                                    <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                                                </motion.div>
                                            );
                                        })}
                                        {m.count > 3 && <div style={{ fontSize: '0.65rem', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>+ {m.count - 3} more cases</div>}

                                        <div style={{ flex: 1 }}></div>

                                        <button
                                            className="btn"
                                            disabled={approvingStage === m.stage || m.stage === 'Discharge'}
                                            onClick={() => handleApprove(m.stage)}
                                            style={{
                                                width: '100%',
                                                background: approvingStage === m.stage ? '#e2e8f0' : (m.isBottleneck ? '#ef4444' : '#1e293b'),
                                                color: 'white',
                                                padding: '12px',
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            {approvingStage === m.stage ? 'PROCESSING...' : (m.stage === 'Discharge' ? 'FINALIZED' : `APPROVE ALL ${m.stage.toUpperCase()}`)}
                                            <Zap size={12} fill="white" />
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                        <CheckCircle2 size={32} />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {i < metrics.length - 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '60px', opacity: 0.4 }}>
                                <ArrowRight size={20} color="#64748b" />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Analysis Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card glass" style={{ background: 'white', padding: 'var(--space-lg)', minHeight: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                        <h4 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} color="var(--primary)" /> PIPELINE THROUGHPUT VELOCITY</h4>
                        <div className="badge badge-success">PEAK EFFICIENCY: 88%</div>
                    </div>
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={throughputData}>
                                <defs>
                                    <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} style={{ fontSize: '0.7rem', fontWeight: 600 }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontWeight: 800, color: 'var(--primary)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="flow"
                                    stroke="var(--primary)"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorFlow)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ background: '#1e293b', color: 'white', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                        <Zap size={18} /> <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>AI LOAD PREDICTION</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
                        HEAVY SURGE EXPECTED
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5 }}>
                        Institutional models predict a <strong>42% increase</strong> in "Waiting" stage density within the next 90 minutes.
                    </p>
                    <div style={{ flex: 1 }}></div>
                    <button
                        className="btn"
                        onClick={() => navigate('/hospital/surge')}
                        style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 900, width: '100%', fontSize: '0.8rem' }}
                    >
                        PRE-EMPTIVE REROUTING
                    </button>
                </div>
            </div>

            {/* Decision Modal */}
            <AnimatePresence>
                {selectedCase && (
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
                            background: 'rgba(15, 23, 42, 0.4)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '24px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: 'white',
                                width: '100%',
                                maxWidth: '440px',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setSelectedCase(null)}
                                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '16px' }}>
                                    {getStageIcon(selectedCase.stage)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b' }}>FLOW DECISION: {selectedCase.stage.toUpperCase()}</div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>CASE #{selectedCase.id}</h3>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>
                                Strategic institutional approval required to advance this case to the <strong>{metrics[selectedCase.index + 1]?.stage || 'FOLLOW-UP'}</strong> phase. Please verify clinical metrics before proceeding.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <button
                                    className="btn"
                                    onClick={() => handleDisapprove(selectedCase.stage)}
                                    style={{ background: '#f1f5f9', color: '#ef4444', fontWeight: 900, padding: '16px' }}
                                >
                                    <ThumbsDown size={18} style={{ marginRight: '8px' }} /> DISAPPROVE
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => handleApprove(selectedCase.stage)}
                                    style={{ background: '#1e293b', color: 'white', fontWeight: 900, padding: '16px' }}
                                >
                                    <ThumbsUp size={18} style={{ marginRight: '8px' }} /> APPROVE
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientFlow;
