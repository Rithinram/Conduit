import React, { useState } from 'react';
import { hospitals } from '../../../services/mockData';
import { FileSearch, AlertTriangle, CheckCircle2, XCircle, Info, Calendar, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const recentTests = [
    { id: 1, type: 'Complete Blood Count (CBC)', date: '2026-02-18', facility: 'Saints Memorial', status: 'Valid', duplicates: [] },
    { id: 2, type: 'MRI - Lumbar Spine', date: '2026-02-10', facility: 'Central General', status: 'Active', duplicates: ['MRI - Spine'] },
    { id: 3, type: 'X-Ray - Chest', date: '2025-11-20', facility: 'City Care', status: 'Expired', duplicates: [] },
];

const TestDuplication = () => {
    const [selectedTests, setSelectedTests] = useState([]);
    const [showWarning, setShowWarning] = useState(false);

    const pendingTests = [
        { id: 'p1', type: 'CBC', urgency: 'routine' },
        { id: 'p2', type: 'MRI - Spine', urgency: 'scheduled' },
        { id: 'p3', type: 'Vitamin D', urgency: 'routine' },
    ];

    const toggleTest = (id) => {
        setSelectedTests(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
        if (id === 'p1' || id === 'p2') setShowWarning(true);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
            {/* Test History & Redundancy Check */}
            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Electronic Health Record Link</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    We've detected recent diagnostic procedures in your history across the medical network.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                    {recentTests.map((test) => (
                        <div key={test.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <div style={{ background: 'var(--primary-light)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                                    <Microscope size={20} color="var(--primary)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{test.type}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.facility} • {test.date}</div>
                                </div>
                            </div>
                            <span className={`badge badge-${test.status === 'Expired' ? 'danger' : 'success'}`}>
                                {test.status}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="card" style={{ marginTop: 'var(--space-xl)', background: 'var(--background)', border: '1px dashed var(--primary)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <FileSearch size={24} color="var(--primary)" />
                        <div>
                            <h4 style={{ margin: 0 }}>Auto-Sharing Active</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Your prior results are automatically visible to the triage doctor to prevent needle-pokes and unnecessary imaging.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Test Selection */}
            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>New Test Review</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Select the tests requested by your practitioner for redundancy verification.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
                    {pendingTests.map((test) => (
                        <div
                            key={test.id}
                            onClick={() => toggleTest(test.id)}
                            style={{
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                border: `2px solid ${selectedTests.includes(test.id) ? 'var(--primary)' : 'var(--surface-border)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: selectedTests.includes(test.id) ? 'var(--primary-light)' : 'transparent'
                            }}
                        >
                            <div style={{ fontWeight: 600 }}>{test.type}</div>
                            {selectedTests.includes(test.id) ? <CheckCircle2 size={18} color="var(--primary)" /> : <div style={{ width: 18, height: 18, border: '2px solid var(--surface-border)', borderRadius: '50%' }} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {showWarning && selectedTests.length > 0 && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ marginTop: 'var(--space-xl)' }}
                        >
                            <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)', padding: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                    <AlertTriangle size={24} color="var(--warning)" />
                                    <div>
                                        <h4 style={{ margin: 0, color: '#92400e' }}>Redundancy Detected</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#92400e' }}>
                                            A <strong>CBC</strong> and <strong>MRI</strong> were performed within the last 10 days. Using prior results can save you $450 and 3 hours of clinic time.
                                        </p>
                                        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                                            <button className="btn btn-primary" style={{ fontSize: '0.75rem' }}>USE PRIOR RESULTS</button>
                                            <button className="btn glass" style={{ fontSize: '0.75rem', background: 'white' }}>DISREGARD</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TestDuplication;
