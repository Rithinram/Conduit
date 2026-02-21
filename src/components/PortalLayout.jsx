import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Bell,
    User as UserIcon,
    ChevronRight,
    Home,
    LogOut,
    ShieldAlert,
    Search,
    LayoutDashboard,
    Clock,
    Zap,
    HeartPulse
} from 'lucide-react';

const PortalLayout = ({ portalName, menuItems }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);

    const getPortalConfig = () => {
        if (portalName === 'USER') return {
            primary: '#1D4E89',
            light: '#e8eff6',
            accent: 'var(--secondary)',
            motif: 'Patient Care Excellence'
        };
        if (portalName === 'HOSPITAL') return {
            primary: '#2ABCA7',
            light: '#eaf8f6',
            accent: 'var(--primary)',
            motif: 'Clinical Operational Control'
        };
        return {
            primary: '#5e6ad2',
            light: '#f0f1fa',
            accent: 'var(--secondary)',
            motif: 'Regional Strategic Oversight'
        };
    };

    const config = getPortalConfig();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>

            {/* ULTRA-DYNAMIC SIDEBAR */}
            <motion.aside
                onHoverStart={() => setIsSidebarHovered(true)}
                onHoverEnd={() => setIsSidebarHovered(false)}
                className="glass"
                style={{
                    width: '300px',
                    borderRight: '1px solid var(--surface-border)',
                    padding: 'var(--space-xl) var(--space-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 100,
                    boxShadow: isSidebarHovered ? '10px 0 40px rgba(29, 78, 137, 0.05)' : 'none',
                    transition: 'box-shadow 0.4s ease'
                }}
            >
                {/* Brand Logo & Portal Tag */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                        marginBottom: 'var(--space-xxl)',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/')}
                >
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        style={{
                            background: config.primary,
                            color: 'white',
                            padding: '10px',
                            borderRadius: '14px',
                            boxShadow: `0 8px 20px ${config.primary}30`
                        }}
                    >
                        <HeartPulse size={24} />
                    </motion.div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px', color: 'var(--primary)' }}>
                            CONDUIT<span style={{ color: config.primary }}>.</span>
                        </h1>
                        <div style={{
                            fontSize: '0.6rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            color: config.primary,
                            letterSpacing: '2px',
                            marginTop: '-4px'
                        }}>
                            {portalName} ENGINE v2
                        </div>
                    </div>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        color: 'var(--text-muted)',
                        marginBottom: 'var(--space-md)',
                        letterSpacing: '1.5px',
                        paddingLeft: '12px'
                    }}>
                        CAPABILITIES
                    </div>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                style={{ textDecoration: 'none' }}
                            >
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: '14px 18px',
                                        borderRadius: 'var(--radius-md)',
                                        color: isActive ? 'white' : 'var(--text-muted)',
                                        backgroundColor: isActive ? config.primary : 'transparent',
                                        boxShadow: isActive ? `0 10px 20px ${config.primary}25` : 'none',
                                        fontWeight: isActive ? 700 : 500,
                                        position: 'relative',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <item.icon size={20} />
                                    <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            style={{ marginLeft: 'auto' }}
                                        >
                                            <ChevronRight size={16} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Sidebar Footer Component */}
                <div style={{
                    marginTop: 'auto',
                    paddingTop: 'var(--space-lg)',
                    borderTop: '1px solid var(--surface-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn elevation-hover"
                        style={{
                            background: 'white',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--surface-border)',
                            justifyContent: 'flex-start',
                            padding: '12px',
                            fontSize: '0.85rem'
                        }}
                    >
                        <Home size={18} /> Exit to Pulse Map
                    </button>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'white',
                        border: '1px solid var(--surface-border)'
                    }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '12px',
                            background: `${config.primary}10`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <UserIcon size={22} color={config.primary} />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Dr. Elena Vance</div>
                            <div style={{ fontSize: '0.7rem', color: config.primary, fontWeight: 900 }}>CHIEF OFFICER</div>
                        </div>
                        <LogOut size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
                    </div>
                </div>
            </motion.aside>

            {/* MAIN CONTENT WORKSPACE */}
            <main style={{
                flex: 1,
                marginLeft: '300px',
                padding: 'var(--space-xl) var(--space-xxl)',
                minHeight: '100vh',
                position: 'relative'
            }}>
                {/* Workspace Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-xxl)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    padding: '10px 0',
                    background: 'rgba(245, 245, 245, 0.8)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: 'var(--text-muted)',
                            marginBottom: '6px',
                            letterSpacing: '0.5px'
                        }}>
                            CONDUIT <ChevronRight size={12} /> {portalName} <ChevronRight size={12} /> <span style={{ color: config.primary }}>{menuItems.find(m => location.pathname === m.path)?.label || 'OVERVIEW'}</span>
                        </div>
                        <motion.h2
                            key={location.pathname}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px', color: 'var(--primary)' }}
                        >
                            {menuItems.find(m => location.pathname === m.path)?.label || 'Intelligence Hub'}
                        </motion.h2>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                        {/* Real-time Sync Indicator */}
                        <div className="glass" style={{
                            padding: '8px 16px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            border: '1px solid var(--surface-border)',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)' }}
                            />
                            <span style={{ fontSize: '0.72rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>GLOBAL NODE SYNC ACTIVE</span>
                        </div>

                        <button className="btn glass elevation-hover" style={{ width: 48, height: 48, padding: 0, borderRadius: '14px' }}>
                            <Bell size={22} color="var(--text-muted)" />
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="btn pulse-alert"
                            style={{
                                background: portalName === 'USER' ? 'var(--danger)' : config.primary,
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                boxShadow: `0 8px 25px ${portalName === 'USER' ? 'var(--danger)' : config.primary}30`
                            }}
                        >
                            {portalName === 'USER' ? <Zap size={18} /> : <Activity size={18} />} SURGE PROTOCOL: STABLE
                        </motion.button>
                    </div>
                </header>

                {/* PAGE TRANSITION CONTAINER */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default PortalLayout;
