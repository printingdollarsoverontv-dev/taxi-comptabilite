'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DevTestPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTestInvoices = async () => {
    setLoading(true);
    setMessage('Ajout en cours...');
    try {
      const response = await fetch('/api/dev/seed', {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message || 'Factures ajoutées! Retourne au dashboard.');
    } catch (error) {
      setMessage(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Page de Test - Comptabilité Taxi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Test des factures</h3>
              <p className="text-slate-600">
                Clique le bouton ci-dessous pour ajouter 5 factures de test avec différentes catégories et montants.
              </p>
            </div>

            <Button
              onClick={addTestInvoices}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
              size="lg"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter 5 factures de test'}
            </Button>

            {message && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                {message}
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Après l'ajout, va vérifier:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ <strong>Dashboard:</strong> Les totaux dépenses et TVA doivent être calculés</li>
                <li>✓ <strong>Factures:</strong> Tu dois voir 5 factures dans le tableau</li>
                <li>✓ <strong>Filtres:</strong> Essaie de chercher par fournisseur ou catégorie</li>
                <li>✓ <strong>Catégories:</strong> Carburant, Péage, Entretien, Assurance, Autres</li>
              </ul>
            </div>

            <div className="pt-4 border-t bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>💡 Note:</strong> Ces factures sont de test uniquement (pas de vrais PDF).
                Le système d'extraction IA et webhooks Mailgun ne sont pas encore activés.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
