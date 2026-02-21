import React, { useState, useEffect } from 'react';
import {
    Microscope, Zap, AlertTriangle, RefreshCcw, Layout,
    Maximize2, Move, X, Activity, Thermometer,
    Wind, Droplets, Info, ArrowRight, Loader2, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getResources } from '../../../services/api';

const equipmentData = [
    { id: 'mri1', name: 'MRI 1.5T', load: 95, status: 'Overloaded', type: 'Imaging', zone: 'Zone 01', icon: <Microscope /> },
    { id: 'mri2', name: 'MRI 3.0T', load: 22, status: 'Idle', type: 'Imaging', zone: 'Zone 03', icon: <Microscope /> },
    { id: 'ct1', name: 'CT Scan Alpha', load: 65, status: 'Optimal', type: 'Imaging', zone: 'Zone 02', icon: <Gauge /> },
    { id: 'v1', name: 'Ventilator Pro', load: 88, status: 'High Use', type: 'Life Support', zone: 'ICU-B', icon: <Wind /> },
    { id: 'd1', name: 'Dialysis Unit 4', load: 15, status: 'Idle', type: 'Treatment', zone: 'Ward C', icon: <Droplets /> },
    { id: 'xr1', name: 'Portable X-Ray', load: 45, status: 'Optimal', type: 'Imaging', zone: 'Zone 06', icon: <Zap /> },
];

