# HedgeDoc Collaborative 

Une application web collaborative de type HedgeDoc construite avec Next.js, permettant l'édition en temps réel de documents Markdown avec un design moderne inspiré d'iOS.

![HedgeDoc Collaborative](https://img.shields.io/badge/Next.js-15.5.5-black?style=for-the-badge&logo=next.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7.5-010101?style=for-the-badge&logo=socket.io)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## Fonctionnalités

- **Collaboration en temps réel** : Plusieurs utilisateurs peuvent éditer le même document simultanément
- **Aperçu en direct** : Visualisation instantanée du rendu Markdown
- **Sauvegarde automatique** : Les modifications sont automatiquement sauvegardées en base
- **Design moderne** : Interface épurée inspirée d'iOS avec mode sombre
- **Coloration syntaxique** : Mise en évidence du code avec react-syntax-highlighter
- **Responsive** : Optimisé pour tous les appareils
- **Système de rooms** : Collaboration organisée par salles

## Démarrage rapide

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Neon.tech (PostgreSQL gratuit)

### Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd hedgedoc-collaborative
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de la base de données**

Créez un compte sur [Neon.tech](https://neon.tech) et récupérez votre URL de connexion PostgreSQL.

Créez un fichier `.env.local` :
```bash
cp env.example .env.local
```

Modifiez `.env.local` avec vos informations :
```env
# Database Configuration (Neon.tech PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Socket.io Configuration
SOCKET_PORT=3001
```

4. **Initialiser la base de données**
```bash
npm run db:migrate
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Architecture

### Structure du projet
```
src/
├── app/
│   ├── api/
│   │   ├── files/          # API REST pour les fichiers
│   │   └── socket/         # Configuration Socket.io
│   ├── globals.css         # Styles globaux avec Tailwind
│   ├── layout.js          # Layout principal
│   └── page.js            # Page d'accueil
├── components/
│   ├── Header.js          # Barre de navigation
│   └── MarkdownEditor.js  # Éditeur avec split view
├── hooks/
│   ├── useSocket.js       # Hook pour Socket.io
│   └── useDebounce.js     # Hook pour debounce
└── lib/
    └── db.js              # Configuration PostgreSQL
```

### Technologies utilisées

- **Frontend** : Next.js 15, React 19, CSS Modules, Framer Motion
- **Backend** : Next.js API Routes, Socket.io
- **Base de données** : PostgreSQL (Neon.tech)
- **Markdown** : react-markdown, react-syntax-highlighter
- **Temps réel** : Socket.io
- **Styling** : CSS Modules avec thème iOS personnalisé

## Design System

L'application utilise un design system inspiré d'iOS avec :

- **Couleurs** : Palette iOS avec support du mode sombre
- **Typographie** : SF Pro Display / Système
- **Composants** : Coins arrondis, ombres légères, transitions fluides
- **Animations** : Framer Motion pour les micro-interactions

## Configuration avancée

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | - |
| `NEXTAUTH_SECRET` | Clé secrète pour l'authentification | - |
| `NEXTAUTH_URL` | URL de base de l'application | `http://localhost:3000` |
| `SOCKET_PORT` | Port pour Socket.io | `3001` |

### Personnalisation du thème

Modifiez `src/app/globals.css` pour personnaliser les couleurs et styles :

```css
:root {
  --ios-blue: #007AFF;
  --ios-blue-hover: #0056CC;
  /* Ajoutez vos couleurs personnalisées */
}
```

## Collaboration

### Système de rooms

- Chaque document appartient à une "room"
- Les utilisateurs rejoignent automatiquement la room du document
- URL format : `/?room=room-id`
- Synchronisation temps réel via Socket.io

### API Endpoints

- `GET /api/files?room=roomId` - Récupérer les fichiers d'une room
- `POST /api/files` - Créer un nouveau fichier
- `GET /api/files/[id]` - Récupérer un fichier spécifique
- `PUT /api/files/[id]` - Mettre à jour un fichier
- `DELETE /api/files/[id]` - Supprimer un fichier

## Utilisation

1. **Créer un nouveau document** : Cliquez sur le bouton "+" en bas à droite
2. **Collaborer** : Partagez l'URL avec d'autres utilisateurs
3. **Éditer** : Tapez dans l'éditeur de gauche, l'aperçu se met à jour en temps réel
4. **Sauvegarder** : La sauvegarde est automatique (indicateur dans l'en-tête)
5. **Mode sombre** : Cliquez sur l'icône lune/soleil dans l'en-tête

## Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement dans les settings Vercel
3. Déployez automatiquement

### Autres plateformes

L'application est compatible avec toutes les plateformes supportant Next.js :
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## Dépannage

### Problèmes courants

**Socket.io ne se connecte pas**
- Vérifiez que le port 3001 est libre
- Assurez-vous que `SOCKET_PORT` est correctement configuré

**Erreur de base de données**
- Vérifiez votre `DATABASE_URL`
- Exécutez `npm run db:migrate` pour créer les tables

**Styles CSS non appliqués**
- Vérifiez que les modules CSS sont bien importés
- Redémarrez le serveur de développement

## Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation
- Vérifiez les logs de la console

---

Fait avec et Next.js
