import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getSystemMetrics } from '../../../services/api';
import { Activity, Thermometer, Users, AlertCircle, Info } from 'lucide-react';

const healthTrends = [
    { time: '08:00', load: 45, community: 70 },
    { time: '10:00', load: 62, community: 68 },
    { time: '12:00', load: 78, community: 65 },
    { time: '14:00', load: 85, community: 62 },
    { time: '16:00', load: 72, community: 64 },
    { time: '18:00', load: 65, community: 70 },
];

const SystemStress = () => {
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
                            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{systemMetrics.cityStress}%</span>
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
                        {systemMetrics.predictiveSurgeProb}%
                    </div>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Probability of reaching CRITICAL surge threshold within the next 6 hours.</p>
                </div>
            </div>

            {/* Middle Section: Trends */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <h4 style={{ marginBottom: 'var(--space-lg)' }}>Community Health Trends (24h)</h4>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={healthTrends}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
                                />
                                <Area type="monotone" dataKey="load" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" name="System Load" />
                                <Area type="monotone" dataKey="community" stroke="var(--success)" strokeWidth={3} fill="transparent" name="Health Index" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: 'var(--space-lg)' }}>Key Indicators</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{ background: 'var(--primary-light)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                                <Thermometer size={20} color="var(--primary)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average ER Temp</div>
                                <div style={{ fontWeight: 700 }}>36.8°C <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>Normal</span></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{ background: 'var(--success-bg)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' }}>
                                <Users size={20} color="var(--success)" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pop. Health Score</div>
                                <div style={{ fontWeight: 700 }}>82/100 <span style={{ color: 'var(--success)', fontSize: '0.7rem' }}>▲ 2%</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="card glass" style={{ marginTop: 'var(--space-xl)', border: 'none', background: 'rgba(37, 99, 235, 0.05)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>Weekly Summary</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Health trends are stabilizing after a 12% spike in respiratory cases last Tuesday.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStress;
