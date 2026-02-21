import React, { useState } from 'react';
import { Settings, Shield, Zap, Globe, Save, History, Play, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const PolicyManagement = () => {
    const [activeTab, setActiveTab] = useState('triage');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-lg)' }}>
                {/* Policy Navigation */}
                <div className="card" style={{ padding: 'var(--space-md)' }}>
                    <h4 style={{ margin: '0 0 var(--space-lg) var(--space-md)' }}>Policy categories</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {[
                            { id: 'triage', label: 'Triage Sensitivity', icon: Shield },
                            { id: 'tele', label: 'Teleconsult Eligibility', icon: Zap },
                            { id: 'surge', label: 'Surge Thresholds', icon: Globe },
                            { id: 'defer', label: 'Deferral Policies', icon: History },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="btn"
                                style={{
                                    justifyContent: 'flex-start',
                                    gap: 'var(--space-md)',
                                    background: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-main)',
                                    border: 'none',
                                    padding: '12px 16px'
                                }}
                            >
                                <tab.icon size={18} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rule Editor */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ margin: 0 }}>Policy Editor: {activeTab.toUpperCase()}</h3>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <button className="btn glass"><Play size={16} /> SIMULATE IMPACT</button>
                            <button className="btn btn-primary"><Save size={16} /> PUSH TO NETWORK</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                        <div className="card glass" style={{ border: 'none', background: 'var(--background)', padding: 'var(--space-xl)' }}>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Universal Urgency Filter Level</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                                    Sets the minimum urgency score required for ER intake during high-load periods.
                                </div>
                                <input type="range" style={{ width: '100%', accentColor: 'var(--primary)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>
                                    <span>RELAXED (LEVEL 1)</span>
                                    <span>STRICT (LEVEL 5)</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Auto-Redirect Eligibility</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <input type="checkbox" defaultChecked /> Fever/Cough &lt; 2 Days
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <input type="checkbox" defaultChecked /> Routine Medication Refills
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                            <input type="checkbox" /> Post-Op Follow-up (Stable)
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Nudge Intensity</div>
                                    <select className="btn glass" style={{ width: '100%', padding: '0.75rem' }}>
                                        <option>Informative (Informational Only)</option>
                                        <option>Balanced (Subtle Rewards)</option>
                                        <option selected>Aggressive (Mandatory Teleconsult)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <AlertCircle size={24} color="var(--warning)" />
                                <div>
                                    <h4 style={{ margin: 0, color: '#92400e' }}>Simulation Result</h4>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#92400e' }}>
                                        Pushing this policy will likely redirect 15% of current ER arrivals to tele-consults, freeing approximately 4 hours of clinical team time per shift.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card glass" style={{ background: 'rgba(37, 99, 235, 0.05)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={20} color="var(--primary)" />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Policy Note:</strong> All changes are logged and reversible. Predictive coordination requires at least 48h of data before full automation.
                </p>
            </div>
        </div>
    );
};

export default PolicyManagement;
