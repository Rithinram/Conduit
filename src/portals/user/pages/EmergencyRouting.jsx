import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHospitals, getUrgencyColor } from '../../../services/api';
import { AlertCircle, Navigation, Phone, Zap, Info, MapPin, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';

// Component to fix Leaflet gray tiles issue
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }, [map]);
    return null;
};

// Component to recenter map when tracking starts
const MapRecenter = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, zoom || 14, { duration: 1.5 });
    }, [center, zoom]);
    return null;
};

const EmergencyRouting = () => {
    const [isEmergencyActive, setIsEmergencyActive] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [impactMetrics, setImpactMetrics] = useState({ queueIncrease: 2, loadShift: 0.5 });
    const [isLoading, setIsLoading] = useState(true);
    const [ambulanceNotif, setAmbulanceNotif] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [userPosition, setUserPosition] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [trackingStep, setTrackingStep] = useState(0);
    const [arrived, setArrived] = useState(false);
    const [etaSeconds, setEtaSeconds] = useState(0);
    const trackingRef = useRef(null);
    const navigate = useNavigate();

    // Fake user location offset from hospital
    const FAKE_USER_OFFSET = [0.012, -0.015];

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

    useEffect(() => {
        return () => { if (trackingRef.current) clearInterval(trackingRef.current); };
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
        setIsTracking(false);
        setArrived(false);
        setTrackingStep(0);
    };

    const handleCallAmbulance = () => {
        setAmbulanceNotif(true);
        window.location.href = 'tel:108';
        setTimeout(() => setAmbulanceNotif(false), 6000);
    };

    const generateRoute = (start, end, steps = 30) => {
        const points = [];
        // Create a slightly curved route with waypoints
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const curve = Math.sin(t * Math.PI) * 0.003; // slight curve
            const lat = start[0] + (end[0] - start[0]) * t + curve;
            const lng = start[1] + (end[1] - start[1]) * t - curve * 0.5;
            points.push([lat, lng]);
        }
        return points;
    };

    const handleOpenMaps = () => {
        const hospitalLoc = selectedHospital.location;
        const userLoc = [hospitalLoc[0] + FAKE_USER_OFFSET[0], hospitalLoc[1] + FAKE_USER_OFFSET[1]];
        const route = generateRoute(userLoc, hospitalLoc, 40);

        setUserPosition(userLoc);
        setRoutePoints(route);
        setTrackingStep(0);
        setIsTracking(true);
        setArrived(false);
        setEtaSeconds(route.length * 2);

        // Animate the user marker along the route
        let step = 0;
        if (trackingRef.current) clearInterval(trackingRef.current);
        trackingRef.current = setInterval(() => {
            step++;
            if (step >= route.length) {
                clearInterval(trackingRef.current);
                trackingRef.current = null;
                setArrived(true);
                setEtaSeconds(0);
                return;
            }
            setTrackingStep(step);
            setUserPosition(route[step]);
            setEtaSeconds(prev => Math.max(0, prev - 2));
        }, 2000);
    };

    const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background: #2563eb;
            width: 16px; height: 16px;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(37,99,235,0.6);
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const hospitalIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background: #E63946;
            width: 16px; height: 16px;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(230,57,70,0.6);
        "></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const formatEta = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };

    const progressPercent = routePoints.length > 0 ? Math.round((trackingStep / (routePoints.length - 1)) * 100) : 0;

    return (
        <div className="emergency-routing-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-lg)', height: 'calc(100vh - 180px)' }}>
            {/* Ambulance Notification Banner */}
            <AnimatePresence>
                {ambulanceNotif && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        style={{
                            gridColumn: 'span 2',
                            background: 'linear-gradient(135deg, #E63946 0%, #c1121f 100%)',
                            color: 'white',
                            padding: '14px 24px',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 6px 20px rgba(230, 57, 70, 0.4)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                                <Phone size={20} />
                            </motion.div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: '0.95rem' }}>🚨 DIALING 108 — Ambulance & Police Notified</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Emergency services are being contacted. Stay calm.</div>
                            </div>
                        </div>
                        <button onClick={() => setAmbulanceNotif(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Arrival Notification */}
            <AnimatePresence>
                {arrived && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        style={{
                            gridColumn: 'span 2',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: 'white',
                            padding: '14px 24px',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%' }}>
                                <CheckCircle2 size={24} />
                            </motion.div>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: '1rem' }}>✅ DESTINATION REACHED — {selectedHospital.name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>You have arrived. Proceed to the Emergency Room entrance.</div>
                            </div>
                        </div>
                        <button onClick={() => setArrived(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                maxHeight: '440px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                gap: 'var(--space-xl)',
                                padding: 'var(--space-xxl) var(--space-xl)',
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
                            style={{
                                flex: 1,
                                minHeight: '400px',
                                padding: 0,
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <MapContainer
                                center={selectedHospital.location}
                                zoom={14}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapResizer />

                                {/* Recenter map when tracking starts */}
                                {isTracking && userPosition && (
                                    <MapRecenter center={[
                                        (userPosition[0] + selectedHospital.location[0]) / 2,
                                        (userPosition[1] + selectedHospital.location[1]) / 2
                                    ]} zoom={14} />
                                )}

                                {/* Route polyline */}
                                {isTracking && routePoints.length > 0 && (
                                    <>
                                        <Polyline positions={routePoints} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '10 6' }} />
                                        {/* Traveled portion */}
                                        <Polyline positions={routePoints.slice(0, trackingStep + 1)} pathOptions={{ color: '#2563eb', weight: 5, opacity: 1 }} />
                                    </>
                                )}

                                {/* User marker */}
                                {isTracking && userPosition && (
                                    <Marker position={userPosition} icon={userIcon}>
                                        <Popup>Your Location</Popup>
                                    </Marker>
                                )}

                                {/* Hospital marker */}
                                <Marker position={selectedHospital.location} icon={hospitalIcon}>
                                    <Popup>{selectedHospital.name}</Popup>
                                </Marker>

                                <Circle
                                    center={selectedHospital.location}
                                    radius={500}
                                    pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.1 }}
                                />
                            </MapContainer>

                            {/* Bottom Overlay */}
                            <div style={{ position: 'absolute', bottom: 'var(--space-lg)', left: 'var(--space-lg)', right: 'var(--space-lg)', zIndex: 1000 }}>
                                <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)' }}>
                                    {!isTracking ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Routing to {selectedHospital.name}</h3>
                                                <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Distance: {selectedHospital.distance}</span>
                                                    <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>ETA: 8 mins</span>
                                                </div>
                                            </div>
                                            <button onClick={handleOpenMaps} className="btn btn-primary"><Navigation size={18} /> OPEN MAPS</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                                        {arrived ? '✅ ARRIVED' : '🔵 TRACKING LIVE'}
                                                    </div>
                                                    <h3 style={{ margin: '2px 0 0 0', fontSize: '0.95rem' }}>{selectedHospital.name}</h3>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ETA</div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: arrived ? 'var(--success)' : 'var(--primary)' }}>
                                                        {arrived ? 'Arrived' : formatEta(etaSeconds)}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div style={{ height: '6px', background: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <motion.div
                                                    animate={{ width: `${progressPercent}%` }}
                                                    style={{ height: '100%', background: arrived ? 'var(--success)' : 'var(--primary)', borderRadius: '3px' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Your location</span>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: arrived ? 'var(--success)' : 'var(--text-muted)' }}>{progressPercent}%</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedHospital.name}</span>
                                            </div>
                                        </div>
                                    )}
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

                <button onClick={handleCallAmbulance} className="btn" style={{ background: 'var(--danger)', color: 'white', width: '100%', height: '50px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                    <Phone size={18} /> CALL AMBULANCE (108)
                </button>
                <Link to="/user/selector" className="btn" style={{ background: 'var(--primary)', color: 'white', width: '100%', height: '50px', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)' }}>
                    <MapPin size={18} /> NEAREST FACILITY
                </Link>
            </div>
        </div>
    );
};

export default EmergencyRouting;

