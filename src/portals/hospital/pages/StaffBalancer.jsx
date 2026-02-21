import React from 'react';
import { Users, UserX, UserCheck, PhoneCall, ArrowRight, Activity, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const StaffBalancer = () => {
    const flags = [
        { id: 'f1', name: 'Alice Johnson', reason: 'Mild Fever (2 days)', urgency: 15, match: 'Teleconsult' },
        { id: 'f2', name: 'Bob Smith', reason: 'Medication Refill', urgency: 5, match: 'Pharmacy Direct' },
        { id: 'f3', name: 'Charlie Davis', reason: 'Routine Follow-up', urgency: 22, match: 'Clinic Referral' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Avoidable Visit Filter */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Avoidable Visit Filter</h3>
                        <div className="badge badge-success">22% Potential Load Relief</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {flags.map((f, i) => (
                            <div key={f.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserX size={20} color="var(--danger)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{f.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.reason} • Urgency: {f.urgency}%</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>{f.match}</span>
                                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>CONVERT</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Staff Load Balancer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Live Staff Workload</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                            {[
                                { name: 'ER Nursing Team', load: 92, status: 'Overloaded' },
                                { name: 'OPD Clinical Team', load: 45, status: 'Stable' },
                                { name: 'Telemedicine Unit', load: 20, status: 'Idle' },
                            ].map((team, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 600 }}>{team.name}</span>
                                        <span style={{ color: team.load > 80 ? 'var(--danger)' : 'var(--text-muted)' }}>{team.load}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${team.load}%`, height: '100%', background: team.load > 80 ? 'var(--danger)' : 'var(--success)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--primary-light)', border: 'none' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <Zap size={24} color="var(--primary)" />
                            <div>
                                <h4 style={{ margin: 0, color: 'var(--primary)' }}>Auto-Balance Proposal</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--primary-dark)' }}>
                                    Redirecting identified avoidable visits to the Telemedicine Unit will reduce ER Nursing load by <strong>15%</strong>.
                                </p>
                                <button className="btn btn-primary" style={{ marginTop: 'var(--space-md)', width: '100%' }}>EXECUTE REBALANCING</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card glass" style={{ background: 'rgba(37, 99, 235, 0.05)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={20} color="var(--primary)" />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Behavioral Nudge Impact:</strong> Automated patient notifications regarding teleconsult benefits have reduced walk-in volume by 8% this morning.
                </p>
            </div>
        </div>
    );
};

export default StaffBalancer;
