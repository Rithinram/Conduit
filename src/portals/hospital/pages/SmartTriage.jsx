import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Activity, Clock, AlertTriangle, TrendingUp, Users,
    Zap, Shield, Plus, Filter, Heart, Thermometer, Droplets,
    CheckCircle2, ChevronRight, MoreHorizontal, Bed, Navigation,
    X, User, Phone, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTriageQueue, updateVitals, updateTriageStatus } from '../../../services/api';
import { classifyUrgency } from '../../../../conduit-ml';

const SmartTriage = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hospitalId, setHospitalId] = useState('65d4b5a1f234567890abcdef');
    const [filter, setFilter] = useState('All');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ urgency: 'All', status: 'All' });
    const filterRef = useRef(null);

    const emptyForm = {
        name: '', age: '', gender: 'Male', bloodGroup: 'O+', contact: '', emergencyContact: '',
        hr: '', bp: '', o2: '', temp: '', symptoms: '', chiefComplaint: ''
    };
    const [formData, setFormData] = useState(emptyForm);

    const mockPatients = [
        { id: '1', name: 'James Wilson', age: 68, arrival: '4m ago', status: 'Waiting', score: 88, urgency: 'Critical', vitals: { hr: 112, bp: '158/95', o2: 89, temp: 101.4 }, symptoms: ['Chest Pain', 'Shortness of Breath'], gender: 'Male', bloodGroup: 'A+', contact: '9876543210', emergencyContact: '9876543211', chiefComplaint: 'Acute chest pain radiating to left arm' },
        { id: '2', name: 'Sarah Miller', age: 34, arrival: '12m ago', status: 'Waiting', score: 42, urgency: 'Moderate', vitals: { hr: 78, bp: '122/80', o2: 98, temp: 98.6 }, symptoms: ['Severe Abdominal Pain'], gender: 'Female', bloodGroup: 'B+', contact: '9876543212', emergencyContact: '9876543213', chiefComplaint: 'Severe abdominal pain in lower right quadrant' },
        { id: '3', name: 'Robert Chen', age: 72, arrival: '22m ago', status: 'Triage', score: 76, urgency: 'High', vitals: { hr: 95, bp: '145/88', o2: 92, temp: 100.2 }, symptoms: ['Fever', 'Dizziness'], gender: 'Male', bloodGroup: 'O-', contact: '9876543214', emergencyContact: '9876543215', chiefComplaint: 'High fever with intermittent dizziness' },
        { id: '4', name: 'Emma Davis', age: 8, arrival: '45m ago', status: 'Waiting', score: 25, urgency: 'Low', vitals: { hr: 85, bp: '110/70', o2: 99, temp: 99.1 }, symptoms: ['Minor Laceration'], gender: 'Female', bloodGroup: 'AB+', contact: '9876543216', emergencyContact: '9876543217', chiefComplaint: 'Small cut on forearm from playground fall' }
    ];

    useEffect(() => {
        const fetchQueue = async () => {
            const data = await getTriageQueue(hospitalId);
            if (data && data.length > 0) {
                const enriched = await Promise.all(data.map(async p => {
                    const vitals = {
                        heart_rate: p.vitals?.heartRate || 75,
                        systolic_bp: p.vitals?.bloodPressure ? parseInt(p.vitals.bloodPressure.split('/')[0]) : 120,
                        temperature: p.vitals?.temperature || 98.6
                    };
                    const condition = p.symptoms?.[0] || 'General';
                    const { score, level } = await classifyUrgency(condition, p.age || 35, 2, {}, vitals);

                    return {
                        ...p,
                        id: p._id,
                        arrival: 'Just now',
                        score: score || p.smartScore || 50,
                        urgency: level || p.urgencyLevel || 'Moderate',
                        vitals: {
                            hr: p.vitals?.heartRate || 75,
                            bp: p.vitals?.bloodPressure || '120/80',
                            o2: p.vitals?.oxygenLevel || 98,
                            temp: p.vitals?.temperature || 98.6
                        },
                        status: p.triageStatus || 'Waiting'
                    };
                }));
                setQueue(enriched);
            } else {
                setQueue(mockPatients);
            }
            setIsLoading(false);
        };
        fetchQueue();
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, [hospitalId]);

    useEffect(() => {
        const simInterval = setInterval(() => {
            setQueue(prev => prev.map(p => {
                if (Math.random() > 0.7) {
                    const hrVar = Math.floor(Math.random() * 5) - 2;
                    const o2Var = Math.random() > 0.9 ? -1 : (Math.random() > 0.9 ? 1 : 0);
                    return { ...p, vitals: { ...p.vitals, hr: Math.max(40, Math.min(180, p.vitals.hr + hrVar)), o2: Math.max(80, Math.min(100, p.vitals.o2 + o2Var)) } };
                }
                return p;
            }));
        }, 3000);
        return () => clearInterval(simInterval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilterDropdown(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredQueue = useMemo(() => {
        let q = [...queue];
        if (activeFilters.urgency !== 'All') q = q.filter(p => p.urgency === activeFilters.urgency);
        if (activeFilters.status !== 'All') q = q.filter(p => p.status === activeFilters.status);
        return q.sort((a, b) => b.score - a.score);
    }, [queue, activeFilters]);

    const stats = useMemo(() => ({
        critical: queue.filter(p => p.urgency === 'Critical').length,
        waiting: queue.filter(p => p.status === 'Waiting').length,
        avgWait: '18m'
    }), [queue]);

    const handleAction = async (id, status) => {
        await updateTriageStatus(id, status);
        setQueue(prev => prev.filter(p => p.id !== id));
        setSelectedPatient(null);
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'Critical': return '#ef4444'; case 'High': return '#f97316';
            case 'Moderate': return '#eab308'; case 'Low': return '#22c55e';
            default: return 'var(--text-muted)';
        }
    };

    const handleAddPatient = async () => {
        const hr = parseInt(formData.hr) || 75;
        const bp = formData.bp || '120/80';
        const o2 = parseInt(formData.o2) || 98;
        const temp = parseFloat(formData.temp) || 98.6;

        const vitals = { heart_rate: hr, systolic_bp: parseInt(bp.split('/')[0]), temperature: temp };
        const { score, level } = await classifyUrgency(formData.symptoms?.split(',')[0] || 'General', parseInt(formData.age) || 35, 2, {}, vitals);

        const newPatient = {
            id: `new-${Date.now()}`, name: formData.name, age: parseInt(formData.age) || 0,
            gender: formData.gender, bloodGroup: formData.bloodGroup,
            contact: formData.contact, emergencyContact: formData.emergencyContact,
            chiefComplaint: formData.chiefComplaint,
            arrival: 'Just now', status: 'Waiting', score, urgency: level,
            vitals: { hr, bp, o2, temp },
            symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()).filter(Boolean) : ['General']
        };
        setQueue(prev => [newPatient, ...prev]);
        setFormData(emptyForm);
        setShowAddModal(false);
    };

    const activeFilterCount = (activeFilters.urgency !== 'All' ? 1 : 0) + (activeFilters.status !== 'All' ? 1 : 0);

    if (isLoading) return <div className="loading-container">Synchronizing Clinical Data...</div>;

    const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' };
    const modalStyle = { background: 'white', borderRadius: '16px', width: '580px', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' };
    const fieldStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', transition: 'border 0.2s' };
    const labelStyle = { fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', height: '100%' }}>
            {/* Header Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-lg)' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}><AlertTriangle color="#ef4444" size={24} /></div>
                    <div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>CRITICAL TRAPS</div><div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.critical}</div></div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}><Users color="#3b82f6" size={24} /></div>
                    <div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL QUEUE</div><div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{queue.length}</div></div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}><Clock color="#22c55e" size={24} /></div>
                    <div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG WAIT TIME</div><div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stats.avgWait}</div></div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-lg)' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 'var(--space-sm)', borderRadius: '12px' }}><Zap color="#a855f7" size={24} /></div>
                    <div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ML TRIAGE ACTIVE</div><div style={{ fontSize: '1.5rem', fontWeight: 900 }}>V.4.2</div></div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-lg)', flex: 1, minHeight: 0 }}>
                {/* Main Queue List */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Activity color="var(--primary)" size={20} /> SMART PRIORITY QUEUE
                        </h3>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', position: 'relative' }} ref={filterRef}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowFilterDropdown(!showFilterDropdown)} style={{ position: 'relative' }}>
                                <Filter size={14} /> FILTER
                                {activeFilterCount > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeFilterCount}</span>}
                            </button>
                            <AnimatePresence>
                                {showFilterDropdown && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                                        style={{ position: 'absolute', top: '110%', right: 80, background: 'white', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: '16px', zIndex: 100, width: '240px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: '12px', color: 'var(--text-main)' }}>Filter Patients</div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={labelStyle}>Urgency Level</label>
                                            <select value={activeFilters.urgency} onChange={e => setActiveFilters(f => ({ ...f, urgency: e.target.value }))} style={{ ...fieldStyle, cursor: 'pointer' }}>
                                                {['All', 'Critical', 'High', 'Moderate', 'Low'].map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={labelStyle}>Status</label>
                                            <select value={activeFilters.status} onChange={e => setActiveFilters(f => ({ ...f, status: e.target.value }))} style={{ ...fieldStyle, cursor: 'pointer' }}>
                                                {['All', 'Waiting', 'Triage'].map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={() => { setActiveFilters({ urgency: 'All', status: 'All' }); setShowFilterDropdown(false); }} style={{ width: '100%', padding: '8px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Clear Filters</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><Plus size={14} /> ADD PATIENT</button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingRight: '8px' }}>
                        <AnimatePresence initial={false}>
                            {filteredQueue.map((patient) => (
                                <motion.div key={patient.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="card glass" style={{ padding: 'var(--space-md)', borderLeft: `6px solid ${getUrgencyColor(patient.urgency)}`, background: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}
                                    onClick={() => setSelectedPatient(patient)}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', alignItems: 'center', gap: 'var(--space-lg)' }}>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{patient.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age {patient.age} • {patient.arrival}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Heart size={14} color={patient.vitals.hr > 100 || patient.vitals.hr < 60 ? '#ef4444' : '#64748b'} style={{ marginBottom: '4px' }} />
                                                <div style={{ fontWeight: 800 }}>{patient.vitals.hr}</div><div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>BPM</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <Droplets size={14} color={patient.vitals.o2 < 92 ? '#ef4444' : '#64748b'} style={{ marginBottom: '4px' }} />
                                                <div style={{ fontWeight: 800 }}>{patient.vitals.o2}%</div><div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>SpO2</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <Thermometer size={14} color={patient.vitals.temp > 100 ? '#ef4444' : '#64748b'} style={{ marginBottom: '4px' }} />
                                                <div style={{ fontWeight: 800 }}>{patient.vitals.temp}°F</div><div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)' }}>TEMP</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: `${getUrgencyColor(patient.urgency)}20`, color: getUrgencyColor(patient.urgency), fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>{patient.urgency}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{patient.score}</div>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ML Score</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {filteredQueue.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                <Filter size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                <div style={{ fontWeight: 600 }}>No patients match the current filters</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Patient Case View / Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ flex: 1, padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
                        {!selectedPatient ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <Navigation size={48} style={{ opacity: 0.2, marginBottom: 'var(--space-md)' }} />
                                <div style={{ fontWeight: 700 }}>Select a patient for clinical orchestration</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>CASE PROFILE</div>
                                    <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedPatient.name}</h4>
                                    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
                                        {selectedPatient.symptoms?.map(s => (
                                            <span key={s} style={{ background: 'var(--surface)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="card glass" style={{ border: 'none', background: 'var(--background)' }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>CLINICAL ACTIONS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                        <button className="btn btn-primary" style={{ justifyContent: 'space-between', width: '100%', padding: '14px' }} onClick={() => handleAction(selectedPatient.id, 'Bed Assigned')}>ASSIGN BEDSIDE <Bed size={18} /></button>
                                        <button className="btn glass" style={{ justifyContent: 'space-between', width: '100%', padding: '14px', border: '1px solid #a855f7', color: '#a855f7' }} onClick={() => handleAction(selectedPatient.id, 'Fast-Track')}>FAST-TRACK LABS <Zap size={18} /></button>
                                        <button className="btn glass" style={{ justifyContent: 'space-between', width: '100%', padding: '14px', border: '1px solid #ef4444', color: '#ef4444' }} onClick={() => handleAction(selectedPatient.id, 'Admitted')}>DIRECT ADMIT <Plus size={18} /></button>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', marginBottom: 'var(--space-md)' }}>ML PREDICTION ({selectedPatient.score}% Conf.)</div>
                                    <div className="card" style={{ background: '#f8fafc', padding: 'var(--space-md)', fontSize: '0.85rem' }}>
                                        <TrendingUp size={16} color="var(--primary)" style={{ marginBottom: '8px' }} />
                                        <p style={{ margin: 0, lineHeight: 1.5, color: '#334155' }}>
                                            Urgency detected as <strong>{selectedPatient.urgency}</strong>.
                                            Target triage protocol initiated based on statistical biomarkers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Patient Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle} onClick={() => setShowAddModal(false)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={modalStyle} onClick={e => e.stopPropagation()}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--primary), #6366f1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} color="white" /></div>
                                    <div><h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add New Patient</h3><p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Enter patient details for ML triage assessment</p></div>
                                </div>
                                <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex' }}><X size={18} color="#64748b" /></button>
                            </div>

                            <div style={{ padding: '20px 24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                    <User size={16} color="var(--primary)" /><span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>Personal Information</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Full Name *</label><input style={fieldStyle} placeholder="Enter patient name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Age *</label><input style={fieldStyle} type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Gender</label><select style={{ ...fieldStyle, cursor: 'pointer' }} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select></div>
                                    <div><label style={labelStyle}>Blood Group</label><select style={{ ...fieldStyle, cursor: 'pointer' }} value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}</select></div>
                                    <div><label style={labelStyle}>Contact Number</label><input style={fieldStyle} placeholder="Phone number" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Emergency Contact</label><input style={fieldStyle} placeholder="Emergency contact number" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} /></div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                    <Heart size={16} color="#ef4444" /><span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ef4444' }}>Health Information & Vitals</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                    <div><label style={labelStyle}>Heart Rate (BPM)</label><input style={fieldStyle} type="number" placeholder="e.g. 75" value={formData.hr} onChange={e => setFormData({ ...formData, hr: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Blood Pressure</label><input style={fieldStyle} placeholder="e.g. 120/80" value={formData.bp} onChange={e => setFormData({ ...formData, bp: e.target.value })} /></div>
                                    <div><label style={labelStyle}>SpO2 (%)</label><input style={fieldStyle} type="number" placeholder="e.g. 98" value={formData.o2} onChange={e => setFormData({ ...formData, o2: e.target.value })} /></div>
                                    <div><label style={labelStyle}>Temperature (°F)</label><input style={fieldStyle} type="number" step="0.1" placeholder="e.g. 98.6" value={formData.temp} onChange={e => setFormData({ ...formData, temp: e.target.value })} /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Symptoms (comma separated)</label><input style={fieldStyle} placeholder="e.g. Chest Pain, Shortness of Breath" value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} /></div>
                                    <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Chief Complaint</label><textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: '60px' }} placeholder="Describe the primary reason for visit" value={formData.chiefComplaint} onChange={e => setFormData({ ...formData, chiefComplaint: e.target.value })} /></div>
                                </div>
                            </div>

                            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>Cancel</button>
                                <button onClick={handleAddPatient} disabled={!formData.name || !formData.age}
                                    style={{ padding: '10px 24px', background: (!formData.name || !formData.age) ? '#cbd5e1' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: (!formData.name || !formData.age) ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle2 size={16} /> Confirm & Run ML Triage
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartTriage;
