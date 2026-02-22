import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { getHospitals, getSystemMetrics, getUrgencyColor, broadcastAlert, getSystemState } from '../../../services/api';
import { Activity, Map as MapIcon, ShieldAlert, BarChart3, Filter, Settings, Bell, Zap, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { predictLoad, isModelTrained, getSurgeLevel, getSurgeColor } from '../../../../conduit-ml';

const NetworkDashboard = () => {
    const [hospitals, setHospitals] = useState([]);
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [systemState, setSystemState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [overrideAction, setOverrideAction] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const [hospitalData, metricsData, stateData] = await Promise.all([
                getHospitals(),
                getSystemMetrics(),
                getSystemState()
            ]);

            // Enrich hospitals with ML predictions (Async)
            const now = new Date();
            const enriched = await Promise.all((hospitalData || []).map(async h => {
                const pred = await predictLoad(now.getHours(), now.getDay(), Math.round((h.occupancy || 50) / 5));
                const surgeLevel = getSurgeLevel(h.icuAvailability || h.occupancy || 50, h.erWaitTime || 0);
                return {
                    ...h,
                    mlPredictedWait: pred.predictedWaitTime,
                    mlSurgeLevel: surgeLevel
                };
            }));

            setHospitals(enriched);
            setSystemMetrics(metricsData);
            setSystemState(stateData);
            setIsLoading(false);
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Sync every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleOverride = async (type) => {
        setOverrideAction(type);

        if (type === 'redistribute') {
            // No specific alert, just redirect to the resource management
            setTimeout(() => navigate('/admin/resources'), 1500);
        } else if (type === 'triage') {
            setTimeout(() => navigate('/admin/policies'), 1500);
        } else if (type === 'alert') {
            // Real Backend Call to set global alert
            await broadcastAlert({
                message: "RED-LEVEL PROTOCOL: Regional Network Divert in place.",
                level: "Critical"
            });
            setTimeout(() => navigate('/admin/alerts'), 1500);
        }

        setTimeout(() => setOverrideAction(null), 3000);
    };

    if (isLoading || !systemMetrics) return <div>Synchronizing Regional Healthcare Network...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-lg)', height: 'calc(100vh - 180px)' }}>
            {/* City Map View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <AnimatePresence>
                    {systemState?.redistributionProtocolActive && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="card"
                            style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid var(--success)',
                                padding: '12px 20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderRadius: '12px',
                                marginBottom: 'var(--space-md)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="pulse-success" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
                                <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                                    ACTIVE REDISTRIBUTION PROTOCOL: REGIONAL NODES OPTIMIZING
                                </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>
                                LAST UPDATED: {new Date(systemState.lastUpdated).toLocaleTimeString()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}>
                    <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {hospitals.map(h => (
                            <Marker
                                key={h.id}
                                position={h.location}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `<div style="
                                        background-color: ${getUrgencyColor(h.status)};
                                        width: 14px;
                                        height: 14px;
                                        border: 2px solid white;
                                        border-radius: 50%;
                                        box-shadow: 0 0 15px ${getUrgencyColor(h.status)};
                                    " class="${h.status === 'critical' ? 'pulse-critical' : ''}"></div>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10]
                                })}
                            >
                                <Popup>
                                    <div className="tooltip-content" style={{ minWidth: '180px', padding: '10px' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>HOSPITAL NODE</div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: 'var(--primary)' }}>{h.name}</h4>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            <div style={{ background: 'var(--background)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                Wait: <strong>{h.erWaitTime}m</strong>
                                            </div>
                                            <div style={{ background: 'var(--background)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                ICU: <strong>{h.icuAvailability}%</strong>
                                            </div>
                                            {h.mlPredictedWait != null && (
                                                <div style={{ background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                                                    ML Wait: <strong>{h.mlPredictedWait}m</strong>
                                                </div>
                                            )}
                                        </div>
                                        <span className={`badge badge-${h.mlSurgeLevel === 'CRITICAL' ? 'danger' : h.mlSurgeLevel === 'WATCH' ? 'warning' : h.status === 'stable' ? 'success' : h.status === 'moderate' ? 'warning' : 'danger'}`} style={{ width: '100%', justifyContent: 'center' }}>
                                            {(h.mlSurgeLevel || h.status.toUpperCase())} STATUS
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Map Overlay Stats */}
                    <div style={{ position: 'absolute', top: 'var(--space-md)', left: 'var(--space-md)', zIndex: 1000, display: 'flex', gap: 'var(--space-md)' }}>
                        <div className="glass" style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>12 Clinics Stable</span>
                        </div>
                        <div className="glass" style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>1 Hospital Critical</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Sidebar Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid var(--surface-border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                        <h4 style={{ margin: 0 }}>Network Health</h4>
                        <div className="badge badge-primary" style={{ fontSize: '0.65rem' }}>TREND: STABLE</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Surge Prob. (4h)</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{systemMetrics.predictiveSurgeProb}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${systemMetrics.predictiveSurgeProb}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '4px', height: '20px', alignItems: 'flex-end', marginTop: '4px' }}>
                            {[40, 45, 42, 48, 52, 50, 47, 45, 43, 41].map((v, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${v}%` }}
                                    style={{ flex: 1, background: 'var(--primary-light)', borderRadius: '1px' }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card" style={{
                    background: 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(67, 56, 202, 0.3)'
                }}>
                    <h4 style={{ marginBottom: 'var(--space-md)', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                        <Settings size={18} /> ADMIN OVERRIDES
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <button
                            className={`btn btn-glass-dark ${overrideAction === 'redistribute' ? 'pulse-alert' : ''}`}
                            style={{ justifyContent: 'flex-start', border: '1px solid rgba(255,255,255,0.1)' }}
                            onClick={() => handleOverride('redistribute')}
                        >
                            <ShieldAlert size={16} /> {overrideAction === 'redistribute' ? 'EXECUTING...' : 'Forced Redistribution'}
                        </button>
                        <button
                            className={`btn btn-glass-dark ${overrideAction === 'triage' ? 'pulse-alert' : ''}`}
                            style={{ justifyContent: 'flex-start', border: '1px solid rgba(255,255,255,0.1)' }}
                            onClick={() => handleOverride('triage')}
                        >
                            <Settings size={16} /> {overrideAction === 'triage' ? 'ADJUSTING...' : 'Adjust Triage Rules'}
                        </button>
                        <button
                            className={`btn btn-glass-dark ${overrideAction === 'alert' ? 'pulse-critical' : ''}`}
                            style={{ justifyContent: 'flex-start', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                            onClick={() => handleOverride('alert')}
                        >
                            <Bell size={16} /> {overrideAction === 'alert' ? 'DISPATCHING...' : 'Network-Wide Alert'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {overrideAction ? (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ marginTop: 'var(--space-md)', fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600, textAlign: 'center' }}
                            >
                                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity }}>
                                    PROTOCOL SECURED: Updating regional nodes...
                                </motion.span>
                            </motion.div>
                        ) : (
                            <div style={{ marginTop: 'var(--space-lg)', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#a5b4fc', marginBottom: '8px', letterSpacing: '1px' }}>REGIONAL ACTION FEED</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '80px', overflowY: 'hidden' }}>
                                    {[
                                        { t: '12:04', m: 'Malar Node Sync Success' },
                                        { t: '11:58', m: 'GGH Load Diverted to MIOT' }
                                    ].map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.7rem' }}>
                                            <span style={{ opacity: 0.5 }}>{f.t}</span>
                                            <span style={{ fontWeight: 500 }}>{f.m}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <Activity size={18} />
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Real-time Sync: ACTIVE</div>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
                        City-wide hospital data is being updated every 5 seconds via Conduit Connect.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NetworkDashboard;
