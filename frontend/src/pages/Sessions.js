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

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Sessions</h1>
            <div className="space-y-4">
                {sessions.length === 0 && <p>No sessions scheduled yet.</p>}
                {sessions.map(session => {
                    const currentUserId = user._id;
                    const isUser1 = session.user1._id === currentUserId;
                    const other = isUser1 ? session.user2 : session.user1;

                    const profile = other?.profile;
                    const displayName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();
                    const profileImg = profile?.profilePhoto || `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=random`;

                    return (
                        <div key={session._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={profileImg}
                                    className="w-12 h-12 rounded-full"
                                    alt="participant"
                                />
                                <div>
                                    <p className="font-semibold text-lg">Session with {displayName || 'Unknown User'}</p>
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
                                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                                >
                                    Completed
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sessions;
