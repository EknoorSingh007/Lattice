import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Video, Calendar, Plus, CalendarX, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import ScheduleSessionModal from '../components/session/ScheduleSessionModal';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const { user } = useAuthContext();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/session/user/${user._id}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setSessions(data);
                }
            } catch (error) {
                console.error("Failed to fetch sessions:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchConnections = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat/conversations`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setConnections(data);
                }
            } catch (error) {
                console.error("Failed to fetch connections:", error);
            }
        };

        if (user?.token) {
            fetchSessions();
            fetchConnections();
        }
    }, [user]);

    const handleStatusUpdate = async (sessionId, status) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/session/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s._id === sessionId ? { ...s, status } : s));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (sessionId) => {
        const confirm = window.confirm("Are you sure you want to mark this session as completed?");
        if (!confirm) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/session/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!res.ok) {
                let error = {};
                try {
                    error = await res.json();
                } catch {
                    error.message = 'Unexpected server response';
                }
                toast.error(error.message || "Failed to delete session.");
                return;
            }

            setSessions(prev => prev.filter(session => session._id !== sessionId));
            toast.success("Session marked as completed.");
        } catch (err) {
            console.error("Error deleting session:", err);
            toast.error("Something went wrong.");
        }
    };


    const handleSchedule = async (title, dateTime, roomId, receiverId) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/session/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    user1: user._id,
                    user2: receiverId,
                    dateTime,
                    roomId,
                    title
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Session proposed successfully!');
                
                // Add locally
                setSessions(prev => [...prev, data]);

                // Send structured session message in chat
                const sessionMsg = `[SESSION_REQUEST]${JSON.stringify({ title, dateTime: dateTime.toISOString ? dateTime.toISOString() : dateTime })}`;
                await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        senderId: user._id,
                        receiverId,
                        message: sessionMsg
                    })
                });
            } else {
                toast.error('Failed to schedule session: ' + (data.error || ''));
            }
        } catch (err) {
            console.error('🚨 Scheduling error:', err);
            toast.error('Something went wrong.');
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
                <Skeleton width="200px" height="40px" className="mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Skeleton circle width="48px" height="48px" />
                                <div>
                                    <Skeleton width="150px" height="20px" className="mb-2" />
                                    <Skeleton width="100px" height="15px" />
                                </div>
                            </div>
                            <Skeleton width="100px" height="36px" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const pendingIncoming = sessions.filter(s => s.status === 'pending' && s.user2._id === user._id);
    const pendingOutgoing = sessions.filter(s => s.status === 'pending' && s.user1._id === user._id);
    const upcoming = sessions.filter(s => s.status === 'accepted');

    return (
        <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Sessions</h1>
            </div>
            
            {pendingIncoming.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Pending Requests (Action Required)</h2>
                    <div className="space-y-4">
                        {pendingIncoming.map(session => {
                            const profile = session.user1?.profile;
                            const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User';
                            const profileImg = profile?.profilePhoto || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

                            return (
                                <div key={session._id} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg shadow-sm border border-yellow-200 dark:border-yellow-700/50 flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                        <img src={profileImg} className="w-12 h-12 rounded-full" alt="participant" />
                                        <div>
                                            <p className="font-semibold text-lg dark:text-white">{displayName} proposed: {session.title}</p>
                                            <p className="text-gray-500 dark:text-gray-400 flex items-center">
                                                <Calendar size={14} className="mr-2" />
                                                {format(new Date(session.dateTime), "PPP 'at' p")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleStatusUpdate(session._id, 'accepted')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Accept</button>
                                        <button onClick={() => handleStatusUpdate(session._id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Reject</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Upcoming Sessions</h2>
                {upcoming.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                        <CalendarX size={48} className="text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">No upcoming sessions yet.</p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Schedule a session from your connections below.</p>
                    </div>
                )}
                {upcoming.map(session => {
                    const currentUserId = user._id;
                    const isUser1 = session.user1._id === currentUserId;
                    const other = isUser1 ? session.user2 : session.user1;
                    const profile = other?.profile;
                    const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User';
                    const profileImg = profile?.profilePhoto || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

                    return (
                        <div key={session._id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <img src={profileImg} className="w-12 h-12 rounded-full" alt="participant" />
                                <div>
                                    <p className="font-semibold text-lg dark:text-white">{session.title} (with {displayName})</p>
                                    <p className="text-gray-500 dark:text-gray-400 flex items-center">
                                        <Calendar size={14} className="mr-2" />
                                        {format(new Date(session.dateTime), "PPP 'at' p")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Link to={`/session/${session.roomId}`}>
                                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600">
                                        <Video size={18} />
                                        <span>Join Call</span>
                                    </button>
                                </Link>
                                <button
                                    onClick={() => handleDelete(session._id)}
                                    className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                                >
                                    Completed
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {pendingOutgoing.length > 0 && (
                 <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Awaiting Partner's Response</h2>
                    <div className="space-y-4 opacity-75">
                         {pendingOutgoing.map(session => {
                            const profile = session.user2?.profile;
                            const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User';
                            return (
                                <div key={session._id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 flex justify-between">
                                    <p className="font-medium text-gray-600 dark:text-gray-300">You proposed "{session.title}" to {displayName} for {format(new Date(session.dateTime), "PPP 'at' p")}</p>
                                    <span className="text-yellow-600 dark:text-yellow-500 text-sm font-semibold">Pending</span>
                                </div>
                            )
                         })}
                    </div>
                 </div>
            )}
            
            <ScheduleSessionModal 
                isOpen={isScheduleOpen} 
                onClose={() => setIsScheduleOpen(false)} 
                onSchedule={handleSchedule} 
                connections={connections}
            />

            {/* Display connections to schedule a session */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Schedule with Connections</h2>
                {connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                        <UsersIcon size={48} className="text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 font-medium">You don't have any connections yet.</p>
                        <Link to="/discover" className="mt-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-medium">
                            Go to Discover
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connections.map(conn => {
                            const partner = conn.otherParticipant;
                            const profileImg = partner.profilePhoto || `https://ui-avatars.com/api/?name=${partner.firstName}+${partner.lastName}&background=random`;
                            
                            return (
                                <div key={partner._id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <img src={profileImg} className="w-12 h-12 rounded-full" alt="partner" />
                                        <div>
                                            <p className="font-semibold text-lg dark:text-white">{partner.firstName} {partner.lastName}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            // Set the selected connection before opening modal
                                            setIsScheduleOpen(partner._id);
                                        }}
                                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <Calendar size={18} />
                                        Schedule
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sessions;
