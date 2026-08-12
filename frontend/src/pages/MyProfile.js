import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Adjust path as needed
import { useNavigate } from 'react-router-dom'; // ⬅ Add this at the top
const MyProfile = () => {
  const { user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
     const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/profile`, {
  headers: {
    'Authorization': `Bearer ${user.token}`,
    'Content-Type': 'application/json'
  }
});


      if (response.status === 404) {
        navigate('/profilesetup');
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAvailability = (availability) => {
    if (!availability) return [];
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days
      .filter(day => availability[day]?.available)
      .map(day => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        times: availability[day].times || []
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchUserProfile}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/favicon.svg" alt="Lattice" className="w-10 h-10" />
              <span className="text-xl font-bold text-gray-800">Lattice</span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-purple-600 transition-colors">Home</Link>
              <Link to="/discover" className="text-gray-600 hover:text-purple-600 transition-colors">Discover</Link>
              <Link to="/chat" className="text-gray-600 hover:text-purple-600 transition-colors">Community</Link>
              <Link to="/sessions" className="text-gray-600 hover:text-purple-600 transition-colors">Sessions</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                {userProfile?.profilePhoto ? (
                  <img 
                    src={userProfile.profilePhoto} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-purple-600">
                    {userProfile?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">
                  {userProfile?.firstName && userProfile?.lastName 
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : user?.email || 'User Profile'
                  }
                </h1>
                <p className="text-purple-100 mb-1">📍 {userProfile?.location || 'Location not set'}</p>
                <p className="text-purple-100">📧 {user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                      <p className="text-gray-800">{userProfile?.dateOfBirth || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
                      <p className="text-gray-800">{userProfile?.bio || 'No bio available'}</p>
                    </div>
                    
                  </div>
                </div>

                {/* Skills to Teach */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Skills I Can Teach</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.skillsToTeach?.length > 0 ? (
                      userProfile.skillsToTeach.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No teaching skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Skills to Learn */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Skills I Want to Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.skillsToLearn?.length > 0 ? (
                      userProfile.skillsToLearn.map((skill, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No learning skills added yet</p>
                    )}
                  </div>
                </div>
              </div>

             {/* Availability */}
<div>
  <h2 className="text-2xl font-bold text-gray-800 mb-4">Availability</h2>
  <div className="bg-gray-50 rounded-lg p-6">
    {formatAvailability(userProfile?.availability).length > 0 ? (
      <div className="flex flex-wrap gap-3">
        {formatAvailability(userProfile.availability).map((day, index) => (
          <span
            key={index}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:scale-105 transition-transform duration-200"
          >
            {day.day}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic">No availability set</p>
    )}
  </div>
</div>


            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
            onClick={() => navigate('/profilesetup?edit=true')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
            Edit Profile
            </button>

              {/* <button className="bg-white border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                View Public Profile
              </button> */}
              <Link 
                to="/sessions" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                My Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;