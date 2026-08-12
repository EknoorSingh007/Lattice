// import React, { useState, useEffect,useContext} from 'react';
// import { Search, Filter, Star, Clock, MapPin, Users, Zap, BookOpen, Video, MessageSquare } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import ChatInterface from './ChatInterface'; 
// import io from 'socket.io-client';
// const socket = io.connect('http://localhost:4000');
// const DiscoverPage = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedSkill, setSelectedSkill] = useState('');
//   const [selectedTime, setSelectedTime] = useState('');
//   const [selectedLevel, setSelectedLevel] = useState('');
//   const [showFilters, setShowFilters] = useState(false);
//   const [learners, setLearners] = useState([]);
//   const { user, dispatch } = useContext(AuthContext);
//     const [userProfile, setUserProfile] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//  const navigate=useNavigate()
//    useEffect(() => {
//      if (user) {
//        fetchUserProfile();
//      }
//    }, [user]);
//  console.log("User from context:", user);
 
//    const fetchUserProfile = async () => {
//    try {
//     const response = await fetch(`/api/profile`, {
//    headers: {
//      'Authorization': `Bearer ${user.token}`  // or localStorage.getItem('userToken')
//    }
//  });
 
//      const profileData = await response.json();
//      console.log('Fetched profile data:', profileData); // 👈 Add this
 
//      // Update this line depending on your response shape
//      setUserProfile(profileData); // or profileData.user
//    } catch (error) {
//      console.error('Error fetching user profile:', error);
//    }
//  };
 
 
//    const handleLogout = () => {
//      // Clear localStorage and dispatch logout action
//      localStorage.removeItem('user');
//      dispatch({ type: 'LOGOUT' });
//      navigate('/login')
//    };

//   // Mock data for learners
//  useEffect(() => {
//   const fetchProfiles = async () => {
//     try {
//       const res = await fetch('/api/profile/all-profiles/discover', {
//         headers: {
//           'Authorization': `Bearer ${user.token}`
//         }
//       });
//       const data = await res.json();
//       console.log("Fetched learner data:", data);
// console.log("Logged in user ID:", user._id);
//      const formatted = data.map(profile => ({
//   id: profile._id,
//   name: `${profile.firstName} ${profile.lastName}`,
//   avatar: profile.profilePhoto 
//             ? profile.profilePhoto 
//             : "https://ui-avatars.com/api/?name=" + 
//               encodeURIComponent(profile.firstName + " " + profile.lastName),  // fallback
//   skills: profile.skillsToLearn || [],
//   teachingSkills: profile.skillsToTeach || [],
//   rating: 4.5,
//   sessions: 50 + Math.floor(Math.random() * 150),
//   location: profile.location || 'N/A',
//   timezone: "IST",
//   availability: "Available now",
//   matchScore: Math.floor(Math.random() * 100),
//   languages: ["English"],
//   bio: profile.bio || '',
//   lastActive: "Just now"
// }));

//       setLearners(formatted);
//     } catch (error) {
//       console.error("Error fetching learners:", error);
//     }
//   };

//   if (user) {
//     fetchProfiles();
//   }
// }, [user]);

//  const handleConnect = (targetUser) => {
//     socket.emit('start_chat', {
//       from: user._id,
//       to: targetUser.id,
//     });
//     setSelectedUser(targetUser);
//     setIsChatOpen(true);
//   };

//   const filteredLearners = learners.filter(learner => {
//     const matchesSearch = learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          learner.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
//                          learner.teachingSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
//     const matchesSkill = !selectedSkill || 
//                         learner.skills.includes(selectedSkill) || 
//                         learner.teachingSkills.includes(selectedSkill);
    
//     return matchesSearch && matchesSkill;
//   }).sort((a, b) => b.matchScore - a.matchScore);

//   const skillOptions = [
//     "React", "JavaScript", "Python", "UI/UX Design", "Data Analysis", 
//     "Graphic Design", "Photography", "Machine Learning", "Music Theory", 
//     "Business Strategy", "Korean", "Fitness Training"
//   ];

//   const LearnerCard = ({ learner }) => (
//     <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center gap-3">
//                   <img
//           src={learner.avatar}
//           alt={learner.name}
//           className="w-10 h-10 rounded-full object-cover"
//         />

//           <div>
//             <h3 className="font-bold text-lg text-gray-900">{learner.name}</h3>
//             <div className="flex items-center gap-2 text-sm text-gray-600">
//               <MapPin size={14} />
//               {learner.location}
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
//           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//           <span className="text-xs text-green-700 font-medium">{learner.matchScore}% match</span>
//         </div>
//       </div>

//       <p className="text-gray-600 text-sm mb-4 line-clamp-2">{learner.bio}</p>

//       <div className="space-y-3 mb-4">
//         <div>
//           <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Wants to Learn</h4>
//           <div className="flex flex-wrap gap-1">
//             {learner.skills.map(skill => (
//               <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
//                 {skill}
//               </span>
//             ))}
//           </div>
//         </div>
        
