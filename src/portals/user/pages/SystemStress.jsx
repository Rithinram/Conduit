import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { getSystemMetrics } from '../../../services/api';
import { Activity, Thermometer, Users, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const generateVolatileData = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
        // Alternating logic for "High to immediate very low"
        const isSpike = i % 2 === 0;
        data.push({
            time: `${i.toString().padStart(2, '0')}:00`,
            load: isSpike ? (70 + Math.random() * 30) : (10 + Math.random() * 20),
            community: isSpike ? (20 + Math.random() * 20) : (60 + Math.random() * 30)
        });
    }
    return data;
};

const diseaseStats = [
    { name: 'Influenza-X (N5H1)', spreadRate: 24.52, risk: 'High', hotspots: 'South District', trend: 'increasing' },
    { name: 'Viral Pneumonia', spreadRate: 8.12, risk: 'Moderate', hotspots: 'Downtown', trend: 'stable' },
    { name: 'Acute Bronchitis', spreadRate: -12.45, risk: 'Low', hotspots: 'Outer Suburbs', trend: 'decreasing' }
];

const SystemStress = () => {
    const [systemMetrics, setSystemMetrics] = useState({
        cityStress: 68,
        predictiveSurgeProb: 44,
        healthIndex: 82
    });
    const [isLoading, setIsLoading] = useState(true);
    const [volatileData, setVolatileData] = useState(generateVolatileData());

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);

        // Dynamic jitter simulation
        const interval = setInterval(() => {
            setSystemMetrics(prev => ({
                cityStress: Math.min(100, Math.max(0, prev.cityStress + (Math.random() - 0.5) * 5)),
                predictiveSurgeProb: Math.min(100, Math.max(0, prev.predictiveSurgeProb + (Math.random() - 0.5) * 8)),
                healthIndex: Math.min(100, Math.max(0, prev.healthIndex + (Math.random() - 0.5) * 2))
            }));
            setVolatileData(generateVolatileData());
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const getStressInfo = (stress) => {
        if (stress < 40) return { label: 'STABLE', color: 'var(--success)', icon: Activity };
        if (stress < 80) return { label: 'HIGH LOAD', color: 'var(--warning)', icon: AlertCircle };
        return { label: 'SURGE MODE', color: 'var(--danger)', icon: AlertCircle };
    };

    if (isLoading || !systemMetrics) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '20px' }}>
                <Activity className="pulse-alert" size={48} color="var(--primary)" />
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>CALIBRATING NETWORK FLOWS...</div>
            </div>
        );
    }

    const stressInfo = getStressInfo(systemMetrics.cityStress);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Top Section: Stress Meter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                        <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={stressInfo.color} strokeDasharray={`${systemMetrics.cityStress}, 100`} strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{systemMetrics.cityStress.toFixed(2)}%</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>City Stress</span>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                            <stressInfo.icon size={24} color={stressInfo.color} />
                            <h3 style={{ margin: 0, color: stressInfo.color }}>{stressInfo.label}</h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            The city healthcare network is currently under {stressInfo.label.toLowerCase()} conditions. Resource redistribution is active across all major hospitals.
                        </p>
                        <div className="card" style={{ background: 'var(--background)', marginTop: 'var(--space-md)', padding: 'var(--space-sm)', fontSize: '0.8rem' }}>
                            <Info size={14} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }} />
                            Behavioral Nudge: Choosing tele-consultations for non-emergencies can reduce city stress by up to 12%.
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: stressInfo.color, color: 'white' }}>
                    <h4>Surge Prediction</h4>
                    <div style={{ fontSize: '3rem', fontWeight: 800, margin: 'var(--space-md) 0' }}>
                        {systemMetrics.predictiveSurgeProb.toFixed(2)}%
                    </div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Probability of reaching CRITICAL surge threshold within the next 6 hours.</p>
                </div>
            </div>

            {/* Middle Section: Trends & Disease Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h4 style={{ margin: 0 }}>System Load Volatility (24h)</h4>
                        <div className="badge pulse-alert" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>LIVE DATA FEED</div>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volatileData}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}
                                    formatter={(value) => value.toFixed(2)}
                                />
                                <Area
                                    animationDuration={1500}
                                    type="step"
                                    dataKey="load"
                                    stroke="var(--primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorLoad)"
                                    name="System Load"
                                />
                                <Area
                                    animationDuration={1500}
                                    type="monotone"
                                    dataKey="community"
                                    stroke="var(--secondary)"
                                    strokeWidth={2}
                                    fill="transparent"
                                    strokeDasharray="5 5"
                                    name="Community Resilience"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0 }}>Pathogen Intelligence</h4>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }} className="pulse-critical" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--danger)', letterSpacing: '1px' }}>BIO-SURGE ALERT</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ height: '180px', marginBottom: 'var(--space-lg)' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={diseaseStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="spreadRate" name="Spread Rate (%)" radius={[4, 4, 0, 0]}>
                                        {diseaseStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.risk === 'High' ? 'var(--danger)' : entry.risk === 'Moderate' ? 'var(--warning)' : 'var(--secondary)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {diseaseStats.map((disease, i) => (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                key={disease.name}
                                className="glass"
                                style={{
                                    padding: '14px',
                                    borderRadius: '16px',
                                    border: `1px solid ${disease.risk === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'var(--surface-border)'}`,
                                    background: disease.risk === 'High' ? 'rgba(239, 68, 68, 0.03)' : 'var(--background)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>{disease.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hotspot: {disease.hotspots}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 900, color: disease.trend === 'increasing' ? 'var(--danger)' : 'var(--secondary)' }}>
                                            {disease.spreadRate > 0 ? '+' : ''}{disease.spreadRate.toFixed(2)}%
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>Spread Velocity</div>
                                    </div>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: disease.risk === 'High' ? '85%' : disease.risk === 'Moderate' ? '45%' : '15%' }}
                                        style={{ height: '100%', background: disease.risk === 'High' ? 'var(--danger)' : disease.risk === 'Moderate' ? 'var(--warning)' : 'var(--secondary)', borderRadius: '10px' }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="pulse-alert" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '16px',
                        borderRadius: '18px',
                        border: '1px solid var(--danger)',
                        marginTop: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '8px' }}>
                            <AlertCircle size={20} />
                            <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>CONTAINMENT ADVISORY</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', opacity: 0.8, lineHeight: '1.4' }}>
                            Rapid transmission detected in <strong style={{ color: 'var(--danger)' }}>Influenza-X</strong>.
                            Community masking and sanitization protocols recommended for districts South of the Central Transit Hub.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStress;
