import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, UserPlus, LogIn, ShieldCheck } from 'lucide-react';

// Email validation regex
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Login = () => {
    const { signIn, signUp, sendForgotPasswordOtp, resetPasswordWithOtp, verifyFirstLoginOtp, resendOtp } = useAuth();
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

    // Forgot Password States
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newForgotPass, setNewForgotPass] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);

    // First Login OTP States
    const [showFirstLoginOtp, setShowFirstLoginOtp] = useState(false);
    const [firstLoginOtp, setFirstLoginOtp] = useState('');
    const [firstLoginOtpTimer, setFirstLoginOtpTimer] = useState(0);

    React.useEffect(() => {
        let interval = null;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    React.useEffect(() => {
        let interval = null;
        if (firstLoginOtpTimer > 0) {
            interval = setInterval(() => {
                setFirstLoginOtpTimer((prev) => prev - 1);
            }, 1000);
        } else if (interval) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [firstLoginOtpTimer]);

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
            const result = await signIn(email, password);
            if (result && result.requiresFirstLoginOtp) {
                setShowFirstLoginOtp(true);
                setSuccess(result.message);
                setFirstLoginOtpTimer(120); // 2 minutes
                return; // Stop here and wait for OTP
            }

            const user = result;
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
            const result = await signUp(email, password, name);
            if (result && result.requiresFirstLoginOtp) {
                setShowFirstLoginOtp(true);
                setSuccess(result.message);
                setFirstLoginOtpTimer(120); // 2 minutes
                return;
            }

            const user = result;
            setSuccess('Account created! Welcome to ArtVista.');
            setTimeout(() => {
                if (user.role === 'admin') navigate('/admin');
                else if (user.role === 'curator') navigate('/curator');
                else if (user.role === 'artist') navigate('/artist');
                else navigate('/');
            }, 1200);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyFirstLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!firstLoginOtp) {
            setError('Please enter the OTP.');
            return;
        }
        setLoading(true);
        try {
            const user = await verifyFirstLoginOtp(email, firstLoginOtp);
            setSuccess('Login successful!');
            setTimeout(() => {
                setShowFirstLoginOtp(false);
                if (user.role === 'admin') navigate('/admin');
                else if (user.role === 'curator') navigate('/curator');
                else if (user.role === 'artist') navigate('/artist');
                else navigate('/');
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendFirstLoginOtp = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await resendOtp(email);
            setSuccess('OTP resent! Please check your email.');
            setFirstLoginOtpTimer(120); // 2 minutes
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Forgot Password Handlers ---
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setSuccess('');
        if (!isValidEmail(forgotEmail)) {
            setError('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            await sendForgotPasswordOtp(forgotEmail);
            setSuccess('OTP sent! Please check your email.');
            setForgotStep(2);
            setOtpTimer(120); // 2 minutes
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (newForgotPass.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }
        if (!forgotOtp) {
            setError('Please enter the OTP.');
            return;
        }
        setLoading(true);
        try {
            await resetPasswordWithOtp(forgotEmail, forgotOtp, newForgotPass);
            setSuccess('Password reset successfully! You can now sign in.');
            setTimeout(() => {
                setShowForgotPassword(false);
                setForgotStep(1);
                setForgotEmail('');
                setForgotOtp('');
                setNewForgotPass('');
                setActiveTab('signin');
                setSuccess('');
            }, 2000);
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
                                <div style={{ textAlign: 'right', marginTop: '0.4rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                                        style={{ fontSize: '0.75rem', color: 'var(--color-accent)', background: 'none', fontWeight: '500', cursor: 'pointer' }}
                                    >
                                        Forgot Password?
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

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPassword && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                        }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            style={{
                                background: 'var(--color-white)', borderRadius: '12px', padding: '2.5rem',
                                width: '100%', maxWidth: '400px', margin: '0 1rem', position: 'relative'
                            }}
                        >
                            <button 
                                onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); setForgotStep(1); }}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                            >
                                &times;
                            </button>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Reset Password</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                {forgotStep === 1 ? "Enter your email to receive an OTP." : "Enter the OTP sent to your email and a new password."}
                            </p>

                            {error && <p style={{ color: '#c53030', fontSize: '0.85rem', marginBottom: '1rem', background: '#fff5f5', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
                            {success && <p style={{ color: '#276749', fontSize: '0.85rem', marginBottom: '1rem', background: '#f0fff4', padding: '0.5rem', borderRadius: '4px' }}>{success}</p>}

                            {forgotStep === 1 && (
                                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>Email Address</label>
                                        <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem' }}>
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </form>
                            )}

                            {forgotStep === 2 && (
                                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={labelStyle}>OTP Code</label>
                                        <input type="text" required value={forgotOtp} onChange={e => setForgotOtp(e.target.value)} style={inputStyle} placeholder="6-digit OTP" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>New Password</label>
                                        <input type="password" required value={newForgotPass} onChange={e => setNewForgotPass(e.target.value)} style={inputStyle} placeholder="Min. 6 characters" />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem' }}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => handleSendOtp()}
                                            disabled={loading || otpTimer > 0}
                                            style={{ color: otpTimer > 0 ? 'var(--color-text-muted)' : 'var(--color-accent)', background: 'none', fontSize: '0.85rem', cursor: otpTimer > 0 ? 'not-allowed' : 'pointer' }}
                                        >
                                            {otpTimer > 0 ? `Resend OTP in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* First Login Verification Modal */}
            <AnimatePresence>
                {showFirstLoginOtp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                        }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            style={{
                                background: 'var(--color-white)', borderRadius: '12px', padding: '2.5rem',
                                width: '100%', maxWidth: '400px', margin: '0 1rem', position: 'relative'
                            }}
                        >
                            <button 
                                onClick={() => { setShowFirstLoginOtp(false); setError(''); setSuccess(''); }}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                            >
                                &times;
                            </button>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Verify Email</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Since this is your first time logging in, we sent an OTP to {email} to verify your identity.
                            </p>

                            {error && <p style={{ color: '#c53030', fontSize: '0.85rem', marginBottom: '1rem', background: '#fff5f5', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}
                            {success && <p style={{ color: '#276749', fontSize: '0.85rem', marginBottom: '1rem', background: '#f0fff4', padding: '0.5rem', borderRadius: '4px' }}>{success}</p>}

                            <form onSubmit={handleVerifyFirstLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>OTP Code</label>
                                    <input type="text" required value={firstLoginOtp} onChange={e => setFirstLoginOtp(e.target.value)} style={inputStyle} placeholder="6-digit OTP" />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.9rem' }}>
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => handleResendFirstLoginOtp()}
                                        disabled={loading || firstLoginOtpTimer > 0}
                                        style={{ color: firstLoginOtpTimer > 0 ? 'var(--color-text-muted)' : 'var(--color-accent)', background: 'none', fontSize: '0.85rem', cursor: firstLoginOtpTimer > 0 ? 'not-allowed' : 'pointer' }}
                                    >
                                        {firstLoginOtpTimer > 0 ? `Resend OTP in ${Math.floor(firstLoginOtpTimer / 60)}:${(firstLoginOtpTimer % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
