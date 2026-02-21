import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import {
    Users, UserPlus, UserMinus, Clock, TrendingUp,
    AlertCircle, Info, Stethoscope, Zap,
    ChevronRight, CornerUpRight, MessageSquare, X, Send, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { forecastLoad, isModelTrained } from '../../../../conduit-ml';

const QueueManagement = () => {
    const navigate = useNavigate();
    const [isExtraDoctor, setIsExtraDoctor] = useState(false);
    const [isDiverted, setIsDiverted] = useState(false);
    const [showRelocate, setShowRelocate] = useState(false);
    const [showDoctorDialog, setShowDoctorDialog] = useState(false);
    const [showDivertDialog, setShowDivertDialog] = useState(false);
    const [relocationTarget, setRelocationTarget] = useState(null);
    const [nurseName, setNurseName] = useState('Nurse Sarah');

    const [waitForecast, setWaitForecast] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ML-powered wait time forecast for the next 6 hours (Async)
    useEffect(() => {
        const fetchForecast = async () => {
            setIsLoading(true);
            try {
                const now = new Date();
                const startHour = now.getHours();
                const day = now.getDay();
                // If model is trained, use it, otherwise use fallback logic in forecastLoad
                const data = await forecastLoad(startHour, day, 10, 6);
                setWaitForecast(data.map(f => ({
                    time: f.time,
                    actual: f.actual || null, // Optional actual data if we had it
                    predicted: f.predictedWaitTime
                })));
            } catch (err) {
                console.error("Fetch forecast failed:", err);
                // Fallback static data if ML fails
                setWaitForecast([
                    { time: '12:00', actual: 35, predicted: 35 },
                    { time: '13:00', actual: 42, predicted: 38 },
                    { time: '14:00', actual: 58, predicted: 55 },
                    { time: '15:00', actual: 85, predicted: 80 },
                    { time: '16:00', actual: null, predicted: 95 },
                    { time: '17:00', actual: null, predicted: 75 },
                    { time: '18:00', actual: null, predicted: 55 },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForecast();
    }, []);

    // Detect if a surge is predicted
    const peakEntry = useMemo(() => {
        if (!waitForecast.length) return { time: '--:--', predicted: 0 };
        return waitForecast.reduce((max, e) => e.predicted > max.predicted ? e : max, waitForecast[0]);
    }, [waitForecast]);

    const surgeExpected = peakEntry.predicted > 60;

    const handleRelocate = (dept) => {
        setRelocationTarget(dept);
        setShowRelocate(true);
    };

    const handleConfirmRelocate = () => {
        setShowRelocate(false);
    };

    const toggleDoctor = () => {
        if (!isExtraDoctor) {
            setShowDoctorDialog(true);
        }
        setIsExtraDoctor(!isExtraDoctor);
    };

    const toggleDivert = () => {
        if (!isDiverted) {
            setShowDivertDialog(true);
        }
        setIsDiverted(!isDiverted);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Wait time forecasting */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0 }}>Clinical Load Forecast</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%' }}></span> Actual Wait
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: 8, height: 8, border: '1px solid var(--danger)', borderRadius: '50%' }}></span> AI Predicted
                                </span>
                            </div>
                        </div>
                        {surgeExpected && <div className="badge badge-danger">PREDICTED SURGE: {peakEntry.time}</div>}
                    </div>
                    <div style={{ height: '300px', marginTop: 'var(--space-xl)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={waitForecast}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="actual" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                                <Line type="monotone" dataKey="predicted" stroke="var(--danger)" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Staff Allocation */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Intervention Suite</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Proactive clinical controls for immediate capacity adjustment.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Stethoscope size={20} color="var(--primary)" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Extra Physician</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isExtraDoctor ? 'Active On-Call' : 'Available'}</div>
                                </div>
                            </div>
                            <button
                                className={`btn ${isExtraDoctor ? 'btn-danger' : 'btn-primary'}`}
                                style={{ height: 32, padding: '0 1rem', fontSize: '0.8rem' }}
                                onClick={toggleDoctor}
                            >
                                {isExtraDoctor ? 'REVOKE' : 'ADD DOCTOR'}
                            </button>
                        </div>

                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: isDiverted ? '1px solid #ef4444' : '1px solid var(--surface-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <CornerUpRight size={20} color={isDiverted ? '#ef4444' : 'var(--text-muted)'} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Divert Low-Urgency</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isDiverted ? 'Diversion Logged' : 'Normal Operations'}</div>
                                </div>
                            </div>
                            <button
                                className={`btn ${isDiverted ? 'btn-danger' : 'btn-secondary'}`}
                                style={{ height: 32, padding: '0 1rem', fontSize: '0.8rem' }}
                                onClick={toggleDivert}
                            >
                                {isDiverted ? 'END DIVERT' : 'TRIGGER'}
                            </button>
                        </div>

                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Users size={20} color="var(--warning)" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Nurse Shortage</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waiting Area C</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ background: 'var(--warning)', color: '#92400e', border: 'none', height: 32, fontSize: '0.8rem' }} onClick={() => handleRelocate('Waiting Area C')}>RELOCATE</button>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--background)', marginTop: 'auto', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                            <TrendingUp size={18} /> EFFICIENCY IMPACT
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Selected interventions will reduce patient saturation by <strong>32%</strong> over the next 120 minutes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Relocation Notification */}
            <div className="card" style={{ background: 'var(--text-main)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}>
                        <MessageSquare size={24} color="var(--warning)" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0 }}>Predictive Staff Orchestration</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                            Relocation protocols and doctor additions will be pushed to the regional staff dashboard upon clicking below.
                        </p>
                    </div>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => navigate('/hospital/staff')}
                >
                    POST ANNOUNCEMENT <Send size={16} />
                </button>
            </div>

            {/* Dialogs Wrapper */}
            <AnimatePresence>
                {/* Relocation Dialog */}
                {showRelocate && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => setShowRelocate(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Staff Relocation</h3>
                                <button onClick={() => setShowRelocate(false)} style={closeButtonStyle}><X size={20} /></button>
                            </div>

                            <div className="card glass" style={{ border: 'none', background: '#f8fafc', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>NURSE NAME</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{nurseName}</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>FROM</div>
                                    <div style={{ fontWeight: 800 }}>Triage Zone B</div>
                                </div>
                                <Activity size={20} color="var(--primary)" />
                                <div style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>TO</div>
                                    <div style={{ fontWeight: 800, color: 'var(--warning)' }}>{relocationTarget}</div>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px' }} onClick={handleConfirmRelocate}>
                                CONFIRM REALLOCATION
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Add Doctor Dialog */}
                {showDoctorDialog && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => setShowDoctorDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Physician Activation</h3>
                                <button onClick={() => setShowDoctorDialog(false)} style={closeButtonStyle}><X size={20} /></button>
                            </div>

                            <div className="card glass" style={{ border: 'none', background: '#f1f5f9', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Stethoscope size={20} /> <span style={{ fontWeight: 800 }}>Dr. Elena Rodriguez</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    Senior Attending Physician paged for immediate surge support. Estimated ETA: <strong>4 minutes</strong>.
                                </p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Predicted Load Reduction</span>
                                    <span style={{ fontWeight: 700 }}>18%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Assigned Zone</span>
                                    <span style={{ fontWeight: 700 }}>Urgent Care B</span>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-xl)', padding: '14px' }} onClick={() => setShowDoctorDialog(false)}>
                                ACKNOWLEDGE & PUSH
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Divert Dialog */}
                {showDivertDialog && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => setShowDivertDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Diversion Protocol</h3>
                                <button onClick={() => setShowDivertDialog(false)} style={closeButtonStyle}><X size={20} /></button>
                            </div>

                            <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid #ef4444', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800, marginBottom: '8px' }}>
                                    <CornerUpRight size={20} /> NETWORK REROUTING
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    Low-priority (ESI 4/5) patients being diverted to: <br />
                                    <strong>City General West Annex</strong> and <strong>St. Jude Urgent Hub</strong>.
                                </p>
                            </div>

                            <div style={{ padding: 'var(--space-md)', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>LOGISTICS UPDATE</div>
                                <div style={{ color: 'var(--text-muted)' }}>Ambulance intake paged. Digital signage updated at regional check-points.</div>
                            </div>

                            <button className="btn btn-danger" style={{ width: '100%', marginTop: 'var(--space-xl)', padding: '14px', border: 'none' }} onClick={() => setShowDivertDialog(false)}>
                                ACTIVATE DIVERSION
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Common Modal Styles
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
    width: '420px', background: 'white', borderRadius: '24px',
    padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--surface-border)'
};

const modalHeaderStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 'var(--space-lg)'
};

const closeButtonStyle = {
    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)'
};

export default QueueManagement;
