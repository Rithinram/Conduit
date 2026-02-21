import React, { useState, useEffect, useRef } from 'react';
import { getHospitals, getUrgencyColor } from '../../../services/api';
import { Search, MapPin, Clock, Bed, ArrowRight, TrendingDown, TrendingUp, Filter, Info, Star, Activity, X, Navigation, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Component to fix Leaflet gray tiles issue
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
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

const HospitalSelector = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hospitals, setHospitals] = useState([
        {
            id: 'h1',
            name: 'City Premier Trauma Center',
            location: [12.9716, 77.5946],
            distance: '1.2 km',
            status: 'danger',
            erWaitTime: 45,
            icuAvailability: 2,
            occupancy: 94,
            loadTrend: 'increasing',
            rating: 4.8
        },
        {
            id: 'h2',
            name: 'St. Mary\'s General Hospital',
            location: [12.9800, 77.6000],
            distance: '3.5 km',
            status: 'moderate',
            erWaitTime: 18,
            icuAvailability: 12,
            occupancy: 65,
            loadTrend: 'stable',
            rating: 4.5
        },
        {
            id: 'h3',
            name: 'Nightingale Speciality Clinic',
            location: [12.9650, 77.5850],
            distance: '0.8 km',
            status: 'high',
            erWaitTime: 5,
            icuAvailability: 24,
            occupancy: 30,
            loadTrend: 'decreasing',
            rating: 4.9
        },
        {
            id: 'h4',
            name: 'Metro Cardiac Institute',
            location: [12.9750, 77.6100],
            distance: '5.2 km',
            status: 'moderate',
            erWaitTime: 25,
            icuAvailability: 8,
            occupancy: 72,
            loadTrend: 'increasing',
            rating: 4.2
        },
        {
            id: 'h5',
            name: 'Sunrise Children\'s Hospital',
            location: [12.9600, 77.6050],
            distance: '4.1 km',
            status: 'high',
            erWaitTime: 8,
            icuAvailability: 18,
            occupancy: 45,
            loadTrend: 'stable',
            rating: 4.7
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        icu: false,
        lowWait: false,
        highRating: false
    });

    // Routing state
    const [routingHospital, setRoutingHospital] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [userPosition, setUserPosition] = useState(null);
    const [routePoints, setRoutePoints] = useState([]);
    const [trackingStep, setTrackingStep] = useState(0);
    const [arrived, setArrived] = useState(false);
    const [etaSeconds, setEtaSeconds] = useState(0);
    const [distanceLeft, setDistanceLeft] = useState(0);
    const trackingRef = useRef(null);

    const FAKE_USER_OFFSET = [0.008, 0.012];

    const getStatusColor = (status) => {
        switch (status) {
            case 'danger': return 'var(--danger)';
            case 'moderate': return '#FACC15'; // Yellow
            case 'high': return 'var(--secondary)'; // Green
            default: return 'var(--primary)';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'danger': return 'CRITICAL LOAD';
            case 'moderate': return 'MODERATE CASELOAD';
            case 'high': return 'HIGH AVAILABILITY';
            default: return status.toUpperCase();
        }
    };

    useEffect(() => {
        // Mocking API fetch delay
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 800);
    }, []);

    const filteredHospitals = hospitals.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
        // For demonstration, we keep 5 mock hospitals but can "highlight" them based on filters
        return matchesSearch;
    });

    const generateRoute = (start, end, steps = 30) => {
        const points = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const curve = Math.cos(t * Math.PI) * 0.002;
            const lat = start[0] + (end[0] - start[0]) * t + curve;
            const lng = start[1] + (end[1] - start[1]) * t + curve * 0.5;
            points.push([lat, lng]);
        }
        return points;
    };

    const handleCommenceRouting = (hospital) => {
        const hospitalLoc = hospital.location;
        const userLoc = [hospitalLoc[0] + FAKE_USER_OFFSET[0], hospitalLoc[1] + FAKE_USER_OFFSET[1]];
        const route = generateRoute(userLoc, hospitalLoc, 40);

        // Mock distance: ~2.5km total
        const totalDistance = 2.5;

        setRoutingHospital(hospital);
        setUserPosition(userLoc);
        setRoutePoints(route);
        setTrackingStep(0);
        setIsTracking(true);
        setArrived(false);
        setEtaSeconds(route.length * 1.5);
        setDistanceLeft(totalDistance);

        let step = 0;
        if (trackingRef.current) clearInterval(trackingRef.current);
        trackingRef.current = setInterval(() => {
            step++;
            if (step >= route.length) {
                clearInterval(trackingRef.current);
                trackingRef.current = null;
                setArrived(true);
                setEtaSeconds(0);
                setDistanceLeft(0);
                return;
            }
            setTrackingStep(step);
            setUserPosition(route[step]);
            setEtaSeconds(prev => Math.max(0, prev - 1.5));
            setDistanceLeft(prev => Math.max(0, prev - (totalDistance / route.length)));
        }, 1500);
    };

    const userIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: #2563eb; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(37,99,235,0.6);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const hospitalIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: #E63946; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 12px rgba(230,57,70,0.6);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    const formatEta = (seconds) => {
        const s = Math.round(seconds);
        return s > 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;
    };

    const progressPercent = routePoints.length > 0 ? Math.round((trackingStep / (routePoints.length - 1)) * 100) : 0;

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
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn glass elevation-hover"
                    style={{
                        padding: '0 24px',
                        height: '56px',
                        borderRadius: '16px',
                        background: showFilters ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: showFilters ? 'white' : 'var(--text-main)',
                        border: '1px solid var(--primary-light)'
                    }}
                >
                    <Filter size={20} /> Advanced Filters
                </button>
            </motion.div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="card glass" style={{
                            padding: 'var(--space-md)',
                            display: 'flex',
                            gap: 'var(--space-md)',
                            flexWrap: 'wrap',
                            background: 'rgba(255,255,255,0.4)',
                            border: '1px dashed var(--primary-light)'
                        }}>
                            {[
                                { id: 'icu', label: 'High ICU Availability (>30%)', icon: Bed },
                                { id: 'lowWait', label: 'Short Wait Times (<20m)', icon: Clock },
                                { id: 'highRating', label: 'Top Rated (4.5+ ★)', icon: Star }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilters(prev => ({ ...prev, [filter.id]: !prev[filter.id] }))}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '10px 18px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--surface-border)',
                                        background: activeFilters[filter.id] ? 'var(--primary)' : 'white',
                                        color: activeFilters[filter.id] ? 'white' : 'var(--text-main)',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <filter.icon size={16} /> {filter.label}
                                </button>
                            ))}
                            <button
                                onClick={() => setActiveFilters({ icu: false, lowWait: false, highRating: false })}
                                style={{
                                    marginLeft: 'auto',
                                    padding: '10px 18px',
                                    borderRadius: '12px',
                                    background: 'transparent',
                                    border: '1px solid var(--danger)',
                                    color: 'var(--danger)',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Reset All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            border: hoveredIndex === index ? `2px solid ${getStatusColor(hospital.status)}` : '1px solid var(--surface-border)'
                        }}
                    >
                        {/* Status Glow Header */}
                        <div style={{
                            height: '6px',
                            background: getStatusColor(hospital.status),
                            boxShadow: `0 2px 10px ${getStatusColor(hospital.status)}40`
                        }} />

                        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                                        {hospital.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                                        <MapPin size={14} color="var(--primary)" /> {hospital.distance} • <Star size={14} color="#FACC15" fill="#FACC15" /> {hospital.rating || '4.8'} Rating
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`badge ${hospital.status === 'danger' ? 'pulse-critical' : ''}`} style={{
                                        background: `${getStatusColor(hospital.status)}15`,
                                        color: getStatusColor(hospital.status),
                                        padding: '6px 14px',
                                        border: `1px solid ${getStatusColor(hospital.status)}40`
                                    }}>
                                        {getStatusLabel(hospital.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Dynamic Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                {[
                                    { icon: Clock, label: 'ER WAIT', value: `${hospital.erWaitTime}m`, color: 'var(--primary)' },
                                    { icon: Bed, label: 'ICU FREE', value: hospital.icuAvailability, color: 'var(--secondary)' },
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
                                            style={{ height: '100%', background: getStatusColor(hospital.status), borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                                {hospital.loadTrend === 'decreasing' ? <TrendingDown size={24} color="var(--secondary)" /> : <TrendingUp size={24} color="var(--danger)" />}
                            </div>

                            {/* Intelligent Recommendation */}
                            <div style={{
                                background: hospital.status === 'danger' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                                padding: '16px',
                                borderRadius: '16px',
                                borderLeft: `6px solid ${getStatusColor(hospital.status)}`,
                                fontSize: '0.88rem'
                            }}>
                                <div style={{ fontWeight: 900, marginBottom: '6px', color: getStatusColor(hospital.status), display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Info size={18} /> SMART RECOMMENDATION ENGINE
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-main)', opacity: 0.8, fontWeight: 500 }}>
                                    {hospital.status === 'danger'
                                        ? `High load saturation. Our routing engine suggests ${hospitals.find(h => h.status === 'high')?.name || 'Nightingale Clinic'} for 40% faster intake.`
                                        : `Optimal clinical performance. This facility has significant trauma capacity available currently.`
                                    }
                                </p>
                            </div>

                            <motion.button
                                onClick={() => handleCommenceRouting(hospital)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    background: getStatusColor(hospital.status),
                                    boxShadow: `0 8px 30px ${getStatusColor(hospital.status)}40`
                                }}
                            >
                                COMMENCE ROUTING PROTOCOL <ArrowRight size={22} />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Routing Map Overlay */}
            <AnimatePresence>
                {routingHospital && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '5vw',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.9 }}
                            animate={{ y: 0, scale: 1 }}
                            exit={{ y: 50, scale: 0.9 }}
                            className="card"
                            style={{
                                width: '90vw',
                                height: '80vh',
                                padding: 0,
                                position: 'relative',
                                background: 'white',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ padding: '20px 30px', background: 'white', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>ROUTING PROTOCOL ACTIVE</h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target: {routingHospital.name}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (trackingRef.current) clearInterval(trackingRef.current);
                                        setRoutingHospital(null);
                                    }}
                                    style={{ background: 'var(--background)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <X size={20} color="var(--text-main)" />
                                </button>
                            </div>

                            <div style={{ flex: 1, position: 'relative' }}>
                                <MapContainer
                                    center={routingHospital.location}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapResizer />

                                    {isTracking && userPosition && (
                                        <MapRecenter center={[
                                            (userPosition[0] + routingHospital.location[0]) / 2,
                                            (userPosition[1] + routingHospital.location[1]) / 2
                                        ]} zoom={14} />
                                    )}

                                    {isTracking && routePoints.length > 0 && (
                                        <>
                                            <Polyline positions={routePoints} pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.6, dashArray: '10 6' }} />
                                            <Polyline positions={routePoints.slice(0, trackingStep + 1)} pathOptions={{ color: '#2563eb', weight: 6, opacity: 1 }} />
                                        </>
                                    )}

                                    {isTracking && userPosition && (
                                        <Marker position={userPosition} icon={userIcon}>
                                            <Popup>Current Location</Popup>
                                        </Marker>
                                    )}

                                    <Marker position={routingHospital.location} icon={hospitalIcon}>
                                        <Popup>{routingHospital.name}</Popup>
                                    </Marker>

                                    <Circle
                                        center={routingHospital.location}
                                        radius={400}
                                        pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.1 }}
                                    />
                                </MapContainer>

                                {/* Tracking HUD Overlay */}
                                <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', zIndex: 1000 }}>
                                    <div className="glass" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.9)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px', marginBottom: '4px' }}>
                                                    {arrived ? 'ARRIVAL DETECTED' : 'REAL-TIME TRACKING ACTIVE'}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {arrived ? <CheckCircle2 size={28} color="var(--success)" /> : <Navigation size={28} className="pulse-alert" color="var(--primary)" />}
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                                                        {arrived
                                                            ? 'Destination Reached'
                                                            : `ETA: ${formatEta(etaSeconds)} • ${distanceLeft.toFixed(2)} km left`
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>LIVE SYNC</div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{progressPercent}%</div>
                                            </div>
                                        </div>

                                        <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div
                                                animate={{ width: `${progressPercent}%` }}
                                                style={{ height: '100%', background: arrived ? 'var(--success)' : 'var(--primary)', borderRadius: '10px' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Arrival Alert Overlay */}
                                <AnimatePresence>
                                    {arrived && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="glass"
                                            style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 1001,
                                                padding: '40px',
                                                borderRadius: '30px',
                                                textAlign: 'center',
                                                background: 'rgba(5, 150, 105, 0.95)',
                                                color: 'white',
                                                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}
                                        >
                                            <motion.div
                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                <CheckCircle2 size={80} style={{ marginBottom: '20px' }} />
                                            </motion.div>
                                            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 10px 0' }}>Arrival Confirmed</h2>
                                            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>Welcome to {routingHospital.name}.<br />Intake team has been alert.</p>
                                            <button
                                                onClick={() => setRoutingHospital(null)}
                                                className="btn"
                                                style={{ marginTop: '30px', background: 'white', color: 'var(--success)', border: 'none', padding: '12px 30px', fontWeight: 800, borderRadius: '12px' }}
                                            >
                                                CLOSE DISPATCH
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HospitalSelector;
