'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye, FileDown, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || invoice.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(invoices.map((inv) => inv.category))].sort();

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette facture?')) return;
    try {
      const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setInvoices(invoices.filter((inv) => inv.id !== id));
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await fetch('/api/exports/csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factures-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const downloadInvoicePDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const pdfUrl = `/invoices/facture-${invoiceNumber}.pdf`;
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `facture-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };


  if (loading) {
    return <div className="text-slate-500">Chargement des factures...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher par fournisseur, numéro..."
          className="flex-1 min-w-[200px] px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Factures ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Aucune facture trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200">
                  <tr className="text-left text-slate-600">
                    <th className="pb-3 font-semibold">Fournisseur</th>
                    <th className="pb-3 font-semibold">Numéro</th>
                    <th className="pb-3 font-semibold">Catégorie</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Montant TTC</th>
                    <th className="pb-3 font-semibold text-right">TVA</th>
                    <th className="pb-3 font-semibold">Statut</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="py-3">{invoice.supplierName || '-'}</td>
                      <td className="py-3 font-mono text-xs">{invoice.invoiceNumber || '-'}</td>
                      <td className="py-3">{invoice.category}</td>
                      <td className="py-3">{formatDate(new Date(invoice.date))}</td>
                      <td className="py-3 text-right font-semibold">
                        {formatCurrency(invoice.amountTTC)}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(invoice.amountTVA)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            invoice.extractionStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : invoice.extractionStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {invoice.extractionStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            className="p-1 hover:bg-blue-100 rounded text-blue-600"
                            onClick={() => setSelectedInvoice(invoice)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-green-100 rounded text-green-600"
                            onClick={() => downloadInvoicePDF(invoice.id, invoice.invoiceNumber)}
                            title="Télécharger PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                            onClick={() => handleDelete(invoice.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <Card className="w-full h-full flex flex-col max-w-6xl max-h-[95vh]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b py-3">
              <CardTitle>Facture: {selectedInvoice.invoiceNumber || 'N/A'}</CardTitle>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <iframe
                src={`/invoices/facture-${selectedInvoice.invoiceNumber}.pdf`}
                className="w-full h-full border-0"
              />
            </CardContent>
            <div className="border-t p-3 flex gap-2">
              <button
                onClick={() => downloadInvoicePDF(selectedInvoice.id, selectedInvoice.invoiceNumber)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-medium flex items-center justify-center gap-2 text-sm"
              >
                <FileDown className="h-4 w-4" />
                Télécharger PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded font-medium text-sm"
              >
                Fermer
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
