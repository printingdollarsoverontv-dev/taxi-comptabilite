'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);

  // Données mockées
  const settings = {
    inboxEmail: 'taxi-demo12345@app.tax.local',
    subscription: {
      status: 'free',
      currentPeriodEnd: null,
    },
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Inbox Email */}
      <Card>
        <CardHeader>
          <CardTitle>Adresse email de réception</CardTitle>
          <CardDescription>
            Envoyez vos factures à cette adresse. Elle est unique et sécurisée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Votre adresse email:</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 text-lg font-mono text-slate-900">
                {settings.inboxEmail}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(settings.inboxEmail)}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              💡 Conseil: Configurez un filtre dans votre client email pour envoyer automatiquement les factures à cette adresse.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
          <CardDescription>Gérez votre plan d'abonnement</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-slate-600 mb-2">Plan actuel:</p>
            <p className="text-lg font-semibold text-slate-900 capitalize">
              {settings.subscription.status}
            </p>
          </div>
          {settings.subscription.status === 'premium' && settings.subscription.currentPeriodEnd && (
            <div>
              <p className="text-sm text-slate-600 mb-2">Renouvellement:</p>
              <p className="text-slate-900">
                {new Date(settings.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
          {settings.subscription.status === 'free' && (
            <Button className="bg-red-500 hover:bg-red-600 w-full">
              Passer à Premium (9,99€/mois)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-800 mb-4">
            Ces actions sont irréversibles. Veuillez être prudent.
          </p>
          <Button variant="destructive">Supprimer mon compte</Button>
        </CardContent>
      </Card>
    </div>
  );
}
