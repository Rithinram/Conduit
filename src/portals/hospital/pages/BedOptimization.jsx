import React, { useState, useEffect } from 'react';
import {
    Bed, UserMinus, Activity, ShieldAlert, CheckCircle2,
    AlertTriangle, TrendingDown, X, Info, Heart,
    Thermometer, ClipboardCheck, ArrowRight, Loader2,
    Calendar, Clock, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getHospitalById } from '../../../services/api';

const BedOptimization = () => {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [isAutoInitiating, setIsAutoInitiating] = useState(false);
    const [executingTransfer, setExecutingTransfer] = useState(null);
    const [dischargeSuccess, setDischargeSuccess] = useState(false);

    const [hospital, setHospital] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const hospitalId = user?.hospitalId || '67b7f1e737bd488820c3ccf2';

        const fetchHospital = async () => {
            setIsLoading(true);
            try {
                const data = await getHospitalById(hospitalId);
                setHospital(data);
            } catch (err) {
                console.error("Fetch hospital failed:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHospital();
    }, []);

    const [dischargeCandidates, setDischargeCandidates] = useState([
        {
            id: 'c1', name: 'Michael Chen', unit: 'Ward B-12', progress: 95, stay: '5 days',
            vitals: { hr: 72, temp: 98.4, bp: '120/80', spo2: 98 },
            diagnosis: 'Post-Op Recovery (Appendectomy)',
            notes: 'Steady improvement in mobilization. Pain well-controlled.'
        },
        {
            id: 'c2', name: 'Elena Rodriguez', unit: 'Ward A-04', progress: 92, stay: '3 days',
            vitals: { hr: 68, temp: 98.6, bp: '118/76', spo2: 99 },
            diagnosis: 'Acute Bronchitis (Resolution Phase)',
            notes: 'Oxygen saturation stable on room air for 24 hours.'
        },
        {
            id: 'c3', name: 'Samuel Wilson', unit: 'ICU-08', progress: 85, stay: '8 days', triage: 'ICU -> Ward',
            vitals: { hr: 84, temp: 99.1, bp: '135/85', spo2: 96 },
            diagnosis: 'Cardiac Monitoring (Post-Stent)',
            notes: 'Stable rhythm. Ready for down-triage to telemetry ward.'
        },
    ]);

    if (isLoading || !hospital) return <div>Synchronizing Bed Data...</div>;

    const stats = [
        { label: 'Total Beds', value: hospital.totalBeds, sub: `${hospital.occupancy}% Occupied` },
        { label: 'ICU Capacity', value: `${hospital.availableICU}/${hospital.totalICU}`, sub: 'High Fidelity Tracking', status: hospital.availableICU < 10 ? 'danger' : 'success' },
        { label: 'ER Rating', value: hospital.rating, sub: 'User Consensus', status: 'success' },
    ];

    const handleAutoInitiate = () => {
        setIsAutoInitiating(true);
        setTimeout(() => {
            setIsAutoInitiating(false);
            setDischargeSuccess(true);
            setTimeout(() => setDischargeSuccess(false), 3000);
        }, 2500);
    };

    const handleExecuteTransfer = () => {
        setShowTransferDialog(true);
    };

    const confirmTransfer = () => {
        setExecutingTransfer('transfer-1');
        setShowTransferDialog(false);
        setTimeout(() => {
            setExecutingTransfer(null);
        }, 2000);
    };

    const confirmDischarge = (id) => {
        setDischargeCandidates(prev => prev.filter(p => p.id !== id));
        setSelectedPatient(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{ borderLeft: s.status ? `4px solid var(--${s.status})` : 'none', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: s.status === 'danger' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>{s.sub}</div>
                        {s.status === 'danger' && (
                            <motion.div
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'var(--danger)', pointerEvents: 'none' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Discharge Optimizer */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Predictive Discharge Optimizer</h3>
                        <button
                            className={`btn ${dischargeSuccess ? 'btn-success' : 'btn-primary'}`}
                            style={{ fontSize: '0.75rem', minWidth: '180px' }}
                            onClick={handleAutoInitiate}
                            disabled={isAutoInitiating}
                        >
                            {isAutoInitiating ? (
                                <><Loader2 size={14} className="animate-spin" /> INITIALIZING...</>
                            ) : dischargeSuccess ? (
                                <><CheckCircle2 size={14} /> CLEARANCE SENT</>
                            ) : (
                                <><CheckCircle2 size={14} /> AUTO-INITIATE DISCHARGE</>
                            )}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {dischargeCandidates.map((c, i) => (
                            <motion.div
                                key={c.id}
                                className="glass clickable"
                                whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.8)' }}
                                style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                onClick={() => setSelectedPatient(c)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.unit} • Length of Stay: {c.stay}</div>
                                    </div>
                                    {c.triage ? (
                                        <span className="badge badge-warning">{c.triage}</span>
                                    ) : (
                                        <span className="badge badge-success">READY</span>
                                    )}
                                </div>
                                <div style={{ marginTop: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        <span>Recovery Profile</span>
                                        <span>{c.progress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--surface-border)', borderRadius: '3px' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${c.progress}%` }}
                                            style={{ height: '100%', background: 'var(--success)', borderRadius: '3px' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* ICU High-Densitity Monitor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <ShieldAlert size={24} color="var(--danger)" />
                            <div>
                                <h4 style={{ margin: 0, color: 'var(--danger)' }}>ICU Critical Lockdown</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#991b1b' }}>
                                    ICU capacity is at 91%. Automatic lockdown protocol: All elective surgeries requiring post-op ICU are deferred for 48h.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h4>Transfer Optimization</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Recommended patient transfers to step-down units to free critical care beds.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <div style={{ padding: 'var(--space-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <TrendingDown size={20} color="var(--success)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Divert to Step-Down</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Potential to free 3 ICU beds in &lt;1h</div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', minWidth: '100px' }}
                                    onClick={handleExecuteTransfer}
                                    disabled={executingTransfer === 'transfer-1'}
                                >
                                    {executingTransfer === 'transfer-1' ? <Loader2 size={12} className="animate-spin" /> : 'EXECUTE'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <Activity size={18} />
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Bed Sensor: ACTIVE</div>
                        </div>
                        <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '50px', background: 'linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.1), transparent)', pointerEvents: 'none' }}
                        />
                    </div>
                </div>
            </div>

            {/* Dialogs Wrapper */}
            <AnimatePresence>
                {/* Patient Detail Modal */}
                {selectedPatient && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => setSelectedPatient(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 48, height: 48, background: 'var(--background)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedPatient.name}</h3>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPatient.unit} • Patient ID: #P-{selectedPatient.id}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedPatient(null)} style={closeButtonStyle}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <div className="card glass" style={{ padding: 'var(--space-md)', border: 'none', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem' }}>
                                        <Heart size={14} /> VITALS
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.85rem' }}>
                                        <div style={{ color: 'var(--text-muted)' }}>HR: <strong>{selectedPatient.vitals.hr}</strong></div>
                                        <div style={{ color: 'var(--text-muted)' }}>BP: <strong>{selectedPatient.vitals.bp}</strong></div>
                                        <div style={{ color: 'var(--text-muted)' }}>Temp: <strong>{selectedPatient.vitals.temp}°F</strong></div>
                                        <div style={{ color: 'var(--text-muted)' }}>SpO2: <strong style={{ color: 'var(--success)' }}>{selectedPatient.vitals.spo2}%</strong></div>
                                    </div>
                                </div>
                                <div className="card glass" style={{ padding: 'var(--space-md)', border: 'none', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem' }}>
                                        <ClipboardCheck size={14} /> DIAGNOSIS
                                    </div>
                                    <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>{selectedPatient.diagnosis}</div>
                                </div>
                            </div>

                            <div className="card" style={{ background: '#fffbeb', border: '1px solid #fef3c7', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>CLINICAL NOTES</div>
                                <div style={{ fontSize: '0.85rem', color: '#92400e' }}>{selectedPatient.notes}</div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedPatient(null)}>KEEP IN WARD</button>
                                <button className="btn btn-primary" style={{ flex: 1.5, background: 'var(--success)', border: 'none' }} onClick={() => confirmDischarge(selectedPatient.id)}>
                                    CONFIRM DISCHARGE <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Transfer Protocol Dialog */}
                {showTransferDialog && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => setShowTransferDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Transfer Protocol</h3>
                                <button onClick={() => setShowTransferDialog(false)} style={closeButtonStyle}><X size={20} /></button>
                            </div>

                            <div className="card" style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary)', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 800, marginBottom: '8px' }}>
                                    <TrendingDown size={20} /> STEP-DOWN ACTIVATION
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                                    Initiating transfer of <strong>3 ICU patients</strong> to the Medical Telemetry Step-Down unit.
                                </p>
                            </div>

                            <div style={{ padding: 'var(--space-md)', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem' }}>
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>BED CAPACITY IMPACT</div>
                                <div style={{ color: 'var(--text-muted)' }}>This action will free 3 critical care beds, reducing ICU saturation to **84%**.</div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-xl)', padding: '14px' }} onClick={confirmTransfer}>
                                CONFIRM TRANSFER
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Common Modal Styles (Reused from QueueManagement for consistency)
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
    width: '480px', background: 'white', borderRadius: '24px',
    padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--surface-border)'
};

const modalHeaderStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'top',
    marginBottom: 'var(--space-lg)'
};

const closeButtonStyle = {
    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)'
};

export default BedOptimization;
