# TaxiCompta - SaaS Comptabilité Taxi

Plateforme de gestion comptable simplifiée pour chauffeurs de taxi. Envoyez vos factures par email, et notre IA en extrait automatiquement les données.

## Stack Technique

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: Clerk
- **Email**: Mailgun Routes (inbound)
- **AI**: OpenAI API (extraction comptable)
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **Deployment**: Vercel

## Setup Local Rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone et dépendances

```bash
git clone <repo>
cd taxi-comptabilite
npm install
```

### 2. Database (Docker)

```bash
docker-compose up -d postgres
```

### 3. Variables d'environnement

Copier `.env.example` en `.env.local`:

```bash
cp .env.example .env.local
```

Remplir les variables requises:

```env
# Database (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxi_comptabilite"

# Clerk (https://clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key

# Mailgun (https://mailgun.com)
MAILGUN_API_KEY=your_key
MAILGUN_DOMAIN=sandbox...mailgun.org
MAILGUN_WEBHOOK_SECRET=your_secret

# OpenAI (https://openai.com)
OPENAI_API_KEY=your_key

# Stripe (https://stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialiser la base de données

```bash
npx prisma db push
npm run db:seed
```

### 5. Démarrer le serveur de développement

```bash
npm run dev
```

Accédez à `http://localhost:3000`

## Services Requis

### Clerk (Auth)

