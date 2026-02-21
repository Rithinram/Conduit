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
                                        <button className="btn glass" style={{ padding: '6px' }}><Edit3 size={14} /></button>
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

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <Navigation size={32} color="var(--primary)" />
                            <div>
                                <h4 style={{ margin: 0 }}>Logistics Health</h4>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, margin: '8px 0' }}>14 <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.7 }}>Active Units</span></div>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                                    Mean response time minimized to <strong>12.4m</strong> عبر across the network.
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
                                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>TRACK UNIT</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoordinationPanel;
