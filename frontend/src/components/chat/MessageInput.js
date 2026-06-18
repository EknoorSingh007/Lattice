import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuthContext } from '../../hooks/useAuth';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const MessageInput = ({ setMessages }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuthContext();
  const { receiverId } = useParams();
  const { socket } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user?._id) return;

    const newMessage = {
      senderId: user._id,
      receiverId,
      message,
      createdAt: new Date().toISOString(),
    };

    socket.emit('sendMessage', newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type your message..."
        className="message-input-field"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit" className="send-button">
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;
