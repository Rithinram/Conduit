import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Activity, ShieldCheck, ArrowRight, ShieldAlert, Zap, HeartPulse, Building2, MapPin, Phone, X } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    const [emergencyTriggered, setEmergencyTriggered] = useState(false);

    useEffect(() => {
        if (emergencyTriggered) {
            const timer = setTimeout(() => setEmergencyTriggered(false), 8000);
            return () => clearTimeout(timer);
        }
    }, [emergencyTriggered]);

    const handleEmergency = () => {
        setEmergencyTriggered(true);
        window.location.href = 'tel:112';
    };

    const cards = [
        {
            role: 'Patient / User',
            description: 'Access emergency routing, load-aware selector, and predictive wait-times.',
            icon: User,
            color: 'var(--primary)',
            secondary: 'var(--secondary)',
            path: '/user',
            tooltip: 'Enter for immediate care & routing'
        },
        {
            role: 'Hospital Staff',
            description: 'Clinical operational tools, smart triage, and ICU capacity management.',
            icon: Building2,
            color: 'var(--secondary)',
            secondary: 'var(--primary)',
            path: '/hospital',
            tooltip: 'Operational control & clinical triage'
        },
        {
            role: 'System Administrator',
            description: 'Regional oversight, surge command, and strategic network allocation.',
            icon: ShieldCheck,
            color: 'var(--accent)',
            secondary: 'var(--primary)',
            path: '/admin',
            tooltip: 'Strategic command & network stats'
        }
    ];

    // Mock Heatmap Spots
    const hotSpots = [
        { top: '25%', left: '15%', size: 40, color: 'var(--danger)', delay: 0 },
        { top: '45%', left: '35%', size: 30, color: 'var(--warning)', delay: 0.5 },
        { top: '20%', left: '65%', size: 50, color: 'var(--success)', delay: 1.2 },
        { top: '75%', left: '25%', size: 25, color: 'var(--primary)', delay: 0.8 },
        { top: '65%', left: '85%', size: 45, color: 'var(--warning)', delay: 2 },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: 'var(--background)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-xl)'
        }}>

            {/* 1. ANIMATED HEATMAP BACKGROUND */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                opacity: 0.4,
                pointerEvents: 'none'
            }}>
                {/* SVG City Grid Illustration */}
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(29, 78, 137, 0.08)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Pulsing Hotspots */}
                {hotSpots.map((spot, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: spot.delay,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            top: spot.top,
                            left: spot.left,
                            width: `${spot.size * 4}px`,
                            height: `${spot.size * 4}px`,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${spot.color} 0%, transparent 70%)`,
                            filter: 'blur(10px)',
                            zIndex: 1
                        }}
                    />
                ))}

                {/* Animated Connections */}
                <motion.svg
                    style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                    width="100%" height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M 15 25 Q 40 10, 65 20"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                        d="M 65 20 Q 80 40, 85 65"
                        fill="none"
                        stroke="var(--secondary)"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                </motion.svg>
            </div>

            {/* EMERGENCY NOTIFICATION BANNER */}
            <AnimatePresence>
                {emergencyTriggered && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            background: 'linear-gradient(135deg, #E63946 0%, #c1121f 100%)',
                            color: 'white',
                            padding: '20px 40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 8px 32px rgba(230, 57, 70, 0.5)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}
                            >
                                <Phone size={28} />
                            </motion.div>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '1px' }}>🚨 EMERGENCY SERVICES DIALING — 112</div>
                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '2px' }}>Connecting you to emergency services. Stay on the line and share your location.</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setEmergencyTriggered(false)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. FLOATING EMERGENCY BUTTON */}
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="pulse-alert"
                onClick={handleEmergency}
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 200,
                    cursor: 'pointer'
                }}
            >
                <div style={{
                    background: 'var(--danger)',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(230, 57, 70, 0.4)'
                }}>
                    <ShieldAlert size={32} />
                </div>
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'var(--danger)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    marginTop: '8px',
                    whiteSpace: 'nowrap'
                }}>EMERGENCY 🚨</div>
            </motion.div>

            {/* 3. CENTER CONTENT */}
            <div style={{ zIndex: 10, textAlign: 'center', width: '100%', maxWidth: '1200px' }}>
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ marginBottom: 'var(--space-xxl)' }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-md)',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            style={{ background: 'var(--primary)', color: 'white', padding: '10px', borderRadius: '16px' }}
                        >
                            <HeartPulse size={40} />
                        </motion.div>
                        <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-3px' }}>
                            CONDUIT<span style={{ color: 'var(--secondary)' }}>.</span>
                        </h1>
                    </div>
                    <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: 500, maxWidth: '700px', margin: '0 auto' }}>
                        Strategic Network Intelligence & Predictive Surge Management for the Modern Hospital Ecosystem.
                    </p>
                </motion.div>

                {/* Role Selection Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: 'var(--space-xl)',
                    padding: 'var(--space-md)'
                }}>
                    {cards.map((card, i) => (
                        <motion.div
                            key={card.role}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2, duration: 0.6 }}
                            whileHover={{ y: -15 }}
                            onHoverStart={() => setHoveredCard(i)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="card glass"
                            style={{
                                cursor: 'pointer',
                                padding: 'var(--space-xl)',
                                border: hoveredCard === i ? `2px solid ${card.color}` : '1px solid var(--surface-border)',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-lg)'
                            }}
                            onClick={() => navigate(card.path)}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '18px',
                                background: `${card.color}15`,
                                color: card.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <card.icon size={36} />
                            </div>

                            <div>
                                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>{card.role}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
                                    {card.description}
                                </p>
                            </div>

                            <AnimatePresence>
                                {hoveredCard === i && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        style={{
                                            position: 'absolute',
                                            top: '20px',
                                            right: '20px',
                                            background: card.color,
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800
                                        }}
                                    >
                                        {card.tooltip}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{
                                marginTop: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingTop: 'var(--space-md)',
                                borderTop: `1px solid ${card.color}15`
                            }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Zap size={18} color={card.color} />
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: card.color }}>SMART ACCESS ACTIVE</span>
                                </div>
                                <motion.div
                                    animate={hoveredCard === i ? { x: 5 } : { x: 0 }}
                                    style={{ color: card.color }}
                                >
                                    <ArrowRight size={20} />
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 4. FOOTER STATUS BAR */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    display: 'flex',
                    gap: 'var(--space-xxl)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }} />
                    NETWORK SYNC: ONLINE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={16} /> CONNECTED NODES: 247
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} /> REGION: CENTRAL METRO
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
