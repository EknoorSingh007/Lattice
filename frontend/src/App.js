// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Home from './pages/LandingPage';
// import Signup from './pages/Signup';
// import Login from './pages/Login';
// import ProfileSetup from './pages/ProfileSetup'; // ✅ Make sure this path is correct
// import { useAuthContext } from './hooks/useAuth';
// import MyProfile from './pages/MyProfile';
// import DiscoverPage from './pages/Discover';
// import CommunityPage from './pages/CommunityPage';
// import ResourcesPage   from './pages/ResourcesPage';
// import SessionsPage from './pages/SessionsPage';
// function App() {
//   const { user } = useAuthContext();

//   return (
//     <div className="App">
//       <BrowserRouter>
//         <div className="pages">
//           <Routes>
//             {/* Public routes */}
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/profile" element={<MyProfile />} />
//             <Route path="/discover" element={<DiscoverPage />} />
//             <Route path="/community" element={<CommunityPage />} />
//             <Route path="/sessions" element={<SessionsPage />} />
//             <Route path="/resources" element={<ResourcesPage />} />

//             {/* Protected routes */}
//             <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
//             <Route path="/profilesetup" element={user ? <ProfileSetup /> : <Navigate to="/login" />} />
            
//           </Routes>
//         </div>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
// Layout component to wrap pages with Navbar
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
  </>
);

function App() {
  const { user } = useAuthContext();

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public routes that are only accessible when logged out */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/profilesetup" />} />
          <Route path="/landing" element={!user ? <LandingPage /> : <Navigate to="/" />} />
           <Route path="/profile" element={<MyProfile />} />

          {/* Protected Routes - a layout with Navbar will be applied */}
          <Route 
            path="/" 
            element={user ? <AppLayout><Dashboard /></AppLayout> : <Navigate to="/landing" />} 
          />
          <Route 
            path="/profilesetup" 
            element={user ? <ProfileSetup /> : <Navigate to="/login" />}
          />
          <Route 
            path="/discover" 
            element={user ? <AppLayout><Discover /></AppLayout> : <Navigate to="/login" />} 
          />
           <Route 
            path="/chat" 
            element={user ? <AppLayout><ChatPage /></AppLayout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/chat/:receiverId" 
            element={user ? <AppLayout><ChatPage /></AppLayout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/sessions" 
            element={user ? <AppLayout><Sessions /></AppLayout> : <Navigate to="/login" />}
          />
           <Route 
            path="/session/:roomId" 
            element={user ? <AppLayout><VideoPage /></AppLayout> : <Navigate to="/login" />}
          />
          <Route path="/aboutus" element={<AboutUs />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to={user ? "/" : "/landing"} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;