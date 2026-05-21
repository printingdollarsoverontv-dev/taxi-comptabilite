import { getOrCreateUser } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getOrCreateUser();

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId: user.id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Serve PDF from public folder
    const pdfPath = join(process.cwd(), 'public', 'invoices', `facture-${invoice.invoiceNumber}.pdf`);

    try {
      const pdfData = readFileSync(pdfPath);
      return new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="facture-${invoice.invoiceNumber}.pdf"`,
        },
      });
    } catch (fileError) {
      // If PDF doesn't exist, return a simple text document
      return NextResponse.json(
        { error: 'PDF not available for this invoice', invoiceNumber: invoice.invoiceNumber },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to retrieve PDF' },
      { status: 500 }
    );
  }
}
