const { createServer } = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL 
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Stockage des utilisateurs connectés par room
const roomUsers = new Map();

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Rejoindre une room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.currentRoom = roomId;
    
    // Ajouter l'utilisateur à la liste de la room
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }
    roomUsers.get(roomId).add(socket.id);
    
    console.log(`👥 User ${socket.id} joined room ${roomId}`);
    
    // Notifier les autres utilisateurs
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      timestamp: new Date().toISOString(),
      totalUsers: roomUsers.get(roomId).size
    });

    // Envoyer le nombre d'utilisateurs connectés
    io.to(roomId).emit('users-count', {
      count: roomUsers.get(roomId).size
    });
  });

  // Quitter une room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    
    // Retirer l'utilisateur de la liste
    if (roomUsers.has(roomId)) {
      roomUsers.get(roomId).delete(socket.id);
      if (roomUsers.get(roomId).size === 0) {
        roomUsers.delete(roomId);
      }
    }
    
    console.log(`👋 User ${socket.id} left room ${roomId}`);
    
    // Notifier les autres utilisateurs
    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      timestamp: new Date().toISOString(),
      totalUsers: roomUsers.has(roomId) ? roomUsers.get(roomId).size : 0
    });

    // Mettre à jour le compteur
    if (roomUsers.has(roomId)) {
      io.to(roomId).emit('users-count', {
        count: roomUsers.get(roomId).size
      });
    }
  });

  // Synchronisation du contenu en temps réel
  socket.on('content-change', async (data) => {
    const { fileId, content, roomId, title } = data;
    
    console.log('🔄 [SOCKET] Received content-change:', {
      fileId,
      roomId,
      contentLength: content?.length,
      title: title?.substring(0, 30) + '...',
      socketId: socket.id
    });
    
    try {
      // Sauvegarder en base de données
      console.log('💾 [SOCKET] Updating database for fileId:', fileId);
      
      const result = await pool.query(
        'UPDATE files SET content = $1, title = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [content, title, fileId]
      );

      console.log('📊 [SOCKET] Database update result:', {
        rowsAffected: result.rowCount,
        fileId: fileId,
        success: result.rowCount > 0
      });

      if (result.rowCount === 0) {
        console.error('❌ [SOCKET] No rows updated - file not found:', fileId);
      } else {
        console.log('✅ [SOCKET] Database updated successfully');
      }

      // Diffuser aux autres utilisateurs de la room
      console.log('📡 [SOCKET] Broadcasting to room:', roomId);
      socket.to(roomId).emit('content-updated', {
        fileId,
        content,
        title,
        userId: socket.id,
        timestamp: new Date().toISOString()
      });

      console.log(`📝 Content updated for file ${fileId} in room ${roomId}`);

    } catch (error) {
      console.error('❌ [SOCKET] Error saving content:', error);
      socket.emit('error', { 
        message: 'Failed to save content',
        error: error.message 
      });
    }
  });

  // Synchronisation de la position du curseur
  socket.on('cursor-position', (data) => {
    const { roomId, position, selection } = data;
    socket.to(roomId).emit('cursor-updated', {
      position,
      selection,
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Indicateur de frappe
  socket.on('typing-start', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      isTyping: true,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('typing-stop', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      isTyping: false,
      timestamp: new Date().toISOString()
    });
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    
    // Nettoyer les rooms
    if (socket.currentRoom && roomUsers.has(socket.currentRoom)) {
      roomUsers.get(socket.currentRoom).delete(socket.id);
      
      // Notifier les autres utilisateurs
      socket.to(socket.currentRoom).emit('user-left', {
        userId: socket.id,
        timestamp: new Date().toISOString(),
        totalUsers: roomUsers.get(socket.currentRoom).size
      });

      // Mettre à jour le compteur
      io.to(socket.currentRoom).emit('users-count', {
        count: roomUsers.get(socket.currentRoom).size
      });

      // Supprimer la room si vide
      if (roomUsers.get(socket.currentRoom).size === 0) {
        roomUsers.delete(socket.currentRoom);
      }
    }
  });

  // Ping/Pong pour maintenir la connexion
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Démarrage du serveur
const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for: ${process.env.NODE_ENV === 'production' ? process.env.NEXTAUTH_URL : 'http://localhost:3000'}`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Socket.io server closed');
    pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Socket.io server closed');
    pool.end();
    process.exit(0);
  });
});
