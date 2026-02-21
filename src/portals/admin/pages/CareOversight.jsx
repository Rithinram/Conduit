import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, LayoutPanelLeft, Activity, ShieldAlert, CheckCircle2, MoreVertical, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const careFlowData = [
    { stage: 'ER', count: 120, trend: 15 },
    { stage: 'OPD', count: 450, trend: -5 },
    { stage: 'Labs', count: 280, trend: 8 },
    { stage: 'Tele', count: 180, trend: 25 },
    { stage: 'Inpatient', count: 95, trend: 2 },
];

const CareOversight = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Search & Filter */}
            <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flex: 1, maxWidth: '500px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by Patient ID, Condition, or Facility..."
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', background: 'white' }}
                        />
                    </div>
                    <button className="btn glass"><Filter size={18} /> Filters</button>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn glass">EXPORT REPORT</button>
                    <button className="btn btn-primary">SYNC GLOBAL DATA</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Care Level Trends */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Active Patients by Care Level</h3>
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

                {/* Care Gaps & Redundancies */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Efficiency Detection</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>High-priority care gaps and redundant visit patterns.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Unnecessary ER Arrivals</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>18% <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>↑ SPIKE</span></div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low-urgency cases at Central General could be tele-consulted.</p>
                        </div>

                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Repeated Lab Tests</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>12 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conflicts Found</span></div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Potential savings: 4.5 hours of lab capacity.</p>
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>AUTO-REDIRECT ELIGIBLE PATIENTS</button>
                </div>
            </div>

            <div className="card">
                <h4>Predictive Care Forecast</h4>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-md)' }}>
                    {[
                        { label: 'OPD Influx (24h)', value: '+12%', color: 'var(--danger)' },
                        { label: 'Telehealth Adoption', value: '+28%', color: 'var(--success)' },
                        { label: 'Avg. Bed Turnaround', value: '-15m', color: 'var(--success)' },
                        { label: 'Staff Fatigue Risk', value: 'Moderate', color: 'var(--warning)' },
                    ].map((stat, i) => (
                        <div key={i} style={{ flex: 1, padding: 'var(--space-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label.toUpperCase()}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stat.color, marginTop: '4px' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareOversight;
