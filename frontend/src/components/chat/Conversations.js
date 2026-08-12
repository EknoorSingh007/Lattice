import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const Conversation = ({ conversation, isSelected, onSelect }) => {
    const { onlineUsers } = useSocket();
    const otherParticipant = conversation.otherParticipant;
    const isOnline = onlineUsers.includes(otherParticipant._id);

    return (
        <div 
            className={`conversation-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(conversation)}
        >
            <div className="avatar-container">
                <img 
                    src={otherParticipant.profilePhoto || `https://ui-avatars.com/api/?name=${otherParticipant.firstName}+${otherParticipant.lastName}&background=random`} 
                    alt="avatar" 
                    className="avatar"
                />
                {isOnline && <div className="online-dot"></div>}
            </div>
            <div className="conversation-details">
                <p className="conversation-name">{otherParticipant.firstName} {otherParticipant.lastName}</p>
                <p className="last-message">
                    {conversation.lastMessage?.text?.startsWith('[SESSION_REQUEST]') 
                        ? '📅 Proposed a session' 
                        : (conversation.lastMessage?.text || "No messages yet")}
                </p>
            </div>
        </div>
    );
};

const Conversations = () => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('chats');
    const { user } = useAuthContext();
    const { newConversation } = useSocket(); // 👈 NEW
    const navigate = useNavigate();
    const { receiverId } = useParams();

    useEffect(() => {
        const getConversations = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat/conversations`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setConversations(data);
                }
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        const getRequests = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/connections`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setRequests(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (user?.token) {
            getConversations();
            getRequests();
        }
    }, [user]);

    const handleRespondRequest = async (requestId, status) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/connections/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setRequests(prev => prev.filter(r => r._id !== requestId));
                // Reload conversations as a new one might have been created
                if (status === 'accepted') {
                   // Quick hack to force refetch:
                   window.location.reload();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 🔁 Handle socket-pushed newConversation
    useEffect(() => {
        if (newConversation) {
            const exists = conversations.find(
                (c) => c._id === newConversation._id
            );
            if (!exists) {
                setConversations((prev) => [newConversation, ...prev]);
            }
        }
    }, [newConversation, conversations]);

    const handleSelectConversation = (conversation) => {
        navigate(`/chat/${conversation.otherParticipant._id}`);
    };

    const pendingIncoming = requests.filter(r => r.receiver._id === user._id && r.status === 'pending');

    return (
        <div className="conversations-container">
            <h2 className="conversations-title">Community</h2>
            
            <div className="conversations-tabs">
                <button className={activeTab === 'chats' ? 'active' : ''} onClick={() => setActiveTab('chats')}>Chats</button>
                <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>
                    Requests {pendingIncoming.length > 0 && `(${pendingIncoming.length})`}
                </button>
            </div>

            {activeTab === 'chats' ? (
                <>
                    {loading && <p>Loading...</p>}
                    <div className="conversation-list">
                        {conversations.map((conv) => (
                            <Conversation 
                                key={conv._id} 
                                conversation={conv}
                                isSelected={receiverId === conv.otherParticipant._id}
                                onSelect={handleSelectConversation}
                            />
                        ))}
                        {conversations.length === 0 && !loading && <p>No chats yet.</p>}
                    </div>
                </>
            ) : (
                <div className="requests-list">
                    {pendingIncoming.map(req => (
                        <div key={req._id} className="request-item">
                            <p>{req.sender.name || req.sender.email} wants to connect</p>
                            <div className="request-actions">
                                <button className="btn-accept" onClick={() => handleRespondRequest(req._id, 'accepted')}>Accept</button>
                                <button className="btn-reject" onClick={() => handleRespondRequest(req._id, 'rejected')}>Reject</button>
                            </div>
                        </div>
                    ))}
                    {pendingIncoming.length === 0 && <p>No pending requests.</p>}
                </div>
            )}
        </div>
    );
};

export default Conversations;
