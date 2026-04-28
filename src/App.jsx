import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GalleryProvider } from './context/GalleryContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Explore from './pages/Explore';
import ArtDetails from './pages/ArtDetails';
import Tour from './pages/Tour';
import Cart from './pages/Cart';

import ArtistDashboard from './pages/Dashboards/ArtistDashboard';
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import CuratorDashboard from './pages/Dashboards/CuratorDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', letterSpacing: '0.2em' }}>Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <GalleryProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/art/:id" element={<ArtDetails />} />
                <Route path="/tour" element={<Tour />} />
                <Route path="/cart" element={<Cart />} />

                <Route path="/artist" element={
                  <ProtectedRoute role="artist">
                    <ArtistDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/curator" element={
                  <ProtectedRoute role="curator">
                    <CuratorDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </GalleryProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