//         <div>
//           <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Can Teach</h4>
//           <div className="flex flex-wrap gap-1">
//             {learner.teachingSkills.map(skill => (
//               <span key={skill} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
//                 {skill}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
//         <div className="flex items-center gap-1">
//           <Star size={14} className="text-yellow-500 fill-current" />
//           <span className="font-medium">{learner.rating}</span>
//           <span>({learner.sessions} sessions)</span>
//         </div>
//         <div className="flex items-center gap-1">
//           <Clock size={14} />
//           <span>{learner.availability}</span>
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <button
//           onClick={() => handleConnect(learner)}
//           className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
//         >
//           <MessageSquare size={16} />
//           Connect
//         </button>
//         {/* <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
//           View Profile
//         </button> */}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
//       {/* Navigation */}
//       <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center gap-8">
//               <div className="flex items-center gap-2">
//                 <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
//                   T
//                 </div>
//                 <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//                   Tandemly
//                 </span>
//               </div>
//               <div className="hidden md:flex space-x-8">
//                 <a href="#" className="text-purple-600 font-medium border-b-2 border-purple-600 pb-1">Discover</a>
//                 <a href="#" className="text-gray-600 hover:text-gray-900">Community</a>
//                 <a href="#" className="text-gray-600 hover:text-gray-900">Sessions</a>
//                 <a href="#" className="text-gray-600 hover:text-gray-900">Resources</a>
//               </div>
//             </div>
//             <div className="hidden md:flex items-center space-x-4">
//         {user ? (
//           // Show when user is logged in
//           <>
//             <Link to="/profile">
//               <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
//                 My Profile
//               </button>
//             </Link>
//             <button 
//               onClick={handleLogout}
//               className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
//             >
//               Logout
//             </button>
//           <span className="ml-3 inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-semibold text-sm rounded-full shadow-sm border border-purple-300">
//   <span>👋 Welcome,</span>
//   <span className="font-bold">
//     {userProfile?.firstName ? `${userProfile.firstName}` : 'User'}
//   </span>
// </span>

      
//           </>
//         ) : (
//           // Show when user is not logged in
//           <>
//             <Link to="/login">
//               <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
//                 Login
//               </button>
//             </Link>
//             <Link to="/signup">
//               <button className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
//                 Sign Up
//               </button>
//             </Link>
//             <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 font-medium">
//               Start Learning
//             </button>
//           </>
//         )}
//       </div>
//           </div>
//         </div>
//       </nav>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">
//             Discover Your Perfect
//             <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Learning Partner</span>
//           </h1>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             Connect with passionate learners worldwide. Find someone who wants to learn what you can teach, and vice versa.
//           </p>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search by name, skill, or expertise..."
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="flex gap-3">
//               <select
//                 className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 value={selectedSkill}
//                 onChange={(e) => setSelectedSkill(e.target.value)}
//               >
//                 <option value="">All Skills</option>
//                 {skillOptions.map(skill => (
//                   <option key={skill} value={skill}>{skill}</option>
//                 ))}
//               </select>
              
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
//               >
//                 <Filter size={20} />
//                 Filters
//               </button>
//             </div>
//           </div>

//           {showFilters && (
//             <div className="mt-4 pt-4 border-t border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <select className="px-3 py-2 border border-gray-300 rounded-lg">
//                   <option>Availability</option>
//                   <option>Available now</option>
//                   <option>Available today</option>
//                   <option>Available this week</option>
//                 </select>
//                 <select className="px-3 py-2 border border-gray-300 rounded-lg">
//                   <option>Experience Level</option>
//                   <option>Beginner</option>
//                   <option>Intermediate</option>
//                   <option>Advanced</option>
//                 </select>
//                 <select className="px-3 py-2 border border-gray-300 rounded-lg">
//                   <option>Time Zone</option>
//                   <option>PST</option>
//                   <option>EST</option>
//                   <option>GMT</option>
//                   <option>CET</option>
//                 </select>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Stats Bar */}
//         <div className="bg-white rounded-xl p-4 mb-8 shadow-sm">
//           <div className="flex items-center justify-between text-sm">
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-2">
//                 <Users size={16} className="text-purple-600" />
//                 <span className="text-gray-600">
//                   <span className="font-semibold text-gray-900">{filteredLearners.length}</span> learners found
//                 </span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Zap size={16} className="text-green-600" />
//                 <span className="text-gray-600">
//                   <span className="font-semibold text-gray-900">{filteredLearners.filter(l => l.availability.includes('now')).length}</span> available now
//                 </span>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-gray-600">Sort by:</span>
//               <select className="border-0 bg-transparent font-medium text-purple-600 focus:ring-0">
//                 <option>Best Match</option>
//                 <option>Highest Rated</option>
//                 <option>Most Sessions</option>
//                 <option>Recently Active</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Learners Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredLearners.map(learner => (
//             <LearnerCard key={learner.id} learner={learner} />
//           ))}
//         </div>

