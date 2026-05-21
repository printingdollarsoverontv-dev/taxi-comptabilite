import { getOrCreateUser } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    // Create PDF
    const doc = new PDFDocument({
      bufferPages: true,
    });

    let bufferData = Buffer.alloc(0);

    doc.on('data', (chunk) => {
      bufferData = Buffer.concat([bufferData, chunk]);
    });

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Rapport Comptable', { align: 'center' });
    doc.fontSize(10).text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });
    doc.moveDown();

    // Summary
    const totalExpenses = invoices.reduce((sum, inv) => sum + inv.amountTTC, 0);
    const totalTVA = invoices.reduce((sum, inv) => sum + inv.amountTVA, 0);

    doc.fontSize(12).font('Helvetica-Bold').text('Résumé', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total dépenses: ${totalExpenses.toFixed(2)}€`);
    doc.text(`Total TVA: ${totalTVA.toFixed(2)}€`);
    doc.text(`Nombre de factures: ${invoices.length}`);
    doc.moveDown();

    // Invoices table
    doc.fontSize(12).font('Helvetica-Bold').text('Détail des factures', { underline: true });
    doc.moveDown(0.5);

    // Table header
    const columnWidths = {
      supplier: 150,
      date: 80,
      category: 100,
      amount: 80,
    };

    const startX = 50;
    let y = doc.y;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Fournisseur', startX, y, { width: columnWidths.supplier });
    doc.text('Date', startX + columnWidths.supplier, y, { width: columnWidths.date });
    doc.text('Catégorie', startX + columnWidths.supplier + columnWidths.date, y, { width: columnWidths.category });
    doc.text('Montant TTC', startX + columnWidths.supplier + columnWidths.date + columnWidths.category, y, { width: columnWidths.amount, align: 'right' });

    doc.moveTo(startX, doc.y + 10).lineTo(500, doc.y + 10).stroke();
    doc.moveDown();

    // Table rows
    doc.fontSize(8).font('Helvetica');
    invoices.forEach(inv => {
      y = doc.y;
      doc.text(inv.supplierName || '-', startX, y, { width: columnWidths.supplier });
      doc.text(inv.date ? new Date(inv.date).toLocaleDateString('fr-FR') : '-', startX + columnWidths.supplier, y, { width: columnWidths.date });
      doc.text(inv.category, startX + columnWidths.supplier + columnWidths.date, y, { width: columnWidths.category });
      doc.text(inv.amountTTC.toFixed(2) + '€', startX + columnWidths.supplier + columnWidths.date + columnWidths.category, y, { width: columnWidths.amount, align: 'right' });
    });

    doc.end();

    return new Promise<Response>((resolve, reject) => {
      doc.on('finish', () => {
        resolve(new NextResponse(bufferData, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="factures-${new Date().toISOString().split('T')[0]}.pdf"`,
          },
        }));
      });
      doc.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    );
  }
}
