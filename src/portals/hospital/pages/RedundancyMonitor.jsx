import React, { useState } from 'react';
import {
    FileSearch, AlertCircle, CheckCircle2, RefreshCcw,
    Database, Share2, Info, AlertTriangle, Zap,
    Activity, FileText, FlaskConical, Stethoscope,
    Pill, ClipboardList, TrendingUp, X, Bell, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RedundancyMonitor = () => {
    const [activeDialog, setActiveDialog] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [alertMessage, setAlertMessage] = useState({ title: '', body: '', icon: null });

    const showAlert = (title, body, icon = <CheckCircle2 size={40} color="var(--success)" />) => {
        setAlertMessage({ title, body, icon });
        setActiveDialog('alert');
    };

    const duplicateTests = [
        { id: 1, patient: 'John Doe', test: 'CBC Panel', conflict: 'CBC (4h ago)', urgency: 'ESI 3', dept: 'Pathology', status: 'Flagged', color: '#f43f5e' },
        { id: 2, patient: 'Jane Smith', test: 'MRI Lumbar', conflict: 'MRI (2 Days ago)', urgency: 'ESI 4', dept: 'Radiology', status: 'Review', color: '#f59e0b' },
        { id: 3, patient: 'Robert Brown', test: 'Troponin-T', conflict: 'Trop (1h ago)', urgency: 'ESI 2', dept: 'ER Lab', status: 'Immediate', color: '#ef4444' },
        { id: 4, patient: 'Alice Williams', test: 'HbA1c', conflict: 'HbA1c (Weekly)', urgency: 'ESI 5', dept: 'OPD Lab', status: 'Flagged', color: '#8b5cf6' },
    ];

    const duplicateDiagnoses = [
        { id: 'd1', patient: 'Mary Johnson', diagnosis: 'Unspecified CP', previous: 'Angina Pectoris', age: '68y', confidence: '92%' },
        { id: 'd2', patient: 'Sam Wilson', diagnosis: 'Soft Tissue Inj', previous: 'Sprain (3d ago)', age: '24y', confidence: '85%' },
    ];

    const visitPatterns = [
        { id: 'p1', patient: 'Kevin Heart', visits: 4, period: '14 Days', reason: 'Non-Emergent Resp', impact: 'High Load' },
        { id: 'p2', patient: 'Sarah Lee', visits: 3, period: '7 Days', reason: 'Chronic Pain Mgmt', impact: 'Moderate' },
    ];

    const handleShare = (dept) => {
        showAlert('Departmental Sync', `Clinical records successfully securely shared with the ${dept} department via internal bridge.`);
    };

    const handleResolve = (item) => {
        setSelectedItem(item);
        setActiveDialog('resolve');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Colorful Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
                {[
                    { label: 'Repeat Lab Rate', value: '18.4%', icon: FlaskConical, color: '#f43f5e', sub: '+2.1% spike detected' },
                    { label: 'Dupe Diagnosis', value: '12%', icon: Stethoscope, color: '#8b5cf6', sub: '92% Confidence AI Match' },
                    { label: 'Multi-Visit Alerts', value: '24', icon: Activity, color: '#10b981', sub: 'Frequent-flyer detection' },
                    { label: 'Resource Savings', value: '$8.2k', icon: Zap, color: '#f59e0b', sub: 'Calculated per 24h shift' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="card glass"
                        style={{ borderLeft: `6px solid ${stat.color}`, background: 'white' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat.label}</span>
                            <stat.icon size={20} color={stat.color} />
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.7rem', color: stat.color, fontWeight: 700 }}>{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Repeat Lab Test Tracker */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>Repeat Lab Conflict Monitor</h3>
                            <div className="badge badge-danger">CRITICAL OVERSIGHT</div>
                        </div>
                        <button className="btn btn-secondary" onClick={() => showAlert('System Sync', 'Redundancy database fully synchronized with Regional Health Exchange.')}>
                            <RefreshCcw size={14} /> REFRESH FEED
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {duplicateTests.map((t) => (
                            <motion.div
                                key={t.id}
                                className="glass"
                                style={{ padding: 'var(--space-md)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--surface-border)' }}
                            >
                                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                    <div style={{ width: 45, height: 45, borderRadius: '12px', background: `${t.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AlertTriangle size={20} color={t.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{t.patient} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({t.urgency})</span></div>
                                        <div style={{ fontSize: '0.85rem', color: t.color, fontWeight: 700 }}>{t.test} • <span style={{ opacity: 0.8 }}>Dupe: {t.conflict}</span></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn glass" style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => handleResolve(t)}>VIEW RESULTS</button>
                                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem' }} onClick={() => showAlert('Order Cancelled', `Redundant ${t.test} for ${t.patient} has been safely cancelled. Resource reallocated.`, <ShieldCheck size={40} color="var(--success)" />)}>CANCEL DUPE</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Duplicate Diagnosis Audit */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <ClipboardList color="var(--primary-light)" size={24} />
                            <h3 style={{ margin: 0 }}>Diagnosis Audit Panel</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {duplicateDiagnoses.map((d) => (
                                <div key={d.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700 }}>{d.patient} ({d.age})</span>
                                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>{d.confidence} MATCH</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>New: {d.diagnosis}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Prev: {d.previous}</div>
                                    <button className="btn glass" style={{ width: '100%', padding: '4px', fontSize: '0.65rem', marginTop: '8px', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => showAlert('Diagnosis Confirmed', 'Previous clinical history merged with current diagnosis log.')}>MERGE RECORDS</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h4 style={{ margin: '0 0 var(--space-md) 0' }}>Multi-Visit Analysis (14d)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            {visitPatterns.map((p) => (
                                <div key={p.id} className="glass" style={{ padding: '10px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.patient}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.visits} Vis. • {p.reason}</div>
                                    </div>
                                    <div className="badge badge-warning" style={{ fontSize: '0.6rem' }}>{p.impact}</div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-lg)' }} onClick={() => showAlert('Social Work Paged', 'Case management paged for pattern intervention.')}>PATIENT CASE REVIEW</button>
                    </div>
                </div>
            </div>

            {/* Departmental Record Hub */}
            <div className="card glass" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                        <Share2 size={24} />
                        <div>
                            <h3 style={{ margin: 0 }}>Inter-Departmental Record Bridge</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Share real-time clinical data across specialized units.</p>
                        </div>
                    </div>
                    <div className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>SECURE ARCHITECTURE</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)' }}>
                    {[
                        { name: 'Radiology', icon: Zap },
                        { name: 'Pathology', icon: FlaskConical },
                        { name: 'Pharmacy', icon: Pill },
                        { name: 'Cardiology', icon: Activity }
                    ].map((dept) => (
                        <button key={dept.name} className="btn glass" style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white', display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '10px' }} onClick={() => handleShare(dept.name)}>
                            <dept.icon size={28} />
                            <span style={{ fontWeight: 700 }}>SHARE WITH {dept.name.toUpperCase()}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Suggestion System */}
            <div className="card glass" style={{ border: '2px dashed var(--primary)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={24} color="var(--primary)" />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>SMART SUGGESTION:</strong> 3 orders flagged for duplication. We strongly recommend **Cross-Checking Previous Results** in the Radiology EHR before confirming new MRI slots.
                </p>
                <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => showAlert('Cross-Check Active', 'Opening historical lab/imaging data for flagged patients.')}>CROSS-CHECK ALL</button>
            </div>

            {/* Dialogs Wrapper */}
            <AnimatePresence>
                {/* Generic Alert Modal */}
                {activeDialog === 'alert' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ ...modalContentStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                {alertMessage.icon || <CheckCircle2 size={48} color="var(--success)" />}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0' }}>{alertMessage.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
                                {alertMessage.body}
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveDialog(null)}>UNDERSTOOD</button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Resolution Modal */}
                {activeDialog === 'resolve' && selectedItem && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Conflict Resolution</h3>
                                <button onClick={() => setActiveDialog(null)} style={closeButtonStyle}><X size={20} /></button>
                            </div>
                            <div className="card glass" style={{ background: `${selectedItem.color}10`, border: `1px solid ${selectedItem.color}`, marginBottom: 'var(--space-lg)' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{selectedItem.test} Conflict</div>
                                <div style={{ fontSize: '0.85rem', color: selectedItem.color }}>Duplicate found in {selectedItem.dept} database.</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Patient</span> <span style={{ fontWeight: 700 }}>{selectedItem.patient}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Last Result</span> <span style={{ fontWeight: 700 }}>NORMAL (4h ago)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Physician</span> <span style={{ fontWeight: 700 }}>Dr. Aris (Pathology)</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => showAlert('Record Linked', 'Historical data attached to current visit chart.')}>USE PREVIOUS</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setActiveDialog(null); showAlert('Order Validated', 'Redundant order manually validated as medically necessary.'); }}>PROCEED NEW</button>
                            </div>
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
    width: '440px', background: 'white', borderRadius: '24px',
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

export default RedundancyMonitor;
