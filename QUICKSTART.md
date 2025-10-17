# 🚀 Guide de démarrage rapide - HedgeDoc Collaborative

## Installation en 5 minutes

### 1. Prérequis
- Node.js 18+ installé
- Compte gratuit sur [Neon.tech](https://neon.tech)

### 2. Installation
```bash
# Cloner et installer
git clone <votre-repo>
cd hedgedoc-collaborative
npm install
```

### 3. Configuration base de données

**Créer une base Neon :**
1. Allez sur [console.neon.tech](https://console.neon.tech)
2. Créez un nouveau projet
3. Copiez l'URL de connexion

**Configuration locale :**
```bash
# Copier le fichier d'exemple
cp env.example .env.local

# Éditer .env.local avec votre URL Neon
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
SOCKET_PORT=3001
```

### 4. Initialisation
```bash
# Créer les tables
npm run db:migrate

# Lancer l'application
npm run dev
```

### 5. Utilisation
- Ouvrez [http://localhost:3000](http://localhost:3000)
- Commencez à écrire dans l'éditeur
- Partagez l'URL pour collaborer !

## 🎯 Fonctionnalités principales

| Fonctionnalité | Description |
|----------------|-------------|
| **Édition temps réel** | Tapez et voyez les changements instantanément |
| **Collaboration** | Plusieurs utilisateurs sur le même document |
| **Sauvegarde auto** | Vos modifications sont sauvées automatiquement |
| **Mode sombre** | Interface adaptée jour/nuit |
| **Rooms** | Organisez vos documents par salles |

## 🔧 Commandes utiles

```bash
# Développement
npm run dev              # Lancer en mode développement
npm run build           # Construire pour la production
npm run start           # Lancer en production

# Base de données
npm run db:migrate      # Créer/mettre à jour les tables
```

## 🆘 Problèmes fréquents

**L'application ne démarre pas :**
- Vérifiez que Node.js 18+ est installé : `node --version`
- Installez les dépendances : `npm install`

**Erreur de base de données :**
- Vérifiez votre `DATABASE_URL` dans `.env.local`
- Exécutez `npm run db:migrate`

**Socket.io ne fonctionne pas :**
- Vérifiez que le port 3001 est libre
- Redémarrez l'application

## 📱 Utilisation mobile

L'application est entièrement responsive et fonctionne parfaitement sur mobile et tablette.

## 🌐 Déploiement rapide

**Vercel (1-click) :**
1. Push votre code sur GitHub
2. Connectez-vous à [vercel.com](https://vercel.com)
3. Importez votre repo
4. Ajoutez vos variables d'environnement
5. Déployez !

---

**Besoin d'aide ?** Consultez le [README.md](README.md) complet ou ouvrez une issue.
