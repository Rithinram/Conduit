import { ShieldAlert, Zap, Calendar, PhoneCall, ArrowRight, CornerUpRight, Info, AlertTriangle, Users, Activity, ExternalLink, ShieldCheck, Clock, CheckCircle2, X, Video, Star, Award, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurgeActions } from '../../../context/SurgeActionsContext';

// Mock data for Urgent Regional Surge
const mockMetrics = {
    cityStress: 87,
    icuCapacity: 23,
    erWaitAvg: 42,
    activeAmbulances: 14,
    pendingAdmissions: 31,
    divertedPatients: 8,
};

const surgeZones = [
    { zone: 'North District', status: 'critical', load: 94, color: '#ef4444' },
    { zone: 'South Metro', status: 'stable', load: 52, color: '#10b981' },
    { zone: 'East Corridor', status: 'elevated', load: 78, color: '#f59e0b' },
    { zone: 'West Central', status: 'critical', load: 91, color: '#ef4444' },
];

const availableDoctors = [
    { name: 'Dr. Priya Sharma', specialty: 'General Medicine', available: true, waitTime: '< 30s' },
    { name: 'Dr. Anil Kapoor', specialty: 'Internal Medicine', available: true, waitTime: '< 45s' },
    { name: 'Dr. Lisa Chen', specialty: 'Emergency Medicine', available: true, waitTime: '< 1 min' },
];

