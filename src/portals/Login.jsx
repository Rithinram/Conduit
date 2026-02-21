import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2, Hospital, ShieldCheck, User, Zap, Activity } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(data));

            // Redirect based on role
            if (data.role === 'admin') navigate('/admin');
            else if (data.role === 'hospital') navigate('/hospital');
            else navigate('/user');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            {/* Animated Background Elements */}
            <div style={bgOverlayStyle} />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={bgCircle1}
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={bgCircle2}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="card glass"
                style={cardStyle}
            >
                <div style={headerStyle}>
                    <div style={logoWrapperStyle}>
                        <Activity size={32} color="white" />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '16px 0 4px 0', letterSpacing: '-1.5px', color: 'var(--primary)' }}>
                        CONDUIT LOGIN
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                        Strategic Healthcare Intelligence Gateway
                    </p>
                </div>

                <form onSubmit={handleLogin} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>OPERATIONAL EMAIL</label>
                        <div style={inputWrapperStyle}>
                            <Mail size={18} style={iconStyle} />
                            <input
                                type="email"
                                placeholder="name@health.com"
                                style={inputStyle}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>ACCESS KEY</label>
                        <div style={inputWrapperStyle}>
                            <Lock size={18} style={iconStyle} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                style={inputStyle}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={errorStyle}
                            >
                                <Zap size={14} /> {error.toUpperCase()}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary elevation-hover"
                        style={submitButtonStyle}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>SYNCHRONIZING...</span>
                            </>
                        ) : (
                            <>
                                <span>INITIALIZE SESSION</span>
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div style={footerStyle}>
                    <div style={roleBadgeStyle}>
                        <User size={14} /> PATIENT
                    </div>
                    <div style={roleBadgeStyle}>
                        <Hospital size={14} /> CLINICAL
                    </div>
                    <div style={roleBadgeStyle}>
                        <ShieldCheck size={14} /> ADMIN
                    </div>
                </div>

                <div style={demoCredentialsStyle}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.7rem', color: 'var(--text-muted)' }}>DEMO GATEWAY ACCESS:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        <span style={hintStyle} title="Admin Access">user1@health.com / 123456</span>
                        <span style={hintStyle} title="Hospital Access">user2@health.com / 123456</span>
                        <span style={hintStyle} title="User Access">user3@health.com / 123456</span>
                    </div>
                </div>
            </motion.div>

            <button
                onClick={() => navigate('/')}
                style={backButtonStyle}
            >
                ← BACK TO PULSE MAP
            </button>
        </div>
    );
};

// Styles
const containerStyle = {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'var(--font-main)'
};

const bgOverlayStyle = {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(29, 78, 137, 0.03) 0%, transparent 70%)',
    zIndex: 1
};

const bgCircle1 = {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(29, 78, 137, 0.05) 0%, transparent 80%)',
    zIndex: 0
};

const bgCircle2 = {
    position: 'absolute',
    bottom: '-15%',
    left: '-10%',
    width: '800px',
    height: '800px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(42, 188, 167, 0.05) 0%, transparent 80%)',
    zIndex: 0
};

const cardStyle = {
    width: '100%',
    maxWidth: '460px',
    padding: 'var(--space-xxl)',
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    boxShadow: '0 20px 50px rgba(29, 78, 137, 0.1), 0 0 0 1px rgba(29, 78, 137, 0.05)'
};

const headerStyle = {
    marginBottom: 'var(--space-xl)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const logoWrapperStyle = {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(29, 78, 137, 0.3)'
};

const formStyle = {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-lg)'
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle = {
    fontSize: '0.65rem',
    fontWeight: 900,
    color: 'var(--text-muted)',
    letterSpacing: '1.5px',
    marginLeft: '4px'
};

const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
};

const iconStyle = {
    position: 'absolute',
    left: '16px',
    color: 'var(--primary)',
    opacity: 0.7
};

const inputStyle = {
    width: '100%',
    padding: '14px 14px 14px 48px',
    borderRadius: '12px',
    border: '1px solid var(--surface-border)',
    background: '#fcfdfe',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    outline: 'none'
};

const errorStyle = {
    background: 'rgba(230, 57, 70, 0.1)',
    color: 'var(--danger)',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.75rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(230, 57, 70, 0.2)'
};

const submitButtonStyle = {
    marginTop: 'var(--space-md)',
    padding: '16px',
    fontSize: '0.95rem',
    fontWeight: 800,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    letterSpacing: '0.5px'
};

const footerStyle = {
    marginTop: 'var(--space-xl)',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    borderTop: '1px solid var(--surface-border)',
    paddingTop: 'var(--space-lg)'
};

const roleBadgeStyle = {
    fontSize: '0.65rem',
    fontWeight: 800,
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textTransform: 'uppercase'
};

const demoCredentialsStyle = {
    marginTop: 'var(--space-lg)',
    padding: '12px',
    background: 'rgba(29, 78, 137, 0.03)',
    borderRadius: '10px'
};

const hintStyle = {
    fontSize: '0.7rem',
    color: 'var(--primary)',
    background: 'white',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid rgba(29, 78, 137, 0.1)',
    fontWeight: 600,
    cursor: 'help'
};

const backButtonStyle = {
    position: 'absolute',
    bottom: '40px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    zIndex: 10,
    opacity: 0.7,
    transition: 'all 0.3s ease'
};

export default Login;
