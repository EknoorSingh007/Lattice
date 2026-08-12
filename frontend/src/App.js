
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuth';

// Page Imports
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage'; // Your original Home.js content
import Dashboard from './pages/Dashboard';     // A new dashboard for logged-in users
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import MyProfile from './pages/MyProfile';
import Discover from './pages/Discover';       // Renamed for clarity
import ChatPage from './pages/ChatPage';       // New Chat Page
import Sessions from './pages/Sessions';       // New Sessions Page
import VideoPage from './pages/VideoPage';     // New Video Call Page
import AboutUs from './pages/AboutUs';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Layout component to wrap pages with Navbar
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes that are only accessible when logged out */}
        <Route path="/login" element={!user ? <PageTransition><Login /></PageTransition> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <PageTransition><Signup /></PageTransition> : <Navigate to="/profilesetup" />} />
        <Route path="/landing" element={!user ? <AppLayout><PageTransition><LandingPage /></PageTransition></AppLayout> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <AppLayout><PageTransition><MyProfile /></PageTransition></AppLayout> : <Navigate to="/login" />} />

        {/* Protected Routes - a layout with Navbar will be applied */}
        <Route 
          path="/" 
          element={user ? <AppLayout><PageTransition><Dashboard /></PageTransition></AppLayout> : <Navigate to="/landing" />} 
        />
        <Route 
          path="/profilesetup" 
          element={user ? <PageTransition><ProfileSetup /></PageTransition> : <Navigate to="/login" />}
        />
        <Route 
          path="/discover" 
          element={user ? <AppLayout><PageTransition><Discover /></PageTransition></AppLayout> : <Navigate to="/login" />} 
        />
         <Route 
          path="/chat" 
          element={user ? <AppLayout><PageTransition><ChatPage /></PageTransition></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat/:receiverId" 
          element={user ? <AppLayout><PageTransition><ChatPage /></PageTransition></AppLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/sessions" 
          element={user ? <AppLayout><PageTransition><Sessions /></PageTransition></AppLayout> : <Navigate to="/login" />}
        />
         <Route 
          path="/session/:roomId" 
          element={user ? <AppLayout><PageTransition><VideoPage /></PageTransition></AppLayout> : <Navigate to="/login" />}
        />
        <Route path="/aboutus" element={<PageTransition><AboutUs /></PageTransition>} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to={user ? "/" : "/landing"} />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;