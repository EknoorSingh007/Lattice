import React from 'react';
import { useAuthContext } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const SessionRequestCard = ({ data, fromMe }) => {
    let title = '';
    let dateTime = '';

    try {
        const parsed = JSON.parse(data);
        title = parsed.title || '';
        dateTime = parsed.dateTime || '';
    } catch {
        // Fallback for old-format messages
        const titleMatch = data.match(/"([^"]+)"/);
        title = titleMatch ? titleMatch[1] : 'Session';
        dateTime = '';
    }

    const formattedDate = dateTime ? format(new Date(dateTime), "PPP 'at' p") : '';

    return (
        <div className={`session-request-card ${fromMe ? 'sent' : 'received'}`}>
            <div className="session-card-header">
                <Calendar size={20} className="session-card-icon" />
                <span className="session-card-label">
                    {fromMe ? 'Session Proposed' : 'Session Invitation'}
                </span>
            </div>
            <h4 className="session-card-title">{title}</h4>
            {formattedDate && (
                <p className="session-card-date">{formattedDate}</p>
            )}
            <Link to="/sessions" className="session-card-link">
                <ExternalLink size={14} />
                View in Sessions
            </Link>
        </div>
    );
};

const Message = ({ message }) => {
    const { user } = useAuthContext();
    const fromMe = message.senderId === user._id;
    const chatBubbleClass = fromMe ? 'sent' : 'received';
    const bubbleAlignment = fromMe ? 'justify-end' : 'justify-start';
    const formattedTime = format(new Date(message.createdAt), 'p');

    // Check if this is a session request message
    const isSessionRequest = message.message && message.message.startsWith('[SESSION_REQUEST]');

    if (isSessionRequest) {
        const jsonData = message.message.replace('[SESSION_REQUEST]', '');
        return (
            <div className={`message-wrapper ${bubbleAlignment}`}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: fromMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <SessionRequestCard data={jsonData} fromMe={fromMe} />
                    <span className="message-time" style={{ textAlign: fromMe ? 'right' : 'left', display: 'block', marginTop: '4px' }}>
                        {formattedTime}
                    </span>
                </div>
            </div>
        );
    }

    // Check for legacy session messages (old format with emoji)
    const isLegacySession = message.message && message.message.startsWith('🗓️');

    if (isLegacySession) {
        return (
            <div className={`message-wrapper ${bubbleAlignment}`}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: fromMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div className={`session-request-card ${chatBubbleClass}`}>
                        <div className="session-card-header">
                            <Calendar size={20} className="session-card-icon" />
                            <span className="session-card-label">Session Proposal</span>
                        </div>
                        <p className="session-card-legacy-text">{message.message.replace('🗓️ ', '')}</p>
                        <Link to="/sessions" className="session-card-link">
                            <ExternalLink size={14} />
                            View in Sessions
                        </Link>
                    </div>
                    <span className="message-time" style={{ textAlign: fromMe ? 'right' : 'left', display: 'block', marginTop: '4px' }}>
                        {formattedTime}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`message-wrapper ${bubbleAlignment}`}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: fromMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                <div className={`chat-bubble ${chatBubbleClass}`}>
                    <p className="message-text">{message.message}</p>
                </div>
                <span className="message-time" style={{ textAlign: fromMe ? 'right' : 'left', display: 'block', marginTop: '4px' }}>
                    {formattedTime}
                </span>
            </div>
        </div>
    );
};

export default Message;