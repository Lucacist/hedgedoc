import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSocket } from '@/hooks/useSocket';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './MarkdownEditor.module.css';

export default function MarkdownEditor({ 
  fileId, 
  roomId, 
  initialContent = '', 
  initialTitle = '',
  onContentChange,
  onTitleChange,
  onSaveStatusChange,
  darkMode 
}) {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  
  // Figer les valeurs initiales pour la comparaison avec useRef
  const frozenInitialContent = useRef(initialContent);
  const frozenInitialTitle = useRef(initialTitle);
  
  // Mettre à jour les refs seulement au changement de fileId
  useEffect(() => {
    frozenInitialContent.current = initialContent;
    frozenInitialTitle.current = initialTitle;
    setContent(initialContent);
    setTitle(initialTitle);
  }, [fileId]);

  // Écouter les changements de titre depuis le parent (Header)
  useEffect(() => {
    console.log('📝 [EDITOR] Title prop changed:', initialTitle);
    setTitle(initialTitle);
  }, [initialTitle]);
  
  const { socket, isConnected } = useSocket();
  const textareaRef = useRef(null);

  // Debounce pour éviter trop de sauvegardes
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 1000);

  // Synchronisation avec Socket.io
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Rejoindre la room
    socket.emit('join-room', roomId);

    // Écouter les mises à jour de contenu
    socket.on('content-updated', (data) => {
      if (data.fileId === fileId && data.userId !== socket.id) {
        setContent(data.content);
        setTitle(data.title);
      }
    });

    return () => {
      socket.emit('leave-room', roomId);
      socket.off('content-updated');
    };
  }, [socket, isConnected, roomId, fileId]);

  // Sauvegarde automatique
  useEffect(() => {
    console.log('🔄 [DEBOUNCE] Effect triggered:', {
      debouncedContent: debouncedContent?.substring(0, 50) + '...',
      frozenInitialContent: frozenInitialContent.current?.substring(0, 50) + '...',
      contentChanged: debouncedContent !== frozenInitialContent.current,
      debouncedTitle,
      frozenInitialTitle: frozenInitialTitle.current,
      titleChanged: debouncedTitle !== frozenInitialTitle.current,
      shouldSave: (debouncedContent !== frozenInitialContent.current || debouncedTitle !== frozenInitialTitle.current)
    });

    if (debouncedContent !== frozenInitialContent.current || debouncedTitle !== frozenInitialTitle.current) {
      console.log('✅ [DEBOUNCE] Conditions met, calling saveContent()');
      saveContent();
    } else {
      console.log('⏸️ [DEBOUNCE] No changes detected, skipping save');
    }
  }, [debouncedContent, debouncedTitle]);

  const saveContent = async () => {
    console.log(' [CLIENT] Starting save process:', {
      fileId,
      hasContent: !!debouncedContent,
      contentLength: debouncedContent?.length,
      title: title?.substring(0, 30) + '...'
    });

    if (!fileId) {
      console.error(' [CLIENT] No fileId - cannot save');
      return;
    }
    
    onSaveStatusChange('saving');
    
    try {
      console.log(' [CLIENT] Sending PUT request to:', `/api/files/${fileId}`);
      
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: debouncedContent,
        }),
      });

      console.log(' [CLIENT] Response status:', response.status);
      
      const data = await response.json();
      console.log(' [CLIENT] Response data:', data);
      
      if (data.success) {
        console.log(' [CLIENT] Save successful');
        onSaveStatusChange('saved');
        
        // Émettre via Socket.io pour la synchronisation temps réel
        if (socket && isConnected) {
          console.log(' [CLIENT] Emitting to Socket.io');
          socket.emit('content-change', {
            fileId,
            content: debouncedContent,
            title,
            roomId
          });
        } else {
          console.log(' [CLIENT] Socket not connected');
        }
      } else {
        console.error(' [CLIENT] Save failed:', data.error);
        onSaveStatusChange('error');
      }
    } catch (error) {
      console.error(' [CLIENT] Error saving content:', error);
      onSaveStatusChange('error');
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    console.log('⌨️ [INPUT] Content changed:', {
      newLength: newContent.length,
      preview: newContent.substring(0, 50) + '...'
    });
    setContent(newContent);
    onContentChange(newContent);
  };

  const handleTitleChange = (newTitle) => {
    console.log('📝 [EDITOR] Title changed:', newTitle);
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  // Composant pour le rendu du code avec coloration syntaxique
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={darkMode ? oneDark : oneLight}
        language={match[1]}
        PreTag="div"
        className="rounded-ios"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={`${className} bg-ios-gray-100 dark:bg-ios-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className={styles.container}>
      {/* Éditeur */}
      <motion.div 
        className={styles.editorPanel}
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>
            Éditeur
          </h3>
        </div>
        <div className={styles.editorContent}>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className={styles.textarea}
            placeholder="Commencez à écrire votre Markdown ici..."
            spellCheck={false}
          />
        </div>
      </motion.div>

      {/* Aperçu */}
      <motion.div 
        className={styles.previewPanel}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={styles.panelHeader}>
          <h3 className={styles.panelTitle}>
            Aperçu
          </h3>
        </div>
        <div className={styles.previewContent}>
          <div className={styles.prose}>
            <ReactMarkdown
              components={{
                code: CodeBlock,
              }}
            >
              {content || '*Commencez à écrire pour voir l\'aperçu...*'}
            </ReactMarkdown>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