const EquipmentUtilization = () => {
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showRedistributor, setShowRedistributor] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [redistributeStatus, setRedistributeStatus] = useState('idle'); // idle, processing, success

    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            setIsLoading(true);
            try {
                const data = await getResources();
                // Transform for UI (Equipment list)
                if (data.length > 0) {
                    const mainRes = data[0]; // For demo, use first hospital's resources
                    setResources([
                        { id: 'v1', name: 'Ventilators', load: Math.round(((mainRes.ventilators - mainRes.availableVentilators) / mainRes.ventilators) * 100), status: mainRes.availableVentilators < 5 ? 'Critical' : 'Stable', color: mainRes.availableVentilators < 5 ? 'var(--danger)' : 'var(--success)' },
                        { id: 'o2', name: 'Oxygen Cylinders', load: Math.round(((mainRes.oxygenCylinders - mainRes.availableOxygen) / mainRes.oxygenCylinders) * 100), status: 'Normal', color: 'var(--success)' },
                        { id: 'staff', name: 'Staff on Duty', load: Math.round((mainRes.staffOnDuty / 100) * 100), status: 'Active', color: 'var(--primary)' }
                    ]);
                }
            } catch (err) {
                console.error("Fetch resources failed:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, []);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => setIsSyncing(false), 1500);
    };

    const handleRedistribute = () => {
        setRedistributeStatus('processing');
        setTimeout(() => {
            setRedistributeStatus('success');
            setTimeout(() => {
                setShowRedistributor(false);
                setRedistributeStatus('idle');
            }, 2000);
        }, 2000);
    };

    if (isLoading) return <div>Synchronizing Resources...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Interactive Controls */}
            <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Clinical Asset Intelligence</h3>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn glass" onClick={() => setShowRedistributor(true)}>
                        <Move size={16} /> SLOT REDISTRIBUTOR
                    </button>
                    <button className="btn btn-primary" onClick={handleSync} disabled={isSyncing}>
                        {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                        {isSyncing ? ' SYNCING...' : ' LIVE SYNC'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Visual Heatmap Map */}
                <div className="card" style={{ position: 'relative', height: '480px', background: 'var(--background)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 'var(--space-xl)', border: '2px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', background: 'white', padding: '1px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', height: '100%', gap: '1px', background: 'var(--surface-border)' }}>
                            {['Zone 01', 'Zone 02', 'Zone 03', 'ICU-B', 'Ward C', 'Zone 06'].map((zone, i) => {
                                const assetInZone = equipmentData.find(e => e.zone === zone);
                                return (
                                    <motion.div
                                        key={zone}
                                        whileHover={{ background: '#f8fafc' }}
                                        style={{ background: 'white', padding: 'var(--space-md)', position: 'relative', cursor: assetInZone ? 'pointer' : 'default' }}
                                        onClick={() => assetInZone && setSelectedAsset(assetInZone)}
                                    >
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>{zone}</span>
                                        {assetInZone && (
                                            <motion.div
                                                initial={{ scale: 0.9 }}
                                                animate={{
                                                    scale: assetInZone.load > 90 ? [1, 1.1, 1] : 1,
                                                    background: assetInZone.load > 90 ? 'rgba(239, 68, 68, 0.15)' :
                                                        assetInZone.load < 30 ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                                }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                style={{ position: 'absolute', inset: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                {React.cloneElement(assetInZone.icon, { size: 32, color: assetInZone.load > 90 ? 'var(--danger)' : assetInZone.load < 30 ? 'var(--success)' : 'var(--primary)' })}
                                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-main)' }}>{assetInZone.load}% Load</div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 'var(--space-lg)', right: 'var(--space-lg)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '12px', borderRadius: '12px', fontSize: '0.7rem', border: '1px solid var(--surface-border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: 'var(--danger)', borderRadius: '50%' }}></span> Overload</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: 'var(--warning)', borderRadius: '50%' }}></span> Optimal</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }}></span> Idle</span>
                        </div>
                    </div>
                </div>

                {/* Equipment Status List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {equipmentData.map((e) => (
                        <motion.div
                            key={e.id}
                            whileHover={{ x: 4 }}
                            className="card clickable"
                            style={{ padding: 'var(--space-md)', cursor: 'pointer', borderLeft: `4px solid ${e.load > 90 ? 'var(--danger)' : e.load < 30 ? 'var(--success)' : 'var(--primary)'}` }}
                            onClick={() => setSelectedAsset(e)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <div style={{ background: 'var(--background)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                                        {e.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{e.type} • {e.zone}</div>
                                    </div>
                                </div>
                                <span className={`badge ${e.load > 90 ? 'badge-danger' : e.load < 30 ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                                    {e.status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ marginTop: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Live Utilization</span>
                                    <span style={{ fontWeight: 700 }}>{e.load}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${e.load}%` }}
                                        style={{ height: '100%', background: e.load > 90 ? 'var(--danger)' : e.load < 30 ? 'var(--success)' : 'var(--primary)' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* AI Insights Bar */}
            <div className="card" style={{ background: 'var(--text-main)', color: 'white', display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                <Zap size={24} color="var(--warning)" />
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>Predictive Reallocation Insight</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                        MRI 1.5T will hit peak capacity in 45m. Dialysis Unit 4 is currently idle. Recommended slot shift to stabilize outpatient throughput.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowRedistributor(true)}>RESOLVE NOW</button>
            </div>

            {/* Dialogs */}
            <AnimatePresence>
                {/* Asset Detail Modal */}
                {selectedAsset && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => setSelectedAsset(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: 48, height: 48, background: 'var(--background)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        {selectedAsset.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedAsset.name}</h3>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serial: {selectedAsset.id.toUpperCase()} • {selectedAsset.zone}</div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAsset(null)} style={closeButtonStyle}><X size={20} /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                <div className="card" style={{ background: '#f8fafc', border: 'none' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>CURRENT LOAD</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedAsset.load > 90 ? 'var(--danger)' : 'var(--primary)' }}>{selectedAsset.load}%</div>
                                </div>
                                <div className="card" style={{ background: '#f8fafc', border: 'none' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>MTBF STATUS</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>STABLE</div>
                                </div>
                            </div>

                            <div className="card glass" style={{ border: 'none', background: 'rgba(59, 130, 246, 0.05)', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>
                                    <Activity size={16} /> PERFORMANCE METRICS
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Uptime</span> <span>99.9%</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Next Maintenance</span> <span>March 14, 2026</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Avg Scan Time</span> <span>22 mins</span></div>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedAsset(null)}>CLOSE MONITOR</button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Slot Redistributor Modal */}
                {showRedistributor && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={modalOverlayStyle}
                        onClick={() => redistributeStatus === 'idle' && setShowRedistributor(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            style={modalContentStyle}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Slot Redistributor</h3>
                                <button onClick={() => setShowRedistributor(false)} style={closeButtonStyle} disabled={redistributeStatus !== 'idle'}><X size={20} /></button>
                            </div>

                            <div style={{ background: 'var(--background)', padding: 'var(--space-lg)', borderRadius: '16px', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>FROM (OVERLOADED)</div>
                                        <div style={{ fontWeight: 800, color: 'var(--danger)' }}>MRI 1.5T</div>
                                    </div>
                                    <ArrowRight size={20} color="var(--primary)" />
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>TO (IDLE)</div>
                                        <div style={{ fontWeight: 800, color: 'var(--success)' }}>MRI 3.0T</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
                                    This will shift 4 afternoon slots to stabilize imaging throughput.
                                </p>
                            </div>

                            <button
                                className={`btn ${redistributeStatus === 'success' ? 'btn-success' : 'btn-primary'}`}
                                style={{ width: '100%', padding: '14px' }}
                                onClick={handleRedistribute}
                                disabled={redistributeStatus !== 'idle'}
                            >
                                {redistributeStatus === 'processing' ? <Loader2 size={20} className="animate-spin" /> :
                                    redistributeStatus === 'success' ? 'REDISTRIBUTION COMPLETE' : 'EXECUTE REDISTRIBUTION'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Common Modal Styles
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
    width: '440px', background: 'white', borderRadius: '24px',
    padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--surface-border)'
};

const modalHeaderStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 'var(--space-lg)'
};

const closeButtonStyle = {
    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)'
};

export default EquipmentUtilization;
