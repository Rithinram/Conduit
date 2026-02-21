import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, LayoutPanelLeft, Activity, ShieldAlert, CheckCircle2, MoreVertical, Search, Filter, RefreshCw, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPatients, bulkRedirect } from '../../../services/api';

const CareOversight = () => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getPatients();
        setPatients(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const eligiblePatients = useMemo(() => {
        // Simple logic for eligibility: Low/Moderate urgency and not yet redirected
        return patients.filter(p =>
            p.policyFlag !== 'Auto-Redirected' &&
            (p.urgencyLevel === 'Low' || p.urgencyLevel === 'Moderate')
        );
    }, [patients]);

    const careFlowData = useMemo(() => {
        const counts = { ER: 0, Clinic: 0, Home: 0, Hospital: 0, Tele: 0 };
        patients.forEach(p => {
            if (p.recommendedCare === 'ER') counts.ER++;
            else if (p.recommendedCare === 'Clinic') counts.Clinic++;
            else if (p.recommendedCare === 'Home') counts.Home++;
            else if (p.recommendedCare === 'Hospital') counts.Hospital++;

            if (p.policyFlag === 'Auto-Redirected') counts.Tele++;
        });
        return [
            { stage: 'ER', count: counts.ER },
            { stage: 'Clinic', count: counts.Clinic },
            { stage: 'Home', count: counts.Home },
            { stage: 'Inpatient', count: counts.Hospital },
            { stage: 'Tele (Auto)', count: counts.Tele },
        ];
    }, [patients]);

    const handleBulkRedirect = async () => {
        setActionStatus('Initiating bulk redirection protocol...');
        const result = await bulkRedirect();
        if (result.success) {
            setActionStatus(`Success: ${result.message}`);
            setShowPreview(false);
            fetchData();
        } else {
            setActionStatus(`Error: ${result.message}`);
        }
        setTimeout(() => setActionStatus(null), 4000);
    };

    if (isLoading) return <div>Analyzing Patient Flow...</div>;

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
                        zIndex: 20
                    }}
                >
                    {actionStatus}
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Level Capacity Trends */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h3 style={{ margin: 0 }}>Active Regional Care Distribution</h3>
                            <button onClick={fetchData} className="btn glass" style={{ padding: '8px' }}><RefreshCw size={16} /></button>
                        </div>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={careFlowData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="stage" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Eligible Preview Section */}
                    {showPreview && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="card"
                            style={{ border: '2px solid var(--primary)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h4 style={{ margin: 0 }}>Redirection Preview: {eligiblePatients.length} Patients</h4>
                                <button onClick={() => setShowPreview(false)} className="btn glass" style={{ padding: '4px' }}><X size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', maxHeight: '300px', overflowY: 'auto' }}>
                                {eligiblePatients.map(p => (
                                    <div key={p.id} className="glass" style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <div>
                                            <strong>{p.patientName}</strong> <span style={{ opacity: 0.6 }}>({p.urgencyLevel})</span>
                                        </div>
                                        <div style={{ color: 'var(--primary)', fontWeight: 700 }}>→ Tele/Clinic</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--space-md)', gap: 'var(--space-sm)' }}
                                onClick={handleBulkRedirect}
                            >
                                <Send size={16} /> CONFIRM BULK ACTION
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Efficiency Stats Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <Activity size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0 }}>Efficiency Detection</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Automated analysis of network throughput and bottlenecks.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                            <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>MISALIGNED ER LOAD</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>
                                    {eligiblePatients.length} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Patients</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>Low-urgency cases currently tied to acute beds.</p>
                            </div>

                            <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>AI THROUGHPUT</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>85.2%</div>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>Accuracy of clinical suitability routing.</p>
                            </div>
                        </div>

                        {!showPreview && (
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--space-lg)', gap: 'var(--space-sm)' }}
                                onClick={() => setShowPreview(true)}
                                disabled={eligiblePatients.length === 0}
                            >
                                <LayoutPanelLeft size={16} /> PREVIEW ELIGIBLE FLOW
                            </button>
                        )}
                        {eligiblePatients.length === 0 && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', textAlign: 'center', marginTop: '8px', fontWeight: 700 }}>
                                <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                FLOW OPTIMIZED: NO ELIGIBLE PATIENTS
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <ShieldAlert size={18} color="var(--warning)" />
                            <h4 style={{ margin: 0 }}>Guardrail Status</h4>
                        </div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.5 }}>
                            All redirections are subject to clinical validation override. Critical cases are strictly isolated from automated routing.
                        </p>
                        <div className="card glass" style={{ border: 'none', background: 'rgba(255,255,255,0.05)', marginTop: 'var(--space-md)', padding: '10px' }}>
                            <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>LAST NETWORK SYNC</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Just Now</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forecast Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
                {[
                    { label: 'Flux Influx', value: '+14%', color: 'var(--danger)' },
                    { label: 'Wait Variance', value: '-22m', color: 'var(--success)' },
                    { label: 'Provider Load', value: 'High', color: 'var(--warning)' },
                    { label: 'Policy Adherence', value: '99.2%', color: 'var(--primary)' }
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color, marginTop: '4px' }}>{s.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CareOversight;
