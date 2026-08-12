import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { MessageSquare, Calendar } from 'lucide-react';
import ScheduleSessionModal from '../session/ScheduleSessionModal';

const MessageContainer = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const { receiverId } = useParams();
    const { user } = useAuthContext();
    const { socket } = useSocket();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const getMessages = async () => {
            if (!receiverId) return;
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat/messages/${receiverId}`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setMessages(data);
                }
            } catch (error) {
                console.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        getMessages();
    }, [receiverId, user.token]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (newMessage) => {
            setMessages((prev) => [...prev, newMessage]);
        };

        socket.on('newMessage', handleNewMessage);

        return () => socket.off('newMessage', handleNewMessage);
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

const handleSchedule = async (title, dateTime, roomId) => {
    try {
        console.log("📤 Scheduling session:", {
            user1: user._id,
            user2: receiverId,
            dateTime: dateTime.toISOString(),
            roomId,
            title
        });

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
            alert('✅ Session proposed successfully!');
            // Send automated message in chat
            const msgRes = await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    senderId: user._id,
                    receiverId,
                    message: `🗓️ I proposed a session: "${title}" for ${dateTime.toLocaleString()}. Please check your Sessions page to accept it.`
                })
            });
        } else {
            console.error('❌ Failed to schedule session:', data.error || data.details);
            alert('Failed to schedule session.');
        }
    } catch (err) {
        console.error('🚨 Scheduling error:', err);
        alert('Something went wrong.');
    }
};


    if (!receiverId) {
        return (
            <div className="no-chat-selected">
                <MessageSquare size={80} className="text-gray-300" />
                <h2 className="text-2xl font-semibold text-gray-500 mt-4">Select a chat to start messaging</h2>
                <p className="text-gray-400">Connect with partners from the Discover page.</p>
            </div>
        );
    }

    return (
        <div className="message-container">
            <div className="messages-list">
                {loading && <p>Loading messages...</p>}
                {!loading && messages.map((msg, index) => (
                    <Message key={msg._id || msg.createdAt || index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button
                    onClick={() => setShowScheduleModal(true)}
                    style={{ margin: '0 1rem', backgroundColor: '#667eea', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                    <Calendar size={18} style={{ marginRight: 6 }} /> Schedule Session
                </button>
                <MessageInput setMessages={setMessages} />
            </div>
            <ScheduleSessionModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleSchedule}
            />
        </div>
    );
};

export default MessageContainer;
