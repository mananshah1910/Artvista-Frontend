import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

// Email validation regex
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = () => {
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    // 'signin', 'signup', 'staff'
    const [activeTab, setActiveTab] = useState('signin');
    const [showPassword, setShowPassword] = useState(false);

    // Shared fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
        setShowPassword(false);
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        resetForm();
    };

    // --- Validation ---
    const validate = () => {
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address (e.g. user@example.com).');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        if (activeTab === 'signup' && password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        return true;
    };

    // --- Sign In handler ---
    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            const user = await signIn(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'curator') navigate('/curator');
            else if (user.role === 'artist') navigate('/artist');
            else navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Sign Up handler ---
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            await signUp(email, password, name);
            setSuccess('Account created! Welcome to ArtVista.');
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Staff Sign In handler ---
    const handleStaffSignIn = async (e) => {
        e.preventDefault();
        setError('');
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const user = await signIn(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'curator') navigate('/curator');
            else if (user.role === 'artist') navigate('/artist');
            else navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'signin', label: 'Sign In', icon: LogIn },
        { id: 'signup', label: 'Sign Up', icon: UserPlus },
        { id: 'staff', label: 'Staff Access', icon: ShieldCheck },
    ];

    return (
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: '480px',
                    margin: '0 auto',
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '3rem 3rem 0', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {activeTab === 'signup' ? 'Create Account' : activeTab === 'staff' ? 'Staff Portal' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                        {activeTab === 'signup' ? 'Join the ArtVista community.' : activeTab === 'staff' ? 'Authorised personnel only.' : 'Sign in to your ArtVista account.'}
                    </p>
                </div>

                {/* Tab Switcher */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', margin: '0 3rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => switchTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '0.9rem 0.5rem',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: activeTab === tab.id ? '700' : '400',
                                color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                                background: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Area */}
                <div style={{ padding: '2.5rem 3rem 3rem' }}>
                    {/* Error & Success Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    background: '#fff5f5',
                                    color: '#c53030',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.88rem',
                                    border: '1px solid #feb2b2',
                                    textAlign: 'left'
                                }}
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    background: '#f0fff4',
                                    color: '#276749',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.88rem',
                                    border: '1px solid #9ae6b4',
                                    textAlign: 'left'
                                }}
                            >
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ---- SIGN IN TAB ---- */}
                    {activeTab === 'signin' && (
                        <motion.form
                            key="signin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSignIn}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}
                        >
                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', padding: '1.1rem', marginTop: '0.5rem', fontSize: '1rem' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                Don't have an account?{' '}
                                <button type="button" onClick={() => switchTab('signup')} style={{ color: 'var(--color-accent)', fontWeight: '600', background: 'none', cursor: 'pointer' }}>
                                    Sign Up
                                </button>
                            </p>
                        </motion.form>
                    )}

                    {/* ---- SIGN UP TAB ---- */}
                    {activeTab === 'signup' && (
                        <motion.form
                            key="signup"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSignUp}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}
                        >
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={inputStyle}
                                />
                                {email && !isValidEmail(email) && (
                                    <p style={{ fontSize: '0.78rem', color: '#c53030', marginTop: '0.4rem' }}>Enter a valid email address.</p>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Password <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(min. 6 characters)</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {/* Password strength bar */}
                                {password.length > 0 && (
                                    <div style={{ marginTop: '0.6rem' }}>
                                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                borderRadius: '2px',
                                                width: password.length < 6 ? '30%' : password.length < 10 ? '65%' : '100%',
                                                background: password.length < 6 ? '#fc8181' : password.length < 10 ? '#f6ad55' : '#68d391',
                                                transition: 'all 0.3s ease'
                                            }} />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                                            Strength: {password.length < 6 ? 'Too short' : password.length < 10 ? 'Fair' : 'Strong'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    style={{ ...inputStyle, borderColor: confirmPassword && confirmPassword !== password ? '#fc8181' : undefined }}
                                />
                                {confirmPassword && confirmPassword !== password && (
                                    <p style={{ fontSize: '0.78rem', color: '#c53030', marginTop: '0.4rem' }}>Passwords do not match.</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', padding: '1.1rem', marginTop: '0.5rem', fontSize: '1rem' }}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                Already have an account?{' '}
                                <button type="button" onClick={() => switchTab('signin')} style={{ color: 'var(--color-accent)', fontWeight: '600', background: 'none', cursor: 'pointer' }}>
                                    Sign In
                                </button>
                            </p>
                        </motion.form>
                    )}

                    {/* ---- STAFF ACCESS TAB ---- */}
                    {activeTab === 'staff' && (
                        <motion.form
                            key="staff"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleStaffSignIn}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}
                        >
                            <div style={{
                                background: '#fffbeb',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                padding: '1rem',
                                fontSize: '0.85rem',
                                color: '#92400e',
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'flex-start'
                            }}>
                                <ShieldCheck size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>This section is for authorised ArtVista staff only. Unauthorised access is prohibited.</span>
                            </div>
                            <div>
                                <label style={labelStyle}>Staff Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="staff@artvista.art"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Staff Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none' }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', padding: '1.1rem', marginTop: '0.5rem', fontSize: '1rem' }}
                            >
                                {loading ? 'Verifying...' : 'Staff Login'}
                            </button>
                        </motion.form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)'
};

const inputStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    background: '#fafafa',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
};

export default Login;
