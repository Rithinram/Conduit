import React, { useState, useEffect, useMemo } from 'react';
import { Truck, Navigation, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Timer, Info, RefreshCw, Zap, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPatients, dispatchRedistribution, getHospitals } from '../../../services/api';
import { getSurgeLevel } from '../../../../conduit-ml';

const CoordinationPanel = () => {
    const [patients, setPatients] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState(null);
    const [trackingUnit, setTrackingUnit] = useState(null);
    const [editingProposal, setEditingProposal] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        const [patientData, hospitalData] = await Promise.all([
            getPatients(),
            getHospitals()
        ]);
        setPatients(patientData);
        setHospitals(hospitalData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Intelligent Proposal Engine (ML-Driven)
    const proposals = useMemo(() => {
        if (hospitals.length < 2) return [];

        const criticals = hospitals.filter(h =>
            getSurgeLevel(h.icuAvailability || 0, h.erWaitTime || 0) === 'CRITICAL' || (h.occupancy || 0) > 85
        ).sort((a, b) => (b.occupancy || 0) - (a.occupancy || 0));

        const stables = hospitals.filter(h =>
            getSurgeLevel(h.icuAvailability || 0, h.erWaitTime || 0) === 'STABLE' && (h.occupancy || 0) < 65
        ).sort((a, b) => (a.occupancy || 0) - (b.occupancy || 0));

        const generatedProposals = [];
        criticals.forEach((source, i) => {
            const target = stables[i % stables.length];
            if (target && source.id !== target.id) {
                generatedProposals.push({
                    id: `prop-${source.id}-${target.id}`,
                    from: source.name,
                    to: target.name,
                    count: Math.max(5, Math.floor((source.occupancy - 75) / 2)) || 5,
                    reason: source.occupancy > 90 ? 'Critical Surge' : 'Load Imbalance',
                    intensity: source.occupancy > 95 ? 'Critical' : 'Moderate'
                });
            }
        });
        return generatedProposals;
    }, [hospitals]);

    const handleExecuteProposal = async (prop) => {
        setActionStatus(`Dispatching redistribution from ${prop.from} to ${prop.to}...`);
        const result = await dispatchRedistribution({
            intensity: prop.intensity === 'Critical' ? 90 : 70,
            proposals: [{ from: prop.from, to: prop.to, count: prop.count }]
        });

        if (result.success) {
            setActionStatus(`Success: ${result.message}`);
            fetchData();
        } else {
            setActionStatus(`Error: ${result.message}`);
        }
        setTimeout(() => setActionStatus(null), 4000);
    };

    const handleTrackUnit = (unit) => {
        setActionStatus(`Initializing GPS link for ${unit.patientName}...`);
        setTimeout(() => {
            setTrackingUnit(unit);
            setActionStatus(`Tracking Active: Unit ${unit.id.slice(-5).toUpperCase()}`);
        }, 1200);
    };

    const handleEditProposal = (prop) => {
        setEditingProposal(prop);
    };

    const handleSaveEdit = () => {
        setActionStatus('Proposal updated in clinical queue.');
        setEditingProposal(null);
        setTimeout(() => setActionStatus(null), 3000);
    };

    // Filter for patients that might be "transfers" or high priority
    const activeTransfers = patients.filter(p =>
        p.urgencyLevel === 'High' || p.urgencyLevel === 'Critical'
    ).slice(0, 4);

    if (isLoading) return <div>Synchronizing Network Coordination...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {actionStatus && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="card"
                    style={{
                        background: actionStatus.includes('Error') ? 'var(--danger-bg)' : 'var(--success-bg)',
                        color: actionStatus.includes('Error') ? 'var(--danger)' : 'var(--success)',
                        border: `1px solid ${actionStatus.includes('Error') ? 'var(--danger)' : 'var(--success)'}`,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        zIndex: 10
                    }}
                >
                    {actionStatus}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Proposed Shifts */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <Zap size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0 }}>Proposed Network Shifts (AI)</h3>
                        </div>
                        <button onClick={fetchData} className="btn glass" style={{ padding: '8px' }}><RefreshCw size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {proposals.length > 0 ? proposals.map((prop) => (
                            <div key={prop.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid var(--${prop.intensity === 'Critical' ? 'danger' : 'primary'})` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 800 }}>{prop.from.split(' ')[0]}</span>
                                            <ArrowRight size={14} color="var(--text-muted)" />
                                            <span style={{ fontWeight: 800 }}>{prop.to.split(' ')[0]}</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Reason: {prop.reason} | Proposed Shift: <strong>{prop.count} Patient Loads</strong>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                        <button className="btn glass" style={{ padding: '6px' }} onClick={() => handleEditProposal(prop)}><Edit3 size={14} /></button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                            onClick={() => handleExecuteProposal(prop)}
                                        >
                                            CONFIRM & DISPATCH
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--success)' }}>
                                <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: '8px' }} />
                                <div style={{ fontWeight: 700, color: 'var(--success-dark)' }}>Network Balanced</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>No urgent redistributions required at this time.</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logistics Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Regional Load Index</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            {hospitals.slice(0, 4).map(h => (
                                <div key={h.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                        <span>{h.name}</span>
                                        <span style={{ fontWeight: 700 }}>{h.occupancy}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px' }}>
                                        <div style={{ width: `${h.occupancy}%`, height: '100%', background: h.occupancy > 85 ? 'var(--danger)' : h.occupancy > 70 ? 'var(--warning)' : 'var(--success)', borderRadius: '3px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{
                        background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(22, 101, 52, 0.2)'
                    }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <Navigation size={32} color="#4ade80" />
                            <div>
                                <h4 style={{ margin: 0, color: '#4ade80', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.5px' }}>ACTIVE UNITS</h4>
                                <div style={{
                                    fontSize: '1.8rem',
                                    fontWeight: 900,
                                    margin: '4px 0',
                                    color: 'white'
                                }}>
                                    14
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>
                                    Mean response time: <strong>12.4m</strong> network-wide.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pipeline Feed */}
            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>Live Transfer Pipeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {activeTransfers.map((t, i) => (
                        <div key={t.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '150px 1fr 1fr 150px', gap: 'var(--space-xl)', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t.patientName}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {t.id.slice(-5).toUpperCase()}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FROM</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{hospitals[i % hospitals.length]?.name.split(' ')[0] || 'ER'}</div>
                                </div>
                                <ArrowRight size={14} color="var(--primary)" />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TO</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{hospitals[(i + 1) % hospitals.length]?.name.split(' ')[0] || 'HUB'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Timer size={16} color="var(--primary)" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>12m REMAINING</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <button
                                    className={`btn ${trackingUnit?.id === t.id ? 'btn-success' : 'btn-primary'}`}
                                    style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                                    onClick={() => handleTrackUnit(t)}
                                >
                                    {trackingUnit?.id === t.id ? 'UNIT TRACKED' : 'TRACK UNIT'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals & Overlays */}
            <AnimatePresence>
                {trackingUnit && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={overlayStyle}
                        onClick={() => setTrackingUnit(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Navigation size={20} className="pulse-alert" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>En-Route Tracking</h3>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unit ID: {trackingUnit.id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </div>
                                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setTrackingUnit(null)} />
                            </div>

                            <div style={{ background: 'var(--background)', padding: 'var(--space-lg)', borderRadius: '16px', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>LIVE TELEMETRY</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--success)' }}>STABLE</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>SPEED</div>
                                        <div style={{ fontWeight: 800 }}>64 km/h</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>DISTANCE</div>
                                        <div style={{ fontWeight: 800 }}>1.4 km to dest.</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ position: 'relative', height: '120px', background: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', background: 'white', borderRadius: '2px' }} />
                                <motion.div
                                    animate={{ left: ['10%', '60%'] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    style={{ position: 'absolute', top: '50', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Navigation size={10} color="white" style={{ transform: 'rotate(90deg)' }} />
                                </motion.div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setTrackingUnit(null)}>DISMISS MONITOR</button>
                        </motion.div>
                    </motion.div>
                )}

                {editingProposal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={overlayStyle}
                        onClick={() => setEditingProposal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>Edit Shift Strategy</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>REALLOCATION COUNT</label>
                                    <input type="number" defaultValue={editingProposal.count} className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px', display: 'block' }}>PRIORITY LEVEL</label>
                                    <select className="glass" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                                        <option>Low</option>
                                        <option selected={editingProposal.intensity === 'Moderate'}>Moderate</option>
                                        <option selected={editingProposal.intensity === 'Critical'}>Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
                                <button className="btn glass" style={{ flex: 1 }} onClick={() => setEditingProposal(null)}>CANCEL</button>
                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit}>SAVE CHANGES</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Styles
const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const modalStyle = {
    width: '400px', background: 'white', padding: 'var(--space-xl)',
    borderRadius: '24px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--surface-border)'
};

const X = ({ size, style, onClick }) => (
    <svg
        onClick={onClick}
        style={style}
        width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default CoordinationPanel;