//         {filteredLearners.length === 0 && (
//           <div className="text-center py-12">
//             <div className="text-6xl mb-4">🔍</div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">No learners found</h3>
//             <p className="text-gray-600">Try adjusting your search criteria or filters</p>
//           </div>
//         )}
//       </div>
//         {isChatOpen && selectedUser && (
//         <ChatInterface
//           selectedUser={selectedUser}
//           currentUser={{ id: user._id, name: userProfile?.firstName, email: user.email }}
//           onClose={() => setIsChatOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default DiscoverPage;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { Search, Star, Clock, MapPin, Users, Zap, MessageSquare } from 'lucide-react';
import './Discover.css';

const skillOptions = [
    "React", "JavaScript", "Python", "UI/UX Design", "Data Analysis",
    "Graphic Design", "Photography", "Machine Learning", "Music Theory",
    "Business Strategy", "Korean", "Fitness Training"
];

const LearnerCard = ({ learner, isOnline, onConnect }) => (
    <div className="profile-card">
        <div className="profile-header">
            <div className="flex items-center gap-3">
                <img
                    src={learner.profilePhoto || `https://ui-avatars.com/api/?name=${learner.firstName}+${learner.lastName}&background=random`}
                    alt={learner.firstName}
                    className="profile-avatar"
                />
                <div>
                    <h3 className="profile-name">{learner.firstName} {learner.lastName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        {learner.location || 'Not specified'}
                    </div>
                </div>
            </div>
             <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
        </div>
        <p className="profile-bio">{learner.bio || 'No bio yet.'}</p>
        <div className="skills-section">
            <h3>Can Teach</h3>
            <div className="skills-tags">
                {learner.skillsToTeach.map(skill => <span key={skill} className="skill-tag teach">{skill}</span>)}
            </div>
        </div>
        <div className="skills-section">
            <h3>Wants to Learn</h3>
            <div className="skills-tags">
                {learner.skillsToLearn.map(skill => <span key={skill} className="skill-tag learn">{skill}</span>)}
            </div>
        </div>
        <div className="profile-footer">
            <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="font-medium">4.5</span>
                <span>(55 sessions)</span>
            </div>
            <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Available now</span>
            </div>
        </div>
        <button className="connect-btn" onClick={() => onConnect(learner.userId)}>
            <MessageSquare size={16} /> Connect
        </button>
    </div>
);


const Discover = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State for API errors
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');

    const { user } = useAuthContext();
    const { onlineUsers } = useSocket();
    const navigate = useNavigate();

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setError(null); // Reset error state on new fetch
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedSkill) params.append('skill', selectedSkill);
            
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/profile/all?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            
            const data = await response.json();

            // ✅ FIX: Check if the response was successful
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch profiles');
            }
            
            setProfiles(data); // Set profiles only on success

        } catch (err) {
            console.error("Failed to fetch profiles:", err);
            setError(err.message);
            setProfiles([]); // ✅ FIX: Set profiles to an empty array on error
        } finally {
            setLoading(false);
        }
    }, [user.token, searchTerm, selectedSkill]);

    useEffect(() => {
        if (user) {
            fetchProfiles();
        }
    }, [user, fetchProfiles]);

    const handleConnect = async (userId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/connections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receiverId: userId })
            });
            const data = await response.json();
            if (response.ok) {
                alert("Connection request sent successfully!");
            } else {
                alert(data.error || "Failed to send connection request.");
            }
        } catch (error) {
            console.error("Error sending connection request:", error);
            alert("Error sending connection request.");
        }
    };

    return (
        <div className="discover-container">
            <div className="discover-header">
                <h1>Discover Your Perfect Learning Partner</h1>
                <p>Connect with passionate learners worldwide. Find someone who wants to learn what you can teach, and vice versa.</p>
            </div>

            <div className="search-filters-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, skill, or expertise..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-wrapper">
                    <select
                        className="filter-select"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                    >
                        <option value="">All Skills</option>
                        {skillOptions.map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="stats-bar">
                 <div className="flex items-center gap-2">
                    <Users size={16} className="text-purple-600" />
                    <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">{profiles.length}</span> learners found
                    </span>
                </div>
                 <div className="flex items-center gap-2">
                    <Zap size={16} className="text-green-600" />
                    <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">{profiles.filter(p => onlineUsers.includes(p.userId)).length}</span> online now
                    </span>
                </div>
            </div>

            <div className="discover-grid">
                {loading && <p>Loading...</p>}
                {error && <div className="no-results"><p>Error: {error}</p></div>}
                {!loading && !error && profiles.length > 0 && (
                    profiles.map(profile => (
                        <LearnerCard 
                            key={profile._id} 
                            learner={profile} 
                            isOnline={onlineUsers.includes(profile.userId)}
                            onConnect={handleConnect}
                        />
                    ))
                )}
                 {!loading && !error && profiles.length === 0 && (
                    <div className="no-results">
                        <h3>No learners found</h3>
                        <p>Try adjusting your search criteria or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;