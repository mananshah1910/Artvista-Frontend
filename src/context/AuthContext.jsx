import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://artvista-backend-s3um.onrender.com';
const AuthContext = createContext();

const STORAGE_KEY_USER = 'art_gallery_user';
const STORAGE_KEY_USERS_DB = 'art_gallery_users_db';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Get the users database from localStorage
  const getUsersDb = () => {
    const db = localStorage.getItem(STORAGE_KEY_USERS_DB);
    return db ? JSON.parse(db) : {};
  };

  // Save the users database to localStorage
  const saveUsersDb = (db) => {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
  };

  // Sign Up - register a new user
  const signUp = async (email, password, name) => {

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password, name: name || email.split('@')[0] })
    });

    if (response.status === 202) {
       const data = await response.json();
       return { requiresFirstLoginOtp: true, email: data.email, message: data.message };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Sign up failed');
    }

    const newUser = await response.json();
    const sessionUser = { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));

    return sessionUser;
  };

  // Sign In - login for both regular users and staff
  const signIn = async (email, password) => {
    const lowerEmail = email.toLowerCase();

    // Regular user login
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lowerEmail, password })
    });

    if (response.status === 202) {
       const data = await response.json();
       return { requiresFirstLoginOtp: true, email: data.email, message: data.message };
    }

    if (!response.ok) {
      throw new Error('Incorrect credentials. Please try again.');
    }

    const storedUser = await response.json();
    const sessionUser = { id: storedUser.id, role: storedUser.role, name: storedUser.name, email: storedUser.email };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const verifyFirstLoginOtp = async (email, otp) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-first-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), otp })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Invalid OTP.');
    }

    const storedUser = await response.json();
    const sessionUser = { id: storedUser.id, role: storedUser.role, name: storedUser.name, email: storedUser.email };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    return sessionUser;
  };

  // Legacy login support (for role-based staff login via old components)
  const login = (role, email, password) => {
    if (role === 'admin') {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      if (email !== adminEmail || password !== adminPassword) {
        throw new Error('Invalid admin credentials');
      }
    }
    const newUser = { id: Date.now(), role, name: role.charAt(0).toUpperCase() + role.slice(1) };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
  };

  const resendOtp = async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase() })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to resend OTP.');
    }
    return await response.text();
  };

  const sendForgotPasswordOtp = async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase() })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to send OTP.');
    }
    return await response.text();
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), otp, newPassword })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || 'Failed to reset password.');
    }
    return await response.text();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  return (
    <AuthContext.Provider value={{ user, login, signIn, signUp, logout, loading, sendForgotPasswordOtp, resetPasswordWithOtp, verifyFirstLoginOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
