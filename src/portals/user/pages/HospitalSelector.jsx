import React, { useState, useEffect } from 'react';
import { getHospitals, getUrgencyColor } from '../../../services/api';
import { Search, MapPin, Clock, Bed, ArrowRight, TrendingDown, TrendingUp, Filter, Info, Star, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HospitalSelector = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);
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

    const filteredHospitals = hospitals.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Search & Intelligence Bar */}
            <motion.div
                layout
                className="dynamic-card glass"
                style={{
                    display: 'flex',
                    gap: 'var(--space-md)',
                    alignItems: 'center',
                    padding: 'var(--space-md)',
                    border: '1px solid var(--primary-light)'
                }}
            >
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6 }} />
                    <input
                        type="text"
                        placeholder="Search for critical care, trauma centers, or local clinics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '16px 20px 16px 50px',
                            borderRadius: '16px',
                            border: '1px solid var(--surface-border)',
                            background: 'var(--surface)',
                            outline: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            transition: 'all 0.3s ease'
                        }}
                    />
                </div>
                <button className="btn glass elevation-hover" style={{ padding: '0 24px', height: '56px', borderRadius: '16px' }}>
                    <Filter size={20} /> Advanced Filters
                </button>
            </motion.div>

            {/* Smart Comparison Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: 'var(--space-xl)',
                minHeight: '400px'
            }}>
                {isLoading ? (
                    <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div className="pulse-critical" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', border: '4px solid var(--primary)' }} />
                        <div style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>INITIALIZING REGIONAL DATA SYNC...</div>
                    </div>
                ) : filteredHospitals.map((hospital, index) => (
                    <motion.div
                        key={hospital.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onHoverStart={() => setHoveredIndex(index)}
                        onHoverEnd={() => setHoveredIndex(null)}
                        className="dynamic-card"
                        style={{
                            padding: 0,
                            border: hoveredIndex === index ? `2px solid ${getUrgencyColor(hospital.status)}` : '1px solid var(--surface-border)'
                        }}
                    >
                        {/* Status Glow Header */}
                        <div style={{
                            height: '6px',
                            background: getUrgencyColor(hospital.status),
                            boxShadow: `0 2px 10px ${getUrgencyColor(hospital.status)}40`
                        }} />

                        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                                        {hospital.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                                        <MapPin size={14} color="var(--primary)" /> {hospital.distance} • <Star size={14} color="#FACC15" fill="#FACC15" /> 4.8 Rating
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge ${hospital.status === 'critical' ? 'pulse-critical' : ''}`} style={{
                                        background: `${getUrgencyColor(hospital.status)}15`,
                                        color: getUrgencyColor(hospital.status),
                                        padding: '6px 14px'
                                    }}>
                                        {hospital.status}
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {[
                                    { icon: Clock, label: 'ER WAIT', value: `${hospital.erWaitTime}m`, color: 'var(--primary)' },
                                    { icon: Bed, label: 'ICU FREE', value: `${hospital.icuAvailability}%`, color: 'var(--secondary)' },
                                    { icon: Activity, label: 'TOTAL LOAD', value: `${hospital.occupancy}%`, color: 'var(--accent)' }
                                ].map((stat, i) => (
                                    <div key={i} className="glass" style={{
                                        padding: '12px',
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                        background: 'var(--background)',
                                        border: '1px solid var(--surface-border)'
                                    }}>
                                        <stat.icon size={20} color={stat.color} style={{ marginBottom: '6px' }} />
                                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Load Trend Visualization */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--background)', padding: '12px', borderRadius: '14px', border: '1px solid var(--surface-border)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>PROJECTED LOAD TRAJECTORY</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: hospital.loadTrend === 'decreasing' ? 'var(--secondary)' : 'var(--danger)' }}>
                                            {hospital.loadTrend.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${hospital.occupancy}%` }}
                                            style={{ height: '100%', background: getUrgencyColor(hospital.status), borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                                {hospital.loadTrend === 'decreasing' ? <TrendingDown size={24} color="var(--secondary)" /> : <TrendingUp size={24} color="var(--danger)" />}
                            </div>

                            {/* Intelligent Recommendation */}
                            <div style={{
                                background: hospital.status === 'critical' ? 'var(--danger-bg)' : 'var(--success-bg)',
                                padding: '16px',
                                borderRadius: '16px',
                                borderLeft: `6px solid ${getUrgencyColor(hospital.status)}`,
                                fontSize: '0.88rem'
                            }}>
                                <div style={{ fontWeight: 900, marginBottom: '6px', color: getUrgencyColor(hospital.status), display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={18} /> SMART RECOMMENDATION ENGINE
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-main)', opacity: 0.8, fontWeight: 500 }}>
                                    {hospital.status === 'critical'
                                        ? `Critical saturation. Our routing engine suggests ${filteredHospitals[0].name} for 40% faster intake.`
                                        : `Optimal performance. Clinical throughput exceeds regional average by 15%.`
                                    }
                                </p>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    background: getUrgencyColor(hospital.status),
                                    boxShadow: `0 8px 30px ${getUrgencyColor(hospital.status)}30`
                                }}
                            >
                                COMMENCE ROUTING PROTOCOL <ArrowRight size={22} />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HospitalSelector;
