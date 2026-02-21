import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Package, Truck, Activity, TrendingUp, AlertTriangle, UserPlus, Microscope, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const resourceData = [
    { hospital: 'Central Gen', beds: 88, ventilators: 92, staff: 95 },
    { hospital: 'Saints Mem', beds: 45, ventilators: 30, staff: 60 },
    { hospital: 'City Care', beds: 65, ventilators: 55, staff: 75 },
    { hospital: 'Suburban Hub', beds: 20, ventilators: 15, staff: 40 },
];

const ResourceAllocation = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Predictive Demand Chart */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Resource Utilization by Hospital (%)</h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={resourceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hospital" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="beds" name="Beds" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="ventilators" name="Ventilators" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="staff" name="Staff" fill="var(--success)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Reallocation Panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Smart Reallocation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        AI-detected imbalances. Drag resources to reassign.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <AlertTriangle size={18} color="var(--danger)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>CRITICAL SHORTAGE</span>
                                </div>
                                <span className="badge badge-danger">VENTILATORS</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', margin: '8px 0' }}><strong>Suburban Hub</strong> is at peak capacity. 5 ventilators available at <strong>Central General</strong>.</p>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '0.6rem' }}><Truck size={14} /> APPROVE TRANSFER</button>
                        </div>

                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <TrendingUp size={18} color="var(--warning)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>STAFF IMBALANCE</span>
                                </div>
                                <span className="badge badge-warning">NURSING</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', margin: '8px 0' }}>Predicted bottleneck at <strong>Saints Memorial</strong> in &lt;3h. Request 4 floating nurses from <strong>City Care</strong>.</p>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', background: 'var(--warning)', color: '#92400e', border: 'none' }}><UserPlus size={14} /> REQUEST FLOAT</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resource Inventory Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Microscope size={32} color="var(--primary)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NETWORK MRIS</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>18 / 22 <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Active</span></div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Activity size={32} color="var(--success)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ICU BEDS</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>142 / 180 <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Full</span></div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Package size={32} color="var(--warning)" />
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PPE STOCK</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>92% <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>Optimal</span></div>
                    </div>
                </div>
                <div className="card glass" style={{ background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                    <div style={{ fontWeight: 800 }}>VIEW FULL INVENTORY <ArrowRight size={16} /></div>
                </div>
            </div>
        </div>
    );
};

export default ResourceAllocation;
