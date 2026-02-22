import { ShieldAlert, Zap, Calendar, PhoneCall, ArrowRight, CornerUpRight, Info, AlertTriangle, Users, Activity, ExternalLink, ShieldCheck, Clock, CheckCircle2, X, Video, Star, Award, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurgeActions } from '../../../context/SurgeActionsContext';
import { getSystemMetrics, getHospitals } from '../../../services/api';
import { getSurgeLevel, getSurgeColor, computeMovingAverage } from '../../../../conduit-ml';

const white = 'white';

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

const PressureGauge = ({ value }) => {
    const radius = 60;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div style={{ position: 'relative', width: radius * 2, height: radius * 2 }}>
            <svg height={radius * 2} width={radius * 2}>
                <circle
                    stroke="rgba(255,255,255,0.1)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <motion.circle
                    stroke={value > 80 ? '#fecaca' : '#fff'}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${radius} ${radius})`}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.4rem' }}>
                {value}%
            </div>
        </div>
    );
};

const SurgePage = () => {
    const navigate = useNavigate();
    const { addRescheduledAppointment } = useSurgeActions() || {};
    const [showDeferralPopup, setShowDeferralPopup] = useState(false);
    const [showVideoClinic, setShowVideoClinic] = useState(false);
    const [showVideoCall, setShowVideoCall] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [videoBooked, setVideoBooked] = useState(false);
    const [deferralDone, setDeferralDone] = useState(false);
    const [callTime, setCallTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCamOff, setIsCamOff] = useState(false);
    const [deferralCount, setDeferralCount] = useState(1243);

    const [systemMetrics, setSystemMetrics] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleDeferral = () => {
        setShowDeferralPopup(true);
    };

    const confirmDeferral = () => {
        setDeferralDone(true);
        setDeferralCount(prev => prev + 1);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 2);
        const dateStr = tomorrow.toISOString().split('T')[0];
        if (addRescheduledAppointment) {
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
        }

        setTimeout(() => setShowDeferralPopup(false), 2500);
    };

    const handleVideoClinic = () => {
        setShowVideoClinic(true);
    };

    const bookDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setVideoBooked(true);
        setTimeout(() => {
            setShowVideoClinic(false);
            setShowVideoCall(true);
            setCallTime(0);
        }, 1500);
    };

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

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [metrics, hosps] = await Promise.all([getSystemMetrics(), getHospitals()]);
                setSystemMetrics(metrics);
                setHospitals(hosps);
            } catch (err) {
                console.error("Fetch data failed:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const networkSurge = useMemo(() => {
        if (!hospitals.length) return { level: 'STABLE', avgIcu: 0, avgWait: 0 };
        const avgIcu = Math.round(hospitals.reduce((s, h) => s + (h.icuAvailability || h.occupancy || 50), 0) / hospitals.length);
        const avgWait = Math.round(hospitals.reduce((s, h) => s + (h.erWaitTime || 0), 0) / hospitals.length);
        const admissionRates = hospitals.map(h => h.occupancy || 50);
        const movAvg = computeMovingAverage(admissionRates);
        const level = getSurgeLevel(avgIcu, avgWait, avgIcu, movAvg);
        return { level, avgIcu, avgWait };
    }, [hospitals]);

    if (isLoading || !systemMetrics) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '20px' }}>
                <Zap className="pulse-alert" size={48} color="var(--warning)" />
                <div style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>CALIBRATING REGIONAL FEED...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)', padding: '20px' }}>

            {/* HIGH-DYNAMIC SURGE HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                    background: 'linear-gradient(135deg, #E63946 0%, #7f1d1d 100%)',
                    color: white,
                    padding: 'var(--space-xxl)',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 40px 80px rgba(230, 57, 70, 0.3)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}
            >
                <motion.div
                    animate={{ opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #E63946 0%, transparent 70%)', zIndex: 0 }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', position: 'relative', zIndex: 1 }}>
                    <PressureGauge value={systemMetrics.cityStress} />

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d4d' }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px', color: '#ff4d4d' }}>LIVE NETWORK PRESSURE</span>
                        </div>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                            Regional System Overload Detected
                        </h1>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)' }}>
                                {hospitals.length} FACILITIES MONITORED
                            </span>
                            <span style={{ background: '#E63946', padding: '6px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                                {networkSurge.level} PROTOCOL
                            </span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.6, letterSpacing: '2px' }}>ESTIMATED WAIT INC.</div>
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f59e0b' }}>+45<span style={{ fontSize: '1.2rem' }}>min</span></div>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>PREDICTIVE SURGE: {systemMetrics.predictiveSurgeProb}%</p>
                    </div>
                </div>

                <div style={{ gridTemplateColumns: 'repeat(4, 1fr)', display: 'grid', gap: '16px', marginTop: '30px', position: 'relative', zIndex: 1 }}>
                    {[
                        { label: 'City Stress', value: `${systemMetrics.cityStress}%`, color: '#ff4d4d' },
                        { label: 'ICU Float', value: 'Critically Low', color: '#ff4d4d' },
                        { label: 'Ems Queue', value: '14 Active', color: '#f59e0b' },
                        { label: 'Redirects', value: 'Awaiting', color: '#10b981' },
                    ].map((m, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>{m.label.toUpperCase()}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-xl)' }}>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="card glass"
                    style={{ border: '2px solid #2ABCA740', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(42, 188, 167, 0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Award size={32} color="#2ABCA7" />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2ABCA7' }}>ALTRUISM NUDGE</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Verified Impact</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>Skip the Line, Save a Life</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                        By deferring non-urgent care, you directly enable trauma surgeons to focus on critical patients.
                        Join <strong>{deferralCount.toLocaleString()}</strong> heroes who deferred this week.
                    </p>

                    <div style={{ background: 'linear-gradient(90deg, #f0fdfa 0%, #fff 100%)', padding: '16px', borderRadius: '16px', border: '1px solid #2ABCA740' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2ABCA7' }}>+850 CareCredits</div>
                            <span className="badge badge-success">Guaranteed</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#134e4a', opacity: 0.8 }}>
                            Instantly claimable for premium lounge access and diagnostic priority in the next 30 days.
                        </p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleDeferral}
                        disabled={deferralDone}
                        style={{
                            background: deferralDone ? '#10b981' : 'linear-gradient(135deg, #2ABCA7 0%, #134e4a 100%)',
                            color: white,
                            border: 'none',
                            padding: '18px',
                            borderRadius: '16px',
                            fontWeight: 900,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: 'auto',
                            boxShadow: '0 10px 20px rgba(42, 188, 167, 0.2)'
                        }}
                    >
                        {deferralDone ? <><CheckCircle2 size={22} /> DEFERRAL SECURED</> : <>VOLUNTARY DEFERRAL ACTIVE <ArrowRight size={22} /></>}
                    </motion.button>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="card glass"
                    style={{ border: '2px solid rgba(245, 158, 11, 0.3)', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Video size={32} color="#f59e0b" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981' }}>LIVE: 4 DOCTORS</span>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>Instant Triage Video</h2>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                        Bypass the physical ER. Connect with a trauma-certified nurse practitioner in under 60 seconds.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {availableDoctors.slice(0, 2).map((doc, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={20} color="var(--primary)" />
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, background: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{doc.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wait time: {doc.waitTime}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleVideoClinic}
                        disabled={videoBooked}
                        style={{
                            background: videoBooked ? '#10b981' : '#f59e0b',
                            color: white,
                            border: 'none',
                            padding: '18px',
                            borderRadius: '16px',
                            fontWeight: 900,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: 'auto',
                            boxShadow: '0 10px 20px rgba(245, 158, 11, 0.2)'
                        }}
                    >
                        {videoBooked ? <><CheckCircle2 size={22} /> SESSION SECURED</> : <>COMMENCE VIRTUAL TRIAGE <Zap size={22} /></>}
                    </motion.button>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ background: 'var(--primary)', color: white, border: 'none', padding: 'var(--space-xl)', borderRadius: '24px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>Facility Load Balancing</h2>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.8, fontSize: '1rem' }}>Automatic intake redirection based on real-time bed capacity.</p>
                    </div>
                    <button onClick={handleRedirection} className="btn badge badge-success elevation-hover" style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900, background: '#2ABCA7', color: 'white', border: 'none', cursor: 'pointer' }}>
                        VIEW REDIRECT OPTIONS
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {hospitals.slice(0, 3).map((h, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontWeight: 800 }}>{h.name}</span>
                                <span style={{ fontSize: '0.8rem', color: h.occupancy > 80 ? '#ffbaba' : '#b2f5ea', fontWeight: 800 }}>
                                    {h.occupancy > 80 ? 'SATURATED' : 'AVAILABLE'}
                                </span>
                            </div>
                            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: '12px' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${h.occupancy}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.2 }}
                                    style={{ height: '100%', background: h.occupancy > 80 ? '#E63946' : '#2ABCA7' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                                <span style={{ opacity: 0.6 }}>LOAD: {h.occupancy}%</span>
                                <span>ETA: {h.distance || '12 mins'}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px 20px', borderRadius: '12px' }}>
                    <ShieldCheck size={20} color="#2ABCA7" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Smart Router: Primary redirection path cleared for emergency admission.</span>
                </div>
            </motion.div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>NETWORK AGGREGATE</div>
                    {surgeZones.map((z, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: z.color }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{z.zone}: {z.load}%</span>
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} /> LIVE UPDATE IN <span style={{ minWidth: '20px' }}>14s</span>
                </div>
            </div>

            <AnimatePresence>
                {showDeferralPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 'var(--space-lg)'
                        }}
                        onClick={() => !deferralDone && setShowDeferralPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50, rotateX: 20 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.9, y: 50, rotateX: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: white,
                                borderRadius: '32px',
                                padding: 'var(--space-xxl)',
                                width: '100%',
                                maxWidth: '500px',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
                                textAlign: 'center',
                                position: 'relative'
                            }}
                        >
                            {!deferralDone ? (
                                <>
                                    <div style={{ background: 'rgba(42, 188, 167, 0.1)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <Award size={48} color="#2ABCA7" />
                                    </div>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>Confirm Clinical Sacrifice</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 32px 0', lineHeight: 1.6 }}>
                                        Voluntarily deferring your visit earns you <strong style={{ color: '#2ABCA7' }}>+850 CareCredit</strong> and immediate priority for any future scheduling. You are saving critical minutes for the trauma unit.
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <button
                                            onClick={() => setShowDeferralPopup(false)}
                                            style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: 900, background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
                                        >
                                            RETAIN VISIT
                                        </button>
                                        <button
                                            onClick={confirmDeferral}
                                            style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: 900, background: '#2ABCA7', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(42, 188, 167, 0.3)' }}
                                        >
                                            CONFIRM & CLAIM
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0, rotate: -45 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                        style={{ background: 'linear-gradient(135deg, #2ABCA7 0%, #134e4a 100%)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 20px 40px rgba(42, 188, 167, 0.4)' }}
                                    >
                                        <Award size={52} color="white" />
                                    </motion.div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 900, color: '#134e4a' }}>Hero Status! 🏆</h3>
                                    <div style={{ background: '#f0fdfa', padding: '12px 24px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
                                        <span style={{ color: '#2ABCA7', fontSize: '1.2rem', fontWeight: 900 }}>+850 CREDITS ADDED</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>
                                        Network capacity increased. Your rescheduled appointment is secured. Thank you for prioritizing collective emergency care.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showVideoClinic && !showVideoCall && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: 'var(--space-lg)'
                        }}
                        onClick={() => setShowVideoClinic(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: white,
                                borderRadius: '32px',
                                padding: 'var(--space-xl)',
                                width: '100%',
                                maxWidth: '520px',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '14px', borderRadius: '18px' }}>
                                        <Video size={28} color="#f59e0b" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Clinical Nurse Connect</h3>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Regional digital triage queue</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowVideoClinic(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                    <X size={24} color="var(--text-muted)" />
                                </button>
                            </div>

                            <div style={{ flexDirection: 'column', display: 'flex', gap: '12px' }}>
                                {availableDoctors.map((doc, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10, background: 'rgba(0,0,0,0.02)' }}
                                        onClick={() => bookDoctor(doc)}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '20px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: 48, height: 48, borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Users size={22} color="var(--primary)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{doc.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>AVAILABLE NOW • {doc.waitTime}</div>
                                            </div>
                                        </div>
                                        <div style={{ background: 'var(--primary)', color: white, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ArrowRight size={18} />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            background: '#0a0a0a',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
                                <span style={{ color: white, fontSize: '1rem', fontWeight: 900, letterSpacing: '0.5px' }}>CONDUIT VIRTUAL EMERGENCY PORTAL</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', color: white, fontWeight: 800, fontSize: '0.9rem' }}>
                                ER UNIT: {formatCallTime(callTime)}
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'radial-gradient(circle at center, #1e293b 0%, #000 100%)',
                                position: 'relative'
                            }}>
                                <motion.div
                                    animate={{ scale: [1, 1.02, 1], filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'] }}
                                    transition={{ duration: 5, repeat: Infinity }}
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '60px',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 0 100px rgba(59, 130, 246, 0.2)',
                                        marginBottom: '32px'
                                    }}
                                >
                                    <Users size={80} color="white" style={{ opacity: 0.8 }} />
                                </motion.div>
                                <h2 style={{ color: white, fontSize: '2rem', fontWeight: 900, margin: 0 }}>{selectedDoctor.name}</h2>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '8px', fontWeight: 600 }}>Trauma Triage Specialist</p>
                            </div>

                            <motion.div
                                drag
                                style={{
                                    position: 'absolute',
                                    bottom: '40px',
                                    right: '40px',
                                    width: '240px',
                                    height: '180px',
                                    borderRadius: '24px',
                                    background: isCamOff ? '#1a1a1a' : '#2d3748',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    cursor: 'grab'
                                }}
                            >
                                {isCamOff ? <VideoOff size={40} color="#4a5568" /> : <Users size={40} color="white" style={{ opacity: 0.5 }} />}
                            </motion.div>
                        </div>

                        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', gap: '24px', background: 'rgba(0,0,0,0.8)' }}>
                            {[
                                { icon: isMuted ? MicOff : Mic, color: isMuted ? '#E63946' : 'rgba(255,255,255,0.1)', action: () => setIsMuted(!isMuted) },
                                { icon: isCamOff ? VideoOff : Video, color: isCamOff ? '#E63946' : 'rgba(255,255,255,0.1)', action: () => setIsCamOff(!isCamOff) },
                                { icon: PhoneOff, color: '#E63946', action: endCall, large: true },
                                { icon: MessageSquare, color: 'rgba(255,255,255,0.1)', action: () => { } },
                                { icon: Monitor, color: 'rgba(255,255,255,0.1)', action: () => { } },
                            ].map((ctrl, i) => (
                                <motion.button
                                    key={i}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={ctrl.action}
                                    style={{
                                        width: ctrl.large ? '80px' : '60px',
                                        height: ctrl.large ? '80px' : '60px',
                                        borderRadius: '24px',
                                        background: ctrl.color,
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: white
                                    }}
                                >
                                    <ctrl.icon size={ctrl.large ? 32 : 24} />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .pulse-alert {
                    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(230, 57, 70, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
                }
            `}</style>
        </div>
    );
};

export default SurgePage;
