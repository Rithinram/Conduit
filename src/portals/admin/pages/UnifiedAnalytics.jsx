import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Target, Zap, Activity, Globe, Info, Calendar, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const predictiveData = [
    { month: 'Jan', actual: 4000, predicted: 4400 },
    { month: 'Feb', actual: 3000, predicted: 3200 },
    { month: 'Mar', actual: 2000, predicted: 2400 },
    { month: 'Apr', actual: 2780, predicted: 2900 },
    { month: 'May', actual: 1890, predicted: 2100 },
    { month: 'Jun', actual: 2390, predicted: 2500 },
];

const capabilityData = [
    { subject: 'ER Efficiency', A: 120, B: 110, fullMark: 150 },
    { subject: 'ICU Throughput', A: 98, B: 130, fullMark: 150 },
    { subject: 'Tele Adoption', A: 86, B: 130, fullMark: 150 },
    { subject: 'Staff Well-being', A: 99, B: 100, fullMark: 150 },
    { subject: 'Resource Sharing', A: 85, B: 90, fullMark: 150 },
    { subject: 'Surge Prep', A: 65, B: 85, fullMark: 150 },
];

const UnifiedAnalytics = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Strategic Header */}
            <div className="card glass" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <Globe size={40} />
                    <div>
                        <h2 style={{ margin: 0 }}>Unified City Analytics</h2>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Strategic insights and predictive foresight for the regional medical network.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn glass" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}><Calendar size={18} /> Last 30 Days</button>
                    <button className="btn glass" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}><Download size={18} /> EXPORT DATA</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Predictive Demand Forecast */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Predictive Case Volume Forecast</h3>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', fontSize: '0.8rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, background: 'var(--primary)' }} /> Actual</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 12, height: 12, border: '2px dashed var(--primary)' }} /> AI Prediction</div>
                        </div>
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={predictiveData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                                <Area type="monotone" dataKey="predicted" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Capability Radar */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Network Capability Profile</h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={capabilityData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 10 }} />
                                <Radar name="Current" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                                <Radar name="Target" dataKey="B" stroke="var(--success)" fill="var(--success)" fillOpacity={0.3} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                <div className="card">
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <Target size={18} color="var(--primary)" />
                        <h4 style={{ margin: 0 }}>Strategic Efficiency Gap</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Network is operating at 12% below target efficiency due to equipment idle time in Suburban zones.
                    </p>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <Zap size={18} color="var(--warning)" />
                        <h4 style={{ margin: 0 }}>Surge Risk Alert (High)</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Predictive models flag a 75% probability of ER surge in North Cluster within 48 hours.
                    </p>
                </div>
                <div className="card">
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <TrendingUp size={18} color="var(--success)" />
                        <h4 style={{ margin: 0 }}>Coordination ROI</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Real-time load balancing has saved an estimated $1.2M in operational costs this quarter.
                    </p>
                </div>
            </div>

            <div className="card" style={{ background: 'var(--text-main)', color: 'white', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={24} color="var(--primary-light)" />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Admin Foresight:</strong> AI suggests adjusting teleconsult eligibility rules for routine follow-ups to mitigate the upcoming peak.
                </p>
                <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>ADJUST POLICIES</button>
            </div>
        </div>
    );
};

export default UnifiedAnalytics;
