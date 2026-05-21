# Quick Start - 10 minutes ⚡

Le moyen le plus rapide pour tester TaxiCompta localement.

## 1. Cloner & Installer (2 min)

```bash
git clone <repo>
cd taxi-comptabilite
npm install
```

## 2. Configurer Docker (1 min)

```bash
docker-compose up -d postgres
```

## 3. Variables d'environnement minimales (2 min)

Créer `.env.local`:

```env
# Database (Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taxi_comptabilite"

# Clerk (https://clerk.com - créer compte gratuit)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY

# OpenAI (https://openai.com - créer account + ajouter crédit)
OPENAI_API_KEY=sk-YOUR_KEY

# Mailgun (https://mailgun.com - créer compte)
MAILGUN_API_KEY=key-YOUR_KEY
MAILGUN_DOMAIN=sandbox...mailgun.org
MAILGUN_WEBHOOK_SECRET=token-YOUR_KEY

# Stripe (https://stripe.com - gratuit mode test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY

# Supabase (https://supabase.com - gratuit)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Où obtenir les clés en 5 min?

1. **Clerk**: https://clerk.com → Sign up → Create app → Copy keys
2. **OpenAI**: https://openai.com → Sign up → API → Create key
3. **Mailgun**: https://mailgun.com → Sign up → Copy API key + sandbox domain
4. **Stripe**: https://stripe.com → Sign up → Use test keys (automatic)
5. **Supabase**: https://supabase.com → Create project → Copy URL + key

## 4. Initialiser la DB (1 min)

```bash
npx prisma db push
```

## 5. Démarrer (30 sec)

```bash
npm run dev
```

Ouvrir http://localhost:3000

## 6. Créer un compte de test (1 min)

1. Cliquer "Sign Up"
2. Entrer email de test: `taxi@test.com`
3. Accepter la confirmation email (simul en dev)
4. Redirection vers Dashboard

## 7. Tester l'email inbound (optionnel, 1 min)

Si vous avez Mailgun configuré:

```bash
# Envoyer une facture de test par email:
# À: taxi-<random_id>@<your_mailgun_domain>

# Attendre 30 secondes et vérifier le dashboard
# Les factures doivent apparaître automatiquement
```

## Résumé structure

```
app/
├── (auth)/sign-in, sign-up
├── (dashboard)/dashboard, invoices, settings
├── api/
│   ├── dashboard/stats
│   ├── invoices (CRUD)
│   ├── settings
│   ├── exports/csv, pdf
│   ├── stripe/checkout
│   └── webhooks/mailgun, stripe

lib/
├── clerk.ts - Auth helpers
├── db.ts - Prisma
└── utils.ts

services/
├── extraction.ts - OpenAI
├── pdf.ts - PDF parsing
└── storage.ts - Supabase

components/ui/ - shadcn/ui components
```

## Features fonctionnelles

✅ Auth Clerk (email)
✅ Dashboard avec stats
✅ Listing factures + filtres
✅ Email inbound (Mailgun)
✅ PDF extraction (pdf-parse)
✅ IA extraction (OpenAI)
✅ Storage (Supabase)
✅ Export CSV/PDF
✅ Stripe subscription
✅ Settings utilisateur

## Prochaines étapes

1. Voir `SETUP.md` pour config détaillée des services
2. Voir `README.md` pour documentation complète
3. Voir `DEPLOY.md` pour déployer en production

## FAQ

**Q: Erreur "User not found in Clerk"**
A: Vérifier `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`

**Q: "OpenAI API error"**
A: Vérifier crédit sur compte OpenAI (minimum 1€)

**Q: Mailgun webhook ne fonctionne pas**
A: Pour local, utiliser ngrok: `ngrok http 3000` puis utiliser l'URL dans Mailgun Route

**Q: Database connection error**
A: Vérifier Docker: `docker ps` doit montrer postgres en running

**Q: Auth page blanche**
A: Vérifier que les clés Clerk sont correctes et que le middleware.ts charge

Bon développement! 🚀
