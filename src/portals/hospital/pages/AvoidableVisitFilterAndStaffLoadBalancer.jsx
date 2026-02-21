import React, { useState } from 'react';
import {
    Users, UserX, UserCheck, PhoneCall, ArrowRight,
    Activity, Zap, Info, X, MessageSquare,
    Clock, ExternalLink, Calendar, Send,
    CheckCircle2, Loader2, AlertTriangle, ShieldAlert,
    Bell, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AvoidableVisitFilterAndStaffLoadBalancer = () => {
    const [selectedCase, setSelectedCase] = useState(null);
    const [activeDialog, setActiveDialog] = useState(null); // 'teleconsult', 'redirect', 'delay', 'notify', 'alert'
    const [alertMessage, setAlertMessage] = useState({ title: '', body: '', icon: null });
    const [isBalancing, setIsBalancing] = useState(false);
    const [balanceStep, setBalanceStep] = useState(0);

    const [flags, setFlags] = useState([
        { id: 'f1', name: 'Alice Johnson', reason: 'Non-emergent rash (2 days)', urgency: 15, match: 'Teleconsult', details: 'Patient reports stable vitals. Suitable for virtual assessment.', clinicalDetail: 'No fever, no difficulty breathing. Chronic dermatosis.' },
        { id: 'f2', name: 'Bob Smith', reason: 'Routine Medication Refill', urgency: 5, match: 'Pharmacy Direct', details: 'Statutory chronic medication refill. No clinical change reported.', clinicalDetail: 'Patient stable on Hypertension meds. Needs script only.' },
        { id: 'f3', name: 'Charlie Davis', reason: 'Stable Chronic Pain', urgency: 22, match: 'Clinic Referral', details: 'Post-op 2-week check. Referral to St. Jude Annex recommended.', clinicalDetail: 'Chronic lower back pain. No neurological deficits noted.' },
        { id: 'f4', name: 'Diana Prince', reason: 'Elective Follow-up', urgency: 30, match: 'Delay/Reschedule', details: 'Elective dermatology session. Can be deferred for surge relief.', clinicalDetail: 'Post-scar review. Non-urgent, clinical deferral suggested.' },
        { id: 'f5', name: 'Eve Adams', reason: 'Minor Skin Irritation', urgency: 10, match: 'Teleconsult', details: 'Localized redness, no systemic symptoms.', clinicalDetail: 'Suspected contact dermatitis from new soap.' },
        { id: 'f6', name: 'Frank Green', reason: 'Ankle Sprain Check', urgency: 18, match: 'Physio Redirect', details: '4-day old injury, stable. Needs physical therapy assessment.', clinicalDetail: 'Swelling reduced, range of motion improving.' },
        { id: 'f7', name: 'Grace Lee', reason: 'Annual Lab Review', urgency: 3, match: 'Virtual Review', details: 'Stable chronic markers. Low priority for in-person review.', clinicalDetail: 'Routine diabetic bloodwork review.' },
        { id: 'f8', name: 'Henry Ford', reason: 'BP Monitoring Inquiry', urgency: 12, match: 'Nurse Call', details: 'Slightly elevated readings. Requires protocol advice.', clinicalDetail: '145/90 consistent, no focal symptoms.' },
    ]);

    const nursingSquads = [
        { id: 's1', name: 'ER Nursing Squad', load: 92, staff: 14, status: 'Overloaded', color: 'var(--danger)' },
        { id: 's2', name: 'OPD Clinical Squad', load: 45, staff: 8, status: 'Stable', color: 'var(--primary)' },
        { id: 's3', name: 'Telemedicine Squad', load: 20, staff: 4, status: 'Idle', color: 'var(--success)' },
        { id: 's4', name: 'Trauma Response Squad', load: 88, staff: 6, status: 'High Load', color: 'var(--warning)' },
        { id: 's5', name: 'Post-Op Care Squad', load: 35, staff: 10, status: 'Stable', color: 'var(--primary)' },
        { id: 's6', name: 'Pediatric Nursing Squad', load: 15, staff: 5, status: 'Idle', color: 'var(--success)' },
    ];

    const individualStaff = [
        { id: 'n1', name: 'Nurse Sarah Jenkins', role: 'Senior ER Nurse', status: 'On Shift', assignment: 'Zone A' },
        { id: 'n2', name: 'Nurse Mark Thompson', role: 'Triage Specialist', status: 'On Shift', assignment: 'Entry Hub' },
        { id: 'n3', name: 'Nurse Elena Rodriguez', role: 'Cardiac Recovery', status: 'On Shift', assignment: 'ICU-B' },
        { id: 'n4', name: 'Nurse David Kim', role: 'OPD Charge Nurse', status: 'On Call', assignment: 'Wait Deck' },
    ];

    const showAlert = (title, body, icon = <Info size={40} />) => {
        setAlertMessage({ title, body, icon });
        setActiveDialog('alert');
    };

    const handleExecuteBalance = () => {
        setIsBalancing(true);
        const steps = ['Scanning Nursing Load', 'Deploying Telemedicine', 'Optimizing Floor Staff', 'Syncing Squad Dashboards'];
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                setBalanceStep(currentStep);
                currentStep++;
            } else {
                clearInterval(interval);
                setIsBalancing(false);
                setBalanceStep(0);
                showAlert('Optimization Complete', 'Nursing workloads have been redistributed across all active squads.');
            }
        }, 800);
    };

    const removeFlag = (id) => {
        setFlags(prev => prev.filter(f => f.id !== id));
        setSelectedCase(null);
        setActiveDialog(null);
        showAlert('Case Actioned', 'The patient has been successfully redirected or deferred.');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Avoidable Visit Filter */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h3 style={{ margin: 0 }}>Avoidable Visit Filter</h3>
                            <div className="badge badge-success">35% LOAD RELIEF</div>
                        </div>
                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setActiveDialog('notify')}>
                            <Bell size={14} /> NOTIFY ALL
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxHeight: '720px', overflowY: 'auto', paddingRight: '8px' }}>
                        {flags.map((f) => (
                            <motion.div
                                key={f.id}
                                whileHover={{ scale: 1.01 }}
                                className="glass clickable"
                                style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }} onClick={() => setSelectedCase(f)}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserX size={20} color={f.urgency > 20 ? 'var(--warning)' : 'var(--danger)'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{f.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.reason} • {f.clinicalDetail}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.7rem' }}>{f.match}</span>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                        onClick={() => {
                                            setSelectedCase(f);
                                            setActiveDialog(f.match.toLowerCase().includes('tele') ? 'teleconsult' : f.match.toLowerCase().includes('clinic') ? 'redirect' : 'delay');
                                        }}
                                    >
                                        ACTION
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Nursing Load Balancer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <h4 style={{ margin: 0 }}>Live Nursing Squads</h4>
                            <RefreshCcw size={16} className="clickable" color="var(--text-muted)" onClick={handleExecuteBalance} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            {nursingSquads.map((team) => (
                                <div key={team.id} className="card glass" style={{ padding: 'var(--space-sm)', border: 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 700 }}>{team.name} ({team.staff} Nurses)</span>
                                        <span style={{ fontWeight: 800, color: team.color }}>{team.load}% CAPACITY</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ flex: 1, height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${team.load}%` }}
                                                style={{ height: '100%', background: team.color }}
                                            />
                                        </div>
                                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.65rem' }} onClick={() => showAlert('Squad Optimization', `Shifted focus metrics for ${team.name}. Squad alerted via mobile hub.`)}>
                                            OPTIMIZE
                                        </button>
                                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.65rem' }} onClick={() => showAlert('Deployment Triggered', `Deploying supplemental nurses to ${team.name}. ETA 2 mins.`)}>
                                            DEPLOY
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <h4 style={{ margin: '0 0 var(--space-md) 0' }}>Individual Shift Status</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)' }}>
                            {individualStaff.map((staff) => (
                                <div key={staff.id} className="glass" style={{ padding: '12px', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{staff.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{staff.role} • {staff.assignment}</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button className="btn glass" style={{ padding: '4px 8px', fontSize: '0.6rem', flex: 1 }} onClick={() => showAlert('Staff Paging', `Paging ${staff.name} via high-priority audio bridge.`)}>PAGE</button>
                                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.6rem', flex: 1 }} onClick={() => showAlert('Task Assignment', `Advanced clinical tasks assigned to ${staff.name}. Checklist synced.`)}>TASK</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', position: 'relative', zIndex: 1 }}>
                            <Zap size={24} color="var(--warning)" />
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0 }}>Auto-Balance Proposal</h4>
                                <p style={{ margin: '4px 0 12px 0', fontSize: '0.8rem', opacity: 0.8 }}>
                                    Redirecting identifying avoidable visits will reduce peak ER load by <strong>15%</strong>.
                                </p>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '12px' }}
                                    onClick={handleExecuteBalance}
                                    disabled={isBalancing}
                                >
                                    {isBalancing ? (
                                        <><Loader2 size={16} className="animate-spin" /> {['Scanning Nursing Load', 'Deploying Telemedicine', 'Optimizing Floor Staff', 'Syncing Squad Dashboards'][balanceStep].toUpperCase()}</>
                                    ) : 'EXECUTE REBALANCING'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialogs Wrapper */}
            <AnimatePresence>
                {/* Generic Alert Modal */}
                {activeDialog === 'alert' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ ...modalContentStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ color: 'var(--primary)', marginBottom: 'var(--space-md)' }}>
                                {alertMessage.icon || <CheckCircle2 size={48} color="var(--success)" />}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0' }}>{alertMessage.title || 'Action Successful'}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
                                {alertMessage.body}
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveDialog(null)}>UNDERSTOOD</button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Teleconsult Modal */}
                {activeDialog === 'teleconsult' && selectedCase && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Teleconsult Conversion</h3>
                                <button onClick={() => setActiveDialog(null)} style={closeButtonStyle}><X size={20} /></button>
                            </div>
                            <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ fontWeight: 700, marginBottom: '4px' }}>{selectedCase.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{selectedCase.details}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Virtual Waiting Room</span> <span style={{ fontWeight: 700 }}>~8 mins</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>Assigned MD</span> <span style={{ fontWeight: 700 }}>Dr. Sarah (Tele-Unit)</span>
                                </div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => removeFlag(selectedCase.id)}>CONFIRM VIRTUAL SHIFT</button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Redirect Modal */}
                {activeDialog === 'redirect' && selectedCase && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={modalContentStyle} onClick={e => e.stopPropagation()}>
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Affiliated Redirection</h3>
                                <button onClick={() => setActiveDialog(null)} style={closeButtonStyle}><X size={20} /></button>
                            </div>
                            <div className="card" style={{ background: '#f8fafc', border: '1px solid var(--surface-border)', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>TARGET CLINIC</div>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', margin: '4px 0' }}>St. Jude Urgent Annex</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location: 2.4 miles (Est. Travel 8m)</div>
                            </div>
                            <div style={{ padding: 'var(--space-md)', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={14} /> WAIT TIME ADVANTAGE
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>-120 mins savings</div>
                            </div>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }} onClick={() => removeFlag(selectedCase.id)}>EXECUTE REDIRECTION</button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Notification Suite Modal */}
                {activeDialog === 'notify' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ ...modalContentStyle, width: '520px' }} onClick={e => e.stopPropagation()}>
                            <div style={modalHeaderStyle}>
                                <h3 style={{ margin: 0 }}>Patient Notification Suite</h3>
                                <button onClick={() => setActiveDialog(null)} style={closeButtonStyle}><X size={20} /></button>
                            </div>
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>TARGET AUDIENCE</label>
                                <div className="badge badge-primary">ALL ESI 4/5 (LOW URGENCY)</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: 'var(--space-lg)', borderRadius: '16px', marginBottom: 'var(--space-xl)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>DRAFT SMS/EMAIL</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%' }}></div>
                                        <div style={{ width: 8, height: 8, background: '#cbd5e1', borderRadius: '50%' }}></div>
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#475569', fontStyle: 'italic' }}>
                                    "NOTICE: Our ER is currently at capacity. To ensure your comfort, we are offering FREE virtual teleconsults for low-priority visits today. Please reply 'VIRTUAL' to switch..."
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }}>EDIT DRAFT</button>
                                <button className="btn btn-primary" style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => { setFlags([]); setActiveDialog(null); showAlert('Bulk Alert Sent', 'All low-urgency patients notified. Queue relief initiated.'); }}>
                                    SEND TO {flags.length} PATIENTS <Send size={16} />
                                </button>
                            </div>
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

export default AvoidableVisitFilterAndStaffLoadBalancer;

