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
                <p className="last-message">{conversation.lastMessage?.text || "No messages yet"}</p>
            </div>
        </div>
    );
};

const Conversations = () => {
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState([]);
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

        if (user?.token) {
            getConversations();
        }
    }, [user]);

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

    return (
        <div className="conversations-container">
            <h2 className="conversations-title">Messages</h2>
            {loading && <p>Loading conversations...</p>}
            <div className="conversation-list">
                {conversations.map((conv) => (
                    <Conversation 
                        key={conv._id} 
                        conversation={conv}
                        isSelected={receiverId === conv.otherParticipant._id}
                        onSelect={handleSelectConversation}
                    />
                ))}
            </div>
        </div>
    );
};

export default Conversations;
