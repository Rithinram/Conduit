import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, Truck, Activity, TrendingUp, AlertTriangle, UserPlus, Microscope, ArrowRight, RefreshCw, History, Send, BrainCircuit, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHospitals, getResources, transferResource, predictResourceExhaustion, getReallocationProposals } from '../../../services/api';

const ResourceAllocation = () => {
    const [hospitals, setHospitals] = useState([]);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState(null);
    const [actionHistory, setActionHistory] = useState([]);

    // AI Insights State
    const [aiInsights, setAiInsights] = useState({});
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Form State
    const [transferForm, setTransferForm] = useState({
        from: '',
        to: '',
        type: 'ventilators',
        count: 1
    });

    const fetchData = async () => {
        setIsLoading(true);
        const [hospData, resData] = await Promise.all([
            getHospitals(),
            getResources()
        ]);
        setHospitals(hospData);
        setResources(resData);
        setIsLoading(false);

        // Fetch AI Insights for each hospital
        fetchAiInsights(hospData, resData);
    };

    const fetchAiInsights = async (hospData, resData) => {
        setIsAiLoading(true);
        const insights = {};

        // Calculate regional metrics
        const avgRegionLoad = hospData.reduce((sum, h) => sum + (h.occupancy || 0), 0) / (hospData.length || 1);

        for (const h of hospData) {
            const res = resData.find(r => r.hospitalId?._id === h.id || r.hospitalId === h.id);
            if (res) {
                try {
                    // 1. Predict Resource Exhaustion
                    const exhaustion = await predictResourceExhaustion({
                        ventilators_avail: res.availableVentilators || 0,
                        staff_on_duty: res.staffOnDuty || 0,
                        oxygen_level: res.availableOxygen || 50,
                        patient_acuity_avg: Math.min(5, (h.erWaitTime || 0) / 10 + 1),
                        admission_rate: (h.occupancy || 50) / 10
                    });

                    // 2. Get Reallocation Proposal if stress is high
                    const stressIndex = (h.occupancy * 0.5) + (h.erWaitTime * 0.3);
                    const proposal = await getReallocationProposals({
                        stress_index: stressIndex,
                        region_load: avgRegionLoad,
                        local_icu: 100 - (h.icuAvailability || 0)
                    });

                    insights[h.id] = {
                        exhaustion,
                        proposal,
                        stressLevel: stressIndex
                    };
                } catch (err) {
                    console.error("AI Insight Error for hospital", h.name, err);
                }
            }
        }
        setAiInsights(insights);
        setIsAiLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const chartData = useMemo(() => {
        return hospitals.map(h => {
            const res = resources.find(r => r.hospitalId?._id === h.id || r.hospitalId === h.id);
            return {
                id: h.id,
                hospital: h.name.split(' ')[0],
                beds: h.occupancy || 0,
                ventilators: res ? Math.round(((res.ventilators - res.availableVentilators) / (res.ventilators || 1)) * 100) : 0,
                staff: res ? Math.min(100, Math.round((res.staffOnDuty / 50) * 100)) : 0
            };
        });
    }, [hospitals, resources]);

    const handleTransfer = async () => {
        if (!transferForm.from || !transferForm.to) {
            setActionStatus('Error: Please select both source and destination hospitals.');
            return;
        }
        if (transferForm.from === transferForm.to) {
            setActionStatus('Error: Source and destination must be different.');
            return;
        }

        setActionStatus(`Dispatching ${transferForm.count} ${transferForm.type} from ${transferForm.from} to ${transferForm.to}...`);

        const result = await transferResource({
            fromHospitalName: transferForm.from,
            toHospitalName: transferForm.to,
            resourceType: transferForm.type,
            count: transferForm.count
        });

        if (result.success) {
            setActionStatus(`Success: ${result.message}`);
            setActionHistory(prev => [{
                id: Date.now(),
                ...transferForm,
                timestamp: new Date().toLocaleTimeString(),
                status: 'Completed'
            }, ...prev]);
            fetchData();
        } else {
            setActionStatus(`Error: ${result.message}`);
        }
        setTimeout(() => setActionStatus(null), 4000);
    };

    if (isLoading) return <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>Synchronizing Resource Inventory...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <AnimatePresence>
                {actionStatus && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="card"
                        style={{
                            background: actionStatus.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: actionStatus.includes('Error') ? 'var(--danger)' : 'var(--success)',
                            border: `1px solid ${actionStatus.includes('Error') ? 'var(--danger)' : 'var(--success)'}`,
                            fontWeight: 700,
                            zIndex: 20
                        }}
                    >
                        {actionStatus}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: 'var(--space-lg)' }}>
                {/* AI Strategic Insights */}
                <div className="card" style={{ border: '1px solid rgba(var(--primary-rgb), 0.3)', background: 'rgba(var(--primary-rgb), 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <BrainCircuit size={24} color="var(--primary)" />
                            <h3 style={{ margin: 0 }}>AI Strategic Intelligence</h3>
                        </div>
                        {isAiLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={16} color="var(--primary)" /></motion.div>}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {hospitals.slice(0, 3).map(h => {
                            const insight = aiInsights[h.id];
                            if (!insight) return null;
                            const isCritical = insight.exhaustion.vent_exhaustion_hours < 5 || insight.exhaustion.staff_exhaustion_hours < 8;

                            return (
                                <div key={h.id} className="glass" style={{ padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)', border: isCritical ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 800 }}>{h.name}</span>
                                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                            <span className="badge" style={{ background: insight.stressLevel > 70 ? 'var(--danger)' : 'var(--success)', fontSize: '0.65rem' }}>
                                                STRESS: {Math.round(insight.stressLevel)}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)', fontSize: '0.75rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Ventilator Failure</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: insight.exhaustion.vent_exhaustion_hours < 12 ? 'var(--danger)' : 'var(--text)' }}>
                                                <Clock size={12} /> {Math.round(insight.exhaustion.vent_exhaustion_hours)}h
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Staff Burnout Risk</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: insight.exhaustion.staff_exhaustion_hours < 12 ? 'var(--warning)' : 'var(--text)' }}>
                                                <UserPlus size={12} /> {Math.round(insight.exhaustion.staff_exhaustion_hours)}h
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Oxygen Depletion</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                                                <Activity size={12} /> {Math.round(insight.exhaustion.oxy_exhaustion_hours)}h
                                            </div>
                                        </div>
                                    </div>

                                    {insight.proposal && insight.stressLevel > 60 && (
                                        <div style={{ marginTop: 'var(--space-sm)', padding: '6px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: '0.75rem' }}>
                                            <Zap size={14} color="var(--primary)" />
                                            <span><strong>AI Recommendation:</strong> Divert overflow to <strong>{insight.proposal.recommended_target}</strong></span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Manual Reallocation Form */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <Truck size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Logistics Control</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>SOURCE NODE</label>
                            <select
                                className="btn glass"
                                style={{ width: '100%', textAlign: 'left', appearance: 'auto', padding: '10px' }}
                                value={transferForm.from}
                                onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })}
                            >
                                <option value="">Select source...</option>
                                {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>DESTINATION NODE</label>
                            <select
                                className="btn glass"
                                style={{ width: '100%', textAlign: 'left', appearance: 'auto', padding: '10px' }}
                                value={transferForm.to}
                                onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                            >
                                <option value="">Select target...</option>
                                {hospitals.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 'var(--space-sm)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>ASSET TYPE</label>
                                <select
                                    className="btn glass"
                                    style={{ width: '100%', textAlign: 'left', appearance: 'auto', padding: '10px' }}
                                    value={transferForm.type}
                                    onChange={(e) => setTransferForm({ ...transferForm, type: e.target.value })}
                                >
                                    <option value="ventilators">Ventilators</option>
                                    <option value="staff">Staff (Float)</option>
                                    <option value="oxygen">Oxygen Units</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>QTY</label>
                                <input
                                    type="number"
                                    className="btn glass"
                                    min="1"
                                    value={transferForm.count}
                                    onChange={(e) => setTransferForm({ ...transferForm, count: parseInt(e.target.value) || 1 })}
                                    style={{ width: '100%', textAlign: 'center', padding: '10px' }}
                                />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 'var(--space-sm)', width: '100%', gap: 'var(--space-sm)', padding: '12px' }}
                            onClick={handleTransfer}
                        >
                            <Send size={16} /> EXECUTE TRANSFER
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Utilization Chart */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <Activity size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Regional Resource Utilization (%)</h3>
                    </div>
                </div>
                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="hospital" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--primary)', borderRadius: '8px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="beds" name="Beds" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ventilators" name="Ventilators" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="staff" name="Staff" fill="var(--success)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ResourceAllocation;

