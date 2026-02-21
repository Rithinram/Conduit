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
                <div className="card" style={{ padding: 'var(--space-md)' }}>
                    <h4 style={{ margin: '0 0 var(--space-lg) var(--space-md)' }}>Policy Categories</h4>
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
                                    padding: '12px 16px',
                                    fontWeight: activeTab === tab.id ? 700 : 500
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
                            <button
                                className="btn glass"
                                onClick={handleSimulate}
                                disabled={isSimulating}
                            >
                                <Play size={16} /> {isSimulating ? 'SIMULATING...' : 'SIMULATE IMPACT'}
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{ transform: isSaving ? 'scale(0.98)' : 'none' }}
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

            <div className="card glass" style={{ background: 'rgba(37, 99, 235, 0.05)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={20} color="var(--primary)" />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
                    <strong>Administrative Governance:</strong> Policy changes require Level 3 authentication and are logged in the regional immutable audit vault.
                </p>
            </div>
        </div>
    );
};

export default PolicyManagement;
