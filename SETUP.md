# Guide de Setup - TaxiCompta

Guide détaillé étape par étape pour configurer tous les services externes.

## 1. Clerk (Authentication)

### Créer le compte et application

1. Aller sur https://clerk.com
2. S'inscrire avec une email
3. Créer une nouvelle application
4. Sélectionner les méthodes d'auth (Email + Google par défaut OK)
5. Dans "API Keys" → copier:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### Configurer les redirects

1. Aller à "Domains"
2. Ajouter:
   - `http://localhost:3000` (développement)
   - `https://<vercel-domain>.com` (production)

## 2. Mailgun (Email Inbound)

### Créer le compte

1. Aller sur https://mailgun.com
2. S'inscrire avec une email
3. Vérifier le domaine (utiliser sandbox si d'abord pas de domaine custom)

### Configuration API

1. Aller à "API Security"
2. Copier votre `MAILGUN_API_KEY`
3. Votre domaine: `MAILGUN_DOMAIN` (par exemple: `sandbox1234.mailgun.org`)

### Configurer le Webhook de réception

1. Aller à "Routes" (sous le domaine)
2. Créer une nouvelle route:

```
Expression:   match_recipient("(.*)@<VOTRE_DOMAINE>")
Actions:      forward("<URL_WEBHOOK>")
```

Pour développement local avec ngrok:
```bash
# Dans un terminal:
ngrok http 3000

# Utiliser l'URL publique, par exemple:
forward("https://abc123.ngrok.io/api/webhooks/mailgun")
```

Pour production:
```
forward("https://<VOTRE_DOMAINE>.com/api/webhooks/mailgun")
```

### Générer le webhook secret

1. Aller à "Webhooks"
2. Ajouter un webhook pour "bounce" événement
3. Cliquer sur le webhook créé
4. Copier le webhook signing key → `MAILGUN_WEBHOOK_SECRET`

## 3. OpenAI (AI Extraction)

### Créer et créditer le compte

1. Aller sur https://platform.openai.com
2. S'inscrire
3. Ajouter un mode de paiement
4. Créditer votre compte (recommandé: minimum 10€ pour test)

### Générer une clé API

1. Aller à "API keys"
2. Créer une nouvelle clé → copier `OPENAI_API_KEY`
3. Vérifier qu'elle est en "organization" mode (pas "user")

### Test (optionnel)

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

## 4. Stripe (Paiements)

### Créer le compte

1. Aller sur https://stripe.com
2. S'inscrire avec email professionnelle
3. Mode TEST automatiquement activé

### Récupérer les clés

1. Aller à "Developers" → "API keys"
2. Copier:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
   - `STRIPE_SECRET_KEY` (sk_test_...)

### Créer le produit et prix

1. Aller à "Products"
2. Créer un produit:
   - Nom: "Premium Subscription"
   - Description: "Accès complet à TaxiCompta"
   - Type: "Recurring"
3. Ajouter un prix:
   - Montant: 9.99 EUR
   - Récurrence: Monthly
4. Copier l'ID du prix → `STRIPE_PRICE_ID` (price_...)

### Configurer les webhooks

#### Option 1: Stripe CLI (développement)

```bash
# Installer
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copier la clé affichée → STRIPE_WEBHOOK_SECRET
```

#### Option 2: Dashboard (production)

1. Aller à "Developers" → "Webhooks"
2. Créer un endpoint:
   - URL: `https://<domaine>/api/webhooks/stripe`
   - Événements à écouter: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`
3. Copier le webhook secret → `STRIPE_WEBHOOK_SECRET`

## 5. Supabase (Storage)

### Créer le projet

1. Aller sur https://supabase.com
2. Créer un nouveau projet
3. Attendre le déploiement (~2 min)

### Récupérer les clés

1. Aller à "Settings" → "API"
2. Copier:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (clé service_role, PAS anon_key)

### Créer le bucket de stockage

1. Aller à "Storage" → "Buckets"
2. Créer un bucket: `invoices`
3. Rendre public: settings → "Public bucket"

### Tester l'accès (optionnel)

```bash
curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  https://<project_id>.supabase.co/storage/v1/object/list/invoices
```

## 6. PostgreSQL Database

### Option A: Local Docker (recommandé pour dev)

```bash
docker-compose up -d postgres

# URL:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxi_comptabilite"
```

### Option B: Vercel Postgres (production)

1. Créer un compte Vercel
2. Dashboard → Storage → créer Postgres
3. Copier la connection string → `DATABASE_URL`

### Option C: Supabase Postgres

1. Votre projet Supabase contient déjà une DB
2. Aller à "Settings" → "Database"
3. Copier la connection string

## Variables d'environnement complètes

Créer `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxi_comptabilite"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_abc...
CLERK_SECRET_KEY=sk_test_abc...

# Mailgun
MAILGUN_API_KEY=key-abc...
MAILGUN_DOMAIN=sandbox1234.mailgun.org
MAILGUN_WEBHOOK_SECRET=token-abc...

# OpenAI
OPENAI_API_KEY=sk-abc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_abc...
STRIPE_SECRET_KEY=sk_test_abc...
STRIPE_WEBHOOK_SECRET=whsec_abc...
STRIPE_PREMIUM_PRICE_ID=price_abc...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
NEXT_PUBLIC_ENABLE_DEMO=true
```

## Vérification de l'installation

### 1. Variables d'environnement

```bash
# Vérifier que tous les .env.local sont définis
cat .env.local | grep -v "^#" | grep -v "^$"
```

### 2. Base de données

```bash
# Créer les tables Prisma
npx prisma db push

# Voir les tables créées
npx prisma studio  # UI interactive
```

### 3. Démarrer le serveur

```bash
npm run dev

# Vérifier dans le navigateur:
# http://localhost:3000 → Landing page
# http://localhost:3000/sign-up → Formulaire Clerk
```

### 4. Tester l'auth

1. Cliquer sur "Sign Up"
2. Créer un compte (email de test OK)
3. Accepter confirmation email (Clerk simule en dev)
4. Redirection vers `/dashboard`

### 5. Tester l'email inbound

Si vous utilisez ngrok (dev local):

1. Envoyer un email de test:
```bash
curl -X POST https://api.mailgun.net/v3/<VOTRE_DOMAINE>/messages \
  -u "api:$MAILGUN_API_KEY" \
  -F from='test@example.com' \
  -F to='taxi-xxx@<VOTRE_DOMAINE>' \
  -F subject='Test' \
  -F text='Test' \
  -F attachment=@facture.pdf
```

2. Vérifier dans les logs du serveur:
```
[api/webhooks/mailgun] Email reçu pour user...
```

3. Aller au dashboard → "Factures" → nouvelle facture créée

### 6. Tester Stripe

```bash
# Ouvrir dans un navigateur:
# http://localhost:3000/settings

# Cliquer sur "Passer à Premium"

# Utiliser les numéros de test Stripe:
# Carte: 4242 4242 4242 4242
# Expiration: 12/25
# CVC: 123
# Billet: N'importe quoi

# Vérifier que la souscription est mise à jour
```

## Dépannage

### "Email not found in Clerk"
- Vérifier que la clé Clerk est correcte
- Verifier qu'on est connecté au bon compte Clerk

### "Invalid webhook signature"
- Vérifier que `STRIPE_WEBHOOK_SECRET` / `MAILGUN_WEBHOOK_SECRET` sont corrects
- Pour Stripe CLI: relancer `stripe listen`

### "OpenAI: Invalid API key"
- Vérifier la clé n'est pas expirée
- Vérifier le crédit sur le compte

### "Supabase bucket not found"
- Créer manuellement le bucket `invoices`
- Le rendre public dans les settings

### Database connection refused
- Vérifier Docker: `docker ps` doit montrer postgres
- Relancer: `docker-compose down && docker-compose up -d postgres`

## Prochaines étapes

1. ✅ Setup local complet
2. ✅ Tester tous les flux
3. ✅ Configurer Vercel
4. ✅ Déployer en production
5. ✅ Configurer domaine personnalisé
6. ✅ Monitoring (Sentry, Datadog)

Voir `DEPLOY.md` pour le déploiement production.
