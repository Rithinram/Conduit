import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ArrowRight, Navigation, Clock, Activity, CornerUpRight, Info, CheckCircle2, ChevronLeft, Building2, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Mock Data ---
const currentFacility = {
    id: 'cf1',
    name: 'Apollo Hospitals – Greams Road',
    occupancy: 92,
    erWaitTime: 135,
    location: [13.0569, 80.2497],
    status: 'critical'
};

const alternateFacilities = [
    {
        id: 'af1',
        name: 'Sri Ramachandra Medical Centre',
        occupancy: 48,
        erWaitTime: 18,
        additionalTravel: 7,
        timeSaved: '~1 hour 15 mins',
        status: 'stable',
        location: [13.0500, 80.2100],
        crowdIncrease: 6.2
    },
    {
        id: 'af2',
        name: 'SIMS Hospital',
        occupancy: 55,
        erWaitTime: 22,
        additionalTravel: 5,
        timeSaved: '~1 hour 10 mins',
        status: 'stable',
        location: [13.0330, 80.2620],
        crowdIncrease: 4.8
    },
    {
        id: 'af3',
        name: 'Government General Hospital',
        occupancy: 61,
        erWaitTime: 30,
        additionalTravel: 6,
        timeSaved: '~55 mins',
        status: 'moderate',
        location: [13.0800, 80.2750],
        crowdIncrease: 7.5
    }
];

// --- Map Helpers ---
const createIcon = (color) => L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});

const MapRecenter = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, zoom || 13, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
};

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 300);
    }, [map]);
    return null;
};

