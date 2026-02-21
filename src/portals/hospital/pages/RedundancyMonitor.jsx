import { FileSearch, AlertCircle, CheckCircle2, RefreshCcw, Database, Share2, Info, AlertTriangle, Zap, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RedundancyMonitor = () => {
    const redundancies = [
        { id: 1, patient: 'John Doe', test: 'CBC', duplicateOf: 'CBC (2 days ago)', status: 'flagged', hospital: 'Central General' },
        { id: 2, patient: 'Jane Smith', test: 'MRI Spine', duplicateOf: 'MRI Spine (7 days ago)', status: 'flagged', hospital: 'Saints Memorial' },
        { id: 3, patient: 'Robert Brown', test: 'X-Ray Chest', duplicateOf: 'None', status: 'verified', hospital: 'Local Clinic' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Redundancy Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                {[
                    { label: 'Duplicate Tests Flagged', value: '14%', sub: 'Avg. per 24h cycle', color: 'var(--danger)', icon: AlertCircle },
                    { label: 'Network EHR Sync', value: 'ACTIVE', sub: 'Connected to 12 Facilities', color: 'var(--success)', icon: CheckCircle2 },
                    { label: 'Potential Cost Saving', value: '$4,250', sub: 'From avoided redundant tests today', color: 'var(--primary)', icon: Activity }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="card"
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
                            <stat.icon size={18} color={stat.color} />
                        </div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, margin: '8px 0', color: stat.color, letterSpacing: '-1px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--space-lg)' }}>
                {/* Flagged Tests Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Redundancy Alerts</h3>
                        <button className="btn glass"><RefreshCcw size={16} /> Refresh Feed</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--background)', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                            <tr>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Patient / Test</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Duplicate Conflict</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Source facility</th>
                                <th style={{ padding: 'var(--space-md) var(--space-lg)' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {redundancies.map((r, i) => (
                                <motion.tr
                                    key={r.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    style={{ borderBottom: '1px solid var(--surface-border)' }}
                                >
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.patient}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.test}</div>
                                    </td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.85rem',
                                            color: r.status === 'flagged' ? 'var(--danger)' : 'var(--success)',
                                            fontWeight: 600
                                        }}>
                                            {r.status === 'flagged' ? <AlertTriangle size={16} className="pulse-alert" /> : <CheckCircle2 size={16} />}
                                            {r.duplicateOf}
                                        </div>
                                    </td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{r.hospital}</td>
                                    <td style={{ padding: 'var(--space-md) var(--space-lg)' }}>
                                        {r.status === 'flagged' ? (
                                            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '10px' }}>RESOLVE CONFLICT</button>
                                        ) : (
                                            <span style={{
                                                background: 'var(--success-bg)',
                                                color: 'var(--success)',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.7rem',
                                                fontWeight: 900
                                            }}>VERIFIED</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Data Sync Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Data Pipeline Status</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Database size={20} color="var(--primary)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Regional EHR Repository</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Synced: 12ms ago</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Share2 size={20} color="var(--primary)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cross-Dept Imaging</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Active Link</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <h4 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--primary-light)' }}>Redundancy Impact</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                            Eliminating duplicate tests today has saved <strong>14 hours</strong> of lab processing time, equivalent to the capacity of <strong>2 additional lab technicians</strong>.
                        </p>
                    </div>

                    <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <FileSearch size={18} />
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Record Oversight: ACTIVE</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RedundancyMonitor;
