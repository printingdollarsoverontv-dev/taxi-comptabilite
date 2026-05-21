# Guide de Déploiement - TaxiCompta

Instructions pour déployer TaxiCompta en production sur Vercel.

## Prérequis

- ✅ Compte Vercel (gratuit)
- ✅ Compte GitHub (pour versionner le code)
- ✅ Tous les services externes configurés (voir SETUP.md)
- ✅ PostgreSQL production (Vercel Postgres ou Supabase)

## 1. Préparer le code pour production

### Verifier les variables d'environnement

```bash
# Vérifier qu'aucune clé n'est commitée
git log --all -p | grep -i "sk_test" | grep -v ".md"

# .env.local ne doit PAS être commité
cat .gitignore | grep env
```

### Build test local

```bash
npm run build
npm run start

# Visiter http://localhost:3000
# Vérifier que tout fonctionne
```

## 2. Pousser vers GitHub

```bash
git add .
git commit -m "Initial commit: TaxiCompta MVP"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

## 3. Setup Vercel

### Créer le projet Vercel

1. Aller sur https://vercel.com/new
2. Importer depuis GitHub → sélectionner le repo
3. Configurer le projet:
   - Framework Preset: **Next.js**
   - Root Directory: **./** (défaut)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Ajouter les variables d'environnement

Dans Vercel dashboard → Settings → Environment Variables

```
DATABASE_URL=postgresql://...

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

MAILGUN_API_KEY=key-...
MAILGUN_DOMAIN=mg.votredomaine.com
MAILGUN_WEBHOOK_SECRET=token-...

OPENAI_API_KEY=sk-...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...

NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=https://<vercel-domain>.vercel.app
NODE_ENV=production
```

### Deploy

Cliquer sur "Deploy" → Attendre 2-3 minutes

## 4. Configuration des Webhooks

### Mailgun Webhook

1. Aller à https://mailgun.com → domaine
2. Routes → modifier la route:

```
forward("https://<PROJECT>.vercel.app/api/webhooks/mailgun")
```

### Stripe Webhook

1. Aller à https://dashboard.stripe.com → Developers → Webhooks
2. Ajouter un endpoint:
   - URL: `https://<PROJECT>.vercel.app/api/webhooks/stripe`
   - Événements: 
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_succeeded
3. Copier le webhook secret → Ajouter dans Vercel env vars

### Clerk Webhook (optionnel)

1. Aller à https://clerk.com → API → Webhooks
2. Ajouter un endpoint:
   - URL: `https://<PROJECT>.vercel.app/api/webhooks/clerk`
   - Événements: user.updated, user.deleted
3. Copier le secret → Ajouter dans env vars

## 5. Configurer la base de données production

### Option A: Vercel Postgres (Recommandé)

1. Dashboard Vercel → Storage → Create Database
2. Sélectionner Postgres
3. Accepter les conditions
4. Copier la connection string
5. Ajouter dans Vercel env vars: `DATABASE_URL`

### Option B: Supabase

La DB Supabase est déjà créée avec votre projet:

1. Aller à https://supabase.com → votre projet
2. Settings → Database → Copier la connection string
3. Formater pour production (ajouter ?sslmode=require)
4. Ajouter dans Vercel env vars: `DATABASE_URL`

### Appliquer les migrations

Après avoir configuré la DB:

```bash
# Localement, avec la DB production
DATB ASE_URL=<production_url> npx prisma migrate deploy

# Ou manuellement via:
# Vercel CLI
vercel env pull
npx prisma db push
```

## 6. Test en production

### Vérifier le déploiement

1. Aller sur https://<PROJECT>.vercel.app
2. Vérifier que le landing page s'affiche
3. Tester le sign-up
4. Tester l'auth

### Tester l'email inbound

1. Envoyer un email à: `taxi-xxx@<MAILGUN_DOMAIN>`
2. Attendre ~30 secondes
3. Vérifier le dashboard → nouvelle facture créée

### Tester Stripe

1. Settings → Passer à Premium
2. Utiliser carte test: 4242 4242 4242 4242
3. Vérifier que la souscription est mise à jour

