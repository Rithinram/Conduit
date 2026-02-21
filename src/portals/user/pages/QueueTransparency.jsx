import React, { useState, useEffect } from 'react';
import { ListOrdered, Clock, User, Bell, ChevronRight, CheckCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const QueueTransparency = () => {
    const [position, setPosition] = useState(4);
    const [timeLeft, setTimeLeft] = useState(24);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 60000); // Decr every min
        return () => clearInterval(timer);
    }, []);

    const queueData = [
        { id: 1, status: 'completed', label: 'Triage' },
        { id: 2, status: 'active', label: 'Lab Tests' },
        { id: 3, status: 'pending', label: 'Consultation' },
        { id: 4, status: 'pending', label: 'Discharge' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Live Status Header */}
            <div className="card glass" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600 }}>CURRENT POSITION</div>
                        <div style={{ fontSize: '3rem', fontWeight: 800 }}>#{position} <span style={{ fontSize: '1rem', fontWeight: 400 }}>in queue</span></div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600 }}>EST. WAIT TIME</div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>~{timeLeft} min</div>
                    </div>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginTop: 'var(--space-xl)', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '65%' }}
                        style={{ height: '100%', background: 'white' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Progress Pipeline */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Treatment Pipeline</h3>
                    <div style={{ position: 'relative' }}>
                        {queueData.map((step, i) => (
                            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', position: 'relative' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: step.status === 'completed' ? 'var(--success)' : step.status === 'active' ? 'var(--primary)' : 'var(--background)',
                                    color: step.status === 'pending' ? 'var(--text-muted)' : 'white',
                                    border: `2px solid ${step.status === 'pending' ? 'var(--surface-border)' : 'transparent'}`,
                                    zIndex: 2
                                }}>
                                    {step.status === 'completed' ? <CheckCircle size={20} /> : i + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>{step.label}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {step.status === 'completed' ? 'Finished at 10:45 AM' : step.status === 'active' ? 'Expected duration: 15 mins' : 'Awaiting clinical availability'}
                                    </div>
                                </div>
                                {i < queueData.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '20px',
                                        top: '40px',
                                        width: '2px',
                                        height: '24px',
                                        background: step.status === 'completed' ? 'var(--success)' : 'var(--surface-border)',
                                        zIndex: 1
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Doctor Load & Alerts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Attending Physician</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={24} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>Dr. Sarah Jenkins</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Internal Medicine • ER Unit B</div>
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-sm)', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Doctor Load</span>
                                <span>Moderate</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--surface-border)', borderRadius: '2px', marginTop: '4px' }}>
                                <div style={{ width: '65%', height: '100%', background: 'var(--warning)', borderRadius: '2px' }} />
                            </div>
                        </div>
                    </div>

                    <div className="card glass" style={{ border: '2px dashed var(--primary)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <Bell size={24} color="var(--primary)" />
                            <div>
                                <h4 style={{ margin: 0 }}>Smart Notifications</h4>
                                <p style={{ margin: '4px 0 var(--space-md) 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    We'll notify you 5 minutes before your consultation begins.
                                </p>
                                <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>NOTIFY ME</button>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--success-bg)', border: 'none' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <Activity size={24} color="var(--success)" />
                            <div>
                                <h4 style={{ margin: 0, color: 'var(--success)' }}>Wait Relief</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#065f46' }}>
                                    You qualify for the <strong>FastTrack</strong> program because you submitted your medical history through the portal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueueTransparency;
