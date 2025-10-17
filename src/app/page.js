'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import MarkdownEditor from '@/components/MarkdownEditor';
import { v4 as uuidv4 } from 'uuid';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentFile, setCurrentFile] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation
  useEffect(() => {
    // Vérifier le mode sombre préféré
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDark = savedDarkMode ? JSON.parse(savedDarkMode) : prefersDark;
    setDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Récupérer ou créer un room ID
    const urlRoomId = searchParams.get('room');
    const currentRoomId = urlRoomId || 'welcome';
    setRoomId(currentRoomId);

    // Charger le fichier
    loadFile(currentRoomId);
  }, [searchParams]);

  const loadFile = async (roomId) => {
    try {
      console.log('🔍 [PAGE] Loading file for room:', roomId);
      setIsLoading(true);
      
      // Récupérer les fichiers de la room
      console.log('📡 [PAGE] Fetching files from API...');
      const response = await fetch(`/api/files?room=${roomId}`);
      const data = await response.json();

      console.log('📋 [PAGE] API Response:', {
        success: data.success,
        filesCount: data.files?.length,
        files: data.files?.map(f => ({ id: f.id, title: f.title }))
      });

      if (data.success && data.files.length > 0) {
        // Prendre le premier fichier de la room
        const file = data.files[0];
        console.log('✅ [PAGE] File found, loading:', {
          id: file.id,
          title: file.title,
          contentLength: file.content?.length
        });
        setCurrentFile(file);
        setTitle(file.title);
        setContent(file.content);
      } else {
        console.log('⚠️ [PAGE] No files found, creating new file...');
        // Créer un nouveau fichier pour cette room
        await createNewFile(roomId);
      }
    } catch (error) {
      console.error('❌ [PAGE] Error loading file:', error);
      // Créer un fichier par défaut en cas d'erreur
      await createNewFile(roomId);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewFile = async (roomId) => {
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Nouveau Document',
          content: '# Nouveau Document\n\nCommencez à écrire ici...',
          roomId: roomId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentFile(data.file);
        setTitle(data.file.title);
        setContent(data.file.content);
        console.log('✅ File created and loaded:', data.file.id);
      } else {
        console.error('❌ Failed to create file:', data.error);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      // Fallback vers un fichier local
      setCurrentFile({ id: uuidv4(), title: 'Document Local', content: '' });
      setTitle('Document Local');
      setContent('# Document Local\n\nCommencez à écrire ici...');
    }
  };

  const handleTitleChange = (newTitle) => {
    console.log('📝 [PAGE] Title changed:', newTitle);
    setTitle(newTitle);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleSaveStatusChange = (status) => {
    setSaveStatus(status);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const createNewRoom = () => {
    const newRoomId = uuidv4().substring(0, 8);
    router.push(`/?room=${newRoomId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.loadingContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>
            Chargement de votre document...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header
        title={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        connectedUsers={connectedUsers}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <main className={styles.main}>
        {currentFile && (
          <MarkdownEditor
            fileId={currentFile.id}
            roomId={roomId}
            initialContent={content}
            initialTitle={title}
            onContentChange={handleContentChange}
            onTitleChange={handleTitleChange}
            onSaveStatusChange={handleSaveStatusChange}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Bouton flottant pour créer une nouvelle room */}
      <motion.button
        onClick={createNewRoom}
        className={styles.fabButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
      >
        <svg className={styles.fabIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      {/* Indicateur de room */}
      <motion.div
        className={styles.roomIndicator}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
      >
        <p className={styles.roomText}>
          Room: <span className={styles.roomId}>{roomId}</span>
        </p>
      </motion.div>
    </div>
  );
}