const SurgePage = () => {
    const navigate = useNavigate();
    const { addRescheduledAppointment } = useSurgeActions();
    const [showDeferralPopup, setShowDeferralPopup] = useState(false);
    const [showVideoClinic, setShowVideoClinic] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [videoBooked, setVideoBooked] = useState(false);
    const [deferralDone, setDeferralDone] = useState(false);
    const [callTime, setCallTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);

    const handleDeferral = () => {
        setShowDeferralPopup(true);
    };

    const confirmDeferral = () => {
        setDeferralDone(true);

        // Push rescheduled appointment to SmartAppointment page
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        const dateStr = tomorrow.toISOString().split('T')[0];
        addRescheduledAppointment({
            id: Date.now(),
            hospital: 'City Central General',
            doctor: 'Dr. Sarah Wilson',
            date: dateStr,
            time: '14:00',
            timestamp: new Date().toLocaleString(),
            type: 'rescheduled',
            reason: 'Surge Protocol Deferral — +850 CareCredit earned'
        });

        // Keep popup open for 2s then close
        setTimeout(() => setShowDeferralPopup(false), 2500);
    };

    const handleVideoClinic = () => {
        setShowVideoClinic(true);
    };

    const bookDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setVideoBooked(true);
        // After 1.5s, close the picker and open the video call
        setTimeout(() => {
            setShowVideoClinic(false);
            setShowVideoCall(true);
            setCallTime(0);
        }, 1500);
    };

    // Timer for the video call
    useEffect(() => {
        let interval;
        if (showVideoCall) {
            interval = setInterval(() => setCallTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [showVideoCall]);

    const endCall = () => {
        setShowVideoCall(false);
    };

    const formatCallTime = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const handleRedirection = () => {
        navigate('/user/emergency');
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

            {/* URGENT REGIONAL SURGE HEADER */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{
                    background: 'linear-gradient(135deg, #E63946 0%, #7f1d1d 100%)',
                    color: 'white',
                    padding: 'var(--space-xxl) var(--space-xl)',
                    borderRadius: 'var(--radius-xl)',
                    border: 'none',
                    boxShadow: '0 30px 60px rgba(230, 57, 70, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Animation */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1 }}
                >
                    <ShieldAlert size={500} />
                </motion.div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xxl)', position: 'relative', zIndex: 1 }}>
                    <div className="pulse-alert" style={{ background: 'rgba(255,255,255,0.15)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
                        <ShieldAlert size={64} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px' }}>
                                LEVEL 4 PROTOCOL
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4].map(i => <div key={i} style={{ width: 12, height: 4, background: 'white', borderRadius: 2 }} />)}
                            </div>
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>URGENT REGIONAL SURGE</h1>
                        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginTop: '12px', fontWeight: 500, maxWidth: '600px', margin: '12px 0 0 0' }}>
                            System load balancing active. Voluntary intake diversion is recommended to preserve critical ICU capacity.
                        </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, opacity: 0.7, letterSpacing: '2px' }}>NETWORK OCCUPANCY</div>
                        <div style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>{mockMetrics.cityStress}<span style={{ fontSize: '1.5rem', opacity: 0.6 }}>%</span></div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, marginTop: '10px' }}>
                            CRITICAL THRESHOLD
                        </div>
                    </div>
                </div>

                {/* Mock Data Metrics Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-md)', marginTop: 'var(--space-xl)', position: 'relative', zIndex: 1 }}>
                    {[
                        { label: 'ICU Capacity', value: `${mockMetrics.icuCapacity}%`, icon: Activity },
                        { label: 'Avg ER Wait', value: `${mockMetrics.erWaitAvg} min`, icon: Clock },
                        { label: 'Active Ambulances', value: mockMetrics.activeAmbulances, icon: CornerUpRight },
                        { label: 'Pending Admissions', value: mockMetrics.pendingAdmissions, icon: Users },
                    ].map((m, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '14px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <m.icon size={14} style={{ opacity: 0.7 }} />
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, letterSpacing: '0.5px' }}>{m.label.toUpperCase()}</span>
                            </div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{m.value}</div>
                        </div>
                    ))}
                </div>

                {/* Surge Zone Status */}
                <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)', position: 'relative', zIndex: 1 }}>
                    {surgeZones.map((z, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <motion.div
                                animate={{ opacity: z.status === 'critical' ? [1, 0.4, 1] : 1 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, boxShadow: `0 0 8px ${z.color}`, flexShrink: 0 }}
                            />
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.5px' }}>{z.zone.toUpperCase()}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{z.load}% load</div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Two-Column: Deferral + Video Clinic */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)', alignItems: 'stretch' }}>
                {/* Voluntary Deferral */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card glass"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        border: '1px solid var(--secondary-light)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ background: 'var(--secondary-light)', width: '56px', height: '56px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={28} color="var(--secondary)" />
                        </div>
                        <span className="badge badge-success">Recommended</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>Altruistic Intake Relief</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                        Help prioritize trauma cases. Deferring your non-urgent diagnostic visit generates immediate clinical capacity.
                    </p>
                    <div style={{ background: '#f0fdfa', padding: '16px', borderRadius: '16px', marginTop: 'auto', border: '1px solid #2ABCA740' }}>
                        <div style={{ color: '#134e4a', fontWeight: 900, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={18} color="#2ABCA7" /> +850 CARECREDIT REWARDS
                        </div>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#134e4a', opacity: 0.8 }}>
                            Redeemable for priority scheduling and health premiums across the entire network.
                        </p>
                    </div>
                    <button
                        onClick={handleDeferral}
                        disabled={deferralDone}
                        className="btn btn-secondary elevation-hover"
                        style={{
                            marginTop: 'var(--space-sm)',
                            borderRadius: '14px',
                            padding: '16px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: deferralDone ? 0.7 : 1,
                            background: deferralDone ? '#10b981' : undefined,
                            cursor: deferralDone ? 'default' : 'pointer'
                        }}
                    >
                        {deferralDone ? <><CheckCircle2 size={18} /> DEFERRAL CONFIRMED</> : <>VOLUNTARY DEFERRAL ACTIVE <CheckCircle2 size={18} /></>}
                    </button>
                </motion.div>

                {/* Video Clinic */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card glass"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ background: 'var(--warning-bg)', width: '56px', height: '56px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PhoneCall size={28} color="var(--warning)" />
                        </div>
                        <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', fontWeight: 900 }}>INSTANT ACCESS</span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>Tele-Clinical Triage</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
                        Immediate video consultation with a registered clinical nurse in under 45 seconds for rapid assessment.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-sm)' }}>
                        {[
                            'Zero-latency clinical connection',
                            'Automated E-Prescription sync',
                            'Regional digital triage priority'
                        ].map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)', flexShrink: 0 }} />
                                {t}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleVideoClinic}
                        disabled={videoBooked}
                        className="btn elevation-hover"
                        style={{
                            marginTop: 'auto',
                            background: videoBooked ? '#10b981' : 'var(--warning)',
                            color: 'white',
                            borderRadius: '14px',
                            padding: '16px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: videoBooked ? 'default' : 'pointer'
                        }}
                    >
                        {videoBooked ? <><CheckCircle2 size={18} /> SESSION BOOKED</> : <>COMMENCE VIRTUAL CLINIC <ArrowRight size={18} /></>}
                    </button>
                </motion.div>
            </div>

            {/* Execute Redirection */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xxl)',
                    padding: 'var(--space-xl)',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: '0 20px 50px rgba(29, 78, 137, 0.2)'
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <ShieldCheck size={18} color="var(--secondary)" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px', opacity: 0.8 }}>PREDICTIVE ROUTER ACTIVE</span>
                    </div>
                    <h3 style={{ fontSize: '2rem', margin: '0 0 12px 0', color: 'white', fontWeight: 900, letterSpacing: '-1px' }}>
                        Automated Facility Redistribution
                    </h3>
                    <p style={{ margin: 0, fontSize: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
                        Primary facility saturated. High-priority redirection established for <strong>St. Jude Metropolitan</strong>.
                        Digital intake token already synchronized with their trauma center.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={18} color="var(--secondary)" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>ETA: 12 MINUTES</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CornerUpRight size={18} color="var(--warning)" />
                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>PROTOCOL: ALPHA ROUTE</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRedirection}
                    className="btn btn-secondary elevation-hover"
                    style={{ padding: '20px 40px', fontSize: '0.95rem', borderRadius: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
                >
                    EXECUTE REDIRECTION <ExternalLink size={20} />
                </button>
            </motion.div>

            {/* Real-time Diagnostics Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-md) var(--space-xl)', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {surgeZones.slice(0, 2).map((z, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <motion.div
                                animate={{ opacity: z.status === 'critical' ? [1, 0.4, 1] : 1 }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, boxShadow: `0 0 8px ${z.color}` }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>{z.status.toUpperCase()}: {z.zone.toUpperCase()}</span>
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} /> UPDATING AUTOMATICALLY IN <span className="pulse-alert" style={{ color: 'var(--danger)', minWidth: '30px' }}>24s</span>
                </div>
            </div>

            {/* ============ POPUPS ============ */}

            {/* Deferral Credit Popup */}
            <AnimatePresence>
                {showDeferralPopup && (
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
                        onClick={() => !deferralDone && setShowDeferralPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: 'var(--space-xl)',
                                width: '100%',
                                maxWidth: '480px',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                                textAlign: 'center'
                            }}
                        >
                            {!deferralDone ? (
                                <>
                                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '72px', height: '72px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-lg)' }}>
                                        <AlertTriangle size={36} color="#f59e0b" />
                                    </div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)' }}>Confirm Voluntary Deferral</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 var(--space-lg) 0', lineHeight: 1.6 }}>
                                        Your current appointment will be <strong>cancelled</strong> to free capacity for critical patients. You'll earn <strong style={{ color: '#2ABCA7' }}>+850 CareCredit</strong> and your appointment will be <strong>automatically rescheduled</strong> via Smart Appointment.
                                    </p>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                        <button
                                            onClick={() => setShowDeferralPopup(false)}
                                            className="btn glass"
                                            style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', background: 'white', border: '1px solid var(--surface-border)' }}
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={confirmDeferral}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem' }}
                                        >
                                            CONFIRM DEFERRAL
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                        style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-lg)' }}
                                    >
                                        <Award size={40} color="#065f46" />
                                    </motion.div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900, color: '#065f46' }}>Credit Earned! 🎉</h3>
                                    <p style={{ color: '#047857', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px 0' }}>
                                        +850 CareCredit added to your account
                                    </p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                                        Your appointment has been cancelled and will be automatically rescheduled. Check <strong>Smart Appointment</strong> for your new slot.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video Clinic Popup */}
            <AnimatePresence>
                {showVideoClinic && !showVideoCall && (
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
                        onClick={() => setShowVideoClinic(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.85, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: 'var(--space-xl)',
                                width: '100%',
                                maxWidth: '520px',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
                            }}
                        >
                            {!videoBooked ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: 'var(--warning-bg)', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Video size={24} color="var(--warning)" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Immediate Video Consultation</h3>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select a doctor for instant connection</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowVideoClinic(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                                            <X size={20} color="var(--text-muted)" />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {availableDoctors.map((doc, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -15 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                style={{
                                                    padding: '14px 16px',
                                                    borderRadius: '14px',
                                                    border: '1px solid var(--surface-border)',
                                                    background: 'var(--background)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <Users size={18} color="var(--primary)" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{doc.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.specialty} • Wait: {doc.waitTime}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => bookDoctor(doc)}
                                                    className="btn btn-primary"
                                                    style={{ fontSize: '0.7rem', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, flexShrink: 0 }}
                                                >
                                                    CONNECT
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={13} /> All doctors confirmed available for immediate session
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                        style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-lg)' }}
                                    >
                                        <Video size={36} color="var(--primary)" />
                                    </motion.div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)' }}>Session Booked! ✅</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 4px 0' }}>
                                        Your video consultation with <strong>{selectedDoctor?.name}</strong> is confirmed.
                                    </p>
                                    <p style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, margin: '0 0 var(--space-lg) 0' }}>
                                        {selectedDoctor?.specialty} • Connecting in {selectedDoctor?.waitTime}
                                    </p>
                                    <button
                                        onClick={() => setShowVideoClinic(false)}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '14px', borderRadius: '14px', fontWeight: 700, fontSize: '0.9rem' }}
                                    >
                                        OK, GOT IT
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dummy Video Call Screen */}
            <AnimatePresence>
                {showVideoCall && selectedDoctor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            background: '#111827',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Top bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                                <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>CONDUIT Virtual Clinic — Live Session</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                                    REC {formatCallTime(callTime)}
                                </span>
                            </div>
                        </div>

                        {/* Main video area */}
                        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                            {/* Doctor's "video" - large */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                                position: 'relative'
                            }}>
                                {/* Simulated gradient avatar background */}
                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{
                                        width: '160px',
                                        height: '160px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 60px rgba(99, 102, 241, 0.3)',
                                        marginBottom: '24px'
                                    }}
                                >
                                    <Users size={64} color="white" style={{ opacity: 0.9 }} />
                                </motion.div>
                                <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800 }}>{selectedDoctor.name}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>{selectedDoctor.specialty}</div>
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Activity size={14} /> Connected — Session Active
                                </motion.div>
                            </div>

                            {/* Your "video" - small PIP */}
                            <div style={{
                                position: 'absolute',
                                bottom: '24px',
                                right: '24px',
                                width: '200px',
                                height: '150px',
                                borderRadius: '16px',
                                background: isCamOff ? '#374151' : 'linear-gradient(135deg, #1e3a5f 0%, #1a2332 100%)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                {isCamOff ? (
                                    <>
                                        <VideoOff size={28} color="#9ca3af" />
                                        <span style={{ color: '#9ca3af', fontSize: '0.7rem', marginTop: '6px' }}>Camera Off</span>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Users size={24} color="white" />
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', marginTop: '8px' }}>You</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bottom controls */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px',
                            background: 'rgba(0,0,0,0.4)'
                        }}>
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                style={{
                                    width: '52px', height: '52px', borderRadius: '50%',
                                    background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isMuted ? <MicOff size={22} color="white" /> : <Mic size={22} color="white" />}
                            </button>
                            <button
                                onClick={() => setIsCamOff(!isCamOff)}
                                style={{
                                    width: '52px', height: '52px', borderRadius: '50%',
                                    background: isCamOff ? '#ef4444' : 'rgba(255,255,255,0.15)',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isCamOff ? <VideoOff size={22} color="white" /> : <Video size={22} color="white" />}
                            </button>
                            <button
                                onClick={endCall}
                                style={{
                                    width: '64px', height: '52px', borderRadius: '30px',
                                    background: '#ef4444',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <PhoneOff size={22} color="white" />
                            </button>
                            <button
                                style={{
                                    width: '52px', height: '52px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.15)',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <MessageSquare size={22} color="white" />
                            </button>
                            <button
                                style={{
                                    width: '52px', height: '52px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.15)',
                                    border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <Monitor size={22} color="white" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SurgePage;
