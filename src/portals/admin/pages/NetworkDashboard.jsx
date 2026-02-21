import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHospitals, getSystemMetrics, getUrgencyColor } from '../../../services/api';
import { Activity, Map as MapIcon, ShieldAlert, BarChart3, Filter, Settings, Bell, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import L from 'leaflet';

const NetworkDashboard = () => {
    const [hospitals, setHospitals] = useState([]);
    const [systemMetrics, setSystemMetrics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [hospitalData, metricsData] = await Promise.all([
                getHospitals(),
                getSystemMetrics()
            ]);
            setHospitals(hospitalData);
            setSystemMetrics(metricsData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading || !systemMetrics) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '20px' }}>
                <Activity className="pulse-critical" size={48} color="var(--primary)" />
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>LOADING NETWORK STATUS...</div>
            </div>
        );
    }
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-lg)', height: 'calc(100vh - 180px)' }}>
            {/* City Map View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
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
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <div style={{ background: 'var(--background)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                Wait: <strong>{h.erWaitTime}m</strong>
                                            </div>
                                            <div style={{ background: 'var(--background)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                                ICU: <strong>{h.icuAvailability}%</strong>
                                            </div>
                                        </div>
                                        <span className={`badge badge-${h.status === 'stable' ? 'success' : h.status === 'moderate' ? 'warning' : 'danger'}`} style={{ width: '100%', justifyContent: 'center' }}>
                                            {h.status.toUpperCase()} STATUS
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        {hospitals.filter(h => h.status === 'critical').map(h => (
                            <Circle key={`c-${h.id}`} center={h.location} radius={1500} pathOptions={{ color: 'var(--danger)', fillColor: 'var(--danger)', fillOpacity: 0.1 }} />
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
                <div className="card">
                    <h4 style={{ margin: '0 0 var(--space-md) 0' }}>Network Health</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>City Stress Index</span>
                            <span style={{ fontWeight: 800, color: 'var(--warning)' }}>{systemMetrics.cityStress}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${systemMetrics.cityStress}%`, height: '100%', background: 'var(--warning)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Predictive Surge Prob.</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{systemMetrics.predictiveSurgeProb}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${systemMetrics.predictiveSurgeProb}%`, height: '100%', background: 'var(--primary)' }} />
                        </div>
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                    <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--primary-light)' }}>Admin Overrides</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <button className="btn glass" style={{ color: 'white', justifyContent: 'flex-start' }}><ShieldAlert size={16} /> Forced Redistribution</button>
                        <button className="btn glass" style={{ color: 'white', justifyContent: 'flex-start' }}><Settings size={16} /> Adjust Triage Rules</button>
                        <button className="btn glass" style={{ color: 'white', justifyContent: 'flex-start' }}><Bell size={16} /> Network-Wide Alert</button>
                    </div>
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
