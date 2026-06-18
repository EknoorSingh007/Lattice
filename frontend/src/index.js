import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { SocketContextProvider } from './context/SocketContext'; // Import
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContextProvider>
    <SocketContextProvider> {/* Add provider */}
      <App />
    </SocketContextProvider>
  </AuthContextProvider>
);


