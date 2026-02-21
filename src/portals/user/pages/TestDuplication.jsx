import React, { useState, useCallback } from 'react';
import { FileSearch, AlertTriangle, CheckCircle2, XCircle, Info, Microscope, Trash2, ShieldCheck, FlaskConical, Stethoscope, ClipboardList, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock EHR History ---
const recentTests = [
    { id: 1, type: 'Complete Blood Count (CBC)', date: '2026-02-18', facility: 'Saints Memorial', status: 'Valid' },
    { id: 2, type: 'MRI - Lumbar Spine', date: '2026-02-10', facility: 'Central General', status: 'Active' },
    { id: 3, type: 'X-Ray - Chest', date: '2025-11-20', facility: 'City Care', status: 'Expired' },
    { id: 4, type: 'Lipid Panel', date: '2026-01-28', facility: 'Saints Memorial', status: 'Valid' },
    { id: 5, type: 'HbA1c (Diabetes)', date: '2026-02-05', facility: 'Metro Diagnostics', status: 'Active' },
];

// --- Expanded Pending Tests ---
const initialPendingTests = [
    { id: 'p1', type: 'CBC', urgency: 'routine' },
    { id: 'p2', type: 'MRI - Spine', urgency: 'scheduled' },
    { id: 'p3', type: 'Vitamin D', urgency: 'routine' },
    { id: 'p4', type: 'Lipid Panel', urgency: 'routine' },
    { id: 'p5', type: 'Thyroid Function (TSH)', urgency: 'scheduled' },
    { id: 'p6', type: 'HbA1c', urgency: 'routine' },
    { id: 'p7', type: 'Liver Function Test (LFT)', urgency: 'urgent' },
    { id: 'p8', type: 'Urine Analysis', urgency: 'routine' },
    { id: 'p9', type: 'ECG - 12 Lead', urgency: 'scheduled' },
    { id: 'p10', type: 'Serum Creatinine', urgency: 'routine' },
];

// Random ML-style results
const mlResults = [
    { verdict: 'Redundancy Detected', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', icon: AlertTriangle, desc: 'A similar test was performed recently. Using prior results can save time and cost.' },
    { verdict: 'Test Needed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)', icon: CheckCircle2, desc: 'No prior results found. This test is recommended for accurate diagnosis.' },
    { verdict: 'Partial Match Found', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.25)', icon: FlaskConical, desc: 'A related test exists but covers only partial markers. Re-testing advised.' },
    { verdict: 'Review Recommended', color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.25)', icon: Stethoscope, desc: 'Prior results are close to expiry. Clinician review is suggested.' },
];

const getRandomResult = () => mlResults[Math.floor(Math.random() * mlResults.length)];

const getStatusStyle = (status) => {
    if (status === 'Valid') return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
    if (status === 'Active') return { bg: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' };
    return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
};

const getUrgencyDot = (urgency) => {
    if (urgency === 'urgent') return '#ef4444';
    if (urgency === 'scheduled') return '#6366f1';
    return '#94a3b8';
};

const TestDuplication = () => {
    const [pendingTests, setPendingTests] = useState(initialPendingTests);
    const [selectedTests, setSelectedTests] = useState([]);
    // Store ML result per test id so it stays consistent after selection
    const [testResults, setTestResults] = useState({});
    const [showSummary, setShowSummary] = useState(false);

    const toggleTest = useCallback((id) => {
        setSelectedTests(prev => {
            const already = prev.includes(id);
            if (already) {
                return prev.filter(t => t !== id);
            }
            // Generate an ML result for this test if not already generated
            if (!testResults[id]) {
                setTestResults(r => ({ ...r, [id]: getRandomResult() }));
            }
            return [...prev, id];
        });
    }, [testResults]);

    const handleDisregard = useCallback((id) => {
        // Remove the test entirely
        setPendingTests(prev => prev.filter(t => t.id !== id));
        setSelectedTests(prev => prev.filter(t => t !== id));
        setTestResults(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    }, []);

    const handleUsePrior = useCallback((id) => {
        // Move from pending to "resolved" — just deselect
        setSelectedTests(prev => prev.filter(t => t !== id));
        setTestResults(prev => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    }, []);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
            {/* Left Column: EHR History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>Electronic Health Record Link</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        We've detected recent diagnostic procedures in your history across the medical network.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                        {recentTests.map((test) => {
                            const s = getStatusStyle(test.status);
                            return (
                                <div key={test.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Microscope size={18} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{test.type}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.facility} • {test.date}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: s.bg,
                                        color: s.color,
                                        border: s.border,
                                        letterSpacing: '0.5px'
                                    }}>
                                        {test.status.toUpperCase()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="card" style={{ marginTop: 'var(--space-xl)', background: 'var(--background)', border: '1px dashed var(--primary)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                            <FileSearch size={22} color="var(--primary)" />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Auto-Sharing Active</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Your prior results are automatically visible to the triage doctor to prevent needle-pokes and unnecessary imaging.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Test Selection & ML Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-md)' }}>New Test Review</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Select the tests requested by your practitioner for redundancy verification.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-lg)', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                        <AnimatePresence>
                            {pendingTests.map((test) => {
                                const isSelected = selectedTests.includes(test.id);
                                return (
                                    <motion.div
                                        key={test.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0, padding: 0 }}
                                        transition={{ duration: 0.25 }}
                                        onClick={() => toggleTest(test.id)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--surface-border)'}`,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: isSelected ? 'var(--primary-light)' : 'transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getUrgencyDot(test.urgency), flexShrink: 0 }} />
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{test.type}</div>
                                        </div>
                                        {isSelected
                                            ? <CheckCircle2 size={18} color="var(--primary)" />
                                            : <div style={{ width: 18, height: 18, border: '2px solid #d1d5db', borderRadius: '50%' }} />
                                        }
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {pendingTests.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-muted)' }}>
                            <ShieldCheck size={36} color="var(--success)" style={{ marginBottom: '8px' }} />
                            <div style={{ fontWeight: 700 }}>All Tests Cleared</div>
                            <div style={{ fontSize: '0.8rem' }}>No pending tests remaining for review.</div>
                        </div>
                    )}
                </div>

                {/* ML Results per selected test */}
                <AnimatePresence>
                    {selectedTests.map(id => {
                        const test = pendingTests.find(t => t.id === id) || initialPendingTests.find(t => t.id === id);
                        const result = testResults[id];
                        if (!test || !result) return null;
                        const IconComp = result.icon;
                        return (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="card"
                                style={{ background: result.bg, border: `1px solid ${result.border}`, padding: 'var(--space-md)' }}
                            >
                                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                        <IconComp size={22} color={result.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, color: result.color, fontSize: '0.95rem' }}>
                                                {result.verdict} — {test.type}
                                            </h4>
                                        </div>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.5 }}>
                                            {result.desc}
                                        </p>
                                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUsePrior(id); }}
                                                className="btn btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '8px', fontWeight: 700 }}
                                            >
                                                USE PRIOR RESULTS
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDisregard(id); }}
                                                className="btn glass"
                                                style={{ fontSize: '0.75rem', padding: '8px 16px', background: 'white', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}
                                            >
                                                <Trash2 size={13} /> DISREGARD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Finalize Button */}
                {pendingTests.length > 0 && (
                    <button
                        onClick={() => setShowSummary(true)}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '14px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <ClipboardList size={18} /> FINALIZE REVIEW
                    </button>
                )}
            </div>

            {/* Summary Popup */}
            <AnimatePresence>
                {showSummary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 'var(--space-lg)'
                        }}
                        onClick={() => setShowSummary(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: 'var(--space-xl)',
                                width: '100%',
                                maxWidth: '520px',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ClipboardList size={22} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Your Test Summary</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tests you need to take based on your review</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSummary(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                                >
                                    <X size={20} color="var(--text-muted)" />
                                </button>
                            </div>

                            {/* Test List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {pendingTests.map((test, i) => {
                                    const result = testResults[test.id];
                                    const urgencyLabel = test.urgency === 'urgent' ? 'URGENT' : test.urgency === 'scheduled' ? 'SCHEDULED' : 'ROUTINE';
                                    const urgencyColor = test.urgency === 'urgent' ? '#ef4444' : test.urgency === 'scheduled' ? '#6366f1' : '#64748b';
                                    return (
                                        <motion.div
                                            key={test.id}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.06 }}
                                            style={{
                                                padding: '14px 16px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--surface-border)',
                                                background: 'var(--background)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <CheckCircle2 size={15} color="#10b981" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{test.type}</div>
                                                    {result && (
                                                        <div style={{ fontSize: '0.7rem', color: result.color, fontWeight: 600, marginTop: '2px' }}>{result.verdict}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                background: `${urgencyColor}15`,
                                                color: urgencyColor,
                                                letterSpacing: '0.5px'
                                            }}>
                                                {urgencyLabel}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldCheck size={20} color="#10b981" />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46' }}>
                                            {pendingTests.length} test{pendingTests.length !== 1 ? 's' : ''} remaining
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                                            {initialPendingTests.length - pendingTests.length} test{(initialPendingTests.length - pendingTests.length) !== 1 ? 's' : ''} cleared via prior results or disregarded
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowSummary(false)}
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 'var(--space-md)', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}
                            >
                                OK, GOT IT
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestDuplication;
