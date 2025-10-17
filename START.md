# 🎉 Votre application HedgeDoc Collaborative est prête !

## 🚀 Démarrage immédiat

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer la base de données
1. Créez un compte gratuit sur [Neon.tech](https://neon.tech)
2. Créez un nouveau projet PostgreSQL
3. Copiez l'URL de connexion
4. Créez le fichier `.env.local` :

```bash
cp env.example .env.local
```

5. Modifiez `.env.local` avec votre URL Neon :
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
SOCKET_PORT=3001
```

### 3. Initialiser la base de données
```bash
npm run db:migrate
```

### 4. Lancer l'application
```bash
npm run dev
```

🎊 **C'est tout !** Votre application est maintenant accessible sur [http://localhost:3000](http://localhost:3000)

## ✨ Fonctionnalités disponibles

- **Édition collaborative** : Partagez l'URL avec d'autres pour collaborer
- **Aperçu temps réel** : Markdown rendu instantanément
- **Sauvegarde automatique** : Vos modifications sont sauvées automatiquement
- **Mode sombre** : Cliquez sur l'icône lune/soleil
- **Rooms** : Créez de nouvelles salles avec le bouton "+"

## 📱 Utilisation

1. **Écrire** : Tapez votre Markdown dans l'éditeur de gauche
2. **Voir** : L'aperçu se met à jour en temps réel à droite
3. **Collaborer** : Partagez l'URL `http://localhost:3000/?room=nom-de-room`
4. **Sauvegarder** : Automatique ! Regardez l'indicateur dans l'en-tête

## 🎨 Personnalisation

- **Couleurs** : Modifiez `tailwind.config.js`
- **Styles** : Éditez `src/app/globals.css`
- **Composants** : Dans `src/components/`

## 🚀 Déploiement

Prêt à déployer ? Consultez [DEPLOYMENT.md](DEPLOYMENT.md) pour :
- Vercel (1-click)
- Railway
- Netlify

## 📚 Documentation complète

- [README.md](README.md) - Documentation complète
- [QUICKSTART.md](QUICKSTART.md) - Guide de démarrage rapide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement

---

**Amusez-vous bien avec votre nouvelle application collaborative !** 🎉
