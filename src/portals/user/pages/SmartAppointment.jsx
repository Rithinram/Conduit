import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Clock, AlertCircle, CheckCircle2, Home, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const hourlyPredictions = [
    { time: '09:00', load: 85 },
    { time: '10:00', load: 92 },
    { time: '11:00', load: 78 },
    { time: '12:00', load: 60 },
    { time: '13:00', load: 45 },
    { time: '14:00', load: 42 },
    { time: '15:00', load: 55 },
    { time: '16:00', load: 70 },
    { time: '17:00', load: 88 },
];

const SmartAppointment = () => {
    const [symptoms, setSymptoms] = useState('');
    const [urgencyScore, setUrgencyScore] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    const analyzeSymptoms = () => {
        // Simulated NLP/Logic analysis
        const score = Math.floor(Math.random() * 100);
        setUrgencyScore(score);
        if (score < 30) {
            setRecommendation({
                type: 'HOME_CARE',
                title: 'Home Care Recommended',
                desc: 'Symptoms suggest low-urgency. We recommend rest and tele-consultation.',
                icon: Home,
                color: 'var(--success)'
            });
        } else if (score < 70) {
            setRecommendation({
                type: 'CLINIC',
                title: 'Community Clinic Visit',
                desc: 'Please visit a local clinic for a professional check-up within 24 hours.',
                icon: Activity,
                color: 'var(--warning)'
            });
        } else {
            setRecommendation({
                type: 'HOSPITAL',
                title: 'Hospital Visit Necessary',
                desc: 'Your symptoms require ER attention. We have pre-notified Central Hospital.',
                icon: AlertCircle,
                color: 'var(--danger)'
            });
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
            {/* Symptom Analyzer */}
            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>Avoidable Visit Analyzer</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Describe your symptoms to receive an AI-driven urgency score and care recommendation.
                </p>
                <textarea
                    placeholder="Describe how you feel (e.g. 'I have a mild fever and cough for two days...')"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    style={{
                        width: '100%',
                        height: '120px',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--surface-border)',
                        background: 'var(--background)',
                        fontFamily: 'inherit',
                        resize: 'none',
                        marginTop: 'var(--space-md)'
                    }}
                />
                <button
                    onClick={analyzeSymptoms}
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--space-md)', width: '100%' }}
                    disabled={!symptoms}
                >
                    ANALYZE URGENCY
                </button>

                <AnimatePresence>
                    {recommendation && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            style={{ marginTop: 'var(--space-lg)', overflow: 'hidden' }}
                        >
                            <div style={{ background: 'var(--background)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${recommendation.color}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                                    <recommendation.icon color={recommendation.color} size={24} />
                                    <h4 style={{ margin: 0 }}>{recommendation.title}</h4>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{recommendation.desc}</p>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                                    <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>Urgency: {urgencyScore}%</span>
                                    <span className="badge badge-success">Confidence: 94%</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Appointment Scheduler */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Smart Scheduler</h3>
                    <div className="badge badge-success">Optimized Load</div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Best times to visit based on predicted hospital capacity and wait times.
                </p>

                <div style={{ height: '180px', margin: 'var(--space-md) 0' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlyPredictions}>
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="load" stroke="var(--primary)" fill="var(--primary-light)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {[
                        { time: '13:00 - 14:00', load: 'Low', wait: '10 min', recommended: true },
                        { time: '14:00 - 15:00', load: 'Low', wait: '12 min', recommended: true },
                        { time: '15:00 - 16:00', load: 'Moderate', wait: '25 min', recommended: false },
                    ].map((slot, i) => (
                        <div
                            key={i}
                            className="glass"
                            style={{
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: slot.recommended ? '1px solid var(--success)' : '1px solid var(--surface-border)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Clock size={16} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{slot.time}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Load: {slot.load} • Wait: {slot.wait}</div>
                                </div>
                            </div>
                            <button className={slot.recommended ? "btn btn-primary" : "btn glass"}>
                                BOOK
                            </button>
                        </div>
                    ))}
                </div>

                <div className="card glass" style={{ border: 'none', background: 'rgba(16, 185, 129, 0.05)', fontSize: '0.8rem' }}>
                    <CheckCircle2 size={14} color="var(--success)" style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    Scheduling during "Low Load" periods earns <strong>CareCredits</strong> and reduces your wait time by 60%.
                </div>
            </div>
        </div>
    );
};

export default SmartAppointment;
