import { motion } from 'framer-motion';
import { Save, Users, Moon, Sun, FileText } from 'lucide-react';
import styles from './Header.module.css';

export default function Header({ 
  title, 
  onTitleChange, 
  saveStatus, 
  connectedUsers, 
  darkMode, 
  onToggleDarkMode 
}) {
  return (
    <motion.header 
      className={styles.header}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Logo et titre */}
          <div className={styles.leftSection}>
            <motion.div
              className={styles.logo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={styles.logoIcon}>
                <FileText size={16} />
              </div>
              <span className={styles.logoText}>
                HedgeDoc
              </span>
            </motion.div>
            
            <div className={styles.titleContainer}>
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className={styles.titleInput}
                placeholder="Titre du document..."
              />
            </div>
          </div>

          {/* Statut et actions */}
          <div className={styles.rightSection}>
            {/* Statut de sauvegarde */}
            <motion.div 
              className={styles.statusContainer}
              animate={{ 
                scale: saveStatus === 'saving' ? [1, 1.05, 1] : 1 
              }}
              transition={{ 
                duration: 0.5, 
                repeat: saveStatus === 'saving' ? Infinity : 0 
              }}
            >
              <Save className={`${styles.statusIcon} ${styles[saveStatus]}`} />
              <span className={`${styles.statusText} ${styles[saveStatus]}`}>
                {saveStatus === 'saved' && 'Enregistré'}
                {saveStatus === 'saving' && 'Sauvegarde...'}
                {saveStatus === 'error' && 'Erreur'}
              </span>
            </motion.div>

            {/* Utilisateurs connectés */}
            <div className={styles.usersContainer}>
              <Users className={styles.usersIcon} />
              <span className={styles.usersCount}>
                {connectedUsers}
              </span>
            </div>

            {/* Toggle mode sombre */}
            <motion.button
              onClick={onToggleDarkMode}
              className={styles.themeToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {darkMode ? (
                <Sun className={styles.themeIcon} />
              ) : (
                <Moon className={styles.themeIcon} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