// Animated marker for routing simulation
const AnimatedMarker = ({ routeCoords, onArrival }) => {
    const map = useMap();
    const markerRef = useRef(null);
    const idxRef = useRef(0);

    useEffect(() => {
        if (!routeCoords || routeCoords.length < 2) return;
        const icon = L.divIcon({
            html: `<div style="width:16px;height:16px;background:var(--primary);border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.4);animation:pulse-ring 1s ease-out infinite"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            className: ''
        });
        const marker = L.marker(routeCoords[0], { icon }).addTo(map);
        markerRef.current = marker;
        idxRef.current = 0;

        const interval = setInterval(() => {
            idxRef.current += 1;
            if (idxRef.current >= routeCoords.length) {
                clearInterval(interval);
                if (onArrival) onArrival();
                return;
            }
            marker.setLatLng(routeCoords[idxRef.current]);
            map.panTo(routeCoords[idxRef.current], { animate: true, duration: 0.3 });
        }, 120);

        return () => {
            clearInterval(interval);
            if (markerRef.current) map.removeLayer(markerRef.current);
        };
    }, [routeCoords, map, onArrival]);

    return null;
};

// Generate intermediate route points between two locations
const generateRoute = (start, end, steps = 30) => {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Add a slight curve 
        const midLat = (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.005;
        const midLng = (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 0.005;
        const lat = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * midLat + t * t * end[0];
        const lng = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * midLng + t * t * end[1];
        points.push([lat, lng]);
    }
    return points;
};

const getStatusBadge = (status) => {
    if (status === 'stable') return { label: 'STABLE', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
    if (status === 'moderate') return { label: 'MODERATE', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
    return { label: 'CRITICAL', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
};


const ReferralOptimization = () => {
    const [reroutingTo, setReroutingTo] = useState(null); // hospital object being rerouted to
    const [routeCoords, setRouteCoords] = useState(null);
    const [arrived, setArrived] = useState(false);
    const [showMap, setShowMap] = useState(null); // hospital id to show map for (inline)

    const handleReroute = (hospital) => {
        const coords = generateRoute(currentFacility.location, hospital.location, 40);
        setRouteCoords(coords);
        setReroutingTo(hospital);
        setArrived(false);
    };

    const handleGoBack = () => {
        setReroutingTo(null);
        setRouteCoords(null);
        setArrived(false);
    };

    // --- REROUTING MAP VIEW ---
    if (reroutingTo) {
        const midLat = (currentFacility.location[0] + reroutingTo.location[0]) / 2;
        const midLng = (currentFacility.location[1] + reroutingTo.location[1]) / 2;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <button
                        onClick={handleGoBack}
                        className="btn glass"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                        <ChevronLeft size={18} /> Back
                    </button>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>
                            {arrived ? '✅ Reroute Complete' : '🔄 Rerouting in Progress...'}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {arrived
                                ? `You have arrived at ${reroutingTo.name}.`
                                : `Navigating from ${currentFacility.name} → ${reroutingTo.name}`
                            }
                        </p>
                    </div>
                </div>

                {/* Route Info Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--space-md)', alignItems: 'center' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--danger)', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Building2 size={16} color="var(--danger)" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>From (Critical)</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentFacility.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Load: {currentFacility.occupancy}%</div>
                    </div>

                    <motion.div animate={{ x: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                        <ArrowRight size={28} color="var(--primary)" />
                    </motion.div>

                    <div className="card" style={{ borderLeft: '4px solid #10b981', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Building2 size={16} color="#10b981" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>To (Stable)</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{reroutingTo.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Load: {reroutingTo.occupancy}%</div>
                    </div>
                </div>

                {/* Map */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', height: '420px' }}>
                    <MapContainer
                        center={[midLat, midLng]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <MapResizer />
                        <MapRecenter center={[midLat, midLng]} zoom={13} />
                        <Marker position={currentFacility.location} icon={createIcon('#ef4444')}>
                            <Popup>{currentFacility.name} (Current)</Popup>
                        </Marker>
                        <Marker position={reroutingTo.location} icon={createIcon('#10b981')}>
                            <Popup>{reroutingTo.name} (Destination)</Popup>
                        </Marker>
                        {routeCoords && (
                            <>
                                <Polyline positions={routeCoords} pathOptions={{ color: 'var(--primary)', weight: 4, dashArray: '8 6', opacity: 0.7 }} />
                                <AnimatedMarker routeCoords={routeCoords} onArrival={() => setArrived(true)} />
                            </>
                        )}
                    </MapContainer>
                </div>

                {/* Arrival confirmation */}
                <AnimatePresence>
                    {arrived && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card"
                            style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}
                        >
                            <CheckCircle2 size={36} color="#10b981" />
                            <div>
                                <h4 style={{ margin: 0, color: '#065f46' }}>Successfully Rerouted!</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#047857' }}>
                                    You've been redirected to <strong>{reroutingTo.name}</strong>. Estimated ER wait: <strong>{reroutingTo.erWaitTime} mins</strong>.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    }

    // --- MAIN VIEW ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Current Selection Status */}
            <div className="card glass" style={{ borderLeft: '4px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <AlertTriangle size={14} /> CAPACITY ALERT: CRITICAL
                        </div>
                        <h2 style={{ margin: 'var(--space-xs) 0' }}>{currentFacility.name}</h2>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Wait times currently exceed 2 hours for non-critical cases.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>{currentFacility.occupancy}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current Load</div>
                    </div>
                </div>
            </div>

            {/* Reroute Suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <h3 style={{ margin: 0 }}>Smart Reroute Recommendations</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    The system has identified less-loaded facilities to ensure you receive care faster.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-lg)', marginTop: 'var(--space-sm)' }}>
                    {alternateFacilities.map((h, i) => {
                        const badge = getStatusBadge(h.status);
                        return (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card"
                                style={{ border: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                                    <h4 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.3, flex: 1 }}>{h.name}</h4>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: badge.bg,
                                        color: badge.color,
                                        border: badge.border,
                                        whiteSpace: 'nowrap',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {badge.label}
                                    </span>
                                </div>

                                {/* Metrics */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Clock size={16} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>ER Wait</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{h.erWaitTime} mins</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <MapPin size={16} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Additional Travel</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>+{h.additionalTravel} mins</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => handleReroute(h)}
                                        className="btn btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px' }}
                                    >
                                        <Navigation size={15} /> REROUTE HERE
                                    </button>
                                    <button
                                        onClick={() => setShowMap(showMap === h.id ? null : h.id)}
                                        className="btn glass"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
                                    >
                                        <Navigation size={15} /> MAP
                                    </button>
                                </div>

                                {/* Inline mini-map */}
                                <AnimatePresence>
                                    {showMap === h.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 180, opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)' }}
                                        >
                                            <MapContainer
                                                center={h.location}
                                                zoom={13}
                                                style={{ height: '180px', width: '100%', borderRadius: 'var(--radius-md)' }}
                                                zoomControl={false}
                                                scrollWheelZoom={false}
                                            >
                                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                                <MapResizer />
                                                <Marker position={h.location} icon={createIcon('#10b981')}>
                                                    <Popup>{h.name}</Popup>
                                                </Marker>
                                                <Marker position={currentFacility.location} icon={createIcon('#ef4444')}>
                                                    <Popup>{currentFacility.name} (Current)</Popup>
                                                </Marker>
                                            </MapContainer>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Time saved info */}
                                <div style={{
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    lineHeight: 1.4
                                }}>
                                    <CornerUpRight size={16} style={{ flexShrink: 0 }} />
                                    <span><strong>Time Saved:</strong> You will be seen {h.timeSaved} earlier here.</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Infrastructure Impact Analyser */}
            <div className="card" style={{ border: '1px solid var(--surface-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BarChart3 size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Infrastructure Impact Analyser</h3>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Predicted crowd surge if you choose a facility</p>
                        </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', letterSpacing: '0.5px' }}>ANALYTICS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {alternateFacilities.map((h, i) => {
                        const newOccupancy = Math.min(100, h.occupancy + h.crowdIncrease);
                        const severityColor = h.crowdIncrease > 7 ? '#ef4444' : h.crowdIncrease > 5 ? '#f59e0b' : '#10b981';
                        const severityLabel = h.crowdIncrease > 7 ? 'HIGH' : h.crowdIncrease > 5 ? 'MODERATE' : 'LOW';
                        return (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.12 }}
                                style={{
                                    background: 'var(--background)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-md)',
                                    border: '1px solid var(--surface-border)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Building2 size={16} color="var(--text-muted)" />
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{h.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: `${severityColor}15`,
                                            color: severityColor,
                                            border: `1px solid ${severityColor}30`,
                                            letterSpacing: '0.3px'
                                        }}>{severityLabel} IMPACT</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: severityColor, fontWeight: 800, fontSize: '1rem' }}>
                                            <TrendingUp size={16} />
                                            +{h.crowdIncrease}%
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar showing current vs projected occupancy */}
                                <div style={{ position: 'relative', height: '28px', background: 'var(--surface-border)', borderRadius: '14px', overflow: 'hidden' }}>
                                    {/* Current occupancy */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${h.occupancy}%` }}
                                        transition={{ duration: 0.8, delay: i * 0.15 }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                                            borderRadius: '14px',
                                            zIndex: 2
                                        }}
                                    />
                                    {/* Projected increase  */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${newOccupancy}%` }}
                                        transition={{ duration: 1, delay: i * 0.15 + 0.3 }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            height: '100%',
                                            background: `${severityColor}30`,
                                            borderRadius: '14px',
                                            zIndex: 1
                                        }}
                                    />
                                    {/* Labels inside bar */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', zIndex: 3 }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{h.occupancy}% current</span>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)' }}>{newOccupancy.toFixed(1)}% projected</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span>Current ER Wait: {h.erWaitTime} mins</span>
                                    <span style={{ color: severityColor, fontWeight: 600 }}>Projected Wait: ~{Math.round(h.erWaitTime * (1 + h.crowdIncrease / 100))} mins</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* System-wide analytics summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                    <div style={{ textAlign: 'center', padding: 'var(--space-sm)', background: 'rgba(99, 102, 241, 0.06)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1' }}>3</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Facilities Analysed</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--space-sm)', background: 'rgba(245, 158, 11, 0.06)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>+{(alternateFacilities.reduce((sum, h) => sum + h.crowdIncrease, 0) / alternateFacilities.length).toFixed(1)}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg. Crowd Surge</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 'var(--space-sm)', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{alternateFacilities.filter(h => h.crowdIncrease <= 5).length}/{alternateFacilities.length}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Low Impact Options</div>
                    </div>
                </div>

                <div style={{ marginTop: 'var(--space-md)', padding: '10px 14px', background: 'rgba(99, 102, 241, 0.06)', borderRadius: '10px', borderLeft: '3px solid #6366f1', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <strong style={{ color: '#6366f1' }}>Analytics Insight:</strong> Choosing a lower-impact facility helps distribute patient load evenly across the network, reducing system-wide wait times by an estimated 12–18%.
                </div>
            </div>

            {/* Impact Statement */}
            <div className="card" style={{ background: 'var(--text-main)', color: 'white', display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Info size={28} color="var(--primary-light)" />
                </div>
                <div>
                    <h4 style={{ margin: 0, color: 'var(--primary-light)' }}>Why Reroute?</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.85, lineHeight: 1.5 }}>
                        City-wide load balancing reduces overall mortality by 14% during peak hours. By choosing a stable facility, you help keep {currentFacility.name} clear for extreme life-threat emergencies.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ReferralOptimization;
