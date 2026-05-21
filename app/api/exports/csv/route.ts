import { getOrCreateUser } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { stringify } from 'csv-stringify/sync';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      include: { items: true },
    });

    // Format data for CSV
    const rows = invoices.map(inv => ({
      'N° Facture': inv.invoiceNumber || '-',
      'Fournisseur': inv.supplierName || '-',
      'Catégorie': inv.category,
      'Date': inv.date ? new Date(inv.date).toLocaleDateString('fr-FR') : '-',
      'Montant HT': (inv.amountHT || 0).toFixed(2),
      'TVA': (inv.amountTVA || 0).toFixed(2),
      'Montant TTC': (inv.amountTTC || 0).toFixed(2),
    }));

    const csv = stringify(rows, {
      header: true,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="factures-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
