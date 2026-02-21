import React from 'react';
import { ShieldAlert, Zap, Users, BarChart, AlertTriangle, ArrowRight, CornerUpRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const SurgeManagement = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Surge Activation Card */}
            <div className="card" style={{ background: 'var(--danger)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-xl)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <ShieldAlert size={48} />
                    <div>
                        <h2 style={{ margin: 0 }}>SURGE MODE: INACTIVE</h2>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Current load: 88%. Surge threshold: 92%.</p>
                    </div>
                </div>
                <button className="btn glass" style={{ color: 'white', border: '2px solid white', padding: '1rem 2rem', fontWeight: 700 }}>ACTIVATE SURGE PROTOCOL</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Surge Cause Analysis */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Incoming Surge Forecast</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div className="card glass" style={{ background: 'var(--background)', padding: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                                <span style={{ fontWeight: 600 }}>Predicted Influx (Next 2h)</span>
                                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>+24 Patients</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--surface-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '85%', height: '100%', background: 'var(--danger)' }} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div className="card" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>REROUTE CAPACITY</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>12/h</div>
                            </div>
                            <div className="card" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: 'none' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>VOLUNTARY CANCELLATIONS</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>15%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Emergency Expansion</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deploy temporary resources and tighten triage protocols.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <button className="btn glass" style={{ justifyContent: 'space-between', border: '1px solid var(--surface-border)' }}>
                            <span>Strict Triage (Urgency Only)</span>
                            <CornerUpRight size={16} />
                        </button>
                        <button className="btn glass" style={{ justifyContent: 'space-between', border: '1px solid var(--surface-border)' }}>
                            <span>Convert Day-Ward to ER-B</span>
                            <CornerUpRight size={16} />
                        </button>
                        <button className="btn glass" style={{ justifyContent: 'space-between', border: '1px solid var(--surface-border)' }}>
                            <span>Lock ICU (Critical Only)</span>
                            <CornerUpRight size={16} />
                        </button>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                            <Zap size={18} color="var(--warning)" />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Network Support</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                            Requesting patient redistribution to 2 nearest facilities with available capacity.
                        </p>
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)' }}>INITIATE CROSS-HOSPITAL TRANSFER</button>
                    </div>
                </div>
            </div>

            <div className="card glass" style={{ border: '2px dashed var(--danger)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={24} color="var(--danger)" />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Behavioral Strategy Impact:</strong> Highlighting surge status to users has led to a 12% decrease in non-critical ER arrivals this morning.
                </p>
            </div>
        </div>
    );
};

export default SurgeManagement;
