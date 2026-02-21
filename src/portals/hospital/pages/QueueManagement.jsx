import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserPlus, UserMinus, Clock, TrendingUp, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const waitForecast = [
    { time: '12:00', wait: 35 },
    { time: '13:00', wait: 42 },
    { time: '14:00', wait: 58 },
    { time: '15:00', wait: 85 },
    { time: '16:00', wait: 65 },
    { time: '17:00', wait: 45 },
];

const QueueManagement = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Wait time forecasting */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Wait Time Forecast (Next 6h)</h3>
                        <div className="badge badge-danger">SURGE EXPECTED AT 15:00</div>
                    </div>
                    <div style={{ height: '300px', marginTop: 'var(--space-xl)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={waitForecast}>
                                <defs>
                                    <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="wait" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorWait)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Staff Allocation */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Dynamic Staff Allocation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        AI-recommended staffing adjustments based on predicted patient inflow.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Users size={20} color="var(--primary)" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Triage Zone A</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently: 4 Staff</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button className="btn glass" style={{ width: 32, height: 32, padding: 0 }}><UserMinus size={16} /></button>
                                <button className="btn btn-primary" style={{ height: 32, padding: '0 0.75rem' }}><UserPlus size={16} /> +1</button>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Users size={20} color="var(--warning)" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Waiting Complex</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shortage Predicted</div>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ background: 'var(--warning)', color: '#92400e', border: 'none' }}>REALLOCATE 2</button>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--background)', marginTop: 'auto', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                            <TrendingUp size={18} /> EFFICIENCY IMPACT
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Proposed allocations will reduce peak wait by 25 minutes (30% improvement).
                        </p>
                    </div>
                </div>
            </div>

            {/* Behavioral Nudges to Staff */}
            <div className="card" style={{ background: 'var(--text-main)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                    <AlertCircle size={32} color="var(--warning)" />
                    <div>
                        <h4 style={{ margin: 0 }}>Predictive Staff Nudge</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                            Upcoming shift (16:00) has a high probability of surge. Recommend voluntary 1h overtime for 4 nurses to stabilize the transition.
                        </p>
                    </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>POST ANNOUNCEMENT</button>
            </div>
        </div>
    );
};

export default QueueManagement;
