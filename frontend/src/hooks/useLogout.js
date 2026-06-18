import { useAuthContext } from "./useAuth";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const logout = () => {
    // 1. Remove from localStorage
    localStorage.removeItem('user');

    // 2. Disconnect the socket
    if (socket) {
      socket.disconnect();
    }

    // 3. Dispatch logout to context
    dispatch({ type: 'LOGOUT' });

    // 4. Redirect to login page
    navigate('/login');
  };

  return { logout };
};
