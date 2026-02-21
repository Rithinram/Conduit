import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutPanelLeft, Clock, AlertTriangle, ArrowRight, CheckCircle2, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const flowData = [
    { stage: 'Arrival', count: 12, avgDelay: 5 },
    { stage: 'Triage', count: 8, avgDelay: 12 },
    { stage: 'Waiting', count: 24, avgDelay: 45 },
    { stage: 'Consultation', count: 15, avgDelay: 20 },
    { stage: 'Lab/Rad', count: 18, avgDelay: 60 },
    { stage: 'Discharge', count: 10, avgDelay: 15 },
];

const PatientFlow = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Pipeline Visualization */}
            <motion.div layout className="card" style={{ padding: 'var(--space-xl)', border: '1px solid var(--primary-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>Active Patient Journey Pipeline</h3>
                    <div className="glass" style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid var(--surface-border)' }}>
                        LIVE FLOW MONITORING
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                    {flowData.map((d, i) => (
                        <React.Fragment key={d.stage}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                                style={{
                                    flex: 1,
                                    background: 'var(--background)',
                                    borderRadius: '20px',
                                    padding: 'var(--space-md)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    border: d.avgDelay > 30 ? '2px solid var(--danger)' : d.avgDelay > 15 ? '2px solid var(--warning)' : '1px solid var(--surface-border)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{d.stage}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>{d.count}</div>
                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: d.avgDelay > 30 ? 'var(--danger)' : 'var(--text-muted)' }}>
                                    {d.avgDelay}M DELAY
                                </div>
                                {d.avgDelay > 30 && (
                                    <div className="pulse-critical" style={{ position: 'absolute', top: -8, right: -8, background: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '6px', boxShadow: '0 0 10px var(--danger)' }}>
                                        <AlertTriangle size={14} />
                                    </div>
                                )}
                            </motion.div>
                            {i < flowData.length - 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--surface-border)' }}>
                                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                        <ArrowRight size={20} />
                                    </motion.div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-lg)' }}>
                {/* Bottleneck Analysis */}
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--space-md)' }}>Bottleneck Alerts</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div className="card glass" style={{ borderLeft: '4px solid var(--danger)', padding: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--danger)' }}>Waiting Hall Overload</span>
                                <span className="badge badge-danger">CRITICAL</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>Delay has increased by 150% in the last 20 mins. Requesting 2 additional nurses from OPD-B.</p>
                            <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)', fontSize: '0.75rem', width: '100%' }}>INITIATE REDIRECTION</button>
                        </div>

                        <div className="card glass" style={{ borderLeft: '4px solid var(--warning)', padding: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, color: 'var(--warning)' }}>Lab Processing Queue</span>
                                <span className="badge badge-warning">MODERATE</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>MRI Unit 1 is backlogged. Transitioning non-urgent scans to tomorrow's schedule.</p>
                        </div>
                    </div>
                </div>

                {/* Delay Trends */}
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--space-md)' }}>Average Stage Delay (24h Trend)</h4>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={flowData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                                <Bar dataKey="avgDelay" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', marginTop: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'var(--primary)' }} /> Actual Delay
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'var(--surface-border)' }} /> Target Goal (15m)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientFlow;
