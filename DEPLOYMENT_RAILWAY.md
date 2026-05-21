# Guide de Déploiement TaxiCompta sur Railway

## Étape 1 : Créer un compte Railway et un projet

1. Allez sur [https://railway.app](https://railway.app)
2. Cliquez sur "Sign Up" et créez votre compte (utilisez GitHub pour plus simple)
3. Une fois connecté, créez un nouveau projet
4. Sélectionnez "Deploy from GitHub repo"

## Étape 2 : Connecter votre dépôt GitHub

1. Railway vous demandera de connecter votre compte GitHub
2. Sélectionnez le dépôt `SaaS taxi` (où vous avez le code TaxiCompta)
3. Railway va proposer de créer automatiquement un service "Next.js"
4. Acceptez cette configuration (Railway détecte Next.js nativement)

## Étape 3 : Configurer la base de données PostgreSQL

### Dans le dashboard Railway :

1. Dans votre projet Railway, cliquez sur "Create" (le bouton +)
2. Sélectionnez "Database" puis "PostgreSQL"
3. Railway crée une instance PostgreSQL automatiquement
4. Cliquez sur le service PostgreSQL créé
5. Dans l'onglet "Variables", Railway va automatiquement fournir `DATABASE_URL`
   - Copiez cette URL (format: `postgresql://user:pass@host:port/dbname`)

## Étape 4 : Configurer les variables d'environnement

### Dans le dashboard Railway (dans votre service Next.js) :

1. Allez à l'onglet "Variables"
2. Vous verrez déjà `DATABASE_URL` (auto-rempli depuis PostgreSQL)
3. Ajoutez les autres variables manquantes :

```
# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = [votre clé publique]
CLERK_SECRET_KEY = [votre clé secrète]

# OpenAI (Extraction de factures)
OPENAI_API_KEY = [votre clé API OpenAI]

# Mailgun (Webhooks email)
MAILGUN_API_KEY = [votre clé API Mailgun]
MAILGUN_DOMAIN = [votre domaine Mailgun]
MAILGUN_SENDER_EMAIL = noreply@[votre domaine]

# Stripe (Paiements)
STRIPE_SECRET_KEY = [votre clé secrète Stripe]
STRIPE_WEBHOOK_SECRET = [votre secret webhook Stripe]

# Supabase (Stockage fichiers)
NEXT_PUBLIC_SUPABASE_URL = [votre URL Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [votre clé anon Supabase]
SUPABASE_SERVICE_ROLE_KEY = [votre clé service role Supabase]

# Configuration app
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://[votre-app-name].up.railway.app
```

**Comment trouver `[votre-app-name]`:**
- Dans le dashboard Railway, voir le nom du domaine fourni par Railway (ex: `mystunning-production-a1b2.up.railway.app`)
- Remplacer dans NEXT_PUBLIC_APP_URL

## Étape 5 : Configurer le déploiement automatique

### Railway configure automatiquement :

1. GitHub est connecté
2. À chaque `push` sur votre branche (par défaut `main`), Railway redéploie
3. Vous pouvez voir les logs en temps réel dans le dashboard

### Vérifier la branche de déploiement :

1. Dans votre service Next.js, allez à l'onglet "Settings"
2. Vérifiez que "GitHub Repo" pointe vers votre dépôt
3. Vérifiez que la branche est `main` (ou votre branche active)

## Étape 6 : Configurer les migrations Prisma

**⚠️ IMPORTANT :** Les migrations Prisma doivent s'exécuter automatiquement au déploiement.

1. Vérifiez le fichier `prisma/schema.prisma` - il doit avoir :
   ```
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   ✅ C'est déjà fait

2. Vérifiez que `package.json` a les scripts pour Prisma:
   ```json
   "db:push": "prisma db push",
   "db:reset": "prisma migrate reset --force"
   ```
   ✅ C'est déjà fait

3. **Option A (Recommandé) - Migrations manuelles au premier déploiement:**
   - Une fois le déploiement réussi, utilisez les logs Railway pour voir l'URL de connexion
   - Lancez localement: `npm run db:push` après mettre la DATABASE_URL de Railway en local
   - Puis faites un `git push` vide pour redéployer

4. **Option B - Script de déploiement automatique:**
   - Créez un fichier `build.sh` à la racine du projet
   - Railway exécutera ce script avant le build Next.js

## Étape 7 : Premier déploiement

1. Assurez-vous que tout est commité et pushé sur GitHub:
   ```bash
   git add .
   git commit -m "Configure Railway deployment"
   git push origin main
   ```

2. Railway va détecter le push et commencer automatiquement le build
3. Regardez les logs dans le dashboard Railway
4. Une fois le build réussi, vous recevrez une URL de domaine

## Étape 8 : Tester l'application en production

1. Ouvrez l'URL fournie par Railway (ex: `https://mystunning-production-a1b2.up.railway.app`)
2. Testez les fonctionnalités principales :
   - ✅ Page de connexion
   - ✅ Dashboard s'affiche
   - ✅ Voir les factures
   - ✅ Télécharger les PDFs
   - ✅ Exporter en CSV

## Dépannage Railway

### Build échoue avec erreur npm

- Railway montre les logs complets
- Vérifiez que `.npmrc` contient: `legacy-peer-deps=true`
- Vérifiez que les versions Next.js et React dans `package.json` sont correctes

### Base de données non accessible

- Railway affiche l'erreur dans les logs
- Vérifiez que `DATABASE_URL` est correctement défini
- Si besoin, redéployez les migrations

### App démarre mais certaines routes 404

- Vérifiez que `NEXT_PUBLIC_APP_URL` est correct dans les variables
- Redéployez avec `git push`

### Mailgun/OpenAI/Stripe ne fonctionnent pas

- Vérifiez que toutes les clés API sont correctement définies dans Railway
- Testez chaque service individuellement
- Vérifiez que les webhooks pointent vers `https://votre-url-railway.app`

## URLs de gestion des services

- **Railway Dashboard**: https://railway.app/dashboard
- **Clerk (Auth)**: https://dashboard.clerk.com
- **OpenAI**: https://platform.openai.com/account/api-keys
- **Mailgun**: https://app.mailgun.com/app/dashboard
- **Stripe**: https://dashboard.stripe.com
- **Supabase**: https://app.supabase.com

## Avantages de Railway vs Vercel

- ✅ Détecte Next.js nativement (no cache conflicts)
- ✅ PostgreSQL inclus et auto-provisionnné
- ✅ Déploiement Docker (dependances isolées)
- ✅ Redéploiement automatique sur GitHub push
- ✅ Logs en temps réel et faciles à lire
- ✅ Variables d'environnement simples
- ✅ Pas d'agressions npm cache

## Notes supplémentaires

- Railway vous donne un domaine gratuit `.up.railway.app`
- Vous pouvez ajouter votre domaine personnalisé plus tard
- Les logs sont conservés et accessibles historiquement
- Vous pouvez "Reset" la base de données depuis le dashboard PostgreSQL
