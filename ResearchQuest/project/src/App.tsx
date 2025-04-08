import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Communities from './components/Communities';
import JoinedCommunities from './components/JoinedCommunities';
import CommunityChat from './components/CommunityChat';
import Resources from './components/Resources';
import Profile from './components/Profile';
import { ProfileSetup } from './components/ProfileSetup';
import ResearchJourney from './components/ResearchJourney';
import Footer from './components/Footer';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile/setup"
                element={
                  <PrivateRoute>
                    <ProfileSetup />
                  </PrivateRoute>
                }
              />
              <Route
                path="/communities"
                element={
                  <PrivateRoute>
                    <Communities />
                  </PrivateRoute>
                }
              />
              <Route
                path="/communities/joined"
                element={
                  <PrivateRoute>
                    <JoinedCommunities />
                  </PrivateRoute>
                }
              />
              <Route
                path="/communities/:communityId/chat"
                element={
                  <PrivateRoute>
                    <CommunityChat />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <PrivateRoute>
                    <Resources />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/journey"
                element={
                  <PrivateRoute>
                    <ResearchJourney />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;