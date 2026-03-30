import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, Spinner } from './components/UI';
import Navbar from './components/Navbar';
import { LoginPage, SignupPage } from './pages/AuthPages';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import BookingPage from './pages/BookingPage';
import ItineraryPage from './pages/ItineraryPage';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function Loading() {
  return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,background:'var(--bg)' }}>
      <div style={{ width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#c9a84c,#9d7c2e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>✈️</div>
      <Spinner size={26}/>
      <div style={{ color:'var(--muted)',fontSize:13 }}>Loading WorldTrips…</div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading/>;
  if (!user) return <Navigate to="/welcome" replace/>;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading/>;
  if (!user) return <Navigate to="/welcome" replace/>;
  if (user.role !== 'admin') return <Navigate to="/" replace/>;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading/>;
  if (user) return <Navigate to={user.role==='admin'?'/admin':'/'} replace/>;
  return children;
}

function Layout({ children }) {
  return <><Navbar/>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public landing page — shown to everyone not logged in */}
            <Route path="/welcome" element={<PublicOnly><LandingPage/></PublicOnly>}/>
            <Route path="/login"   element={<PublicOnly><LoginPage/></PublicOnly>}/>
            <Route path="/signup"  element={<PublicOnly><SignupPage/></PublicOnly>}/>

            {/* Protected app routes */}
            <Route path="/"          element={<ProtectedRoute><Layout><HomePage/></Layout></ProtectedRoute>}/>
            <Route path="/packages"  element={<ProtectedRoute><Layout><PackagesPage/></Layout></ProtectedRoute>}/>
            <Route path="/book"      element={<ProtectedRoute><Layout><BookingPage/></Layout></ProtectedRoute>}/>
            <Route path="/itinerary" element={<ProtectedRoute><Layout><ItineraryPage/></Layout></ProtectedRoute>}/>
            <Route path="/chat"      element={<ProtectedRoute><Layout><ChatPage/></Layout></ProtectedRoute>}/>
            <Route path="/admin"     element={<AdminRoute><Layout><AdminDashboard/></Layout></AdminRoute>}/>

            {/* Redirect root to welcome if not logged in */}
            <Route path="*" element={<Navigate to="/welcome" replace/>}/>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}