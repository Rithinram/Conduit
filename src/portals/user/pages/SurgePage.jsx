import { ShieldAlert, Zap, Calendar, PhoneCall, ArrowRight, CornerUpRight, Info, AlertTriangle, Users, Activity, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { getSystemMetrics } from '../../../services/api';

const CheckCircle = ({ size, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const SurgePage = () => {
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            setIsLoading(true);
            const data = await getSystemMetrics();
            setSystemMetrics(data);
            setIsLoading(false);
        };
        fetchMetrics();
    }, []);

    if (isLoading || !systemMetrics) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '20px' }}>
                <Zap className="pulse-alert" size={48} color="var(--warning)" />
                <div style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>CALIBRATING REGIONAL FEED...</div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>

            {/* BRAVO SURGE STATUS HEADER - ULTRA DYNAMIC */}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xxl)',
                    boxShadow: '0 30px 60px rgba(230, 57, 70, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Animation Element */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1 }}
                >
                    <ShieldAlert size={500} />
                </motion.div>

                <div className="pulse-alert" style={{ background: 'rgba(255,255,255,0.15)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.3)' }}>
                    <ShieldAlert size={64} />
                </div>

                <div style={{ flex: 1, zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px' }}>
                            LEVEL 4 PROTOCOL
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4].map(i => <div key={i} style={{ width: 12, height: 4, background: 'white', borderRadius: 2 }} />)}
                        </div>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>URGENT REGIONAL SURGE</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '12px', fontWeight: 500, maxWidth: '600px' }}>
                        System load balancing active. Voluntary intake diversion is recommended to preserve critical ICU capacity.
                    </p>
                </div>

                <div style={{ textAlign: 'right', zIndex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, opacity: 0.7, letterSpacing: '2px' }}>NETWORK OCCUPANCY</div>
                    <div style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>{systemMetrics.cityStress}<span style={{ fontSize: '1.5rem', opacity: 0.6 }}>%</span></div>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, marginTop: '10px' }}>
                        {systemMetrics.cityStress > 70 ? 'CRITICAL THRESHOLD' : 'STRESS DETECTED'}
                    </div>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Behavioral Nudges - Professional clinical palette */}
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
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>Altruistic Intake Relief</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
                        Help prioritize trauma cases. Deferring your non-urgent diagnostic visit generates immediate clinical capacity.
                    </p>
                    <div style={{ background: '#f0fdfa', padding: '20px', borderRadius: '20px', marginTop: 'auto', border: '1px solid #2ABCA740' }}>
                        <div style={{ color: '#134e4a', fontWeight: 900, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={20} color="#2ABCA7" /> +850 CARECREDIT REWARDS
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#134e4a', opacity: 0.8 }}>
                            Redeemable for priority scheduling and health premiums across the entire network.
                        </p>
                    </div>
                    <button className="btn btn-secondary elevation-hover" style={{ marginTop: 'var(--space-md)', borderRadius: '18px', padding: '18px' }}>
                        VOLUNTARY DEFERRAL ACTIVE <CheckCircle size={20} style={{ marginLeft: 8 }} />
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="dynamic-card glass"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        border: '1px solid var(--warning)30'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ background: 'var(--warning-bg)', width: '56px', height: '56px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PhoneCall size={28} color="var(--warning)" />
                        </div>
                        <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', fontWeight: 900 }}>INSTANT ACCESS</span>
                    </div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>Tele-Clinical Triage</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 500 }}>
                        Immediate video consultation with a registered clinical nurse in under 45 seconds for rapid assessment.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'var(--space-sm)' }}>
                        {[
                            'Zero-latency clinical connection',
                            'Automated E-Prescription sync',
                            'Regional digital triage priority'
                        ].map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 8px var(--warning)' }} />
                                {t}
                            </div>
                        ))}
                    </div>
                    <button className="btn elevation-hover" style={{ marginTop: 'auto', background: 'var(--warning)', color: 'white', borderRadius: '18px', padding: '18px' }}>
                        COMMENCE VIRTUAL CLINIC <ArrowRight size={20} />
                    </button>
                </motion.div>
            </div>

            {/* Smart Emergency Redirection Workspace */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="dynamic-card"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xxl)',
                    padding: 'var(--space-xxl)',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 20px 50px rgba(29, 78, 137, 0.2)'
                }}
            >
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <ShieldCheck size={20} color="var(--secondary)" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px', opacity: 0.8 }}>PREDICTIVE ROUTOR ACTIVE</span>
                    </div>
                    <h3 style={{ fontSize: '2.2rem', margin: '0 0 16px 0', color: 'white', fontWeight: 900, letterSpacing: '-1px' }}>
                        Automated Facility Redistribution
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>
                        Primary facility saturated. High-priority redirection established for <strong>St. Jude Metropolitan</strong>.
                        Digital intake token already synchronized with their trauma center.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="var(--secondary)" />
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>ETA: 12 MINUTES</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CornerUpRight size={20} color="var(--warning)" />
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>PROTOCOL: ALPHA ROUTE</span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary elevation-hover" style={{ padding: '24px 48px', fontSize: '1rem', borderRadius: '20px' }}>
                    EXECUTE REDIRECTION <ExternalLink size={24} style={{ marginLeft: 12 }} />
                </button>
            </motion.div>

            {/* Dynamic Real-time Diagnostics Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-lg) var(--space-xl)', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>SURGE: NORTH DISTRICT</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>LOAD STABLE: SOUTH METRO</span>
                    </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} /> UPDATING AUTOMATICALLY IN <span className="pulse-alert" style={{ color: 'var(--danger)', minWidth: '30px' }}>24s</span>
                </div>
            </div>
        </div>
    );
};

export default SurgePage;
