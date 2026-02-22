import React, { useState, useEffect } from 'react';
import { Settings, Shield, Zap, Globe, Save, History, Play, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSystemState, updatePolicy, simulatePolicy } from '../../../services/api';

const PolicyManagement = () => {
    const [activeTab, setActiveTab] = useState('triage');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [policyState, setPolicyState] = useState({
        urgencyFilterLevel: 1,
        autoRedirectEligibility: {
            feverCough: true,
            medicationRefill: true,
            stablePostOp: false
        },
        nudgeIntensity: 'Balanced'
    });
    const [isDraftMode, setIsDraftMode] = useState(true);
    const [simulationResult, setSimulationResult] = useState(null);
    const [saveStatus, setSaveStatus] = useState(null);

    useEffect(() => {
        const fetchState = async () => {
            setIsLoading(true);
            const state = await getSystemState();
            if (state) {
                setPolicyState({
                    urgencyFilterLevel: state.urgencyFilterLevel || 1,
                    autoRedirectEligibility: state.autoRedirectEligibility || {
                        feverCough: true,
                        medicationRefill: true,
                        stablePostOp: false
                    },
                    nudgeIntensity: state.nudgeIntensity || 'Balanced'
                });
            }
            setIsLoading(false);
        };
        fetchState();
    }, []);

    const handleSimulate = async () => {
        setIsSimulating(true);
        const result = await simulatePolicy(policyState);
        setSimulationResult(result);
        setIsSimulating(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Step 1: Push to DB
        const result = await updatePolicy(policyState);

        // Step 2: Show "Propagating" state for UX
        setTimeout(() => {
            if (result.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
            }
            setIsSaving(false);
        }, 1500);
    };

    const toggleEligibility = (key) => {
        setPolicyState(prev => ({
            ...prev,
            autoRedirectEligibility: {
                ...prev.autoRedirectEligibility,
                [key]: !prev.autoRedirectEligibility[key]
            }
        }));
    };

    if (isLoading) return (
        <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <RefreshCw size={40} color="var(--primary)" />
            </motion.div>
            <div style={{ fontWeight: 800, color: 'var(--text-muted)' }}>SYNCING NETWORK POLICIES...</div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-lg)' }}>
                {/* Policy Navigation */}
                <div className="card" style={{ padding: 'var(--space-md)', background: '#f8fafc', border: '1px solid var(--surface-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-lg)', paddingLeft: 'var(--space-md)' }}>
                        <Settings size={20} color="var(--primary)" />
                        <h4 style={{ margin: 0 }}>Policy Categories</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {[
                            { id: 'triage', label: 'Triage Sensitivity', icon: Shield, color: '#6366f1' },
                            { id: 'tele', label: 'Teleconsult Eligibility', icon: Zap, color: '#f59e0b' },
                            { id: 'surge', label: 'Surge Thresholds', icon: Globe, color: '#10b981' },
                            { id: 'defer', label: 'Deferral Policies', icon: History, color: '#ef4444' },
                        ].map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ x: 5 }}
                                onClick={() => setActiveTab(tab.id)}
                                className="btn"
                                style={{
                                    justifyContent: 'flex-start',
                                    gap: 'var(--space-md)',
                                    background: activeTab === tab.id ? 'white' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                                    border: activeTab === tab.id ? '1px solid var(--surface-border)' : '1px solid transparent',
                                    boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                                    padding: '12px 16px',
                                    fontWeight: activeTab === tab.id ? 800 : 500
                                }}
                            >
                                <tab.icon size={18} color={activeTab === tab.id ? tab.color : 'var(--text-muted)'} /> {tab.label.toUpperCase()}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Rule Editor */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Policy Editor: {activeTab.toUpperCase()}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDraftMode ? '#f59e0b' : '#10b981' }} className={isDraftMode ? 'pulse-alert' : ''} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{isDraftMode ? 'STAGING DRAFT' : 'LIVE NETWORK'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                            <div style={{ display: 'flex', background: 'var(--background)', padding: '4px', borderRadius: '10px', marginRight: 'var(--space-md)' }}>
                                <button
                                    onClick={() => setIsDraftMode(true)}
                                    style={{
                                        padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, border: 'none',
                                        background: isDraftMode ? 'white' : 'transparent', boxShadow: isDraftMode ? 'var(--shadow-sm)' : 'none',
                                        color: isDraftMode ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer'
                                    }}
                                >DRAFT</button>
                                <button
                                    onClick={() => setIsDraftMode(false)}
                                    style={{
                                        padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, border: 'none',
                                        background: !isDraftMode ? 'white' : 'transparent', boxShadow: !isDraftMode ? 'var(--shadow-sm)' : 'none',
                                        color: !isDraftMode ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer'
                                    }}
                                >LIVE</button>
                            </div>
                            <button
                                className="btn glass"
                                onClick={handleSimulate}
                                disabled={isSimulating}
                                style={{ border: '1px solid var(--surface-border)', fontWeight: 700 }}
                            >
                                <Play size={16} /> {isSimulating ? 'SIMULATING...' : 'SIMULATE'}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={isSaving || isDraftMode}
                                style={{
                                    transform: isSaving ? 'scale(0.98)' : 'none',
                                    fontWeight: 800,
                                    opacity: isDraftMode ? 0.5 : 1
                                }}
                            >
                                {isSaving ? 'PROPAGATING...' : 'PUSH TO NETWORK'} <Save size={16} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                        <div className="card glass" style={{ border: 'none', background: 'var(--background)', padding: 'var(--space-xl)' }}>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', color: 'var(--primary-dark)' }}>Universal Urgency Filter Level</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                                    Sets the minimum urgency score required for ER intake during high-load periods. Currently: <strong>Level {policyState.urgencyFilterLevel}</strong>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={policyState.urgencyFilterLevel}
                                    onChange={(e) => setPolicyState({ ...policyState, urgencyFilterLevel: parseInt(e.target.value) })}
                                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', fontWeight: 900 }}>
                                    <span style={{ color: 'var(--success)' }}>RELAXED (LEVEL 1)</span>
                                    <span style={{ color: 'var(--danger)' }}>STRICT (LEVEL 5)</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', color: 'var(--primary-dark)' }}>Auto-Redirect Eligibility</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={policyState.autoRedirectEligibility.feverCough}
                                                onChange={() => toggleEligibility('feverCough')}
                                            /> Fever/Cough &lt; 2 Days
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={policyState.autoRedirectEligibility.medicationRefill}
                                                onChange={() => toggleEligibility('medicationRefill')}
                                            /> Routine Medication Refills
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={policyState.autoRedirectEligibility.stablePostOp}
                                                onChange={() => toggleEligibility('stablePostOp')}
                                            /> Post-Op Follow-up (Stable)
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 'var(--space-sm)', color: 'var(--primary-dark)' }}>Nudge Intensity</div>
                                    <select
                                        className="btn glass"
                                        value={policyState.nudgeIntensity}
                                        onChange={(e) => setPolicyState({ ...policyState, nudgeIntensity: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid var(--surface-border)' }}
                                    >
                                        <option value="Informative">Informative (Informational Only)</option>
                                        <option value="Balanced">Balanced (Subtle Rewards)</option>
                                        <option value="Aggressive">Aggressive (Mandatory Teleconsult)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {saveStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="card"
                                    style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}
                                >
                                    <Shield size={20} color="var(--success)" />
                                    <span style={{ color: 'var(--success-dark)', fontWeight: 700, fontSize: '0.85rem' }}>POLICY PROPAGATED: All regional nodes updated and laws enforced.</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <AlertCircle size={24} color="var(--warning)" />
                                <div>
                                    <h4 style={{ margin: 0, color: '#92400e' }}>Strategic Impact Analysis</h4>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
                                        {simulationResult ? (
                                            <>Based on last {simulationResult.sampleSize} patients, this policy would redirect <strong>{simulationResult.redirectedCount}</strong> cases to clinics and <strong>{simulationResult.teleconsultCount}</strong> to teleconsults. Potential load reduction: <strong>{simulationResult.potentialImpact}%</strong>.</>
                                        ) : (
                                            <>Run "Simulate Impact" to calculate how these filters would have influenced the last 48 hours of regional patient traffic.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', border: 'none', color: 'white' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#818cf8', marginBottom: '16px', letterSpacing: '1px' }}>POLICY IMPACT HISTORY</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { date: 'FEB 21', action: 'Increased Triage to Level 3', impact: '-18% ER Wait' },
                            { date: 'FEB 19', action: 'Auto-Redirect Post-Op Follow-up', impact: '22% Clinic ROI' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5, width: '40px' }}>{item.date}</div>
                                <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600 }}>{item.action}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399' }}>{item.impact}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card glass" style={{ background: 'rgba(37, 99, 235, 0.05)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center', border: 'none' }}>
                    <Info size={24} color="var(--primary)" />
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Administrative Governance</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Policy changes require Level 3 authentication and are logged in the regional immutable audit vault.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyManagement;
