# 🚀 Guide de déploiement - HedgeDoc Collaborative

## Déploiement sur Vercel (Recommandé)

### 1. Préparation
```bash
# Assurez-vous que votre code est sur GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Configuration Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Cliquez sur "New Project"
4. Sélectionnez votre repository `hedgedoc-collaborative`

### 3. Variables d'environnement
Dans les settings Vercel, ajoutez :

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=your-production-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
SOCKET_PORT=3001
```

### 4. Déploiement
- Vercel déploiera automatiquement
- L'URL sera disponible sous `https://your-app.vercel.app`

## Déploiement sur Railway

### 1. Préparation
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### 2. Déploiement
```bash
# Initialiser le projet
railway init

# Ajouter les variables d'environnement
railway variables set DATABASE_URL="your-neon-url"
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"

# Déployer
railway up
```

## Déploiement sur Netlify

### 1. Configuration
Créez un fichier `netlify.toml` :
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 2. Variables d'environnement
Dans Netlify dashboard :
- `DATABASE_URL`
- `NEXTAUTH_SECRET` 
- `NEXTAUTH_URL`
- `SOCKET_PORT`

## Configuration de la base de données Neon

### 1. Production
- Utilisez une base de données séparée pour la production
- Activez la sauvegarde automatique
- Configurez les limites de connexion

### 2. Migration
```bash
# Sur votre serveur de production
npm run db:migrate
```

## Monitoring et logs

### Vercel
- Logs disponibles dans le dashboard Vercel
- Monitoring intégré

### Railway
```bash
# Voir les logs
railway logs
```

## Optimisations pour la production

### 1. Performance
- Les assets sont automatiquement optimisés par Next.js
- Images optimisées avec `next/image`
- CSS minifié avec Tailwind

### 2. Sécurité
- Variables d'environnement sécurisées
- HTTPS automatique
- CORS configuré

### 3. Mise à l'échelle
- Socket.io supporte la mise à l'échelle horizontale
- Base de données Neon s'adapte automatiquement

## Dépannage déploiement

### Erreurs communes

**Build failed :**
```bash
# Vérifier localement
npm run build
```

**Database connection failed :**
- Vérifiez `DATABASE_URL`
- Assurez-vous que Neon autorise les connexions externes

**Socket.io ne fonctionne pas :**
- Vérifiez la configuration CORS
- Assurez-vous que le port est correct

### Logs utiles
```bash
# Vercel
vercel logs

# Railway  
railway logs

# Local debug
npm run dev
```

## Maintenance

### Mises à jour
```bash
# Mettre à jour les dépendances
npm update

# Tester localement
npm run dev

# Déployer
git push origin main
```

### Sauvegarde
- Neon fait des sauvegardes automatiques
- Exportez régulièrement vos données importantes

---

**Besoin d'aide ?** Consultez la documentation de votre plateforme de déploiement ou ouvrez une issue.
