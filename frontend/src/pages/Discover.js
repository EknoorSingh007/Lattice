import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { Search, MapPin, Code, Star, Sparkles, Filter, X, Send, Clock, Users, Zap, MessageSquare, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import './Discover.css';

const skillOptions = [
    "React", "JavaScript", "Python", "UI/UX Design", "Data Analysis",
    "Graphic Design", "Photography", "Machine Learning", "Music Theory",
    "Business Strategy", "Korean", "Fitness Training"
];

const LearnerCard = ({ learner, isOnline, connectionStatus, onConnect }) => {
    const navigate = useNavigate();

    const renderButton = () => {
        if (connectionStatus === 'accepted') {
            return (
                <button 
                    className="connect-btn connected" 
                    onClick={() => navigate(`/chat/${learner.userId}`)}
                >
                    <MessageSquare size={16} /> Message
                </button>
            );
        }
        if (connectionStatus === 'pending') {
            return (
                <button className="connect-btn pending" disabled>
                    <Loader2 size={16} className="animate-spin" /> Request Pending
                </button>
            );
        }
        return (
            <button className="connect-btn" onClick={() => onConnect(learner.userId)}>
                <MessageSquare size={16} /> Connect
            </button>
        );
    };

    return (
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
            {renderButton()}
        </div>
    );
};


const Discover = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [connectionMap, setConnectionMap] = useState({});

    const { user } = useAuthContext();
    const { onlineUsers } = useSocket();
    const navigate = useNavigate();

    // Fetch existing connections to build status map
    const fetchConnections = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/connections`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const data = await res.json();
            if (res.ok) {
                const map = {};
                data.forEach(conn => {
                    const otherId = conn.sender._id === user._id ? conn.receiver._id : conn.sender._id;
                    map[otherId] = conn.status;
                });
                setConnectionMap(map);
            }
        } catch (err) {
            console.error("Failed to fetch connections:", err);
        }
    }, [user.token, user._id]);

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedSkill) params.append('skill', selectedSkill);
            
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/profile/all?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch profiles');
            }
            
            setProfiles(data);

        } catch (err) {
            console.error("Failed to fetch profiles:", err);
            setError(err.message);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    }, [user.token, searchTerm, selectedSkill]);

    useEffect(() => {
        if (user) {
            fetchProfiles();
            fetchConnections();
        }
    }, [user, fetchProfiles, fetchConnections]);

    const handleConnect = async (targetUserId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/connections`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receiverId: targetUserId })
            });
            const data = await response.json();
            if (response.ok) {
                setConnectionMap(prev => ({...prev, [targetUserId]: 'pending'}));
                toast.success("Connection request sent successfully!");
            } else {
                toast.error(data.error || "Failed to send connection request.");
            }
        } catch (error) {
            console.error("Error sending request:", error);
            toast.error("Error sending connection request.");
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
                {loading && (
                    <div className="profile-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="profile-card skeleton-card">
                                <Skeleton height="200px" className="rounded-t-2xl" />
                                <div className="profile-info">
                                    <Skeleton width="150px" height="24px" className="mb-2" />
                                    <Skeleton width="100px" height="16px" className="mb-4" />
                                    <div className="skills-section">
                                        <Skeleton width="80px" height="20px" className="mb-2" />
                                        <div className="skills-tags">
                                            <Skeleton width="60px" height="24px" className="rounded-full" />
                                            <Skeleton width="60px" height="24px" className="rounded-full" />
                                        </div>
                                    </div>
                                    <Skeleton width="100%" height="40px" className="rounded-xl mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {error && <div className="no-results"><p>Error: {error}</p></div>}
                {!loading && !error && profiles.length > 0 && (
                    profiles.map(profile => (
                        <LearnerCard 
                            key={profile._id} 
                            learner={profile} 
                            isOnline={onlineUsers.includes(profile.userId)}
                            connectionStatus={connectionMap[profile.userId]}
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