import React from 'react';
import { useAuthContext } from '../../hooks/useAuth';
import { format } from 'date-fns';

const Message = ({ message }) => {
    const { user } = useAuthContext();
    const fromMe = message.senderId === user._id;
    const chatBubbleClass = fromMe ? 'sent' : 'received';
    const bubbleAlignment = fromMe ? 'justify-end' : 'justify-start';
    const formattedTime = format(new Date(message.createdAt), 'p');

    return (
        <div className={`message-wrapper ${bubbleAlignment}`}>
            <div className={`chat-bubble ${chatBubbleClass}`}>
                <p className="message-text">{message.message}</p>
                <span className="message-time">{formattedTime}</span>
            </div>
        </div>
    );
};

export default Message;