1. Créer un compte sur [clerk.com](https://clerk.com)
2. Créer une application
3. Récupérer les clés publiques et secrètes
4. Configurer les redirect URLs: `http://localhost:3000/sign-in/callback`

### Mailgun (Email Inbound)

1. Créer un compte sur [mailgun.com](https://mailgun.com)
2. Vérifier un domaine (ou utiliser le domaine sandbox fourni)
3. Créer un Mailgun Route:
   - **Expression**: `match_recipient("(.*)@<YOUR_DOMAIN>")`
   - **Actions**: `forward("http://localhost:3000/api/webhooks/mailgun")`
4. Générer une clé API
5. Générer un webhook secret

### OpenAI (Extraction)

1. Créer un compte sur [openai.com](https://openai.com)
2. Générer une clé API
3. Créditer votre compte pour les appels API

### Stripe (Paiements)

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer les clés test (`pk_test_...` et `sk_test_...`)
3. Créer un produit "Premium" avec prix récurrent (9,99€/mois)
4. Configurer les webhook localement avec Stripe CLI:

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Supabase (Storage)

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un bucket public `invoices`
3. Récupérer l'URL du projet et la clé service role

## Commandes Disponibles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Database
npx prisma db push          # Pusher les migrations
npx prisma studio          # UI pour explorer la DB
npm run db:seed             # Créer les catégories par défaut
npm run db:reset            # Réinitialiser la DB

# Linting
npm run lint
```

## Architecture

```
├── app/
│   ├── (auth)/              # Pages auth (Clerk)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/         # Routes protégées
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   └── settings/
│   ├── api/
│   │   ├── dashboard/
│   │   ├── invoices/
│   │   ├── settings/
│   │   ├── exports/
│   │   ├── stripe/
│   │   └── webhooks/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── clerk.ts            # Clerk helpers
│   ├── db.ts               # Prisma client
│   └── utils.ts            # Utilities
├── services/
│   ├── extraction.ts       # OpenAI extraction
│   ├── pdf.ts              # PDF parsing
│   └── storage.ts          # Supabase storage
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── seed.js             # Seed script
└── middleware.ts           # Auth middleware
```

## Workflow Email

1. **Utilisateur envoie une facture** → `taxi-xxx@app.tax.local`
2. **Mailgun reçoit** → Forward vers `/api/webhooks/mailgun`
3. **Webhook traite**:
   - Valide la signature Mailgun
   - Trouve l'utilisateur
   - Vérifie le quota (free: 10/mois)
   - Extrait le PDF
   - Appelle OpenAI pour extraction des données
   - Crée l'invoice en DB
   - Sauvegarde le PDF dans Supabase
4. **Dashboard mets à jour** → Vue en temps réel

## Modèle de Données

### User
- clerkId (unique, Clerk)
- email (unique)
- inboxEmail (unique, généré)
- name, avatarUrl
- Relations: subscription, invoices, emails, categories

### Subscription
- stripeCustomerId, stripeSubscriptionId
- status: "free" | "premium"
- Limites: free = 10 factures/mois, premium = illimité

### Invoice
- category (chauffeur, carburant, péage, etc.)
- supplierName, invoiceNumber, date
- amountHT, amountTVA, amountTTC
- extractionStatus: "pending" | "completed" | "failed"
- Relations: user, email, items

### Email
- from, subject, body
- attachmentCount
- status: "pending" | "processed" | "no_invoices"
- Relations: user, attachments, invoices

### ExpenseCategory
- Catégories pour chauffeur: Carburant, Péage, Entretien, Assurance, Location, Restauration, Autres

## Fonctionnalités

### Auth
✅ Inscription/connexion avec Clerk
✅ Espace utilisateur sécurisé
✅ Adresse email unique par chauffeur

### Emails
✅ Réception automatique via Mailgun
✅ Extraction PDF automatique
✅ Stockage sécurisé dans Supabase

### Extraction
✅ OCR avec pdf-parse
✅ IA avec OpenAI pour détection montants, dates, fournisseurs
✅ Catégorisation automatique
✅ Gestion des erreurs

### Dashboard
✅ Statistiques (total dépenses, TVA, répartition)
✅ Listing factures avec recherche/filtres
✅ Statut extraction (pending/completed/failed)
✅ Actions (view/delete)

### Exports
✅ CSV (compatibles Excel/Google Sheets)
✅ PDF (rapport comptable formaté)
✅ Filtres par période, catégorie

### Abonnement
✅ Stripe Checkout intégré
✅ Webhook de synchronisation
✅ Limites free vs premium
✅ Gestion renouvellement

## Déploiement

### Vercel (Recommandé)

1. **Fork/Push vers GitHub**

```bash
git remote add origin <github_repo>
git push origin main
```

2. **Import dans Vercel**
   - Aller sur vercel.com
   - "Import Project" → sélectionner le repo
   - Ajouter les variables d'environnement
   - Deploy

3. **Database**
   - Créer une DB PostgreSQL (Vercel Postgres ou externe)
   - Copier l'URL de connexion dans Vercel env vars

4. **Webhooks**
   - Mailgun: `https://<domaine-vercel>/api/webhooks/mailgun`
   - Stripe: `https://<domaine-vercel>/api/webhooks/stripe`

5. **Domaine personnalisé**
   - Ajouter dans Vercel settings
   - Mettre à jour `NEXT_PUBLIC_APP_URL` pour les redirects

### Docker Local

```bash
# Build image
docker build -t taxi-compta .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e CLERK_SECRET_KEY="..." \
  ... taxi-compta
```

## Troubleshooting

### Erreur Mailgun webhook
- Vérifier `MAILGUN_WEBHOOK_SECRET` correspond à celui généré dans Mailgun
- Logger les requêtes dans `/api/webhooks/mailgun`
- Tester avec curl: `curl -X POST http://localhost:3000/api/webhooks/mailgun`

### Extraction OpenAI échoue
- Vérifier `OPENAI_API_KEY` valide
- Vérifier crédit sur compte OpenAI
- Tester avec un simple prompt en Python

### Erreur auth Clerk
- Vérifier `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` correct
- Vérifier redirect URLs dans Clerk dashboard
- Vérifier middleware.ts est chargé

### PDF ne s'upload pas à Supabase
- Vérifier `SUPABASE_SERVICE_ROLE_KEY` (pas la clé anon)
- Vérifier bucket `invoices` existe et est public
- Vérifier permissions RLS si activées

## Sécurité

✅ Auth via Clerk (passwordless par défaut)
✅ Webhook Mailgun signé
✅ Webhook Stripe signé
✅ Variables sensibles dans .env.local (pas committed)
✅ Ownership verification sur invoices/emails
✅ Prisma protégé contre SQL injection
✅ CORS configurable

## Performance

- Dashboard stats: 1 requête DB
- Invoice listing: 1 requête DB + pagination
- PDF export: streaming (pas de RAM complète)
- CSV export: streaming
- OpenAI extraction: ~2-5s par facture
- Supabase upload: ~1-2s par fichier

## Roadmap

- [ ] Notifications email confirmation
- [ ] Bulk import CSV
- [ ] Graphiques revenue/expenses par mois
- [ ] Tags personnalisés
- [ ] Intégration comptable (API Ciel, Sage)
- [ ] Mode hors ligne
- [ ] Mobile app native

## Support

Pour questions/bugs:
1. Vérifier la documentation
2. Vérifier les logs (console, Vercel)
3. Créer une issue GitHub

## License

MIT
