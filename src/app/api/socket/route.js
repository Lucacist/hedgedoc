import { NextResponse } from 'next/server';
import { Server } from 'socket.io';
import pool from '@/lib/db';

let io;

export async function GET() {
  if (!io) {
    console.log('Initializing Socket.io server...');
    
    // Créer le serveur Socket.io
    io = new Server({
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Rejoindre une room
      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        
        // Notifier les autres utilisateurs de la room
        socket.to(roomId).emit('user-joined', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      // Quitter une room
      socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
        
        // Notifier les autres utilisateurs de la room
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      // Synchronisation du contenu en temps réel
      socket.on('content-change', async (data) => {
        const { fileId, content, roomId, title } = data;
        
        try {
          // Sauvegarder en base de données
          await pool.query(
            'UPDATE files SET content = $1, title = $2, updated_at = NOW() WHERE id = $3',
            [content, title, fileId]
          );

          // Diffuser le changement aux autres utilisateurs de la room
          socket.to(roomId).emit('content-updated', {
            fileId,
            content,
            title,
            userId: socket.id,
            timestamp: new Date().toISOString()
          });

        } catch (error) {
          console.error('Error saving content:', error);
          socket.emit('error', { message: 'Failed to save content' });
        }
      });

      // Synchronisation de la position du curseur
      socket.on('cursor-position', (data) => {
        const { roomId, position, userId } = data;
        socket.to(roomId).emit('cursor-updated', {
          position,
          userId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      // Gestion de la déconnexion
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Démarrer le serveur sur le port 3001
    const port = process.env.SOCKET_PORT || 3001;
    io.listen(port);
    console.log(`Socket.io server running on port ${port}`);
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Socket.io server initialized',
    port: process.env.SOCKET_PORT || 3001
  });
}
