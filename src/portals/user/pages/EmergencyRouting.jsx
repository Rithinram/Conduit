import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHospitals, getUrgencyColor } from '../../../services/api';
import { AlertCircle, Navigation, Phone, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyRouting = () => {
    const [isEmergencyActive, setIsEmergencyActive] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [impactMetrics, setImpactMetrics] = useState({ queueIncrease: 2, loadShift: 0.5 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getHospitals();
            setHospitals(data);
            if (data.length > 0) setSelectedHospital(data[0]);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading || !selectedHospital) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '20px' }}>
                <AlertCircle className="pulse-alert" size={48} color="var(--danger)" />
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>SCANNING REGIONAL NODES...</div>
            </div>
        );
    }

    const handleSOS = () => {
        setIsEmergencyActive(true);
        // In a real app, this would trigger backend logic to find best route
    };

    return (
        <div className="emergency-routing-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-lg)', height: 'calc(100vh - 180px)' }}>
            {/* Left Column: Action & Map */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <AnimatePresence mode="wait">
                    {!isEmergencyActive ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0 }}
                            className="card glass"
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 'var(--space-xl)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    style={{
                                        position: 'absolute',
                                        inset: -20,
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        borderRadius: '50%',
                                        zIndex: 0
                                    }}
                                />
                                <button
                                    onClick={handleSOS}
                                    className="btn-danger"
                                    style={{
                                        width: '180px',
                                        height: '180px',
                                        borderRadius: '50%',
                                        fontSize: '1.5rem',
                                        fontWeight: 800,
                                        boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
                                        border: '8px solid rgba(255,255,255,0.3)',
                                        cursor: 'pointer',
                                        zIndex: 1,
                                        position: 'relative'
                                    }}
                                >
                                    SOS 🚨
                                </button>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Medical Emergency?</h2>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
                                    Tap the button to instantly route to the nearest available hospital with optimal capacity.
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="card"
                            style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}
                        >
                            <MapContainer
                                center={selectedHospital.location}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={selectedHospital.location}>
                                    <Popup>{selectedHospital.name}</Popup>
                                </Marker>
                                <Circle
                                    center={selectedHospital.location}
                                    radius={500}
                                    pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.1 }}
                                />
                            </MapContainer>

                            <div style={{ position: 'absolute', bottom: 'var(--space-lg)', left: 'var(--space-lg)', right: 'var(--space-lg)', zIndex: 1000 }}>
                                <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Routing to {selectedHospital.name}</h3>
                                        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Distance: {selectedHospital.distance}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>ETA: 8 mins</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-primary"><Navigation size={18} /> OPEN MAPS</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Column: Status & Impact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {/* Hospital Status */}
                <div className="card">
                    <h4 style={{ margin: '0 0 var(--space-md) 0' }}>Nearest Facilities</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {hospitals.map(h => (
                            <div
                                key={h.id}
                                onClick={() => setSelectedHospital(h)}
                                style={{
                                    padding: 'var(--space-sm)',
                                    border: `2px solid ${selectedHospital.id === h.id ? 'var(--primary)' : 'transparent'}`,
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--background)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</span>
                                    <span className={`badge badge-${h.status === 'stable' ? 'success' : h.status === 'moderate' ? 'warning' : 'danger'}`}>
                                        {h.status.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    ER Wait: {h.erWaitTime} min • ICU: {h.icuAvailability}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Infrastructure Impact Analyzer */}
                <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                        <Zap size={20} color="var(--warning)" />
                        <h4 style={{ margin: 0 }}>Impact Analyzer</h4>
                    </div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 'var(--space-lg)' }}>
                        Predictive analysis of how your admission affects {selectedHospital.name} infrastructure.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ER Queue Shift</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>+{impactMetrics.queueIncrease} mins <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>▲</span></div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>System Load Factor</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>+{impactMetrics.loadShift}% <span style={{ fontSize: '0.7rem', color: 'var(--warning)' }}>▲</span></div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-sm)', borderLeft: '3px solid var(--primary)', background: 'rgba(37, 99, 235, 0.1)', fontSize: '0.75rem' }}>
                        <Info size={14} style={{ marginBottom: '4px' }} />
                        Load balancing active. System is rerouting non-critical patients to maintain your care quality.
                    </div>
                </div>

                <button className="btn" style={{ background: 'var(--surface-border)', width: '100%', height: '50px' }}>
                    <Phone size={18} /> CALL AMBULANCE
                </button>
            </div>
        </div>
    );
};

export default EmergencyRouting;
