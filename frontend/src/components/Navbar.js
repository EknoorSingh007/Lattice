import { Link, useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuth';
import React, { useState, useEffect,useContext } from 'react';
import { Search, MessageCircle, Calendar, User, Bell, Menu, X, Star, Users, BookOpen, ArrowRight, Zap, Globe, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext'; 
const Navbar = () => {
     const [isMenuOpen, setIsMenuOpen] = useState(false);
      const [activeTab, setActiveTab] = useState('features');
      const [currentTestimonial, setCurrentTestimonial] = useState(0);
        const { user, dispatch } = useContext(AuthContext);
       const [userProfile, setUserProfile] = useState(null);
    
      useEffect(() => {
        if (user) {
          fetchUserProfile();
        }
      }, [user]);
    console.log("User from context:", user);
    
      const fetchUserProfile = async () => {
      try {
       const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${user.token}`  // or localStorage.getItem('userToken')
      }
    });
    
        const profileData = await response.json();
        console.log('Fetched profile data:', profileData); // 👈 Add this
    
        // Update this line depending on your response shape
        setUserProfile(profileData); // or profileData.user
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    
      const handleLogout = () => {
        // Clear localStorage and dispatch logout action
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/favicon.svg" alt="Lattice" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Lattice
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/discover" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Discover</Link>
              <Link to="/chat" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Community</Link>
              <Link to="/sessions" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Sessions</Link>
              <Link to="/aboutus" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">AboutUs</Link>
            </div>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
          // Show when user is logged in
          <>
            <Link to="/profile">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                My Profile
              </button>
            </Link>
            <button 
              onClick={handleLogout}
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              Logout
            </button>
          <span className="ml-3 inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-semibold text-sm rounded-full shadow-sm border border-purple-300">
  <span>👋 Welcome,</span>
  <span className="font-bold">
    {userProfile?.firstName ? `${userProfile.firstName}` : 'User'}
  </span>
</span>

      
          </>
        ) : (
          // Show when user is not logged in
          <>
            <Link to="/login">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Sign Up
              </button>
            </Link>
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium">
              Start Learning
            </button>
          </>
        )}
      </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;