import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { MessageSquare, Calendar } from 'lucide-react';
import ScheduleSessionModal from '../session/ScheduleSessionModal';
import toast from 'react-hot-toast';

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
            toast.success('Session proposed successfully!');
            // Send structured session message in chat
            const sessionMsg = `[SESSION_REQUEST]${JSON.stringify({ title, dateTime: dateTime.toISOString() })}`;
            const msgPayload = {
                senderId: user._id,
                receiverId,
                message: sessionMsg
            };
            // Send via socket for real-time
            if (socket) {
                socket.emit('sendMessage', msgPayload);
            }
            // Add locally
            setMessages(prev => [...prev, { ...msgPayload, createdAt: new Date().toISOString() }]);
        } else {
            console.error('❌ Failed to schedule session:', data.error || data.details);
            toast.error('Failed to schedule session.');
        }
    } catch (err) {
        console.error('🚨 Scheduling error:', err);
        toast.error('Something went wrong.');
    }
};


    if (!receiverId) {
        return (
            <div className="no-chat-selected flex flex-col items-center justify-center h-full">
                <MessageSquare size={80} className="text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400 mt-4">Select a chat to start messaging</h2>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Connect with partners from the Discover page.</p>
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
