import React from 'react';
import Conversations from '../components/chat/Conversations';
import MessageContainer from '../components/chat/MessageContainer';
import './ChatPage.css';

const ChatPage = () => {
  return (
    <div className="chat-page-container">
      <div className="chat-sidebar">
        <Conversations />
      </div>
      <div className="chat-main">
        <MessageContainer />
      </div>
    </div>
  );
};

export default ChatPage;