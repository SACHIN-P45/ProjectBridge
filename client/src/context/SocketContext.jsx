import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, setTyping, clearTyping, markMessagesSeen, markMessagesDelivered, editMessageInState, deleteMessageInState } from '../store/slices/chatSlice';
import { addNotification } from '../store/slices/notificationSlice';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || '/';
    const newSocket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user_online', user._id);
    });

    newSocket.on('online_users', (users) => setOnlineUsers(users));

    newSocket.on('receive_message', (message) => {
      dispatch(addMessage({ chatId: message.chat, message }));
    });

    newSocket.on('messages_seen', (data) => {
      dispatch(markMessagesSeen(data));
    });

    newSocket.on('messages_delivered', (data) => {
      dispatch(markMessagesDelivered(data));
    });

    newSocket.on('message_edited', (data) => {
      dispatch(editMessageInState(data));
    });

    newSocket.on('message_deleted', (data) => {
      dispatch(deleteMessageInState(data));
    });

    newSocket.on('typing', (data) => {
      // data = { userId, name } — chatId comes from the room context
      // But since socket.to(chatId) is used, we need chatId in the event
      dispatch(setTyping({ chatId: data.chatId, userId: data.userId, name: data.name }));
    });

    newSocket.on('stop_typing', (data) => {
      dispatch(clearTyping({ chatId: data.chatId, userId: data.userId }));
    });

    newSocket.on('notification', (data) => {
      dispatch(addNotification(data));
      toast(data.message, { icon: '🔔' });
    });

    return () => { newSocket.close(); };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
