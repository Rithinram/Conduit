import React, { useState, useEffect } from 'react';
import { getHospitals } from '../../../services/api';
import { MapPin, ArrowRight, Navigation, Clock, Activity, CornerUpRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ReferralOptimization = () => {
    const [hospitals, setHospitals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHospitals = async () => {
            setIsLoading(true);
            const data = await getHospitals();
            setHospitals(data);
            setIsLoading(false);
        };
        fetchHospitals();
    }, []);

    if (isLoading || hospitals.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '20px' }}>
                <Activity className="pulse-alert" size={48} color="var(--primary)" />
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>CALCULATING OPTIMAL PATHS...</div>
            </div>
        );
    }

    // Identify a critical hospital (or highest occupancy) and its alternates
    const sortedHospitals = [...hospitals].sort((a, b) => b.occupancy - a.occupancy);
    const currentHospital = sortedHospitals[0];
    const alternateHospitals = sortedHospitals.slice(1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Current Selection Status */}
            <div className="card glass" style={{ borderLeft: '4px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Activity size={14} /> CAPACITY ALERT: CRITICAL
                        </div>
                        <h2 style={{ margin: 'var(--space-xs) 0' }}>{currentHospital.name}</h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Wait times currently exceed 2 hours for non-critical cases.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentHospital.occupancy}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Load</div>
                    </div>
                </div>
            </div>

            {/* Reroute Suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <h3 style={{ margin: 0 }}>Smart Reroute Recommendations</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    The system has identified less-loaded facilities to ensure you receive care faster.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-lg)', marginTop: 'var(--space-sm)' }}>
                    {alternateHospitals.map((h, i) => (
                        <motion.div
                            key={h.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card"
                            style={{ display: 'flex', gap: 'var(--space-lg)', border: '1px solid var(--primary-light)' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{h.name}</h4>
                                    <span className="badge badge-success">STABLE</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={16} color="var(--primary)" />
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ER Wait</div>
                                            <div style={{ fontWeight: 600 }}>{h.erWaitTime} mins</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} color="var(--primary)" />
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Additional Travel</div>
                                            <div style={{ fontWeight: 600 }}>+5 mins</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: 'var(--space-sm)', fontSize: '0.8rem', marginTop: 'var(--space-sm)' }}>
                                    <CornerUpRight size={14} style={{ verticalAlign: 'text-top', marginRight: '4px' }} />
                                    <strong>Time Saved:</strong> You will be seen ~1 hour 15 mins earlier here.
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', justifyContent: 'center' }}>
                                <button className="btn btn-primary">REROUTE HERE</button>
                                <button className="btn glass"><Navigation size={16} /> MAP</button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Impact Statement */}
            <div className="card" style={{ background: 'var(--text-main)', color: 'white', display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
                    <Info size={32} color="var(--primary-light)" />
                </div>
                <div>
                    <h4 style={{ margin: 0, color: 'var(--primary-light)' }}>Why Reroute?</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
                        City-wide load balancing reduces overall mortality by 14% during peak hours. By choosing a stable facility, you help keep {currentHospital.name} clear for extreme life-threat emergencies.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReferralOptimization;
