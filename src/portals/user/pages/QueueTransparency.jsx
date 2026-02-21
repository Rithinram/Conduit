import React, { useState, useEffect, useCallback } from 'react';
import { ListOrdered, Clock, User, Bell, ChevronRight, CheckCircle, Activity, Pill, Stethoscope, FileText, Syringe, HeartPulse, ClipboardList, BellRing, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueNotification } from '../../../context/QueueNotificationContext';

const initialPipeline = [
    { id: 1, status: 'completed', label: 'Registration', detail: 'Completed at 10:12 AM', duration: null },
    { id: 2, status: 'completed', label: 'Triage Assessment', detail: 'Finished at 10:45 AM', duration: null },
    { id: 3, status: 'active', label: 'Lab Tests (CBC, LFT)', detail: 'In progress — Expected: 15 mins', duration: '15 mins' },
    { id: 4, status: 'pending', label: 'Consultation', detail: 'Dr. Sarah Jenkins — Internal Medicine', duration: '20 mins' },
    { id: 5, status: 'pending', label: 'Prescription & Discharge', detail: 'Medication review and discharge papers', duration: '10 mins' },
];

const stepIcons = {
    1: ClipboardList,
    2: HeartPulse,
    3: Syringe,
    4: Stethoscope,
    5: FileText,
};

const QueueTransparency = () => {
    const [position, setPosition] = useState(4);
    const [timeLeft, setTimeLeft] = useState(24);
    const [pipeline, setPipeline] = useState(initialPipeline);
    const { triggerNotification, notificationState } = useQueueNotification();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleNotifyMe = useCallback(() => {
        triggerNotification(() => {
            // Update all pipeline stages after notification
            setPipeline(prev => prev.map(step => {
                if (step.id <= 3) return { ...step, status: 'completed', detail: step.id === 3 ? 'Results ready — All normal' : step.detail };
                if (step.id === 4) return { ...step, status: 'active', detail: 'You\'re next! Dr. Jenkins is ready.' };
                if (step.id === 5) return { ...step, status: 'pending', detail: 'Will begin after consultation' };
                return step;
            }));
            setPosition(1);
            setTimeLeft(2);
        });
    }, [triggerNotification]);

    const completedCount = pipeline.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedCount / pipeline.length) * 100);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', position: 'relative' }}>


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
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8 }}
                        style={{ height: '100%', background: 'white', borderRadius: '4px' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', opacity: 0.7 }}>
                    <span>{completedCount} of {pipeline.length} steps completed</span>
                    <span>{progress}%</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Treatment Pipeline */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Treatment Pipeline</h3>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{pipeline.length} stages</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        {pipeline.map((step, i) => {
                            const IconComp = stepIcons[step.id] || CheckCircle;
                            return (
                                <motion.div
                                    key={step.id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', marginBottom: i < pipeline.length - 1 ? '4px' : 0, position: 'relative' }}
                                >
                                    {/* Connector line + Node */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                        <motion.div
                                            animate={step.status === 'active' ? { scale: [1, 1.15, 1] } : {}}
                                            transition={step.status === 'active' ? { repeat: Infinity, duration: 2 } : {}}
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: step.status === 'completed' ? '#10b981' : step.status === 'active' ? 'var(--primary)' : 'var(--background)',
                                                color: step.status === 'pending' ? 'var(--text-muted)' : 'white',
                                                border: step.status === 'pending' ? '2px solid var(--surface-border)' : '2px solid transparent',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                boxShadow: step.status === 'active' ? '0 0 0 4px rgba(59, 130, 246, 0.15)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {step.status === 'completed' ? <CheckCircle size={18} /> : <IconComp size={16} />}
                                        </motion.div>
                                        {i < pipeline.length - 1 && (
                                            <div style={{
                                                width: '2px',
                                                height: '28px',
                                                background: step.status === 'completed' ? '#10b981' : 'var(--surface-border)',
                                                transition: 'background 0.3s ease'
                                            }} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div style={{ paddingTop: '6px', flex: 1, minHeight: '58px' }}>
                                        <div style={{
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            {step.label}
                                            {step.status === 'active' && (
                                                <span style={{
                                                    fontSize: '0.6rem',
                                                    fontWeight: 700,
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    background: 'var(--primary-light)',
                                                    color: 'var(--primary)',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    IN PROGRESS
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {step.detail}
                                        </div>
                                        {step.duration && step.status !== 'completed' && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={11} /> Est. {step.duration}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Attending Physician */}
                    <div className="card">
                        <h4 style={{ margin: '0 0 var(--space-md) 0' }}>Attending Physician</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
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

                    {/* Notify Me */}
                    <div className="card glass" style={{ border: `2px dashed ${notificationState === 'notified' ? '#10b981' : 'var(--primary)'}`, transition: 'border-color 0.3s' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '2px', flexShrink: 0 }}>
                                {notificationState === 'notified' ? <BellRing size={22} color="#10b981" /> : <Bell size={22} color="var(--primary)" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0 }}>Smart Notifications</h4>
                                <p style={{ margin: '4px 0 var(--space-md) 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {notificationState === 'notified'
                                        ? '✅ You\'ve been notified — Dr. Jenkins is ready for you!'
                                        : notificationState === 'waiting'
                                            ? 'Preparing your notification...'
                                            : 'We\'ll notify you 5 minutes before your consultation begins.'
                                    }
                                </p>
                                <button
                                    onClick={handleNotifyMe}
                                    disabled={notificationState !== 'idle'}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        padding: '10px',
                                        borderRadius: '10px',
                                        background: notificationState === 'notified' ? '#10b981' : notificationState === 'waiting' ? '#94a3b8' : undefined,
                                        cursor: notificationState !== 'idle' ? 'default' : 'pointer',
                                        opacity: notificationState !== 'idle' ? 0.85 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {notificationState === 'notified' && <><CheckCircle size={15} /> NOTIFIED</>}
                                    {notificationState === 'waiting' && (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                                <Clock size={15} />
                                            </motion.div>
                                            WAITING...
                                        </>
                                    )}
                                    {notificationState === 'idle' && <><Bell size={15} /> NOTIFY ME</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Wait Relief */}
                    <div className="card" style={{ background: 'var(--success-bg)', border: 'none' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                            <Activity size={22} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <h4 style={{ margin: 0, color: 'var(--success)' }}>Wait Relief</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#065f46' }}>
                                    You qualify for the <strong>FastTrack</strong> program because you submitted your medical history through the portal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Queue Stats */}
                    <div className="card" style={{ background: 'var(--background)' }}>
                        <h4 style={{ margin: '0 0 var(--space-md) 0', fontSize: '0.9rem' }}>Queue Statistics</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            {[
                                { label: 'Avg Wait Today', value: '32 min', color: 'var(--warning)' },
                                { label: 'Patients Ahead', value: position - 1, color: 'var(--primary)' },
                                { label: 'ER Throughput', value: '8/hr', color: '#10b981' },
                                { label: 'Your Priority', value: 'Medium', color: '#6366f1' },
                            ].map((stat, i) => (
                                <div key={i} style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--surface-border)', background: 'white' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color, marginTop: '2px' }}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueueTransparency;
