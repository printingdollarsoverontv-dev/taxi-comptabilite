'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, TrendingUp, Zap } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
  // Redirect to dashboard immediately in dev mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-slate-900">TaxiCompta</h1>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 transition">Features</Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 transition">Tarifs</Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-red-500 hover:bg-red-600">Inscription</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            Votre comptabilité<br />simplifie
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Envoyez vos factures par email. Nous extrayons automatiquement les données comptables. Vous obtenez un dashboard complet et des exports prêts à l'emploi.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-16">
            Fonctionnalités
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-red-500" />,
                title: 'Extraction automatique',
                desc: 'Intelligence artificielle qui analyse vos factures en PDF et en extrait les données comptables.',
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-red-500" />,
                title: 'Dashboard temps réel',
                desc: 'Visualisez vos dépenses, TVA récupérable, et répartition par catégorie en un coup d\'œil.',
              },
              {
                icon: <FileText className="h-8 w-8 text-red-500" />,
                title: 'Exports simples',
                desc: 'CSV, PDF, prêts pour votre comptable ou votre logiciel de comptabilité.',
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-red-500" />,
                title: 'Analyse dépenses',
                desc: 'Catégorisez automatiquement vos frais. Carburant, péage, entretien, assurance...',
              },
              {
                icon: <FileText className="h-8 w-8 text-red-500" />,
                title: 'Adresse email unique',
                desc: 'Chaque chauffeur reçoit une adresse email dédiée pour recevoir ses factures.',
              },
              {
                icon: <Zap className="h-8 w-8 text-red-500" />,
                title: 'Stockage illimité',
                desc: 'Toutes vos factures conservées de manière sécurisée. Recherche rapide et filtres avancés.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-slate-200">
                <div className="mb-3">{feature.icon}</div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-16">
            Tarifs simples et transparents
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg border border-slate-200">
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Gratuit</h4>
              <p className="text-slate-600 mb-6">Parfait pour tester</p>
              <ul className="space-y-3 text-slate-600 mb-8">
                <li className="flex gap-2">✓ 10 factures/mois</li>
                <li className="flex gap-2">✓ Dashboard basique</li>
                <li className="flex gap-2">✓ Extraction IA</li>
                <li className="flex gap-2">✗ Export CSV/PDF</li>
              </ul>
              <Button variant="outline" className="w-full">
                Commencer
              </Button>
            </div>
            <div className="bg-slate-900 p-8 rounded-lg border-2 border-red-500 text-white relative">
              <div className="absolute -top-3 left-4 bg-red-500 px-2 py-1 text-xs font-bold rounded">
                RECOMMANDÉ
              </div>
              <h4 className="text-2xl font-bold mb-2">Premium</h4>
              <p className="text-slate-300 mb-6">9,99€/mois</p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2">✓ Factures illimitées</li>
                <li className="flex gap-2">✓ Dashboard complet</li>
                <li className="flex gap-2">✓ Extraction IA avancée</li>
                <li className="flex gap-2">✓ Export CSV/PDF</li>
                <li className="flex gap-2">✓ Support prioritaire</li>
              </ul>
              <Link href="/sign-up">
                <Button className="w-full bg-red-500 hover:bg-red-600">
                  Abonnez-vous
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>© 2026 TaxiCompta. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
