import React, { useState, useEffect } from 'react';
import { getPatients, getUrgencyColor } from '../../../services/api';
import { MoreHorizontal, ShieldAlert, PhoneForwarded, Users, CheckCircle, RefreshCcw, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SmartTriage = () => {
    const [patients, setPatients] = useState([]);
    const [surgeMode, setSurgeMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            const data = await getPatients();
            setPatients(data);
            setIsLoading(false);
        };
        fetchPatients();
    }, []);

    const processPatient = (id, destination) => {
        setPatients(prev => prev.filter(p => p.id !== id));
        // In real app, this would route patient to destination
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Control Header */}
            <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Incoming Stream</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{patients.length} Active Intakes</div>
                    </div>
                    <div style={{ height: '32px', width: '1px', background: 'var(--surface-border)' }} />
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <button className="btn glass"><Filter size={16} /> Filter: All Urgencies</button>
                        <button className="btn glass"><RefreshCcw size={16} /> Syncing Live</button>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Surge Optimization</span>
                    <button
                        onClick={() => setSurgeMode(!surgeMode)}
                        style={{
                            width: '60px',
                            height: '32px',
                            borderRadius: '16px',
                            background: surgeMode ? 'var(--danger)' : 'var(--surface-border)',
                            position: 'relative',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'background 0.3s'
                        }}
                    >
                        <motion.div
                            animate={{ x: surgeMode ? 30 : 2 }}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px' }}
                        />
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Patient Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                            <tr>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Patient ID</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Condition</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Urgency Score</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>ETA</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                                            <div className="pulse-alert" style={{ display: 'inline-block', width: '20px', height: '20px', background: 'var(--primary)', borderRadius: '50%' }} />
                                            <div style={{ marginTop: '10px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>SYNCHRONIZING WITH REGIONAL HUB...</div>
                                        </td>
                                    </tr>
                                ) : patients.map((p) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ x: 50, opacity: 0 }}
                                        style={{ borderBottom: '1px solid var(--surface-border)' }}
                                    >
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RID: {p.id.toUpperCase()}</div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{p.type}</span>
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getUrgencyColor(p.urgency) }} />
                                                <span style={{ fontWeight: 700, color: getUrgencyColor(p.urgency) }}>{p.urgency.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)', color: 'var(--text-muted)' }}>{p.arrival}</td>
                                        <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                                <button onClick={() => processPatient(p.id, 'er')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>ER</button>
                                                <button onClick={() => processPatient(p.id, 'clinic')} className="btn glass" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>CLINIC</button>
                                                <button className="btn glass" style={{ padding: '0.4rem 0.8rem' }}><MoreHorizontal size={14} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {patients.length === 0 && (
                        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <CheckCircle size={48} style={{ marginBottom: 'var(--space-md)', opacity: 0.3 }} />
                            <div>No pending intakes. Triage clear.</div>
                        </div>
                    )}
                </div>

                {/* Operational Oversight */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Triage Efficiency</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 800, margin: 'var(--space-sm) 0' }}>88%</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg. Decision Time: <strong>42s</strong></div>
                        <div style={{ height: '4px', background: 'var(--surface-border)', borderRadius: '2px', marginTop: 'var(--space-md)' }}>
                            <div style={{ width: '88%', height: '100%', background: 'var(--success)', borderRadius: '2px' }} />
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <ShieldAlert size={20} color="var(--danger)" />
                            <h4 style={{ margin: 0 }}>Smart Routing Engine</h4>
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Triage sensitivity is currently set to <strong>Level 2</strong>. Low urgency cases are automatically suggested for clinic referral.
                        </p>
                        <div className="card glass" style={{ border: 'none', background: 'rgba(255,255,255,0.05)', marginTop: 'var(--space-md)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Potential Diverted Load</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>12 Patients / hr</div>
                        </div>
                    </div>

                    <button className="btn" style={{ width: '100%', height: '50px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                        <PhoneForwarded size={18} /> NOTIFY AFFILIATED CLINICS
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartTriage;