### Vérifier les logs

```bash
# Installer Vercel CLI
npm install -g vercel

# Voir les logs en temps réel
vercel logs <PROJECT>

# Voir les erreurs
vercel logs <PROJECT> --since 1h
```

## 7. Configurer un domaine personnalisé

### Ajouter le domaine

1. Vercel dashboard → Project Settings → Domains
2. Ajouter domaine: `comptabilite.votredomaine.com`
3. Suivre les instructions de configuration DNS

### Mettre à jour les URLs

Dans Vercel env vars:

```
NEXT_PUBLIC_APP_URL=https://comptabilite.votredomaine.com
```

Redéployer:

```bash
git commit --allow-empty -m "Update app URL"
git push
```

### Mettre à jour les webhooks

1. **Mailgun**: Routes → forward vers votre nouveau domaine
2. **Stripe**: Webhooks → utiliser votre nouveau domaine
3. **Clerk**: Domains → ajouter votre domaine

## 8. Monitoring et maintenance

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest
```

Ajouter dans `.env`:
```
SENTRY_AUTH_TOKEN=...
SENTRY_DSN=...
```

### Analytics (Optionnel)

```bash
npm install @vercel/analytics
```

Ajouter dans `app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout() {
  return (
    <html>
      <body>
        <Analytics />
      </body>
    </html>
  );
}
```

## 9. Sécurité production

### HTTPS

✅ Automatique sur Vercel

### Secrets

- ✅ Toutes les clés dans Vercel env vars (pas .env committé)
- ✅ `STRIPE_WEBHOOK_SECRET` utilisé pour vérifier les webhook

### Rate limiting (optionnel)

```bash
npm install @vercel/kv
```

### CORS (si API publique)

Dans `next.config.js`:
```js
const nextConfig = {
  // ...
  headers: async () => [
    {
      source: "/api/:path*",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: process.env.NEXT_PUBLIC_APP_URL,
        },
      ],
    },
  ],
};
```

## 10. Performance

### Vérifier Core Web Vitals

1. Vercel dashboard → Analytics
2. Vérifier LCP, FID, CLS
3. Optimiser les images si nécessaire

### Optimiser les fonctions API

```bash
# Vercel CLI - voir les durées
vercel logs --follow
```

## Checklist Final

Avant de considérer le projet comme live:

- [ ] Tous les env vars configurés en production
- [ ] Database production initialisée et testée
- [ ] Webhooks Mailgun pointant vers vercel.app
- [ ] Webhooks Stripe configurés
- [ ] Clerk configuré avec production keys
- [ ] Stripe switché en mode LIVE
- [ ] Landing page visible
- [ ] Auth flow testé (sign-up → dashboard)
- [ ] Email inbound testé (envoyer une facture)
- [ ] Extraction OpenAI testé
- [ ] Premium subscription testé
- [ ] Export CSV/PDF testé
- [ ] Logs Vercel monitorés (aucune erreur critique)
- [ ] Analytics activé (optionnel)

## Troubleshooting Production

### "502 Bad Gateway"
- Vérifier les logs Vercel: `vercel logs`
- Vérifier la DB est accessible
- Vérifier les env vars

### "Webhook failed"
- Vérifier le domaine dans l'URL du webhook
- Vérifier le secret webhook est correct
- Checker les logs Vercel

### "OpenAI API error"
- Vérifier le crédit sur le compte OpenAI
- Vérifier la clé API n'est pas expirée
- Checker les logs Vercel

### Performance lente
- Vérifier les Core Web Vitals dans Vercel Analytics
- Optimiser les images
- Aumenter le timeout des fonctions serverless

## Rollback

Si quelque chose ne fonctionne pas:

```bash
# Vercel sauvegarde les 3 derniers déploiements
# Dashboard → Deployments → Cliquer sur "Rollback"
```

Ou en CLI:
```bash
vercel rollback
```

## Support

- Logs: `vercel logs <PROJECT>`
- Documentation: https://vercel.com/docs
- Support Vercel: https://vercel.com/support

Prêt pour le déploiement! 🚀
