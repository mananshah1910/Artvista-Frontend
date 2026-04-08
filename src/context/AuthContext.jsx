import React, { createContext, useContext, useState, useEffect } from 'react';

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

    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), password, name: name || email.split('@')[0] })
    });

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
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lowerEmail, password })
    });

    if (!response.ok) {
      throw new Error('Incorrect credentials. Please try again.');
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  return (
    <AuthContext.Provider value={{ user, login, signIn, signUp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
