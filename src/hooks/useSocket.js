import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // En production sur Vercel, désactiver Socket.io (mode solo)
    if (process.env.NODE_ENV === 'production') {
      console.log('Production mode: Socket.io disabled (solo mode)');
      setIsConnected(false);
      socketRef.current = null;
      return;
    }

    // En développement, utiliser Socket.io
    const socketUrl = 'http://localhost:3001';
    
    try {
      // Créer la connexion Socket.io
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.io server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
        setIsConnected(false);
      });

      socketRef.current = newSocket;

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } catch (error) {
      console.log('Socket.io connection failed, running in solo mode');
      setIsConnected(false);
      socketRef.current = null;
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected
  };
}
