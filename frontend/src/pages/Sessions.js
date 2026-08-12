import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Video, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
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

        if (user?.token) {
            fetchSessions();
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
                alert(error.message || "Failed to delete session.");
                return;
            }

            setSessions(prev => prev.filter(session => session._id !== sessionId));
        } catch (err) {
            console.error("Error deleting session:", err);
            alert("Something went wrong.");
        }
    };


    if (loading) return <div className="p-8">Loading sessions...</div>;

    const pendingIncoming = sessions.filter(s => s.status === 'pending' && s.user2._id === user._id);
    const pendingOutgoing = sessions.filter(s => s.status === 'pending' && s.user1._id === user._id);
    const upcoming = sessions.filter(s => s.status === 'accepted');

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Sessions</h1>
            
            {pendingIncoming.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Pending Requests (Action Required)</h2>
                    <div className="space-y-4">
                        {pendingIncoming.map(session => {
                            const profile = session.user1?.profile;
                            const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User';
                            const profileImg = profile?.profilePhoto || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

                            return (
                                <div key={session._id} className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200 flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                        <img src={profileImg} className="w-12 h-12 rounded-full" alt="participant" />
                                        <div>
                                            <p className="font-semibold text-lg">{displayName} proposed: {session.title}</p>
                                            <p className="text-gray-500 flex items-center">
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
                <h2 className="text-xl font-bold text-gray-700 mb-4">Upcoming Sessions</h2>
                {upcoming.length === 0 && <p className="text-gray-600">No accepted sessions yet. Go to <Link to="/chat" className="text-blue-500 underline">Community</Link> to schedule one.</p>}
                {upcoming.map(session => {
                    const currentUserId = user._id;
                    const isUser1 = session.user1._id === currentUserId;
                    const other = isUser1 ? session.user2 : session.user1;
                    const profile = other?.profile;
                    const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User';
                    const profileImg = profile?.profilePhoto || `https://ui-avatars.com/api/?name=${displayName}&background=random`;

                    return (
                        <div key={session._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <img src={profileImg} className="w-12 h-12 rounded-full" alt="participant" />
                                <div>
                                    <p className="font-semibold text-lg">{session.title} (with {displayName})</p>
                                    <p className="text-gray-500 flex items-center">
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
                                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300"
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
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Awaiting Partner's Response</h2>
                    <div className="space-y-4 opacity-75">
                         {pendingOutgoing.map(session => {
                            const profile = session.user2?.profile;
                            const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User';
                            return (
                                <div key={session._id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between">
                                    <p className="font-medium text-gray-600">You proposed "{session.title}" to {displayName} for {format(new Date(session.dateTime), "PPP 'at' p")}</p>
                                    <span className="text-yellow-600 text-sm font-semibold">Pending</span>
                                </div>
                            )
                         })}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default Sessions;
